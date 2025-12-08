/**
 * timelineEngine.ts
 * 
 * Phase 8A: Cosmic Timeline 2.0 - Multi-band layered animation system
 * 
 * This engine produces deterministic animation frames based on:
 * - Time position within an 8-second loop
 * - Effect word category (energetic, introspective, social, spiritual, balanced)
 * - Dose intensity bucket (micro, low, medium, high, heroic)
 * - Strain-specific signature hash
 * 
 * All outputs are pure functions of inputs - no unseeded randomness.
 */

import type { 
  EffectWordCategory, 
  DoseIntensityBucket,
} from "@/app/lib/tripdarExperienceState";
import { hashToFloat } from "@/app/lib/tripdarExperienceState";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Single halo band animation state
 */
export interface HaloBandFrame {
  intensity: number;      // 0-1, brightness/opacity
  rotation: number;       // degrees
  layerOpacity: number;   // 0-1, layer visibility
}

/**
 * Multi-band halo animation state
 */
export interface HaloFrame {
  bands: HaloBandFrame[];           // Up to 3 bands
  // Legacy compatibility fields
  primaryIntensity: number;         // Same as bands[0].intensity
  primaryRotation: number;          // Same as bands[0].rotation
}

/**
 * Single star layer animation state
 */
export interface StarLayerFrame {
  twinkle: number;      // 0-1, sparkle intensity
  driftX: number;       // -1 to 1, horizontal drift
  driftY: number;       // -1 to 1, vertical drift
  scale: number;        // 0.8-1.2, size variation
}

/**
 * Two-layer star animation state
 */
export interface StarsFrame {
  foreground: StarLayerFrame;       // Higher twinkle, larger drift
  background: StarLayerFrame;       // Slower, subtler, parallax feel
  // Legacy compatibility fields
  twinkle: number;                  // Average of both layers
  driftX: number;                   // Foreground driftX
  driftY: number;                   // Foreground driftY
}

/**
 * Radar polygon animation state
 */
export interface RadarFrame {
  wobble: number;                   // 0-1, edge distortion amount
  pulse: number;                    // 0-1, scale pulse amount
  secondaryWobbleFreq: number;      // Secondary wobble frequency multiplier
  breathingPhase: number;           // 0-1, breathing cycle position
}

/**
 * Message display animation state
 */
export interface MessageFrame {
  opacity: number;        // 0-1, text opacity
  scale: number;          // 0.9-1.1, text scale
  glowIntensity: number;  // 0-1, glow effect strength
}

/**
 * Complete animation frame for all Cosmic components
 */
export interface CosmicTimelineFrame {
  // Timestamp
  t: number;                        // Time in seconds (0-8 loop)
  loopProgress: number;             // 0-1, position in current loop
  
  // Component frames
  halo: HaloFrame;
  stars: StarsFrame;
  radar: RadarFrame;
  message: MessageFrame;
  
  // Global modifiers
  globalIntensity: number;          // 0-1, overall animation strength
  reduceMotion: boolean;            // Accessibility flag
}

/**
 * Timeline configuration derived from experience state
 */
