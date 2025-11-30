"use client";

import { useMemo } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Filler,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import type { StrainJsonEntry, TraitAxisId } from "./types";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

// Abbreviated axis labels for the mini preview
const AXIS_LABEL_SHORT: Record<TraitAxisId, string> = {
  visuals: "Vis",
  euphoria: "Euph",
  introspection: "Intro",
  creativity: "Creat",
  spiritual_depth: "Spirit",
  sociability: "Soc",
};

type MiniRadarProps = {
  axes: TraitAxisId[];
  strain?: StrainJsonEntry;
  doseIndex: number;
};

export default function MiniRadarPreview({
  axes,
  strain,
  doseIndex,
}: MiniRadarProps) {
  const isClient = typeof window !== "undefined";

  const data = useMemo(() => {
    if (!strain || doseIndex < 0) return null;
    return {
      labels: axes.map((axis) => AXIS_LABEL_SHORT[axis] ?? axis),
      datasets: [
        {
          data: axes.map((axis) => strain.radar[axis]?.[doseIndex] ?? 0),
          backgroundColor: "rgba(15, 23, 42, 0.25)",
          borderColor: "#0f172a",
          borderWidth: 1.5,
          pointRadius: 2,
          pointBackgroundColor: "#0f172a",
        },
      ],
    };
  }, [axes, strain, doseIndex]);

  if (!isClient) {
    return (
      <div className="text-center text-xs text-slate-500 py-4">
        Loading preview…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-xs text-slate-500 py-4">
        No preview
      </div>
    );
  }

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: { display: false },
        angleLines: { color: "rgba(148, 163, 184, 0.6)" },
        grid: { color: "rgba(148, 163, 184, 0.3)" },
        pointLabels: {
          font: { size: 9, weight: 500 },
          color: "#475569",
        },
      },
    },
  } as const;

  return (
    <div className="h-44 w-full">
      <Radar data={data} options={options} />
    </div>
  );
}
