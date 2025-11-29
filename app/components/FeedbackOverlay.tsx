import FeedbackQR from "../FeedbackQR";
import type { DoseKey } from "@/lib/types";
import type { CtaKey } from "@/lib/feedbackCtas";

type FeedbackOverlayProps = {
  strainId: string;
  doseKey: DoseKey;
  accentHex: string;
  ctaKey: CtaKey;
  ctaLabel: string;
  onClose: () => void;
};

export function FeedbackOverlay({
  strainId,
  doseKey,
  accentHex,
  ctaKey,
  ctaLabel,
  onClose,
}: FeedbackOverlayProps) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#d3c3a2] bg-white/80 px-4 text-center text-sm text-[#3c291b] shadow-inner transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3f301f]"
    >
      <FeedbackQR
        strainId={strainId}
        doseKey={doseKey}
        accentHex={accentHex}
        ctaKey={ctaKey}
        ctaLabel={ctaLabel}
      />
      <p className="text-xs text-[#6b5841]">Tap anywhere to return to the radar ↓</p>
    </button>
  );
}

