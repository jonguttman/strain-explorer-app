// lib/tripdarPreset.ts
// =============================================================================
// TRIPDAR ANIMATION PRESET
// =============================================================================
// Default animation settings for TripdarSporeRadar on the main screen.
// These values are tuned to feel organic and visually pleasing.
// =============================================================================

import type { TripdarVisualSkin } from "./types";

/**
 * Visual overrides specific to the Golden Aura skin.
 * All values are optional - undefined means use default.
 */
export type GoldenAuraSkinOverrides = {
  bloomIntensity?: number;    // Background bloom strength (0-1)
  grainOpacity?: number;      // Film grain overlay opacity (0-1)
  plateGloss?: number;        // Golden plate bevel/gloss strength (0-1)
  starBrightness?: number;    // Vertex star brightness (0-1)
  radarStrokeWidth?: number;  // Polygon stroke width (1-4)
  ringOpacity?: number;       // Concentric ring opacity (0-1)
  labelScale?: number;        // Label font size multiplier (0.8-1.5)
  haloIntensity?: number;     // Backlight halo intensity (0-1)
  starfieldDensity?: number;  // Background starfield density (0-1, 0=off)
  radarBrightness?: number;   // Radar line brightness/contrast (0-1)
};

export type TripdarPreset = {
  speed: number;                              // Animation speed multiplier (0.5-2.0)
  intensity: number;                          // Gill pointiness/jaggedness (0-1)
  visualSkin?: TripdarVisualSkin;             // Which visual skin to use
  goldenAuraOverrides?: GoldenAuraSkinOverrides; // Golden Aura-specific tuning
};

/**
 * Default preset used by the main Tripdar radar display.
 * 
 * speed: 1.2 - Slightly faster than base for lively feel
 * intensity: 0.55 - Moderate pointiness, balanced between soft and spiky
 */
export const TRIPDAR_PRESET: TripdarPreset = {
  speed: 1.2,
  intensity: 0.55,
};
