/**
 * COSMIC THEME ENGINE — TRIPDAR DATA INTEGRATION (PHASE 5A)
 * ----------------------------------------------------------
 * Guardrail: Do NOT import legacy cosmic-fire-ring code.
 * Guardrail: Do NOT alter geometry math.
 * Guardrail: All animations remain declarative and reversible.
 * Guardrail: All changes logged in docs/cursor-change-history.md.
 * 
 * Phase 4C: Halo directional rotation transitions (400ms).
 * Phase 5A: Uses real Tripdar strain colors for halo.
 * Phase 6A.2: SSR-safe client component.
 * Guardrail compliance: No geometry modifications, only CSS transform transitions.
 */

"use client";

import { useMemo } from "react";
import { COSMIC_HALO_RADIUS, COSMIC_CENTER_X, COSMIC_CENTER_Y } from "./config/cosmicThemeDefaults";
import { cosmicThemeColors } from "./config/cosmicThemeColors";
import { getAxisById, getDefaultRadarGeometry } from "./CosmicThemeRadar";
import { useCosmicMessageAnimation, getCosmicMessageAnimationKeyframes } from "./hooks/useCosmicMessageAnimation";
import type { CosmicChoreographyDescriptor } from "./config/cosmicThemeChoreography";
import { getCosmicVisualPreset, type CosmicThemeId } from "./config/cosmicThemeVisualPresets";
// Phase 6I: Timeline frame integration
import type { CosmicTimelineFrame } from "./choreography/timelineEngine";

/**
 * Halo configuration.
 * Defines the geometric and mathematical properties of the cosmic halo.
 */
export interface CosmicHaloConfig {
  radius: number;
  intensityScale: number; // Multiplier for halo intensity (0.0 to 1.0)
  solarFlareRotationSpeed: number; // Rotation speed in degrees per second (for future use)
  harmonicWaveFrequencies: number[]; // Wave frequencies for harmonic effects (for future use)
}

/**
 * Default halo configuration.
 * Uses canonical radius and default intensity/rotation values.
 */
export const DEFAULT_HALO_CONFIG: CosmicHaloConfig = {
  radius: COSMIC_HALO_RADIUS,
  intensityScale: 1.0,
  solarFlareRotationSpeed: 0.5, // Degrees per second (not used in Phase 2, defined for Phase 3+)
  harmonicWaveFrequencies: [1.0, 2.0, 3.0], // Harmonic frequencies (not used in Phase 2, defined for Phase 3+)
};

/**
 * Get the halo radius.
 * @param config - The halo configuration (defaults to default config)
 * @returns The halo radius in pixels
 */
export function getHaloRadius(
  config: CosmicHaloConfig = DEFAULT_HALO_CONFIG
): number {
  return config.radius;
}

/**
 * Get the halo intensity scale.
 * @param config - The halo configuration (defaults to default config)
 * @returns The intensity scale (0.0 to 1.0)
 */
export function getHaloIntensity(
  config: CosmicHaloConfig = DEFAULT_HALO_CONFIG
): number {
  return config.intensityScale;
}

/**
 * Get the solar flare rotation speed.
 * Phase 2: Defined but not used (no animations yet).
 * @param config - The halo configuration (defaults to default config)
 * @returns The rotation speed in degrees per second
 */
export function getSolarFlareRotationSpeed(
  config: CosmicHaloConfig = DEFAULT_HALO_CONFIG
): number {
  return config.solarFlareRotationSpeed;
}

/**
 * Get the harmonic wave frequencies.
 * Phase 2: Defined but not used (no wave animations yet).
 * @param config - The halo configuration (defaults to default config)
 * @returns Array of wave frequencies
 */
export function getHarmonicWaveFrequencies(
  config: CosmicHaloConfig = DEFAULT_HALO_CONFIG
): number[] {
  return config.harmonicWaveFrequencies;
}

/**
 * Calculate halo intensity at a given distance from center.
 * Phase 2: Pure math function, no rendering.
 * @param distanceFromCenter - Distance from center in pixels
 * @param config - The halo configuration (defaults to default config)
 * @returns Intensity value (0.0 to 1.0)
 */
export function calculateHaloIntensityAtDistance(
  distanceFromCenter: number,
  config: CosmicHaloConfig = DEFAULT_HALO_CONFIG
): number {
  const haloRadius = config.radius;
  const normalizedDistance = Math.min(distanceFromCenter / haloRadius, 1.0);
  // Inverse relationship: intensity decreases as distance increases
  const baseIntensity = 1.0 - normalizedDistance;
  return baseIntensity * config.intensityScale;
}

/**
 * PHASE 4C — Halo with cinematic transitions.
 * Renders a circular halo with radial and conic gradients.
 * Responds to axis highlights (directional bias) and message effects (tints).
 * Smoothly rotates and adjusts tint when highlightAxis or messageId changes.
 */
