/**
 * cosmicThemeChoreography.ts
 * 
 * Phase 8B: Choreography profiles for theme variants
 * 
 * Choreography profiles control motion behavior (speeds, amplitudes, durations)
 * independent of visual styling. Each theme can have its own choreography feel.
 */

import type { CosmicPresetId } from "./cosmicThemeVisualPresets";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Transition timing configuration
 */
export interface TransitionConfig {
  /** Duration of strain change transition in ms */
  strainChangeDurationMs: number;
  
  /** Duration of dose change transition in ms */
  doseChangeDurationMs: number;
  
  /** Duration of theme crossfade in ms */
  themeCrossfadeDurationMs: number;
  
  /** Easing function name */
  easing: "linear" | "ease-in-out" | "ease-out" | "ease-in";
}

/**
 * Motion amplitude modifiers relative to baseline
 */
export interface MotionAmplitudes {
  /** Star drift range multiplier (1.0 = baseline) */
  starDrift: number;
  
  /** Star twinkle intensity multiplier */
  starTwinkle: number;
  
  /** Halo rotation speed multiplier */
  haloRotation: number;
  
  /** Halo intensity pulse multiplier */
  haloPulse: number;
  
  /** Radar breathing amplitude multiplier */
  radarBreathing: number;
  
  /** Radar wobble strength multiplier */
  radarWobble: number;
  
  /** Message glow intensity multiplier */
  messageGlow: number;
}

/**
 * Complete choreography profile
 */
export interface ChoreographyProfile {
  id: CosmicPresetId;
  name: string;
  
  /** Transition timing */
  transitions: TransitionConfig;
  
  /** Motion amplitude modifiers */
  amplitudes: MotionAmplitudes;
  
  /** Whether to enable multi-band halo (false = single band only) */
  enableMultiBandHalo: boolean;
  
  /** Whether to enable two-layer stars (false = single layer only) */
  enableDualStarLayers: boolean;
  
  /** Global speed multiplier for all animations */
  globalSpeedMultiplier: number;
}

// ============================================================================
// PROFILE: COSMIC (Default)
// ============================================================================

export const COSMIC_CHOREOGRAPHY: ChoreographyProfile = {
  id: "cosmic",
  name: "Cosmic",
  
  transitions: {
    strainChangeDurationMs: 300,
    doseChangeDurationMs: 250,
    themeCrossfadeDurationMs: 500,
    easing: "ease-in-out",
  },
  
  amplitudes: {
    starDrift: 1.0,
    starTwinkle: 1.0,
    haloRotation: 1.0,
    haloPulse: 1.0,
    radarBreathing: 1.0,
    radarWobble: 1.0,
    messageGlow: 1.0,
  },
  
  enableMultiBandHalo: true,
  enableDualStarLayers: true,
  globalSpeedMultiplier: 1.0,
};

// ============================================================================
// PROFILE: APOTHECARY
// ============================================================================

/**
 * Apothecary Choreography - Phase 8B Enhanced
 * 
 * Design notes:
 * - "Candle flicker" motion: slow, warm, organic
 * - Longer blend transitions (400ms vs 300ms standard)
 * - Reduced star drift amplitudes for calm feel
 * - Message opacity with extended fade envelope
 * - Halo rotates slowly like candlelight wavering
 */
export const APOTHECARY_CHOREOGRAPHY: ChoreographyProfile = {
  id: "apothecary",
  name: "Apothecary",
  
  transitions: {
    strainChangeDurationMs: 450,  // Slower, deliberate transitions
    doseChangeDurationMs: 400,    // Unhurried dose changes
    themeCrossfadeDurationMs: 700, // Graceful crossfade
    easing: "ease-out",
  },
  
  amplitudes: {
    starDrift: 0.45,      // Very gentle drift, like dust motes
    starTwinkle: 0.55,    // Soft, subtle twinkle
    haloRotation: 0.35,   // Very slow rotation ("candle waver")
    haloPulse: 0.6,       // Gentle breathing pulse
    radarBreathing: 0.55, // Calm, measured breathing
    radarWobble: 0.3,     // Minimal wobble, stable feel
    messageGlow: 0.5,     // Subtle warm glow
  },
  
  enableMultiBandHalo: true,   // Warm amber multi-band creates depth
  enableDualStarLayers: true,  // Subtle parallax effect
  globalSpeedMultiplier: 0.65, // 35% slower overall
};

// ============================================================================
// PROFILE: MINIMAL
// ============================================================================

export const MINIMAL_CHOREOGRAPHY: ChoreographyProfile = {
  id: "minimal",
  name: "Minimal",
  
  transitions: {
    strainChangeDurationMs: 200,  // Quick, snappy
    doseChangeDurationMs: 150,
    themeCrossfadeDurationMs: 300,
    easing: "ease-out",
  },
  
  amplitudes: {
    starDrift: 0.3,       // Very subtle
    starTwinkle: 0.4,
    haloRotation: 0.3,
    haloPulse: 0.4,
    radarBreathing: 0.4,
    radarWobble: 0.2,
    messageGlow: 0.3,
  },
  
  enableMultiBandHalo: false,  // Single band only
  enableDualStarLayers: false, // Single layer only
  globalSpeedMultiplier: 0.6,  // Quite slow and subtle
};

// ============================================================================
// PROFILE MAP
// ============================================================================

export const CHOREOGRAPHY_PROFILES: Record<CosmicPresetId, ChoreographyProfile> = {
  cosmic: COSMIC_CHOREOGRAPHY,
  apothecary: APOTHECARY_CHOREOGRAPHY,
  minimal: MINIMAL_CHOREOGRAPHY,
};

/**
 * Gets a choreography profile by ID, falling back to cosmic if not found
 */
export function getChoreographyProfile(id: CosmicPresetId): ChoreographyProfile {
  return CHOREOGRAPHY_PROFILES[id] ?? COSMIC_CHOREOGRAPHY;
}

/**
 * Applies choreography amplitude modifiers to timeline frame values
 */
export function applyChoreographyAmplitudes<T extends number>(
  value: T,
  amplitudeKey: keyof MotionAmplitudes,
  profile: ChoreographyProfile
): number {
  const amplitude = profile.amplitudes[amplitudeKey];
  const speed = profile.globalSpeedMultiplier;
  return value * amplitude * speed;
}

/**
 * Gets transition duration with optional override
 */
export function getTransitionDuration(
  transitionType: keyof TransitionConfig,
  profile: ChoreographyProfile,
  overrideMs?: number
): number {
  if (overrideMs !== undefined) return overrideMs;
  const value = profile.transitions[transitionType];
  return typeof value === "number" ? value : 300;
}

/**
 * CSS easing string from profile
 */
export function getTransitionEasing(profile: ChoreographyProfile): string {
  switch (profile.transitions.easing) {
    case "linear": return "linear";
    case "ease-in": return "ease-in";
    case "ease-out": return "ease-out";
    case "ease-in-out": 
    default: return "ease-in-out";
  }
}
