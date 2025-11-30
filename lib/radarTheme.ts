/**
 * Shared Apothecary Radar theme configuration
 * Used by both main kiosk radar and feedback radar preview
 */
import type { ChartOptions } from "chart.js";
import type { TraitAxisId } from "./types";

// Canonical axis order for all radar charts
export const RADAR_AXES_ORDER: TraitAxisId[] = [
  "visuals",
  "euphoria",
  "introspection",
  "creativity",
  "spiritual_depth",
  "sociability",
];

// Axis display labels (full)
export const RADAR_AXIS_LABELS: Record<TraitAxisId, string> = {
  visuals: "Visuals",
  euphoria: "Euphoria",
  introspection: "Introspection",
  creativity: "Creativity",
  spiritual_depth: "Spiritual",
  sociability: "Social",
};

// Axis display labels (abbreviated for feedback radar)
export const RADAR_AXIS_LABELS_SHORT: Record<TraitAxisId, string> = {
  visuals: "Vis",
  euphoria: "Euph",
  introspection: "Intro",
  creativity: "Creat",
  spiritual_depth: "Spirit",
  sociability: "Soc",
};

// Apothecary color palette
export const APOTHECARY_COLORS = {
  // Warm browns
  darkBrown: "#3f301f",
  mediumBrown: "#6b5841",
  lightBrown: "#8b7a5c",
  // Parchment tones
  parchment: "#faf6ef",
  cream: "#f6eddc",
  // Grid and line colors
  gridWarm: "rgba(148, 116, 76, 0.20)",
  gridAngle: "rgba(148, 116, 76, 0.35)",
  // Dataset colors
  expectedFill: "rgba(212, 193, 162, 0.35)",
  expectedBorder: "rgba(107, 88, 65, 0.7)",
  feltFill: "rgba(180, 140, 80, 0.45)",
  feltBorder: "rgba(90, 70, 45, 0.85)",
};

type ApothecaryRadarOpts = {
  max?: number;
  showLegend?: boolean;
};

/**
 * Get Chart.js options for the Apothecary-styled radar
 */
export function getApothecaryRadarOptions(opts?: ApothecaryRadarOpts): ChartOptions<"radar"> {
  const { max = 100, showLegend = false } = opts ?? {};

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: showLegend },
      tooltip: { enabled: false },
    },
    animation: {
      duration: 400,
      easing: "easeOutQuad" as const,
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        suggestedMax: max,
        ticks: {
          display: false, // No radial tick numbers
          stepSize: max / 5,
        },
        grid: {
          color: APOTHECARY_COLORS.gridWarm,
          lineWidth: 1,
        },
        angleLines: {
          color: APOTHECARY_COLORS.gridAngle,
          lineWidth: 1,
        },
        pointLabels: {
          font: {
            size: 13,
            weight: 600,
            family: "'Libre Baskerville', Georgia, serif",
          },
          color: APOTHECARY_COLORS.darkBrown,
          padding: 8,
        },
      },
    },
  };
}

export type RadarDatasetStyle = {
  borderColor: string;
  backgroundColor: string;
  pointRadius: number;
  pointHoverRadius: number;
  borderWidth: number;
  pointBackgroundColor: string;
  pointBorderColor: string;
  pointBorderWidth: number;
  borderDash?: number[];
};

/**
 * Style for the "expected" dataset (ghost/baseline shape with dotted stroke)
 */
export function getExpectedDatasetStyle(): RadarDatasetStyle {
  return {
    backgroundColor: "rgba(212, 193, 162, 0.15)", // Very light fill
    borderColor: "rgba(107, 88, 65, 0.6)",
    borderWidth: 2,
    borderDash: [6, 4], // Dotted line
    pointRadius: 2,
    pointHoverRadius: 4,
    pointBackgroundColor: "rgba(107, 88, 65, 0.5)",
    pointBorderColor: "rgba(107, 88, 65, 0.6)",
    pointBorderWidth: 1,
  };
}

/**
 * Style for the "felt" dataset (user's actual experience)
 */
export function getFeltDatasetStyle(): RadarDatasetStyle {
  return {
    backgroundColor: APOTHECARY_COLORS.feltFill,
    borderColor: APOTHECARY_COLORS.feltBorder,
    borderWidth: 2.5,
    pointRadius: 5,
    pointHoverRadius: 7,
    pointBackgroundColor: APOTHECARY_COLORS.feltBorder,
    pointBorderColor: "#fff",
    pointBorderWidth: 2,
  };
}

/**
 * Get style for the main kiosk radar (single dataset with accent color)
 */
export function getMainRadarDatasetStyle(accentColor: string, fillAlpha = 0.35): RadarDatasetStyle {
  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return {
    backgroundColor: hexToRgba(accentColor, fillAlpha),
    borderColor: hexToRgba(accentColor, 0.85),
    borderWidth: 2.5,
    pointRadius: 4,
    pointHoverRadius: 7,
    pointBackgroundColor: hexToRgba(accentColor, 0.9),
    pointBorderColor: hexToRgba(accentColor, 1),
    pointBorderWidth: 1,
  };
}

