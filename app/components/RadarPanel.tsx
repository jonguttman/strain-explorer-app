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
  modeSwitch?: React.ReactNode;
  // Strain info for card header
  strainName?: string;
  effectWord?: string;
  doseLabel?: string;
  grams?: number | null;
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

// Internal Chip component for metadata display - uses CSS variables
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span 
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em]"
      style={{ 
        background: "var(--accent-pill)", 
        color: "var(--ink-soft)",
      }}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full" 
        style={{ background: "var(--accent)" }} 
      />
      {children}
    </span>
  );
}

export function RadarPanel({ color, traits, axisLabels, doseKey, experienceMeta, modeSwitch, strainName, effectWord, doseLabel, grams }: RadarPanelProps) {
  const style = DOSE_STYLE[doseKey] ?? DOSE_STYLE.macro;
  const baseHex = doseKey === "micro" ? "#c4c4c4" : color;

  const data = useMemo(() => {
    const labels = axisLabels.map(formatAxisLabel);
    const values = axisLabels.map((axis) => traits.values[axis] ?? 0);
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: hexToRgba(baseHex, style.fillAlpha),
          borderColor: hexToRgba(baseHex, 0.85),
          borderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: hexToRgba(baseHex, 0.9),
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    };
  }, [traits, axisLabels, baseHex, style.fillAlpha]);

  // Premium radar chart options using CSS variable colors
  const chartOptions = useMemo<ChartOptions<"radar">>(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      heroGlow: {
        enabled: style.hasGlow,
        color: hexToRgba(color, style.glowOpacity ?? 0.55),
        blur: style.glowBlur ?? 32,
        lineWidth: style.borderWidth ?? 2.5,
        // Phase 8E enhancements
        innerBlur: Math.max(8, (style.glowBlur ?? 32) * 0.4),
        innerOpacity: (style.glowOpacity ?? 0.55) * 0.7,
        showPointGlow: style.pointGlow ?? false,
      },
    } as ChartOptions<"radar">["plugins"],
      animation: {
      duration: 400,
        easing: "easeOutQuad" as const,
      },
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
        suggestedMax: 100,
          ticks: {
            display: false,
          stepSize: 20,
          },
          grid: {
          color: "#e5d4bf", // --radar-grid
          lineWidth: 1,
          },
          angleLines: {
          color: "rgba(0,0,0,0.04)", // Very subtle
          lineWidth: 1,
          },
          pointLabels: {
            font: {
            size: 13,
              weight: 600,
            family: "'Libre Baskerville', Georgia, serif",
            },
          color: "#8a6c4a", // --radar-axis
          padding: 10,
          },
        },
      },
  }), [style.hasGlow, style.glowOpacity, style.glowBlur, style.borderWidth, style.pointGlow, color]);

  return (
    <div 
      className="w-full flex flex-col px-4 sm:px-8 pt-4 sm:pt-6 pb-0 relative overflow-hidden"
      style={{ 
        backgroundColor: "var(--card-inner)",
      }}
    >
      {/* Premium sunburst pattern background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/sunburst-pattern.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.5,
        }}
      />

      {/* Strain header: name + metadata on left, trip profile on right */}
      {strainName && (
        <div className="flex items-start justify-between gap-4 px-2 mb-3 sm:mb-4 relative z-10">
          {/* Left: Strain name + metadata */}
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-semibold leading-tight text-[var(--ink-main)]">
              {strainName}
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[var(--ink-soft)]">
              {[effectWord, doseLabel, grams != null ? `${grams.toFixed(grams % 1 === 0 ? 0 : 1)} g` : null].filter(Boolean).join(" · ")}
            </p>
          </div>
          {/* Right: Trip profile + tagline */}
          {experienceMeta?.effectTagline && (
            <div className="text-right">
              <p 
                className="text-[13px] sm:text-[14px] font-medium"
                style={{ color: "var(--ink-soft)" }}
              >
                Trip profile
              </p>
              <p 
                className="mt-0.5 text-[12px] sm:text-[13px] leading-snug max-w-[160px] sm:max-w-[200px]"
                style={{ color: "var(--ink-main)" }}
              >
                {experienceMeta.effectTagline}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Radar chart container - enlarged */}
      <div className="relative z-10 mx-auto w-full max-w-[540px] h-[320px] sm:h-[380px]">
        <Radar
          data={data}
          options={chartOptions}
          plugins={[heroGlowPlugin]}
        />
      </div>

      {/* Timeline chips + intensity badge below radar */}
      {experienceMeta?.timeline && (
        <div className="relative z-10 flex justify-center items-center gap-2 sm:gap-3 py-2 flex-wrap">
          <Chip>
            {experienceMeta.timeline.peakMinHours}–{experienceMeta.timeline.peakMaxHours}hr peak
          </Chip>
          {/* Intensity badge centered between timeline chips */}
          {experienceMeta.experienceLevel && (
            <span 
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em]"
              style={{ 
                background: "var(--accent-pill)", 
                color: "var(--ink-soft)",
              }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${getLevelConfig(experienceMeta.experienceLevel).dotClass}`} />
              {getLevelConfig(experienceMeta.experienceLevel).label}
            </span>
          )}
          <Chip>
            {experienceMeta.timeline.onsetMinMinutes}–{experienceMeta.timeline.onsetMaxMinutes}min onset
          </Chip>
        </div>
      )}

      {/* Mode switch at bottom */}
      {modeSwitch && (
        <div className="relative z-10 py-3" style={{ borderTop: "1px solid var(--card-border)" }}>
          <div className="flex items-center justify-center">
            {modeSwitch}
          </div>
        </div>
      )}
    </div>
  );
}
