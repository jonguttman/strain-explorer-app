// Shared types for the strain explorer application
// This is the single source of truth for all type definitions

export type DoseKey = "micro" | "mini" | "macro" | "museum" | "mega" | "hero";

export type TraitAxisId =
  | "visuals"
  | "euphoria"
  | "introspection"
  | "creativity"
  | "spiritual_depth"
  | "sociability";

export type DoseSnapshot = {
  onset: string;
  duration: string;
  intensity: string;
  bestFor: string[];
  setting: string[];
};

export type StrainMeta = {
  origin: string;
  history: string;
  tags: string[];
};

export type StrainTestimonials = Record<DoseKey, string[]>;

export type VisualConfig = {
  [K in DoseKey]?: {
    colorHex: string;
  };
};

export type DoseConfig = {
  label: string;
  grams: number;
};

export type DoseConfigMap = Record<DoseKey, DoseConfig>;

export type StrainJsonEntry = {
  radar: Record<TraitAxisId, number[]>;
  blurb: Record<DoseKey, string>;
  details: Record<DoseKey, string>;
  products: Record<DoseKey, string[]>;
  visual?: VisualConfig;
  meta: StrainMeta;
  snapshots: Record<DoseKey, DoseSnapshot>;
  testimonials: StrainTestimonials;
};

export type EditorDataset = {
  doses: DoseKey[];
  axes: TraitAxisId[];
  doseConfig: DoseConfigMap;
  strains: Record<string, StrainJsonEntry>;
};

// Additional types used by the data layer
export type DoseTraits = {
  values: Record<TraitAxisId, number>;
};

export type DoseContent = {
  blurb: string;
  details: string;
  products: string[];
};

export type Strain = {
  id: string;
  name: string;
  colorHex: string;
};

export type StrainDoseData = {
  traits: DoseTraits;
  content: DoseContent;
};

export type StrainDoseResult = {
  strain: Strain;
  doseKey: DoseKey;
  doseData: StrainDoseData;
  axes: TraitAxisId[];
  accentHex: string;
  doseInfo: DoseConfig;
  meta: StrainMeta | null;
  snapshot: DoseSnapshot | null;
  testimonialsForDose: string[];
};

export type StrainDataset = {
  doses: DoseKey[];
  axes: TraitAxisId[];
  doseConfig: DoseConfigMap;
  strains: Record<string, StrainJsonEntry>;
};

// Access key types for invite links and referral tracking
export type AccessKeyType = "master" | "partner" | "staff" | "test";

export type AccessKey = {
  id: string;           // URL-safe key, e.g. "dani-top"
  label: string;        // Human-readable label, e.g. "Dani @ The Other Path"
  type: AccessKeyType;
  isActive: boolean;
  notes?: string;
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
};

export type AccessKeyDataset = {
  keys: AccessKey[];
};

// Feedback entry types

// One numeric score per radar axis (0–10)
export type AxisExperienceScores = Partial<Record<TraitAxisId, number>>;

export type FeedbackEntry = {
  id: string;
  strainId?: string;
  doseKey?: string;
  accessKeyId?: string;
  ctaKey?: string;
  overallExperience?: number;       // 1-5 rating
  intensityRating?: number;         // 1-5 rating
  testimonial?: string;
  bestFor?: string[];
  setting?: string[];
  contact?: string;
  createdAt: string;                // ISO timestamp
  // User's felt experience by axis
  feltAxes?: AxisExperienceScores;
  // Snapshot of expected axes at time of submission (computed server-side)
  expectedAxes?: AxisExperienceScores;
};

export type FeedbackDataset = {
  entries: FeedbackEntry[];
};

