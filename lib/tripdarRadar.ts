// lib/tripdarRadar.ts
// Shared utilities for the Tripdar spore radar visualization
// This is the single source of truth for radar math and shaping functions

import type { TraitAxisId } from "./types";

/**
 * Remaps axis values so low values (0-35%) are more visually distinct.
 * This curve ensures that:
 * - 0% → 0% (no gills)
 * - 10% → ~17% of max length
 * - 20% → ~34% of max
 * - 35% → 60% of max (clearly "medium")
 * - Higher values still have room to grow
 *
 * A small baseline (8%) is added to any non-zero value to ensure visibility.
 */
export function shapeAxisValue(v: number): number {
  const clamped = Math.max(0, Math.min(1, v));
  if (clamped === 0) return 0;

  let shaped: number;
  if (clamped <= 0.35) {
    // First segment: 0–35% stretched up to 60% of full length
    const factor = 0.6 / 0.35; // ≈ 1.714
    shaped = clamped * factor;
  } else {
    // Second segment: 35–100% mapped from 0.60–1.00
    const m = 0.4 / 0.65; // ≈ 0.615
    const b = 0.6 - m * 0.35; // ≈ 0.385
    shaped = m * clamped + b;
  }

  shaped = Math.min(1, shaped);

  // Add small baseline so any non-zero value is clearly visible
  const baseline = 0.08; // 8% of max length for any non-zero value
  return baseline + (1 - baseline) * shaped;
}

/**
 * Convert polar coordinates to cartesian
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleRad: number
): { x: number; y: number } {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

/**
 * Calculate the shortest angular distance (handles wrap-around)
 */
export function shortestAngle(a: number, b: number): number {
  const fullCircle = Math.PI * 2;
  let diff = a - b;
  while (diff > Math.PI) diff -= fullCircle;
  while (diff < -Math.PI) diff += fullCircle;
  return diff;
}

/**
 * Build an SVG arc path centered at (cx, cy)
 */
export function buildArc(
  cx: number,
  cy: number,
  midAngle: number,
  radius: number,
  halfWidth: number,
  reverse: boolean = false
): { sx: number; sy: number; ex: number; ey: number; d: string } {
  let startAngle = midAngle - halfWidth;
  let endAngle = midAngle + halfWidth;

  // For bottom labels, reverse the arc direction so text stays upright
  if (reverse) {
    const tmp = startAngle;
    startAngle = endAngle;
    endAngle = tmp;
  }

  const sx = cx + radius * Math.cos(startAngle);
  const sy = cy + radius * Math.sin(startAngle);
  const ex = cx + radius * Math.cos(endAngle);
  const ey = cy + radius * Math.sin(endAngle);

  // sweepFlag: 1 for clockwise, 0 for counter-clockwise
  const sweepFlag = reverse ? 0 : 1;

  return {
    sx,
    sy,
    ex,
    ey,
    d: `M ${sx} ${sy} A ${radius} ${radius} 0 0 ${sweepFlag} ${ex} ${ey}`,
  };
}

/**
 * Helper to create an arc path for the TripdarMark component
 */
export function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const largeArc = Math.abs(endAngleDeg - startAngleDeg) > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
}

// Axis configuration - maps TraitAxisId to display labels
export const AXIS_LABELS: Record<TraitAxisId, string> = {
  visuals: "Visuals",
  euphoria: "Euphoria",
  introspection: "Introspection",
  creativity: "Creativity",
  spiritual_depth: "Spiritual",
  sociability: "Social",
};

// Quadrant color palette for subtle tinting
export const QUADRANT_COLORS = [
  "#EAD6C0",
  "#E7D4C4",
  "#E3D1C8",
  "#E0CEC9",
  "#DDCBC8",
  "#DAC8C6",
];

// Default animation preset values
export const DEFAULT_RADAR_PRESET = {
  speed: 1.2,
  intensity: 0.55,
} as const;

// =============================================================================
// VISUAL OVERRIDES - Comprehensive tuning for the radar visualization
// =============================================================================

/**
 * Complete visual override configuration for TripdarSporeRadar.
 * All values are optional - undefined means use default.
 */
