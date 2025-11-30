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
} from "chart.js";
import type { AxisExperienceScores } from "@/lib/types";
import {
  RADAR_AXES_ORDER,
  RADAR_AXIS_LABELS_SHORT,
  getApothecaryRadarOptions,
  getExpectedDatasetStyle,
  getFeltDatasetStyle,
} from "@/lib/radarTheme";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

type FeedbackRadarPreviewProps = {
  expectedAxes: AxisExperienceScores;
  feltAxes: AxisExperienceScores;
};

export function FeedbackRadarPreview({ expectedAxes, feltAxes }: FeedbackRadarPreviewProps) {
  const data = useMemo(() => {
    // Use abbreviated labels for feedback radar
    const labels = RADAR_AXES_ORDER.map((axis) => RADAR_AXIS_LABELS_SHORT[axis]);
    const expectedValues = RADAR_AXES_ORDER.map((axis) => expectedAxes[axis] ?? 0);
    const feltValues = RADAR_AXES_ORDER.map((axis) => feltAxes[axis] ?? 0);

    const expectedStyle = getExpectedDatasetStyle();
    const feltStyle = getFeltDatasetStyle();

    return {
      labels,
      datasets: [
        {
          label: "Expected",
          data: expectedValues,
          ...expectedStyle,
          order: 2, // Draw behind
        },
        {
          label: "How it felt",
          data: feltValues,
          ...feltStyle,
          order: 1, // Draw on top
        },
      ],
    };
  }, [expectedAxes, feltAxes]);

  const options = useMemo(() => getApothecaryRadarOptions({ max: 10 }), []);

  return (
    <div className="relative" style={{ width: "100%", height: "200px" }}>
      <Radar data={data} options={options} />
    </div>
  );
}
