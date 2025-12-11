import { NextResponse } from "next/server";
import { getStrainDoseData } from "@/data/strainData";
import type { DoseKey } from "@/lib/types";

type RouteParams = {
  params: Promise<{
    strainId: string;
    doseKey: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { strainId, doseKey } = await params;

  // Validate doseKey is a valid DoseKey
  const validDoseKeys: DoseKey[] = ["micro", "mini", "macro", "museum", "mega", "hero"];
  if (!validDoseKeys.includes(doseKey as DoseKey)) {
    return NextResponse.json(
      { error: `Invalid dose key: ${doseKey}` },
      { status: 400 }
    );
  }

  const result = getStrainDoseData(strainId, doseKey as DoseKey);

  if (!result) {
    return NextResponse.json(
      { error: `Strain "${strainId}" or dose "${doseKey}" not found` },
      { status: 404 }
    );
  }

  // Transform StrainDoseResult into the shape expected by app/page.tsx
  const payload = {
    traits: result.doseData.traits,
    content: result.doseData.content,
    strainName: result.strain.name,
    colorHex: result.strain.colorHex,
    grams: result.doseInfo.grams ?? null,
    axes: result.axes,
    doseLabel: result.doseInfo.label,
    accentHex: result.accentHex,
    meta: result.meta,
    snapshot: result.snapshot,
    testimonials: result.testimonialsForDose,
    experienceMeta: result.experienceMeta,
    microVibes: result.microVibes ?? null,
  };

  return NextResponse.json(payload);
}

