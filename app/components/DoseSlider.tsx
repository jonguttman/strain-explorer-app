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

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Apothecary Dose Meter - full width */}
      <ApothecaryDoseMeter
        doseKey={selected}
        strainName={strainName}
        onChangeDoseKey={onSelect}
      />

      {/* Dose label buttons aligned with tick marks */}
      <div
        className="mt-1 flex items-center text-center"
        style={{
          // Match the SVG padding: X_START=20, X_END=480 out of 500 total
          // That's 4% on left and 4% on right
          paddingLeft: "4%",
          paddingRight: "4%",
        }}
      >
        {order.map((key, idx) => {
          const label = (config[key]?.label ?? key).toUpperCase();
          const isActive = key === selected;
          // Calculate flex positioning to center each button on its tick
          const isFirst = idx === 0;
          const isLast = idx === order.length - 1;

          return (
            <button
              type="button"
              key={key}
              onClick={() => onSelect(key)}
              className={`
                flex-1 py-1 text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-all duration-200
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f301f]
                ${isActive
                  ? "text-[#3f301f] font-semibold"
                  : "text-stone-400 hover:text-stone-600"
                }
                ${isFirst ? "text-left" : isLast ? "text-right" : "text-center"}
              `}
            >
              {isActive ? (
                <span className="inline-flex items-center justify-center rounded-full border border-[#3f301f] bg-white px-2 py-0.5 shadow-sm">
                  {label}
                </span>
              ) : (
                label
              )}
            </button>
          );
        })}
      </div>

      {/* Footer: Logo, Version, Add-to-Home, Copyright */}
      <div className="mt-4 flex flex-col items-center gap-2 text-center text-[10px] text-stone-400">
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
            © {currentYear} The Original Psilly. All rights reserved.
          </p>
          <p className="text-[11px] leading-snug text-stone-400 uppercase tracking-wide max-w-sm mt-2">
            CONFIDENTIAL BETA. This application contains proprietary methodology, trade secrets, and confidential business information. Unauthorized disclosure, distribution, or reproduction is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
