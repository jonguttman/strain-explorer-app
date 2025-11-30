import { FeedbackFormClient } from "./FeedbackFormClient";
import { getStrains, getDoseConfig, getTraitAxes, getStrainDoseData } from "@/data/strainData";
import type { DoseKey, TraitAxisId } from "@/lib/types";

type FeedbackPageProps = {
  searchParams: Promise<{
    strain?: string;
    dose?: string;
    key?: string;
    cta?: string;
  }>;
};

export default async function FeedbackPage({ searchParams }: FeedbackPageProps) {
  const params = await searchParams;
  
  // Load strain data for the form
  const strains = getStrains();
  const { order: doseOrder, config: doseConfig } = getDoseConfig();
  const axes = getTraitAxes();
  
  // Build initial axis values from the strain/dose if valid
  const initialAxisValues: Partial<Record<TraitAxisId, number>> = {};
  if (params.strain && params.dose) {
    const data = getStrainDoseData(params.strain, params.dose as DoseKey);
    if (data) {
      for (const axis of axes) {
        const rawValue = data.doseData.traits.values[axis];
        if (typeof rawValue === "number") {
          // Scale from 0-100 to 0-10
          initialAxisValues[axis] = Math.round(rawValue / 10);
        }
      }
    }
  }
  
  // Prepare strain options for the form
  const strainOptions = strains.map(s => ({
    id: s.id,
    name: s.name,
  }));
  
  // Prepare dose options
  const doseOptions = doseOrder.map(key => ({
    key,
    label: doseConfig[key]?.label ?? key,
  }));
  
  return (
    <main className="min-h-screen bg-[#f6eddc] text-[#3f301f]">
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Share Your Experience
          </h1>
          <p className="mt-2 text-sm text-[#6b5841]">
            Help us improve dosing guidance for everyone
          </p>
        </div>

        <FeedbackFormClient
          initialStrainId={params.strain}
          initialDoseKey={params.dose}
          accessKeyId={params.key}
          ctaKey={params.cta}
          strainOptions={strainOptions}
          doseOptions={doseOptions}
          axes={axes}
          initialAxisValues={initialAxisValues}
        />
      </div>
    </main>
  );
}
