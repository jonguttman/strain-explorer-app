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
  currentDoseLabel,
  currentGrams,
}: DoseSliderProps) {
  if (!order.length) {
    return null;
  }

  const sliderIndex = Math.max(
    0,
    order.findIndex((key) => key === selected)
  );
  const sliderMax = Math.max(0, order.length - 1);

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
                  ? "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f301f]"
                  : "text-[11px] uppercase tracking-wide text-stone-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f301f]"
              }
              style={
                isActive
                  ? {
                      borderColor: "var(--dose-accent)",
                      color: "var(--dose-accent)",
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
              className={`h-2 w-[2px] rounded-full ${
                idx === sliderIndex
                  ? "bg-[color:var(--dose-accent)]"
                  : "bg-[color:var(--dose-accent-soft)]"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 text-center text-[11px] text-stone-400">
        Version {KIOSK_VERSION}
      </div>
    </div>
  );
}

