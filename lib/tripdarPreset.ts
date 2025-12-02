// lib/tripdarPreset.ts
// =============================================================================
// TRIPDAR ANIMATION PRESET
// =============================================================================
// Default animation settings for TripdarSporeRadar on the main screen.
// These values are tuned to feel organic and visually pleasing.
// =============================================================================

export type TripdarPreset = {
  speed: number;      // Animation speed multiplier (0.5-2.0)
  intensity: number;  // Gill pointiness/jaggedness (0-1)
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
