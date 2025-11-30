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
import type { DoseKey, TraitAxisId, DoseTraits } from "@/lib/types";
import { formatAxisLabel, hexToRgba } from "@/lib/utils";
import { DOSE_STYLE, heroGlowPlugin } from "./strainConstants";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

type RadarPanelProps = {
  color: string;
  traits: DoseTraits;
  axisLabels: TraitAxisId[];
  doseKey: DoseKey;
};

export function RadarPanel({ color, traits, axisLabels, doseKey }: RadarPanelProps) {
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
          borderWidth: style.borderWidth,
          pointRadius: 2,
          pointBackgroundColor: borderColor,
          pointBorderColor: borderColor,
        },
      ],
    };
  }, [traits, axisLabels, fillColor, borderColor, style.borderWidth]);

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
              size: 13,
              weight: 600,
              family: "serif",
            },
            color: "#5e4a30",
          },
        },
      },
    }),
    []
  );

  return (
    <div className="h-full w-full">
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
              lineWidth: style.borderWidth + 0.5,
            },
          } as ChartOptions<"radar">["plugins"],
        }}
        plugins={[heroGlowPlugin]}
      />
    </div>
  );
}

