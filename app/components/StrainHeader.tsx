import { PsillyMark } from "./PsillyMark";

type StrainHeaderProps = {
  strainName: string;
  grams: number | null;
  doseLabel: string;
  accentHex: string;
  ctaLabel: string;
  onShowFeedback: () => void;
  feedbackActive: boolean;
  welcomeLabel?: string;
};

export function StrainHeader({
  strainName,
  grams,
  doseLabel,
  accentHex: _accentHex,
  ctaLabel,
  onShowFeedback,
  feedbackActive,
  welcomeLabel,
}: StrainHeaderProps) {
  // _accentHex kept for API compatibility but using unified cream color scheme
  return (
    <header className="px-6 pt-8 pb-4 md:pb-5 bg-[#fdfbf7]">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
        <PsillyMark size={84} />
        <div className="flex flex-col justify-between min-h-[84px] flex-1">
        <div>
            <h1 className="text-3xl font-semibold tracking-tight leading-none md:text-4xl text-[#3f301f]">
                {strainName}
              </h1>
            {welcomeLabel && (
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[#8b7a5c]">
                Welcome back {welcomeLabel}
              </p>
            )}
          </div>
          <div className="flex items-end justify-between gap-2 mt-auto w-full">
            <span className="inline-flex items-center rounded-full border border-[#d3c3a2] bg-[#fdfbf7] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#3f301f]">
                {doseLabel}
                {grams != null
                  ? ` · ${grams.toFixed(grams % 1 === 0 ? 0 : 1)} g`
                  : ""}
              </span>
          <button
            type="button"
            onClick={onShowFeedback}
            aria-pressed={feedbackActive}
              className="inline-flex items-center rounded-full border border-[#d3c3a2] bg-[#fdfbf7] px-4 py-2 text-sm font-semibold text-[#3f301f] transition hover:bg-[#f5ebe0] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3f301f] whitespace-nowrap"
          >
            {ctaLabel}
          </button>
          </div>
        </div>
      </div>
    </header>
  );
}

