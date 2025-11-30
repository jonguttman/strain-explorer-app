"use client";

import { useMemo } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import type { DoseKey, TraitAxisId, DoseTraits, StrainExperienceMeta, ExperienceLevel } from "@/lib/types";
import { formatAxisLabel, hexToRgba } from "@/lib/utils";
import { DOSE_STYLE, heroGlowPlugin } from "./strainConstants";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

type RadarPanelProps = {
  color: string;
  traits: DoseTraits;
  axisLabels: TraitAxisId[];
  doseKey: DoseKey;
  experienceMeta?: StrainExperienceMeta;
};

// Helper to get level styling config
function getLevelConfig(level?: ExperienceLevel) {
  switch (level) {
    case "gentle":
      return { label: "Gentle", dotClass: "bg-emerald-400", textClass: "text-emerald-700" };
    case "intense":
      return { label: "Intense", dotClass: "bg-rose-400", textClass: "text-rose-700" };
    case "balanced":
    default:
      return { label: "Balanced", dotClass: "bg-amber-400", textClass: "text-amber-700" };
  }
}

// Internal Chip component for metadata display
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.1em] text-stone-600">
      {children}
    </span>
  );
}

export function RadarPanel({ color, traits, axisLabels, doseKey, experienceMeta }: RadarPanelProps) {
  const style = DOSE_STYLE[doseKey] ?? DOSE_STYLE.macro;
  const baseHex = doseKey === "micro" ? "#c4c4c4" : color;
  const fillColor = hexToRgba(baseHex, style.fillAlpha);
  const borderColor = hexToRgba(baseHex, style.borderAlpha);

  const data = useMemo(() => {
    const labels = axisLabels.map(formatAxisLabel);
    const values = axisLabels.map((axis) => traits.values[axis] ?? 0);
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: fillColor,
          borderColor,
          borderWidth: 2,
          pointRadius: 3.5,
          pointHoverRadius: 6,
          pointBackgroundColor: borderColor,
          pointBorderColor: borderColor,
        },
      ],
    };
  }, [traits, axisLabels, fillColor, borderColor]);

  const options = useMemo<ChartOptions<"radar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      animation: {
        duration: 450,
        easing: "easeOutQuad" as const,
      },
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: 100,
          ticks: {
            display: false,
          },
          grid: {
            color: "rgba(148, 116, 76, 0.25)",
          },
          angleLines: {
            color: "rgba(148, 116, 76, 0.45)",
          },
          pointLabels: {
            font: {
              size: 14,
              weight: 600,
              family: "system-ui, sans-serif",
            },
            color: "#3f301f",
          },
        },
      },
    }),
    []
  );

  const levelCfg = getLevelConfig(experienceMeta?.experienceLevel);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Top row: Trip profile on left, Balanced badge on right */}
      {experienceMeta && (
        <div className="flex items-start justify-between gap-4 px-2 mb-1">
          {/* Left: Trip profile + tagline */}
          <div className="flex-shrink-0">
            <p className="text-base font-medium text-stone-500">
              Trip profile
            </p>
            {experienceMeta.effectTagline && (
              <p className="mt-0.5 text-sm text-stone-600 max-w-[200px]">
                {experienceMeta.effectTagline}
              </p>
            )}
          </div>

          {/* Right: Intensity badge only */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs font-medium">
            <span className={`h-2 w-2 rounded-full ${levelCfg.dotClass}`} />
            <span className={levelCfg.textClass}>{levelCfg.label}</span>
          </div>
        </div>
      )}

      {/* Radar chart container - takes up more space */}
      <div className="relative flex-1 min-h-[300px]">
        <Radar
          data={data}
          options={{
            ...options,
            plugins: {
              ...(options.plugins ?? {}),
              heroGlow: {
                enabled: style.hasGlow,
                color: hexToRgba(color, 0.55),
                blur: 32,
                lineWidth: 2.5,
              },
            } as ChartOptions<"radar">["plugins"],
          }}
          plugins={[heroGlowPlugin]}
        />
      </div>

      {/* Timeline chips below radar */}
      {experienceMeta?.timeline && (
        <div className="flex justify-center gap-3 pt-3 pb-1">
          <Chip>
            {experienceMeta.timeline.peakMinHours}–{experienceMeta.timeline.peakMaxHours}hr peak
          </Chip>
          <Chip>
            {experienceMeta.timeline.onsetMinMinutes}–{experienceMeta.timeline.onsetMaxMinutes}min onset
          </Chip>
        </div>
      )}
    </div>
  );
}
