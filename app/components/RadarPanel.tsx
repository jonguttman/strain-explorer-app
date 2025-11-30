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
import { getApothecaryRadarOptions, getMainRadarDatasetStyle } from "@/lib/radarTheme";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

type RadarPanelProps = {
  color: string;
  traits: DoseTraits;
  axisLabels: TraitAxisId[];
  doseKey: DoseKey;
  experienceMeta?: StrainExperienceMeta;
  modeSwitch?: React.ReactNode;
};

// Warm apothecary colors
const WARM = {
  dark: "#3f301f",      // Deep warm brown
  medium: "#6b5841",    // Medium brown  
  light: "#8b7a5c",     // Light brown
  cream: "#f6eddc",     // Warm cream
};

// Helper to get level styling config - warm tones
function getLevelConfig(level?: ExperienceLevel) {
  switch (level) {
    case "gentle":
      return { label: "Gentle", dotClass: "bg-emerald-500", textClass: "text-emerald-800" };
    case "intense":
      return { label: "Intense", dotClass: "bg-rose-500", textClass: "text-rose-800" };
    case "balanced":
    default:
      return { label: "Balanced", dotClass: "bg-amber-500", textClass: "text-amber-800" };
  }
}

// Internal Chip component for metadata display - warm cream with brown text
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span 
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs uppercase tracking-[0.1em] shadow-sm"
      style={{ 
        backgroundColor: WARM.cream, 
        color: WARM.medium,
        border: `1px solid ${WARM.light}40`
      }}
    >
      {children}
    </span>
  );
}

export function RadarPanel({ color, traits, axisLabels, doseKey, experienceMeta, modeSwitch }: RadarPanelProps) {
  const style = DOSE_STYLE[doseKey] ?? DOSE_STYLE.macro;
  const baseHex = doseKey === "micro" ? "#c4c4c4" : color;
  
  // Use shared theme for dataset styling
  const datasetStyle = getMainRadarDatasetStyle(baseHex, style.fillAlpha);

  const data = useMemo(() => {
    const labels = axisLabels.map(formatAxisLabel);
    const values = axisLabels.map((axis) => traits.values[axis] ?? 0);
    return {
      labels,
      datasets: [
        {
          data: values,
          ...datasetStyle,
        },
      ],
    };
  }, [traits, axisLabels, datasetStyle]);

  // Use shared Apothecary radar options
  const baseOptions = useMemo(() => getApothecaryRadarOptions({ max: 100 }), []);

  const levelCfg = getLevelConfig(experienceMeta?.experienceLevel);

  // Create radial gradient - white center over radar, transitions through labels to accent color
  const gradientBg = `radial-gradient(circle at 50% 45%, 
    white 0%, 
    white 35%, 
    ${hexToRgba(baseHex, 0.08)} 55%, 
    ${hexToRgba(baseHex, 0.15)} 100%)`;

  return (
    <div 
      className="w-full flex flex-col px-4 pt-3 pb-0"
      style={{ background: gradientBg }}
    >
      {/* Top row: Trip profile on left, Balanced badge on right */}
      {experienceMeta && (
        <div className="flex items-start justify-between gap-4 px-2 mb-1">
          {/* Left: Trip profile + tagline */}
          <div className="flex-shrink-0">
            <p className="text-base font-medium" style={{ color: WARM.medium }}>
              Trip profile
            </p>
            {experienceMeta.effectTagline && (
              <p className="mt-0.5 text-sm max-w-[200px]" style={{ color: WARM.dark }}>
                {experienceMeta.effectTagline}
              </p>
            )}
          </div>

          {/* Right: Intensity badge - warm cream pill */}
          <div 
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm"
            style={{ 
              backgroundColor: WARM.cream,
              border: `1px solid ${WARM.light}40`
            }}
          >
            <span className={`h-2 w-2 rounded-full ${levelCfg.dotClass}`} />
            <span className={levelCfg.textClass}>{levelCfg.label}</span>
          </div>
        </div>
      )}

      {/* Radar chart container - explicit height for proper sizing */}
      <div className="relative mx-auto w-full max-w-[520px] h-[320px] sm:h-[360px]">
        <Radar
          data={data}
          options={{
            ...baseOptions,
            plugins: {
              ...(baseOptions.plugins ?? {}),
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
        <div className="flex justify-center gap-3 py-1">
          <Chip>
            {experienceMeta.timeline.peakMinHours}–{experienceMeta.timeline.peakMaxHours}hr peak
          </Chip>
          <Chip>
            {experienceMeta.timeline.onsetMinMinutes}–{experienceMeta.timeline.onsetMaxMinutes}min onset
          </Chip>
        </div>
      )}

      {/* Mode switch at bottom */}
      {modeSwitch && (
        <div className="py-2" style={{ borderTop: `1px solid ${WARM.light}30` }}>
          <div className="flex items-center justify-center">
            {modeSwitch}
          </div>
        </div>
      )}
    </div>
  );
}