export default function CosmicThemeHalo({
  config = DEFAULT_HALO_CONFIG,
  animationContext,
  highlightAxis,
  messageId,
  choreography,
  blendProgress = 0,
  haloColor,
  themeId = "cosmic",
  reduceMotion = false,
  currentFrame,
  _themeBlendProgress, // Phase 7B: Reserved for Phase 8A
}: {
  config?: CosmicHaloConfig;
  animationContext?: {
    haloRotationBiasDeg: number;
    polygonEnergyBias: number;
    starEmphasis: "low" | "medium" | "high";
  };
  highlightAxis?: string;
  messageId?: string;
  choreography?: CosmicChoreographyDescriptor;
  blendProgress?: number;
  // Phase 6I: Timeline frame integration
  currentFrame?: CosmicTimelineFrame;
  haloColor?: string;
  themeId?: CosmicThemeId;
  reduceMotion?: boolean;
  // Phase 7B: Theme blend preparation (reserved for Phase 8A theme transition choreography)
  // Phase 7D: _themeBlendProgress fully threaded; no visual logic attached yet.
  _themeBlendProgress?: number;
}) {
  const diameter = config.radius * 2;
  const centerX = COSMIC_CENTER_X;
  const centerY = COSMIC_CENTER_Y;
  
  // Phase 7: Theme blend effects - fade in halo as Cosmic appears
  const blend = _themeBlendProgress ?? 1; // Default to full cosmic for lab pages
  const haloOpacity = 0.8 * blend;
  
  // Phase 6A.3: Memoize geometry - it's static and doesn't depend on props
  const geometry = useMemo(() => getDefaultRadarGeometry(), []);
  const highlightedAxis = useMemo(
    () => highlightAxis ? getAxisById(highlightAxis, geometry) : undefined,
    [highlightAxis, geometry]
  );
  const baseAxisAngle = highlightedAxis ? highlightedAxis.angleDeg : 0;
  
  // Phase 4C: Compute target rotation angle with animation context bias
  const rotationBias = animationContext?.haloRotationBiasDeg ?? 0;
  // Phase 4F: Apply choreography rotation delta with blend progress
  const choreographyRotation = choreography 
    ? choreography.haloRotation * blendProgress 
    : 0;
  // Phase 6I: Add timeline rotation (blends with choreography)
  // Phase 6J.3.1: When reduceMotion, ignore timeline wobble and reduce choreography influence
  const timelineRotation = reduceMotion ? 0 : (currentFrame?.halo.rotation ?? 0);
  const effectiveChoreographyRotation = reduceMotion 
    ? choreographyRotation * 0.2  // Small static rotation only
    : choreographyRotation;
  const targetAngleDeg = baseAxisAngle + rotationBias + effectiveChoreographyRotation + timelineRotation;
  
  // Message effect flags
  const isCreativityMode = messageId === "creativity";
  const isClarityMode = messageId === "clarity";
  const isDepthMode = messageId === "depth";
  const isConnectMode = messageId === "connect";
  
  // Phase 4C: Modulate opacity subtly with polygonEnergyBias (higher energy → slightly brighter)
  // Keep within existing breathing range (0.45-0.60), add small boost based on energy
  const energyBoost = (animationContext?.polygonEnergyBias ?? 0.4) * 0.05; // Max +0.05 boost
  const baseOpacity = 0.525; // Midpoint of breathing range
  // Phase 6I: Multiply by timeline intensity (blends with existing)
  // Phase 6J.3.1: When reduceMotion, fix opacity near baseline (ignore timeline fluctuations)
  const timelineIntensity = reduceMotion ? 1.0 : (currentFrame?.halo.intensity ?? 1);
  let adjustedOpacity = (baseOpacity + energyBoost) * timelineIntensity;
  
  // Phase 6C.4: Halo brightness safety - cap opacity during aggressive states
  // When clarity or connect modes are active, cap opacity to prevent excessive brightness
  const isAggressiveState = isClarityMode || isConnectMode;
  const brightnessCap = 0.35; // Safe upper bound for aggressive states
  if (isAggressiveState && adjustedOpacity > brightnessCap) {
    adjustedOpacity = brightnessCap;
  }
  
  // Phase 4E: Get message animation styles
  // Phase 6C.6: Pass reduceMotion to disable creativity wobble
  const messageAnimationStyles = useCosmicMessageAnimation(messageId as any, reduceMotion ?? false);
  
  // Phase 4F: Apply message delay from choreography
  const messageDelay = choreography?.messageDelay ?? 0;
  
  // Phase 6A.3: Memoize visual preset - depends only on themeId
  // Phase 5B: Get visual preset styles
  const preset = useMemo(() => getCosmicVisualPreset(themeId), [themeId]);
  
  // Phase 5A: Use real strain color if provided, otherwise use preset
  // Convert hex to rgba for gradient (with opacity)
  const getHaloGradientColor = (hex: string, opacity: number) => {
    if (!hex) return preset.haloStyle.innerColor;
    // Convert hex to rgb
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  // Phase 5B: Use preset halo colors, but blend with strain color if provided
  const baseHaloColor = haloColor || preset.haloStyle.innerColor;
  const haloInner = haloColor 
    ? getHaloGradientColor(baseHaloColor, 0.4)
    : preset.haloStyle.innerColor;
  const haloOuter = haloColor
    ? getHaloGradientColor(baseHaloColor, 0.2)
    : preset.haloStyle.outerColor;
  
  // Phase 4B: Build base background with message effects
  // Phase 5B: Use preset halo style
  let baseBackground = `
    radial-gradient(circle at center, ${haloInner} 0%, transparent 70%),
    conic-gradient(from 0deg at center, 
      ${haloOuter} 0deg,
      ${haloInner} 90deg,
      ${haloOuter} 180deg,
      ${haloInner} 270deg,
      ${haloOuter} 360deg
    )
  `;
  
  // Phase 4B: Clarity mode - brightness +8% (lighter colors)
  if (isClarityMode) {
    baseBackground = `
      radial-gradient(circle at center, rgba(255, 235, 195, 0.43) 0%, transparent 70%),
      conic-gradient(from 0deg at center, 
        rgba(255, 216, 162, 0.22) 0deg,
        rgba(255, 235, 195, 0.43) 90deg,
        rgba(255, 216, 162, 0.22) 180deg,
        rgba(255, 235, 195, 0.43) 270deg,
        rgba(255, 216, 162, 0.22) 360deg
      )
    `;
  }
  
  // Phase 4B: Connect mode - soft radial gradient at center
  if (isConnectMode) {
    baseBackground = `
      radial-gradient(circle at center, ${cosmicThemeColors.highlightColors.connectGlow} 0%, transparent 50%),
      ${baseBackground}
    `;
  }
  
  // Phase 4B: Directional gradient bias toward highlighted axis (opacity 0.08)
  const directionalOverlay = highlightAxis ? `
    conic-gradient(from ${baseAxisAngle}deg at center, 
      transparent 0deg,
      rgba(255, 255, 255, 0.08) 45deg,
      transparent 90deg,
      rgba(255, 255, 255, 0.08) 135deg,
      transparent 180deg
    )
  ` : "";
  
  // Phase 4B: Message tint overlays
  let messageOverlay = "";
  if (isCreativityMode) {
    messageOverlay = `radial-gradient(circle at center, ${cosmicThemeColors.highlightColors.creativityGlow} 0%, transparent 60%)`;
  } else if (isDepthMode) {
    // Depth mode - inner halo dark band (opacity 0.10)
    messageOverlay = `radial-gradient(circle at center, ${cosmicThemeColors.highlightColors.depthShade} 0%, transparent 40%)`;
  }
  
  // Combine all background layers
  const finalBackground = [
    baseBackground,
    directionalOverlay,
    messageOverlay,
  ].filter(Boolean).join(", ");

  return (
    <>
      <style>{`
        @keyframes haloBreathe {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.98);
          }
          50% {
            opacity: 0.60;
            transform: scale(1.02);
          }
        }
        @keyframes haloBreatheReduced {
          0%, 100% {
            opacity: 0.525;
            transform: scale(1.0);
          }
          50% {
            opacity: 0.5275;
            transform: scale(1.005);
          }
        }
        ${getCosmicMessageAnimationKeyframes()}
      `}</style>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          width: `${diameter}px`,
          height: `${diameter}px`,
          left: "50%",
          top: "50%",
          borderRadius: "50%",
          background: finalBackground,
          filter: `blur(${preset.haloStyle.blur}px)`,
          // Phase 6C.4: Apply brightness safety cap when in aggressive states
          // Phase 7: Apply blend opacity multiplier
          opacity: (isAggressiveState ? Math.min(preset.haloStyle.opacity, adjustedOpacity) : preset.haloStyle.opacity) * haloOpacity,
          // Phase 4C: Base transform with rotation transition (400ms as specified)
          transform: `translate(-50%, -50%) rotate(${targetAngleDeg}deg)`,
          transformOrigin: "center center",
          transition: "transform 400ms ease-in-out",
          // Phase 4C: Breathing animation for scale/opacity (layered on top)
          // Phase 6C.6: Reduced motion - use minimal breathing animation
          // Phase 6J.3.1: When reduceMotion, disable breathing entirely
          animation: reduceMotion ? "none" : "haloBreathe 14s ease-in-out infinite",
          // Phase 4E: Message animation effects (halo)
          // Phase 4F: Apply message delay to halo brightness animation
          animationDelay: messageDelay > 0 ? `${messageDelay}ms` : undefined,
          ...messageAnimationStyles.haloEffectStyle,
        }}
      />
    </>
  );
}

