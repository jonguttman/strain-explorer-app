import Image from "next/image";
import { KIOSK_VERSION } from "@/lib/version";
import type { DoseKey, DoseConfig } from "@/lib/types";

type DoseSliderProps = {
  order: DoseKey[];
  config: Record<DoseKey, DoseConfig>;
  selected: DoseKey;
  onSelect: (key: DoseKey) => void;
  currentDoseLabel: string;
  currentGrams: number | null;
  strainName: string;
  onShowHowItWorks?: () => void;
};

export function DoseSlider({
  order,
  config,
  selected,
  onSelect,
  onShowHowItWorks,
}: DoseSliderProps) {
  if (!order.length) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full max-w-xl mx-auto mb-6 mt-4">
      {/* Dose pill buttons row - equal width grid matching strain selector style */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6 px-4">
        {order.map((key) => {
          const label = config[key]?.label ?? key;
          const isActive = key === selected;

          return (
            <button
              type="button"
              key={key}
              onClick={() => onSelect(key)}
              className={`
                px-3 py-1.5 rounded-full text-[12px] sm:text-[13px] font-medium 
                transition-all duration-200 whitespace-nowrap
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                ${isActive ? "text-[#1a1612] shadow-lg" : "text-white/80 hover:text-white hover:bg-white/10"}
              `}
              style={isActive ? {
                background: "linear-gradient(180deg, #f3b34c 0%, #d4913f 100%)",
                boxShadow: "0 4px 12px rgba(243, 179, 76, 0.35)",
              } : {
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* CTA text - italic serif */}
      <p 
        className="text-center text-[18px] sm:text-[20px] mb-4"
        style={{ 
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: "italic",
          color: "rgba(255, 255, 255, 0.85)",
        }}
      >
        Which effect resonates with you?
      </p>

      {/* How it works button */}
      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={onShowHowItWorks}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] sm:text-[15px] font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(180deg, #f3b34c 0%, #d4913f 100%)",
            color: "#1a1612",
            boxShadow: "0 4px 14px rgba(243, 179, 76, 0.35)",
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          How it works
        </button>
      </div>

      {/* Footer: Logo, Version, Add-to-Home, Copyright */}
      <div 
        className="mt-4 flex flex-col items-center gap-2 text-center text-[10px]"
        style={{ color: "rgba(255, 255, 255, 0.4)" }}
      >
        <Image
          src="/TOPsilly2026.svg"
          alt="The Original Psilly"
          width={120}
          height={20}
          className="opacity-40 invert"
          style={{ width: "auto", height: "auto" }}
        />
        <div className="space-y-1.5">
          <p className="text-xs">Version {KIOSK_VERSION}</p>
          <p className="text-xs">
            On iPhone, use &quot;Add to Home Screen&quot; for the best kiosk experience.
          </p>
          <p className="text-xs">
            © {currentYear} The Original Psilly. Tripdar™ powered by Fungapedia. All rights reserved.
          </p>
          <p 
            className="text-[11px] leading-snug uppercase tracking-wide max-w-sm mt-2"
            style={{ color: "rgba(255, 255, 255, 0.3)" }}
          >
            CONFIDENTIAL BETA. Tripdar™ and the underlying Fungapedia dataset are proprietary and intended only for authorized Psilly partners. Unauthorized disclosure, distribution, or reproduction is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