export interface TimelineConfig {
  effectCategory: EffectWordCategory;
  doseIntensity: DoseIntensityBucket;
  strainSeed: number;
  reduceMotion: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Duration of one animation loop in seconds */
export const LOOP_DURATION_SECONDS = 8;

/** Target frame rate for smooth animation */
export const TARGET_FPS = 60;

/** Frame interval in milliseconds */
export const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;

// ============================================================================
// MOTION PROFILES
// ============================================================================

/**
 * Motion profile settings per effect category
 */
interface MotionProfile {
  haloSpeed: number;          // Rotation speed multiplier
  haloBands: number;          // Number of halo bands (1-3)
  starTwinkleRate: number;    // Twinkle frequency
  starDriftAmplitude: number; // Drift range
  radarWobbleStrength: number;// Wobble intensity
  breathingRate: number;      // Breathing cycle speed
  messageGlowStrength: number;// Message glow intensity
}

const MOTION_PROFILES: Record<EffectWordCategory, MotionProfile> = {
  energetic: {
    haloSpeed: 1.3,
    haloBands: 3,
    starTwinkleRate: 1.4,
    starDriftAmplitude: 0.8,
    radarWobbleStrength: 0.6,
    breathingRate: 1.2,
    messageGlowStrength: 0.7,
  },
  introspective: {
    haloSpeed: 0.7,
    haloBands: 2,
    starTwinkleRate: 0.6,
    starDriftAmplitude: 0.4,
    radarWobbleStrength: 0.3,
    breathingRate: 0.7,
    messageGlowStrength: 0.4,
  },
  social: {
    haloSpeed: 1.0,
    haloBands: 2,
    starTwinkleRate: 1.0,
    starDriftAmplitude: 0.6,
    radarWobbleStrength: 0.4,
    breathingRate: 1.0,
    messageGlowStrength: 0.5,
  },
  spiritual: {
    haloSpeed: 0.5,
    haloBands: 3,
    starTwinkleRate: 0.5,
    starDriftAmplitude: 0.3,
    radarWobbleStrength: 0.2,
    breathingRate: 0.5,
    messageGlowStrength: 0.6,
  },
  balanced: {
    haloSpeed: 0.85,
    haloBands: 2,
    starTwinkleRate: 0.8,
    starDriftAmplitude: 0.5,
    radarWobbleStrength: 0.35,
    breathingRate: 0.85,
    messageGlowStrength: 0.45,
  },
};

/**
 * Intensity multipliers per dose bucket
 */
const DOSE_INTENSITY_MULTIPLIERS: Record<DoseIntensityBucket, number> = {
  micro: 0.4,
  low: 0.6,
  medium: 0.85,
  high: 1.0,
  heroic: 1.2,
};

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

/** Smooth sine easing */
function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/** Gentle breathing curve */
function breathingCurve(t: number): number {
  // Asymmetric breathing: slower inhale, slightly faster exhale
  const phase = t % 1;
  if (phase < 0.6) {
    return easeInOutSine(phase / 0.6);
  } else {
    return easeInOutSine(1 - (phase - 0.6) / 0.4);
  }
}

// ============================================================================
// FRAME COMPUTATION
// ============================================================================

/**
 * Computes a single halo band frame
 */
function computeHaloBand(
  t: number,
  bandIndex: number,
  profile: MotionProfile,
  doseMultiplier: number,
  strainSeed: number
): HaloBandFrame {
  const bandOffset = hashToFloat(strainSeed, bandIndex * 100);
  const phaseOffset = bandIndex * (2 * Math.PI / 3); // 120° offset per band
  
  const baseRotation = t * profile.haloSpeed * 45 * doseMultiplier;
  const rotation = (baseRotation + bandOffset * 30 + bandIndex * 60) % 360;
  
  const intensityWave = Math.sin((t * profile.haloSpeed * Math.PI) + phaseOffset);
  const intensity = 0.5 + 0.3 * intensityWave * doseMultiplier;
  
  // Outer bands are more transparent
  const layerOpacity = 1 - bandIndex * 0.25;
  
  return {
    intensity: Math.max(0, Math.min(1, intensity)),
    rotation,
    layerOpacity,
  };
}

/**
 * Computes multi-band halo frame
 */
function computeHaloFrame(
  t: number,
  profile: MotionProfile,
  doseMultiplier: number,
  strainSeed: number
): HaloFrame {
  const bands: HaloBandFrame[] = [];
  
  for (let i = 0; i < profile.haloBands; i++) {
    bands.push(computeHaloBand(t, i, profile, doseMultiplier, strainSeed));
  }
  
  return {
    bands,
    primaryIntensity: bands[0]?.intensity ?? 0.5,
    primaryRotation: bands[0]?.rotation ?? 0,
  };
}

/**
 * Computes a single star layer frame
 */
function computeStarLayer(
  t: number,
  isBackground: boolean,
  profile: MotionProfile,
  doseMultiplier: number,
  strainSeed: number
): StarLayerFrame {
  const layerOffset = isBackground ? 0.5 : 0;
  const speedMult = isBackground ? 0.5 : 1.0;
  const ampMult = isBackground ? 0.6 : 1.0;
  
  const seedOffset = hashToFloat(strainSeed, isBackground ? 500 : 600);
  
  const twinkleBase = Math.sin((t + seedOffset) * profile.starTwinkleRate * Math.PI * 2 * speedMult);
  const twinkle = 0.5 + 0.4 * twinkleBase * doseMultiplier;
  
  const driftPhase = (t * speedMult + layerOffset) * Math.PI * 0.5;
  const driftX = Math.sin(driftPhase + seedOffset * 2 * Math.PI) * profile.starDriftAmplitude * ampMult * doseMultiplier;
  const driftY = Math.cos(driftPhase * 0.7 + seedOffset * 2 * Math.PI) * profile.starDriftAmplitude * 0.6 * ampMult * doseMultiplier;
  
  const scaleWave = Math.sin((t + seedOffset) * Math.PI * speedMult);
  const scale = 1 + 0.1 * scaleWave * doseMultiplier;
  
  return {
    twinkle: Math.max(0, Math.min(1, twinkle)),
    driftX: Math.max(-1, Math.min(1, driftX)),
    driftY: Math.max(-1, Math.min(1, driftY)),
    scale: Math.max(0.8, Math.min(1.2, scale)),
  };
}

/**
 * Computes two-layer star frame
 */
function computeStarsFrame(
  t: number,
  profile: MotionProfile,
  doseMultiplier: number,
  strainSeed: number
): StarsFrame {
  const foreground = computeStarLayer(t, false, profile, doseMultiplier, strainSeed);
  const background = computeStarLayer(t, true, profile, doseMultiplier, strainSeed);
  
  return {
    foreground,
    background,
    // Legacy compatibility
    twinkle: (foreground.twinkle + background.twinkle) / 2,
    driftX: foreground.driftX,
    driftY: foreground.driftY,
  };
}

/**
 * Computes radar animation frame
 */
function computeRadarFrame(
  t: number,
  profile: MotionProfile,
  doseMultiplier: number,
  strainSeed: number
): RadarFrame {
  const seedOffset = hashToFloat(strainSeed, 700);
  
  // Primary wobble
  const wobbleWave = Math.sin((t + seedOffset) * Math.PI * 2 * profile.breathingRate);
  const wobble = 0.5 + 0.3 * wobbleWave * profile.radarWobbleStrength * doseMultiplier;
  
  // Pulse
  const pulseWave = breathingCurve((t / LOOP_DURATION_SECONDS + seedOffset) % 1);
  const pulse = 0.02 * pulseWave * doseMultiplier;
  
  // Secondary wobble frequency (strain-specific variation)
  const secondaryWobbleFreq = 1.5 + hashToFloat(strainSeed, 800) * 0.5;
  
  // Breathing phase
  const breathingPhase = ((t * profile.breathingRate) / LOOP_DURATION_SECONDS) % 1;
  
  return {
    wobble: Math.max(0, Math.min(1, wobble)),
    pulse: Math.max(0, Math.min(0.1, pulse)),
    secondaryWobbleFreq,
    breathingPhase,
  };
}

/**
 * Computes message animation frame
 */
function computeMessageFrame(
  t: number,
  profile: MotionProfile,
  doseMultiplier: number,
  strainSeed: number
): MessageFrame {
  const seedOffset = hashToFloat(strainSeed, 900);
  const loopProgress = (t % LOOP_DURATION_SECONDS) / LOOP_DURATION_SECONDS;
  
  // Opacity envelope: fade in, hold, fade out
  let opacity: number;
  if (loopProgress < 0.15) {
    opacity = easeInOutSine(loopProgress / 0.15);
  } else if (loopProgress > 0.85) {
    opacity = easeInOutSine((1 - loopProgress) / 0.15);
  } else {
    opacity = 1;
  }
  
  // Subtle scale breathing
  const scaleWave = Math.sin((t + seedOffset) * Math.PI * profile.breathingRate * 0.5);
  const scale = 1 + 0.02 * scaleWave * doseMultiplier;
  
  // Glow intensity
  const glowWave = Math.sin((t + seedOffset * 2) * Math.PI * 0.5);
  const glowIntensity = (0.3 + 0.2 * glowWave) * profile.messageGlowStrength * doseMultiplier;
  
  return {
    opacity: Math.max(0, Math.min(1, opacity)),
    scale: Math.max(0.9, Math.min(1.1, scale)),
    glowIntensity: Math.max(0, Math.min(1, glowIntensity)),
  };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Builds a complete timeline frame for the given time and configuration
 * This is the main entry point for the timeline engine.
 */
export function buildCosmicTimelineFrame(
  timeSeconds: number,
  config: TimelineConfig
): CosmicTimelineFrame {
  const { effectCategory, doseIntensity, strainSeed, reduceMotion } = config;
  
  // Get motion profile and dose multiplier
  const profile = MOTION_PROFILES[effectCategory];
  const doseMultiplier = DOSE_INTENSITY_MULTIPLIERS[doseIntensity];
  
  // Wrap time to loop duration
  const t = timeSeconds % LOOP_DURATION_SECONDS;
  const loopProgress = t / LOOP_DURATION_SECONDS;
  
  // If reduceMotion is enabled, return static frame
  if (reduceMotion) {
    return createStaticFrame(t, loopProgress);
  }
  
  return {
    t,
    loopProgress,
    halo: computeHaloFrame(t, profile, doseMultiplier, strainSeed),
    stars: computeStarsFrame(t, profile, doseMultiplier, strainSeed),
    radar: computeRadarFrame(t, profile, doseMultiplier, strainSeed),
    message: computeMessageFrame(t, profile, doseMultiplier, strainSeed),
    globalIntensity: doseMultiplier,
    reduceMotion: false,
  };
}

/**
 * Creates a static frame for reduceMotion accessibility
 */
function createStaticFrame(t: number, loopProgress: number): CosmicTimelineFrame {
  return {
    t,
    loopProgress,
    halo: {
      bands: [{ intensity: 0.5, rotation: 0, layerOpacity: 1 }],
      primaryIntensity: 0.5,
      primaryRotation: 0,
    },
    stars: {
      foreground: { twinkle: 0.5, driftX: 0, driftY: 0, scale: 1 },
      background: { twinkle: 0.5, driftX: 0, driftY: 0, scale: 1 },
      twinkle: 0.5,
      driftX: 0,
      driftY: 0,
    },
    radar: {
      wobble: 0,
      pulse: 0,
      secondaryWobbleFreq: 1.5,
      breathingPhase: 0,
    },
    message: {
      opacity: 1,
      scale: 1,
      glowIntensity: 0,
    },
    globalIntensity: 0.5,
    reduceMotion: true,
  };
}

/**
 * Interpolates between two frames for smooth transitions
 * @param frameA Start frame
 * @param frameB End frame
 * @param t Interpolation factor (0-1)
 */
export function interpolateFrames(
  frameA: CosmicTimelineFrame,
  frameB: CosmicTimelineFrame,
  t: number
): CosmicTimelineFrame {
  const lerp = (a: number, b: number) => a + (b - a) * t;
  
  return {
    t: lerp(frameA.t, frameB.t),
    loopProgress: lerp(frameA.loopProgress, frameB.loopProgress),
    halo: {
      bands: frameA.halo.bands.map((bandA, i) => ({
        intensity: lerp(bandA.intensity, frameB.halo.bands[i]?.intensity ?? bandA.intensity),
        rotation: lerp(bandA.rotation, frameB.halo.bands[i]?.rotation ?? bandA.rotation),
        layerOpacity: lerp(bandA.layerOpacity, frameB.halo.bands[i]?.layerOpacity ?? bandA.layerOpacity),
      })),
      primaryIntensity: lerp(frameA.halo.primaryIntensity, frameB.halo.primaryIntensity),
      primaryRotation: lerp(frameA.halo.primaryRotation, frameB.halo.primaryRotation),
    },
    stars: {
      foreground: {
        twinkle: lerp(frameA.stars.foreground.twinkle, frameB.stars.foreground.twinkle),
        driftX: lerp(frameA.stars.foreground.driftX, frameB.stars.foreground.driftX),
        driftY: lerp(frameA.stars.foreground.driftY, frameB.stars.foreground.driftY),
        scale: lerp(frameA.stars.foreground.scale, frameB.stars.foreground.scale),
      },
      background: {
        twinkle: lerp(frameA.stars.background.twinkle, frameB.stars.background.twinkle),
        driftX: lerp(frameA.stars.background.driftX, frameB.stars.background.driftX),
        driftY: lerp(frameA.stars.background.driftY, frameB.stars.background.driftY),
        scale: lerp(frameA.stars.background.scale, frameB.stars.background.scale),
      },
      twinkle: lerp(frameA.stars.twinkle, frameB.stars.twinkle),
      driftX: lerp(frameA.stars.driftX, frameB.stars.driftX),
      driftY: lerp(frameA.stars.driftY, frameB.stars.driftY),
    },
    radar: {
      wobble: lerp(frameA.radar.wobble, frameB.radar.wobble),
      pulse: lerp(frameA.radar.pulse, frameB.radar.pulse),
      secondaryWobbleFreq: lerp(frameA.radar.secondaryWobbleFreq, frameB.radar.secondaryWobbleFreq),
      breathingPhase: lerp(frameA.radar.breathingPhase, frameB.radar.breathingPhase),
    },
    message: {
      opacity: lerp(frameA.message.opacity, frameB.message.opacity),
      scale: lerp(frameA.message.scale, frameB.message.scale),
      glowIntensity: lerp(frameA.message.glowIntensity, frameB.message.glowIntensity),
    },
    globalIntensity: lerp(frameA.globalIntensity, frameB.globalIntensity),
    reduceMotion: frameA.reduceMotion || frameB.reduceMotion,
  };
}

/**
 * Gets the default timeline config
 */
export function getDefaultTimelineConfig(): TimelineConfig {
  return {
    effectCategory: "balanced",
    doseIntensity: "medium",
    strainSeed: 12345,
    reduceMotion: false,
  };
}
