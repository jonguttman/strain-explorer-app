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
  ctaLabel,
  onShowFeedback,
  feedbackActive,
}: StrainHeaderProps) {
  return (
    <header className="bg-transparent border-b border-white/10">
      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-2 flex items-center gap-3">
        {/* Left: Psilly mark - flex-1 to balance with right side */}
        <div className="flex-1 flex justify-start">
          <PsillyMark size={28} className="sm:hidden" invertColors />
          <PsillyMark size={32} className="hidden sm:block" invertColors />
        </div>

        {/* Center: Tripdar lockup - truly centered */}
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase text-white/90">
            TRIPDAR™
          </span>
          <span className="text-[8px] sm:text-[10px] text-white/50 tracking-wide mt-[1px]">
            Trip radar by Fungapedia
          </span>
        </div>

        {/* Right: CTA button - flex-1 to balance with left side */}
        <div className="flex-1 flex justify-end items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onShowFeedback}
            aria-pressed={feedbackActive}
            className="rounded-full px-4 py-[6px] sm:px-5 sm:py-2 text-[12px] sm:text-[13px] font-medium shadow-sm transition hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
