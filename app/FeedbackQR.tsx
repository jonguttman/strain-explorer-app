"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import type { DoseKey } from "@/lib/types";
import type { CtaKey } from "@/lib/feedbackCtas";

type FeedbackQRProps = {
  strainId: string;
  doseKey: DoseKey;
  accentHex?: string;
  ctaKey?: CtaKey;
  ctaLabel?: string;
  accessKeyId?: string;
  onQRClick?: () => void;
};

export default function FeedbackQR({
  strainId,
  doseKey,
  ctaKey,
  ctaLabel,
  accessKeyId,
  onQRClick,
}: FeedbackQRProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Build the feedback URL with query params
  const feedbackUrl = buildFeedbackUrl({ strainId, doseKey, ctaKey, accessKeyId });

  useEffect(() => {
    let cancelled = false;

    async function generateQR() {
      try {
        // Generate QR code as data URL
        const dataUrl = await QRCode.toDataURL(feedbackUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: "#3f301f",
            light: "#fdfbf7",
          },
        });
        if (!cancelled) {
          setQrDataUrl(dataUrl);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to generate QR code:", err);
        if (!cancelled) {
          setError("Failed to generate QR code");
          setQrDataUrl(null);
        }
      }
    }

    generateQR();

    return () => {
      cancelled = true;
    };
  }, [feedbackUrl]);

  // Show error state for missing required props
  if (!strainId || !doseKey) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-amber-700">
        <p className="text-sm font-medium">Unable to generate QR</p>
        <p className="text-xs text-slate-500">
          Missing strain or dose information
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-red-600">
        <p className="text-sm">{error}</p>
        <p className="text-xs text-slate-500">URL: {feedbackUrl}</p>
      </div>
    );
  }

  if (!qrDataUrl) {
    return (
      <div className="flex items-center justify-center h-[200px] w-[200px]">
        <div className="animate-pulse bg-slate-200 rounded-lg h-full w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-base font-semibold text-[#3f301f]">
        {ctaLabel ?? "Share Your Feedback"}
      </p>
      <button
        type="button"
        onClick={onQRClick}
        className="cursor-pointer rounded-lg transition hover:opacity-90 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3f301f] focus-visible:ring-offset-2"
        aria-label="Tap to open feedback form"
      >
        <img
          src={qrDataUrl}
          alt="Scan to share feedback"
          width={200}
          height={200}
          className="rounded-lg shadow-sm"
        />
      </button>
      <p className="text-xs text-[#6b5841] max-w-[220px] text-center">
        Scan with your phone or tap to open form
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
