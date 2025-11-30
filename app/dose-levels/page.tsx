import Link from "next/link";

type DoseLevelsPageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function DoseLevelsPage({ searchParams }: DoseLevelsPageProps) {
  const params = await searchParams;
  const accessKey = params.key;
  const backUrl = accessKey ? `/?key=${accessKey}` : "/";

  return (
    <main className="min-h-screen bg-[#f6eddc] text-[#3f301f]">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1 text-sm text-[#6b5841] hover:text-[#3f301f] transition mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Explorer
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          About Dose Levels
        </h1>
        <p className="text-sm text-[#8b7a5c] mb-8">Beta placeholder</p>

        <div className="space-y-6 text-sm leading-relaxed text-[#4c3926]">
          <section className="rounded-2xl border border-[#e2d3b5] bg-white/80 p-5 shadow-sm">
            <h2 className="font-semibold text-[#2d1d12] mb-3">Understanding Dose Tiers</h2>
            <p className="mb-4">
              Our dosing system organizes psilocybin experiences into distinct tiers, 
              each with its own character and typical effects profile.
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="font-semibold text-[#8b7a5c] w-20 shrink-0">MICRO</span>
                <span>Sub-perceptual doses for focus and mood support (0.1–0.3g)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#8b7a5c] w-20 shrink-0">MINI</span>
                <span>Light enhancement, social warmth, gentle creativity (0.3–0.7g)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#8b7a5c] w-20 shrink-0">MACRO</span>
                <span>Full experience with moderate visuals and introspection (1–2g)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#8b7a5c] w-20 shrink-0">MUSEUM</span>
                <span>Stronger visuals, deeper emotional processing (2–3.5g)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#8b7a5c] w-20 shrink-0">MEGA</span>
                <span>Intense journey, significant ego softening (3.5–5g)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#8b7a5c] w-20 shrink-0">HERO</span>
                <span>Transformative, ego dissolution possible (5g+)</span>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[#e2d3b5] bg-[#fff9f0] p-5 shadow-sm">
            <p className="text-xs text-[#8b7a5c]">
              <strong>Note:</strong> Individual sensitivity varies significantly. 
              These are general guidelines based on typical dried psilocybin mushroom potency. 
              Always start lower than you think you need, especially with a new strain.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            href={backUrl}
            className="inline-flex items-center rounded-full bg-[#3f301f] px-6 py-2 text-sm font-medium text-[#f6eddc] transition hover:bg-[#2a2015]"
          >
            Return to Explorer
          </Link>
        </div>
      </div>
    </main>
  );
}

