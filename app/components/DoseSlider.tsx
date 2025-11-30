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
};

export function DoseSlider({
  order,
  config,
  selected,
  onSelect,
}: DoseSliderProps) {
  if (!order.length) {
    return null;
  }

  const sliderIndex = Math.max(
    0,
    order.findIndex((key) => key === selected)
  );
  const sliderMax = Math.max(0, order.length - 1);
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-6 w-full max-w-xl mx-auto">
      <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#8b7a5c] mb-2 text-center sm:text-left">
        Dose
      </p>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-center">
        {order.map((key) => {
          const label = (config[key]?.label ?? key).toUpperCase();
          const isActive = key === selected;
          return (
            <button
              type="button"
              key={key}
              onClick={() => onSelect(key)}
              className={
                isActive
                  ? "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold uppercase tracking-wide shadow-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f301f]"
                  : "text-sm uppercase tracking-wide text-stone-400 transition-all duration-200 hover:text-stone-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f301f]"
              }
              style={
                isActive
                  ? {
                      borderColor: "#3f301f",
                      color: "#3f301f",
                      backgroundColor: "white",
                      boxShadow: "0 2px 8px rgba(63, 48, 31, 0.15)",
                    }
                  : undefined
              }
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="relative px-2">
        <input
          type="range"
          min={0}
          max={sliderMax}
          step={1}
          value={sliderIndex}
          onChange={(e) => {
            const idx = Number(e.target.value) || 0;
            const key = order[idx] ?? order[order.length - 1];
            if (key) {
              onSelect(key);
            }
          }}
          className="dose-slider w-full"
        />
        <div className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between">
          {order.map((key, idx) => (
            <div
              key={key}
              className={`rounded-full transition-all duration-200 ${
                idx === sliderIndex
                  ? "h-3 w-1 bg-[#3f301f]"
                  : "h-2 w-0.5 bg-[#c4b393]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer: Logo, Version, Add-to-Home, Copyright */}
      <div className="mt-6 flex flex-col items-center gap-2 text-center text-[10px] text-stone-400">
        <Image
          src="/TOPsilly2026.svg"
          alt="The Original Psilly"
          width={120}
          height={20}
          className="opacity-60"
        />
        <div className="space-y-1">
          <p>Version {KIOSK_VERSION}</p>
          <p className="text-[9px]">
            On iPhone, use &quot;Add to Home Screen&quot; for the best kiosk experience.
          </p>
          <p className="text-[9px]">
            © {currentYear} The Original Psilly. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
