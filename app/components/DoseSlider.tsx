import Image from "next/image";
import { KIOSK_VERSION } from "@/lib/version";
import type { DoseKey, DoseConfig } from "@/lib/types";
import { ApothecaryDoseMeter } from "./ApothecaryDoseMeter";

type DoseSliderProps = {
  order: DoseKey[];
  config: Record<DoseKey, DoseConfig>;
  selected: DoseKey;
  onSelect: (key: DoseKey) => void;
  currentDoseLabel: string;
  currentGrams: number | null;
  strainName: string;
};

export function DoseSlider({
  order,
  config,
  selected,
  onSelect,
  strainName,
}: DoseSliderProps) {
  if (!order.length) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const activeLabel = (config[selected]?.label ?? selected).toUpperCase();

  return (
    <div className="w-full max-w-[600px] mx-auto mb-6">
      {/* Section title */}
      <p 
        className="text-[11px] font-semibold tracking-[0.14em] uppercase text-center mb-1"
        style={{ color: "var(--ink-subtle)" }}
      >
        Dose
      </p>

      {/* Dose label row - ABOVE the slider */}
      <div
        className="flex justify-between text-[10px] sm:text-[11px] leading-tight tracking-[0.14em] uppercase mb-1"
        style={{
          // Match the SVG padding: X_START=20, X_END=480 out of 500 total
          paddingLeft: "4%",
          paddingRight: "4%",
          color: "var(--ink-subtle)",
        }}
      >
        {order.map((key, idx) => {
          const label = (config[key]?.label ?? key).toUpperCase();
          const isActive = key === selected;
          const isFirst = idx === 0;
          const isLast = idx === order.length - 1;

          return (
            <button
              type="button"
              key={key}
              onClick={() => onSelect(key)}
              className={`
                flex-1 py-0.5 font-medium transition-all duration-200
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                ${isFirst ? "text-left" : isLast ? "text-right" : "text-center"}
              `}
              style={{
                color: isActive ? "var(--accent)" : "var(--ink-subtle)",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Apothecary Dose Meter - brass slider */}
      <div className="h-[80px] sm:h-[90px]">
        <ApothecaryDoseMeter
          doseKey={selected}
          strainName={strainName}
          onChangeDoseKey={onSelect}
        />
      </div>

      {/* Active dose pill */}
      <div className="mt-2 flex justify-center">
        <span 
          className="inline-flex items-center justify-center rounded-full border px-4 py-1.5 shadow-sm font-semibold text-sm"
          style={{
            background: "var(--accent-pill)",
            borderColor: "var(--accent)",
            color: "var(--accent)",
          }}
        >
          {activeLabel}
        </span>
      </div>

      {/* Footer: Logo, Version, Add-to-Home, Copyright */}
      <div 
        className="mt-4 flex flex-col items-center gap-2 text-center text-[10px]"
        style={{ color: "var(--ink-subtle)" }}
      >
        <Image
          src="/TOPsilly2026.svg"
          alt="The Original Psilly"
          width={120}
          height={20}
          className="opacity-60"
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
            style={{ color: "var(--ink-subtle)" }}
          >
            CONFIDENTIAL BETA. Tripdar™ and the underlying Fungapedia dataset are proprietary and intended only for authorized Psilly partners. Unauthorized disclosure, distribution, or reproduction is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
