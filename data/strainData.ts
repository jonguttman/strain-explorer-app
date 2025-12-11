// data/strainData.ts
// SERVER-ONLY canonical dataset for strain + dose values & text.

import rawStrainData from "./strains.json";
import type {
  DoseKey,
  TraitAxisId,
  DoseSnapshot,
  StrainMeta,
  StrainTestimonials,
  StrainJsonEntry,
  DoseConfig,
  DoseConfigMap,
  DoseTraits,
  DoseContent,
  Strain,
  StrainDoseData,
  StrainDoseResult,
  StrainDataset,
  StrainExperienceMeta,
  MicroVibeId,
  MicroVibes,
  MicroVibesByDose,
} from "@/lib/types";

// Re-export types for convenience
export type {
  DoseKey,
  TraitAxisId,
  DoseSnapshot,
  StrainMeta,
  StrainJsonEntry,
  DoseConfig,
  DoseConfigMap,
  DoseTraits,
  DoseContent,
  Strain,
  StrainDoseData,
  StrainDoseResult,
  StrainDataset,
};

const dataset = rawStrainData as {
  doses: DoseKey[];
  axes: TraitAxisId[];
  doseConfig: DoseConfigMap;
  strains: Record<string, Omit<StrainJsonEntry, 'meta' | 'snapshots' | 'testimonials' | 'experienceMeta' | 'microVibes'> & {
    meta?: StrainMeta;
    snapshots?: Record<DoseKey, DoseSnapshot>;
    testimonials?: StrainTestimonials;
    experienceMeta?: Record<DoseKey, StrainExperienceMeta>;
    microVibes?: MicroVibesByDose;
  }>;
};

// Microvibe validation constants
const MICROVIBE_IDS: MicroVibeId[] = ["ease", "desire", "lift", "connect", "create", "focus"];

/**
 * Validate that all 6 micro-vibe values are present.
 * Throws if any are missing.
 */
function validateMicroVibes(vibes: Partial<MicroVibes>, strainName: string, doseKey: DoseKey): MicroVibes {
  const missing = MICROVIBE_IDS.filter(id => typeof vibes[id] !== "number");
  if (missing.length > 0) {
    throw new Error(
      `Incomplete microVibes for ${strainName}/${doseKey}: missing ${missing.join(", ")}`
    );
  }
  return vibes as MicroVibes;
}

const STRAIN_SLUGS: Record<string, { slug: string; colorHex: string }> = {
  "Golden Teacher": { slug: "golden-teacher", colorHex: "#f3b34c" },
  "Penis Envy": { slug: "penis-envy", colorHex: "#8c6cae" },
  Amazonian: { slug: "amazonian", colorHex: "#95a751" },
  Enigma: { slug: "enigma", colorHex: "#5f6c6e" },
  Cambodian: { slug: "cambodian", colorHex: "#4b7a1b" },
  "Full Moon Party": { slug: "full-moon-party", colorHex: "#cf2914" },
};

const SLUG_TO_INFO = Object.entries(STRAIN_SLUGS).reduce<
  Record<string, { name: string; colorHex: string }>
>((acc, [name, info]) => {
  acc[info.slug] = { name, colorHex: info.colorHex };
  return acc;
}, {});

const DEFAULT_COLOR = "#4a371f";
const DOSE_KEYS = dataset.doses as DoseKey[];
const AXIS_LABELS = dataset.axes as TraitAxisId[];

export function getTraitAxes(): TraitAxisId[] {
  return AXIS_LABELS;
}

export function getDoseConfig(): { order: DoseKey[]; config: DoseConfigMap } {
  return {
    order: dataset.doses,
    config: dataset.doseConfig,
  };
}

export function getStrains(): Strain[] {
  return Object.entries(STRAIN_SLUGS)
    .filter(([name]) => dataset.strains[name as keyof typeof dataset.strains])
    .map(([name, info]) => ({
      id: info.slug,
      name,
      colorHex: info.colorHex ?? DEFAULT_COLOR,
    }));
}

export function getStrainDoseData(
  strainId: string,
  doseKey: DoseKey
): StrainDoseResult | null {
  const strainInfo = SLUG_TO_INFO[strainId];
  if (!strainInfo) return null;

  const strainName = strainInfo.name;

  const strainEntry = dataset.strains[strainName as keyof typeof dataset.strains] as
    | StrainJsonEntry
    | undefined;
  if (!strainEntry) return null;

  const doseIndex = DOSE_KEYS.indexOf(doseKey);
  if (doseIndex === -1) return null;

  const traitsValues = AXIS_LABELS.reduce<Record<TraitAxisId, number>>(
    (acc, axis) => {
      const axisSeries = strainEntry.radar[axis];
      acc[axis] = axisSeries?.[doseIndex] ?? 0;
      return acc;
    },
    {} as Record<TraitAxisId, number>
  );

  const content: DoseContent = {
    blurb: strainEntry.blurb[doseKey] ?? "",
    details: strainEntry.details[doseKey] ?? "",
    products: strainEntry.products[doseKey] ?? [],
  };

  const meta = strainEntry.meta ?? null;
  const snapshot = strainEntry.snapshots?.[doseKey] ?? null;
  const testimonialsForDose =
    strainEntry.testimonials?.[doseKey]?.filter(Boolean) ?? [];
  const experienceMeta = strainEntry.experienceMeta?.[doseKey] ?? null;

  // Extract and validate microVibes if present
  const rawMicroVibes = strainEntry.microVibes?.[doseKey];
  const microVibes = rawMicroVibes 
    ? validateMicroVibes(rawMicroVibes, strainName, doseKey)
    : null;

  const baseColor = SLUG_TO_INFO[strainId]?.colorHex ?? DEFAULT_COLOR;
  const accentHex =
    strainEntry.visual?.[doseKey]?.colorHex?.trim() || baseColor;
  const doseInfo =
    dataset.doseConfig?.[doseKey] ??
    ({
      label: doseKey,
      grams: 0,
    } as DoseConfig);

  return {
    strain: {
      id: strainId,
      name: strainInfo.name,
      colorHex: SLUG_TO_INFO[strainId]?.colorHex ?? DEFAULT_COLOR,
    },
    doseKey,
    doseData: {
      traits: { values: traitsValues },
      content,
    },
    axes: AXIS_LABELS,
    accentHex,
    doseInfo,
    meta,
    snapshot,
    testimonialsForDose,
    experienceMeta,
    microVibes,
  };
}

export function getEditableDataset(): StrainDataset {
  return JSON.parse(JSON.stringify(dataset));
}
