"use client";

import FeedbackQR from "../FeedbackQR";
import type { DoseKey } from "@/lib/types";
import type { CtaKey } from "@/lib/feedbackCtas";

type FeedbackOverlayProps = {
  strainId: string;
  doseKey: DoseKey;
  accentHex: string;
  ctaKey: CtaKey;
  ctaLabel: string;
  accessKeyId?: string;
  onClose: () => void;
};

export function FeedbackOverlay({
  strainId,
  doseKey,
  accentHex,
  ctaKey,
  ctaLabel,
  accessKeyId,
  onClose,
}: FeedbackOverlayProps) {
  // Build the feedback URL for the clickable QR
  const feedbackUrl = buildFeedbackUrl({ strainId, doseKey, ctaKey, accessKeyId });

  function handleOpenFeedback() {
    window.open(feedbackUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#d3c3a2] bg-white/95 px-4 text-center text-sm text-[#3c291b] shadow-inner">
      {/* Close button - top right */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close feedback overlay"
        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#d3c3a2] bg-white text-[#6b5841] transition hover:bg-[#f5ebe0] hover:text-[#3f301f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3f301f] focus-visible:ring-offset-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* QR Code - clickable to open feedback form */}
      <FeedbackQR
        strainId={strainId}
        doseKey={doseKey}
        accentHex={accentHex}
        ctaKey={ctaKey}
        ctaLabel={ctaLabel}
        accessKeyId={accessKeyId}
        onQRClick={handleOpenFeedback}
      />

      {/* Helper text */}
      <p className="text-xs text-[#6b5841]">
        Tap the QR code to open form, or use X to return to radar
      </p>
    </div>
  );
}

function buildFeedbackUrl(params: {
  strainId: string;
  doseKey: DoseKey;
  ctaKey?: CtaKey;
  accessKeyId?: string;
}): string {
  const searchParams = new URLSearchParams();
  
  searchParams.set("strain", params.strainId);
  searchParams.set("dose", params.doseKey);
  
  if (params.accessKeyId) {
    searchParams.set("key", params.accessKeyId);
  }
  
  if (params.ctaKey) {
    searchParams.set("cta", params.ctaKey);
  }

  return `/feedback?${searchParams.toString()}`;
}
