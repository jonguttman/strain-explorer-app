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
  effectWord?: string;
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
  effectWord,
}: StrainHeaderProps) {
  // _accentHex kept for API compatibility but using unified cream color scheme
  return (
    <header className="px-6 pt-5 pb-4 md:pb-5" style={{ background: "var(--shell-bg)" }}>
      {/* Outer: two-column layout with stretch for vertical alignment */}
      <div className="flex items-stretch justify-between gap-4">
        
        {/* LEFT CLUSTER: PsillyMark + strain text column */}
        <div className="flex items-stretch gap-3 flex-1 min-w-0">
          {/* PsillyMark icon */}
          <div className="flex-shrink-0">
            <PsillyMark size={72} />
          </div>

          {/* Strain text column: top = name, bottom = dose pill */}
          <div className="flex flex-col justify-between py-0.5 min-w-0">
            {/* TOP: Strain name + effect word + welcome */}
            <div>
              <h1 className="flex flex-wrap items-baseline gap-x-2">
                <span 
                  className="text-[28px] sm:text-[32px] font-semibold tracking-tight leading-none"
                  style={{ color: "var(--ink-main)" }}
                >
                  {strainName}
                </span>
                {effectWord && (
                  <span 
                    className="text-[24px] sm:text-[28px] font-normal"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {effectWord}
                  </span>
                )}
              </h1>
              {welcomeLabel && (
                <p 
                  className="mt-0.5 text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--ink-subtle)" }}
                >
                  Welcome back {welcomeLabel}
                </p>
              )}
            </div>

            {/* BOTTOM: Dose pill */}
            <span 
              className="inline-flex items-center self-start rounded-full border px-4 py-1.5 text-sm font-semibold uppercase tracking-wide"
              style={{ 
                borderColor: "var(--card-border)", 
                background: "var(--accent-pill)",
                color: "var(--ink-main)" 
              }}
            >
              {doseLabel}
              {grams != null
                ? ` · ${grams.toFixed(grams % 1 === 0 ? 0 : 1)} g`
                : ""}
            </span>
          </div>
        </div>

        {/* RIGHT CLUSTER: Tripdar lockup (top) + CTA button (bottom) */}
        <div className="flex flex-col justify-between items-end py-0.5 flex-shrink-0">
          {/* TOP: Tripdar lockup */}
          <div className="text-right leading-tight">
            <p 
              className="text-xs font-bold tracking-[0.08em]"
              style={{ color: "var(--accent)" }}
            >
              Tripdar™
            </p>
            <p 
              className="text-[9px] leading-tight"
              style={{ color: "var(--ink-subtle)" }}
            >
              Trip radar by Fungapedia
            </p>
          </div>

          {/* BOTTOM: CTA button */}
          <button
            type="button"
            onClick={onShowFeedback}
            aria-pressed={feedbackActive}
            className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition whitespace-nowrap shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ 
              borderColor: "var(--accent)", 
              background: "var(--accent-pill)",
              color: "var(--accent)",
            }}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </header>
  );
}

