import { PsillyMark } from "./PsillyMark";

type StrainHeaderProps = {
  strainName: string;
  grams: number | null;
  doseLabel: string;
  accentHex: string;
  ctaLabel: string;
  onShowFeedback: () => void;
  feedbackActive: boolean;
};

export function StrainHeader({
  strainName,
  grams,
  doseLabel,
  accentHex,
  ctaLabel,
  onShowFeedback,
  feedbackActive,
}: StrainHeaderProps) {
  return (
    <header className="px-6 pt-8 pb-4 md:pb-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <PsillyMark size={48} />
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight leading-tight md:text-4xl">
                {strainName}
              </h1>
              <span className="inline-flex items-center rounded-full border border-[#d3c3a2] bg-white/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#4c3926]">
                {doseLabel}
                {grams != null
                  ? ` · ${grams.toFixed(grams % 1 === 0 ? 0 : 1)} g`
                  : ""}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 md:mt-0 md:flex md:items-start">
          <button
            type="button"
            onClick={onShowFeedback}
            aria-pressed={feedbackActive}
            className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold text-[#3f301f] transition hover:bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3f301f]"
            style={{ borderColor: accentHex }}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </header>
  );
}