export type TripdarVisualOverrides = {
  // -------------------------------------------------------------------------
  // Color Cast / Vibe Wedges
  // -------------------------------------------------------------------------
  /** Enable color cast wedges behind gills for maxed vibes */
  castEnabled?: boolean;
  /** Base opacity for cast wedges (0-0.25) */
  castBaseOpacity?: number;
  /** Inner radius of cast as fraction of outer radius (0-1) */
  castInnerRadius?: number;
  /** Outer radius of cast as fraction of outer radius (0-1) */
  castOuterRadius?: number;
  /** How strongly strain color tints the cast (0-1) */
  castBlendStrength?: number;

  // -------------------------------------------------------------------------
  // Rails / Dose Arches
  // -------------------------------------------------------------------------
  /** Minimum angle width in degrees (pencil line at low values) */
  railMinAngleWidth?: number;
  /** Maximum angle width in degrees (full arc at high values) */
  railMaxAngleWidth?: number;
  /** Minimum thickness in px */
  railMinThickness?: number;
  /** Maximum thickness in px */
  railMaxThickness?: number;
  /** Minimum opacity (0-1) */
  railMinOpacity?: number;
  /** Maximum opacity (0-1) */
  railMaxOpacity?: number;
  /** Value threshold above which rails bounce (0-1, e.g. 0.8) */
  railEdgeBounceThreshold?: number;
  /** Extra width multiplier when bouncing (0-0.2) */
  railEdgeBounceAmount?: number;
  /** Radius offset for rails (negative = inside stroke to hug circle) */
  railRadiusOffset?: number;

  // -------------------------------------------------------------------------
  // Gills / Spore Texture
  // -------------------------------------------------------------------------
  /** Number of gill lines (120-400) */
  gillCount?: number;
  /** Base length as fraction of max (0-1) */
  gillBaseLength?: number;
  /** Maximum length as fraction (0-1) */
  gillMaxLength?: number;
  /** Base stroke width in px */
  gillBaseThickness?: number;
  /** Maximum stroke width in px */
  gillMaxThickness?: number;
  /** Minimum jaggedness/roughness (0-1) */
  jaggednessMin?: number;
  /** Maximum jaggedness/roughness (0-1) */
  jaggednessMax?: number;
  /** Strength of low-value shaping (0-1, how aggressively 0-35% is stretched) */
  lowValueShapingStrength?: number;
  /** Baseline visibility for any non-zero value (0-0.2) */
  lowValueBaseline?: number;

  // -------------------------------------------------------------------------
  // Animation & Motion
  // -------------------------------------------------------------------------
  /** Degrees per step when spinning between strains */
  spinDegreesPerStep?: number;
  /** Duration of spin animation in ms */
  spinDurationMs?: number;
  /** Amount of organic noise/fidget (0-1) */
  noiseAmount?: number;
  /** Speed of noise animation (0-2) */
  noiseSpeed?: number;
  /** Amplitude of breathing animation (0-1) */
  breathAmplitude?: number;
  /** Duration of one breath cycle in ms */
  breathDurationMs?: number;

  // -------------------------------------------------------------------------
  // Gaussian Falloff (advanced)
  // -------------------------------------------------------------------------
  /** Minimum sigma for Gaussian falloff (controls how pointy gills are) */
  gaussianSigmaMin?: number;
  /** Maximum sigma for Gaussian falloff */
  gaussianSigmaMax?: number;
};

/**
 * Default visual overrides matching the current radar behavior.
 * These values are used when no override is provided.
 */
export const DEFAULT_VISUAL_OVERRIDES: Required<TripdarVisualOverrides> = {
  // Color cast
  castEnabled: true,
  castBaseOpacity: 0.06,
  castInnerRadius: 0.5,
  castOuterRadius: 0.99,
  castBlendStrength: 1.0,

  // Rails
  railMinAngleWidth: 4,
  railMaxAngleWidth: 45,
  railMinThickness: 4,
  railMaxThickness: 10,
  railMinOpacity: 0.5,
  railMaxOpacity: 0.9,
  railEdgeBounceThreshold: 0.8,
  railEdgeBounceAmount: 0.08,
  railRadiusOffset: 8, // positive = outside the outer circle edge

  // Gills
  gillCount: 260,
  gillBaseLength: 0.16, // inner radius as fraction of size
  gillMaxLength: 0.4, // outer radius as fraction of size
  gillBaseThickness: 0.4,
  gillMaxThickness: 1.2,
  jaggednessMin: 0.008,
  jaggednessMax: 0.04,
  lowValueShapingStrength: 1.0,
  lowValueBaseline: 0.08,

  // Animation
  spinDegreesPerStep: 55,
  spinDurationMs: 600,
  noiseAmount: 0.03,
  noiseSpeed: 1.0,
  breathAmplitude: 0.03,
  breathDurationMs: 5000,

  // Gaussian
  gaussianSigmaMin: Math.PI / 16,
  gaussianSigmaMax: Math.PI / 5,
};

/**
 * Merge user overrides with defaults, returning a complete config.
 */
export function mergeVisualOverrides(
  overrides?: TripdarVisualOverrides
): Required<TripdarVisualOverrides> {
  return { ...DEFAULT_VISUAL_OVERRIDES, ...(overrides || {}) };
}

/**
 * Configurable version of shapeAxisValue that respects override settings.
 * @param v - Raw value 0-1
 * @param strength - How aggressively to apply the shaping (0-1)
 * @param baseline - Minimum visible length for non-zero values
 */
export function shapeAxisValueConfigurable(
  v: number,
  strength: number = 1,
  baseline: number = 0.08
): number {
  const clamped = Math.max(0, Math.min(1, v));
  if (clamped === 0) return 0;

  // Calculate the shaped value with configurable strength
  let shaped: number;
  if (clamped <= 0.35) {
    const factor = 0.6 / 0.35;
    shaped = clamped * factor * strength + clamped * (1 - strength);
  } else {
    const m = 0.4 / 0.65;
    const b = 0.6 - m * 0.35;
    const strongShaped = m * clamped + b;
    shaped = strongShaped * strength + clamped * (1 - strength);
  }

  shaped = Math.min(1, shaped);
  return baseline + (1 - baseline) * shaped;
}

