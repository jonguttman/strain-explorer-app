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
import { formatAxisLabel } from "@/lib/utils";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

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
      labels: axes.map(formatAxisLabel),
      datasets: [
        {
          data: axes.map((axis) => strain.radar[axis]?.[doseIndex] ?? 0),
          backgroundColor: "rgba(15, 23, 42, 0.25)",
          borderColor: "#0f172a",
          borderWidth: 1,
          pointRadius: 1.5,
          pointBackgroundColor: "#0f172a",
        },
      ],
    };
  }, [axes, strain, doseIndex]);

  if (!isClient) {
    return (
      <div className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-4 text-center text-xs text-slate-500">
        Loading preview…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-4 text-center text-xs text-slate-500">
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
          font: { size: 9 },
          color: "#475569",
        },
      },
    },
  } as const;

  return (
    <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Preview
      </div>
      <div className="h-40 w-full">
        <Radar data={data} options={options} />
      </div>
    </div>
  );
}
