/**
 * COSMIC THEME ENGINE — TRIPDAR DATA INTEGRATION (PHASE 5A)
 * ----------------------------------------------------------
 * Guardrail: Do NOT import legacy cosmic-fire-ring code.
 * Guardrail: Do NOT alter geometry math.
 * Guardrail: All animations remain declarative and reversible.
 * Guardrail: All changes logged in docs/cursor-change-history.md.
 * 
 * Phase 4C: Star highlight transitions with CSS (300ms).
 * Phase 5A: Uses real Tripdar strain colors for stars.
 * Phase 6A.2: SSR-safe client component.
 * Guardrail compliance: No geometry modifications, only opacity/scale transitions.
 */

"use client";

import { useMemo } from "react";
import { getStarAnchors, getDefaultRadarGeometry } from "./CosmicThemeRadar";
import type { CosmicStarAnchor } from "./CosmicThemeRadar";
import { cosmicThemeColors } from "./config/cosmicThemeColors";
import { useCosmicMessageAnimation, getCosmicMessageAnimationKeyframes } from "./hooks/useCosmicMessageAnimation";
import type { CosmicChoreographyDescriptor } from "./config/cosmicThemeChoreography";
import { getCosmicVisualPreset, type CosmicThemeId } from "./config/cosmicThemeVisualPresets";
// Phase 6I: Timeline frame integration
import type { CosmicTimelineFrame } from "./choreography/timelineEngine";

/**
 * Star point definition.
 * Represents a single star in the cosmic system with its position and transform properties.
 */
export interface CosmicStarPoint {
  axisId: string;
  anchorX: number; // Base anchor position X (from axis)
  anchorY: number; // Base anchor position Y (from axis)
  driftX: number; // Drift offset X (pixels from anchor)
  driftY: number; // Drift offset Y (pixels from anchor)
  rotationDeg: number; // Rotation angle in degrees (for future use)
}

/**
 * Star drift preset.
 * Defines a named pattern of drift offsets for stars.
 * Phase 2: Config only, no animation applied yet.
 */
export interface CosmicStarDriftPreset {
  id: string;
  name: string;
  stars: Array<{
    axisId: string;
    driftX: number;
    driftY: number;
    rotationDeg: number;
  }>;
}

/**
 * Creativity spark preset.
 * Stars drift outward and slightly rotate to create a "spark" effect.
 */
export const CREATIVITY_SPARK_PRESET: CosmicStarDriftPreset = {
  id: "creativitySpark",
  name: "Creativity Spark",
  stars: [
    { axisId: "creativity", driftX: 12, driftY: -8, rotationDeg: 15 },
    { axisId: "visuals", driftX: -10, driftY: -12, rotationDeg: -10 },
    { axisId: "social", driftX: 8, driftY: 10, rotationDeg: 5 },
    { axisId: "euphoria", driftX: -5, driftY: 15, rotationDeg: -15 },
    { axisId: "introspection", driftX: -15, driftY: -5, rotationDeg: 10 },
    { axisId: "spiritual", driftX: 10, driftY: -10, rotationDeg: -5 },
  ],
};

/**
 * Clarity focus preset.
 * Stars drift inward toward center, creating a focused effect.
 */
export const CLARITY_FOCUS_PRESET: CosmicStarDriftPreset = {
  id: "clarityFocus",
  name: "Clarity Focus",
  stars: [
    { axisId: "creativity", driftX: -8, driftY: 5, rotationDeg: -5 },
    { axisId: "visuals", driftX: 6, driftY: 8, rotationDeg: 3 },
    { axisId: "social", driftX: -5, driftY: -6, rotationDeg: -3 },
    { axisId: "euphoria", driftX: 3, driftY: -10, rotationDeg: 8 },
    { axisId: "introspection", driftX: 10, driftY: 3, rotationDeg: -8 },
    { axisId: "spiritual", driftX: -6, driftY: 6, rotationDeg: 5 },
  ],
};

/**
 * Connect merge preset.
 * Stars drift toward each other, creating a merging/connecting effect.
 */
export const CONNECT_MERGE_PRESET: CosmicStarDriftPreset = {
  id: "connectMerge",
  name: "Connect Merge",
  stars: [
    { axisId: "creativity", driftX: 5, driftY: 5, rotationDeg: 0 },
    { axisId: "visuals", driftX: -5, driftY: 5, rotationDeg: 0 },
    { axisId: "social", driftX: 5, driftY: -5, rotationDeg: 0 },
    { axisId: "euphoria", driftX: -5, driftY: -5, rotationDeg: 0 },
    { axisId: "introspection", driftX: 0, driftY: 8, rotationDeg: 0 },
    { axisId: "spiritual", driftX: 0, driftY: -8, rotationDeg: 0 },
  ],
};

/**
 * Map of all available star drift presets.
 */
export const STAR_DRIFT_PRESETS: Record<string, CosmicStarDriftPreset> = {
  creativitySpark: CREATIVITY_SPARK_PRESET,
  clarityFocus: CLARITY_FOCUS_PRESET,
  connectMerge: CONNECT_MERGE_PRESET,
};

/**
 * Get star anchor points from the radar geometry.
 * @returns Array of 6 star anchor points (one per axis)
 */
export function getStarAnchorPoints(): CosmicStarAnchor[] {
  return getStarAnchors(getDefaultRadarGeometry());
}

/**
 * Create star points from anchor points with no drift.
 * Base state: all stars at their anchor positions.
 * @returns Array of 6 star points with zero drift
 */
export function createBaseStarPoints(): CosmicStarPoint[] {
  const anchors = getStarAnchorPoints();
  return anchors.map((anchor) => ({
    axisId: anchor.axisId,
    anchorX: anchor.x,
    anchorY: anchor.y,
    driftX: 0,
    driftY: 0,
    rotationDeg: 0,
  }));
}

/**
 * Apply a drift preset to star points.
 * Phase 2: Pure math function, no animation.
 * @param starPoints - Array of base star points
 * @param presetId - The drift preset ID (e.g., "creativitySpark")
 * @returns Array of star points with drift applied
 */
export function applyStarDriftPreset(
  starPoints: CosmicStarPoint[],
  presetId: string
): CosmicStarPoint[] {
  const preset = STAR_DRIFT_PRESETS[presetId];
  if (!preset) {
    // If preset not found, return original points
    return starPoints;
  }

  return starPoints.map((star) => {
    const presetStar = preset.stars.find((s) => s.axisId === star.axisId);
    if (!presetStar) {
      return star;
    }

    return {
      ...star,
      driftX: presetStar.driftX,
      driftY: presetStar.driftY,
      rotationDeg: presetStar.rotationDeg,
    };
  });
}

/**
 * Calculate the final position of a star (anchor + drift).
 * Phase 2: Pure math function.
 * @param star - The star point
 * @returns Object with final x and y coordinates
 */
export function getStarFinalPosition(star: CosmicStarPoint): {
  x: number;
  y: number;
} {
  return {
    x: star.anchorX + star.driftX,
    y: star.anchorY + star.driftY,
  };
}

/**
 * Get a star point by axis ID.
 * @param axisId - The axis identifier
 * @param starPoints - Array of star points
 * @returns The star point, or undefined if not found
 */
export function getStarByAxisId(
  axisId: string,
  starPoints: CosmicStarPoint[]
): CosmicStarPoint | undefined {
  return starPoints.find((star) => star.axisId === axisId);
}

/**
 * Static seeded delays for star twinkle animations.
 * Each star gets a unique delay based on its index (0-5).
 * Delays range from 0s to 3.5s to create natural variation.
 */
const STAR_TWINKLE_DELAYS = [0, 0.6, 1.2, 1.8, 2.4, 3.0];

/**
 * Star twinkle durations (4-7 seconds per star).
 * Each star has a slightly different duration for organic feel.
 */
const STAR_TWINKLE_DURATIONS = [5.2, 4.8, 6.1, 5.5, 4.5, 6.8];

/**
 * PHASE 4C — Star rendering with cinematic transitions.
 * Renders 6 stars at anchor positions with independent opacity twinkles.
 * Responds to axis highlights and message effects with smooth transitions.
 */
export default function CosmicThemeStars({
  geometry = getDefaultRadarGeometry(),
  animationContext,
  highlightAxisId,
  messageId,
  choreography,
  blendProgress = 0,
  starColor,
  themeId = "cosmic",
  reduceMotion = false,
  currentFrame,
  _themeBlendProgress, // Phase 7B: Reserved for Phase 8A
}: {
  geometry?: ReturnType<typeof getDefaultRadarGeometry>;
  animationContext?: {
    haloRotationBiasDeg: number;
    polygonEnergyBias: number;
    starEmphasis: "low" | "medium" | "high";
  };
  highlightAxisId?: string;
  messageId?: string;
  choreography?: CosmicChoreographyDescriptor;
  blendProgress?: number;
  starColor?: string;
  themeId?: CosmicThemeId;
  reduceMotion?: boolean;
  // Phase 6I: Timeline frame integration
  currentFrame?: CosmicTimelineFrame;
  // Phase 7B: Theme blend preparation (reserved for Phase 8A theme transition choreography)
  // Phase 7D: _themeBlendProgress fully threaded; no visual logic attached yet.
  _themeBlendProgress?: number;
}) {
  // Phase 7: Theme blend effects - fade in stars as Cosmic appears
  const blend = _themeBlendProgress ?? 1; // Default to full cosmic for lab pages
  const starOpacityMultiplier = blend;
  
  // Phase 6A.3: Memoize static computations
  // Phase 5B: Get visual preset styles (memoized by themeId)
  const preset = useMemo(() => getCosmicVisualPreset(themeId), [themeId]);
  
  // Phase 6A.3: Memoize base star points - they're static and don't depend on props
  const starPoints = useMemo(() => createBaseStarPoints(), []);
  const svgSize = 360;
  const isConnectMode = messageId === "connect";
  const isCreativityMode = messageId === "creativity";
  
  // Phase 4E: Get message animation styles
  // Phase 6C.6: Pass reduceMotion to disable creativity wobble
  const messageAnimationStyles = useCosmicMessageAnimation(messageId as any, reduceMotion ?? false);
  
  // Phase 4B: Connect mode - stars move 4px toward center (static shift)
  const connectShift = isConnectMode ? 0.03 : 0; // ~4px at 138px radius

  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      className="absolute inset-0 pointer-events-none"
    >
      <defs>
        <style>{`
          @keyframes starTwinkle {
            0%, 100% {
              opacity: 0.85;
            }
            50% {
              opacity: 1.0;
            }
            25%, 75% {
              opacity: 0.88;
            }
          }
          @keyframes starTwinkleReduced {
            0%, 100% {
              opacity: 0.92;
            }
            50% {
              opacity: 0.94;
            }
          }
          ${getCosmicMessageAnimationKeyframes()}
        `}</style>
      </defs>
      {starPoints.map((star, index) => {
        let position = getStarFinalPosition(star);
        
        // Phase 4B: Connect mode - move stars 4px toward center
        if (isConnectMode) {
          const centerX = geometry.centerX;
          const centerY = geometry.centerY;
          const dx = position.x - centerX;
          const dy = position.y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            const shiftX = (dx / distance) * -4;
            const shiftY = (dy / distance) * -4;
            position = { x: position.x + shiftX, y: position.y + shiftY };
          }
        }
        
        // Phase 4F: Apply choreography star drift multiplier
        if (choreography && blendProgress > 0) {
          const driftMultiplier = choreography.starDrift * blendProgress;
          // Apply drift multiplier to existing drift values
          const centerX = geometry.centerX;
          const centerY = geometry.centerY;
          const dx = position.x - centerX;
          const dy = position.y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            // Reduce drift toward center based on multiplier
            const driftReduction = (1 - driftMultiplier) * 2; // Max 2px reduction
            const shiftX = (dx / distance) * -driftReduction;
            const shiftY = (dy / distance) * -driftReduction;
            position = { x: position.x + shiftX, y: position.y + shiftY };
          }
        }
        
        // Phase 6I: Add timeline drift (blends with existing position)
        // Phase 6J.3.2: When reduceMotion, clamp drift to near-zero
        const driftMultiplier = reduceMotion ? 0.1 : 1.0;
        const timelineDriftX = (currentFrame?.stars.driftX ?? 0) * driftMultiplier;
        const timelineDriftY = (currentFrame?.stars.driftY ?? 0) * driftMultiplier;
        position = { 
          x: position.x + timelineDriftX, 
          y: position.y + timelineDriftY 
        };
        
        const isHighlighted = highlightAxisId === star.axisId;
        const isCreativityAxis = star.axisId === "creativity";
        
        // Phase 4B: Axis highlight mode
        // Highlighted: opacity 1.0, scale 1.20, highlight color
        // Others: opacity 0.40
        let baseOpacity = isHighlighted ? 1.0 : 0.40;
        
        // Phase 4B: Creativity mode - star opacity +0.1 on creative axis
        if (isCreativityMode && isCreativityAxis) {
          baseOpacity = Math.min(baseOpacity + 0.1, 1.0);
        }
        
        // Phase 5A: Use real strain color if provided, otherwise use preset
        // Phase 5B: Use preset star style colors
        const baseColor = starColor || preset.starStyle.baseColor;
        const color = isHighlighted
          ? preset.starStyle.highlightColor
          : baseColor;
        
        // Phase 5B: Use preset opacity ranges
        let effectiveOpacity = isHighlighted
          ? baseOpacity * preset.starStyle.highlightOpacity
          : baseOpacity * preset.starStyle.baseOpacity;
        
        // Phase 6I: Multiply by timeline twinkle (blends with existing opacity)
        const timelineTwinkle = currentFrame?.stars.twinkle ?? 1;
        effectiveOpacity = effectiveOpacity * timelineTwinkle;
        
        const delay = STAR_TWINKLE_DELAYS[index] || 0;
        const duration = STAR_TWINKLE_DURATIONS[index] || 5.0;
        
        // Phase 4C: Star scale with emphasis and highlight
        let scale = 1.0;
        if (isHighlighted) {
          scale = 1.20;
        } else if (animationContext?.starEmphasis === "high") {
          scale = 1.05;
        } else if (animationContext?.starEmphasis === "medium") {
          scale = 1.02;
        }
        
        // Phase 6I: Blend with radar wobble from timeline (subtle scaling effect)
        const radarWobble = currentFrame?.radar.wobble ?? 0;
        scale = scale * (1 + 0.05 * radarWobble);
        
        // Phase 4C: Creativity mode - slight rotation for highlighted star
        // Phase 6C.6: Reduced motion - disable creativity wobble
        const rotation = (messageId === "creativity" && isHighlighted && !reduceMotion) ? "rotate(6deg)" : "";
        const transform = rotation 
          ? `${rotation} scale(${scale})`
          : `scale(${scale})`;
        
        // Phase 4E: Apply message animation styles to stars
        // For creativity mode, apply to creativity axis star
        // For connect mode, apply to all stars
        const shouldApplyStarAnimation = 
          (isCreativityMode && isCreativityAxis) || 
          isConnectMode;
        
        const starAnimationStyle = shouldApplyStarAnimation 
          ? messageAnimationStyles.starEffectStyle 
          : {};
        
        // Phase 4F: Use choreography label fade timing for star transitions
        const starFadeDuration = choreography?.labelFade ?? 300;
        
        // Phase 6C.2: Highlight visibility safety - apply brightness filter when highlighted and background is bright
        // Check if we're in a bright state (clarity mode or high halo brightness)
        const isBrightState = messageId === "clarity" || animationContext?.haloRotationBiasDeg !== undefined;
        const needsBrightnessFilter = isHighlighted && isBrightState;

        return (
          <circle
            key={star.axisId}
            cx={position.x}
            cy={position.y}
            r="4"
            fill={color}
            opacity={effectiveOpacity * starOpacityMultiplier}
            style={{
              // Phase 6C.6: Reduced motion - use minimal twinkle animation (70% reduction in amplitude)
              // Phase 6J.3.2: When reduceMotion, disable twinkle entirely
              animation: reduceMotion 
                ? "none"
                : `starTwinkle ${duration}s ease-in-out ${delay}s infinite`,
              transform: transform,
              transformOrigin: `${position.x}px ${position.y}px`,
              // Phase 4C: Star highlight transitions
              // Phase 4F: Use choreography label fade duration
              // Phase 6J.3.2: When reduceMotion, ensure transitions are ≤ 300ms
              transition: reduceMotion
                ? `opacity ${Math.min(starFadeDuration, 300)}ms ease-out, transform ${Math.min(starFadeDuration, 300)}ms ease-out`
                : `opacity ${starFadeDuration}ms ease-in-out, transform ${starFadeDuration}ms ease-in-out`,
              // Phase 4E: Message animation effects (star)
              // Phase 6C.2: Highlight visibility safety - apply brightness filter to prevent blowout
              filter: needsBrightnessFilter ? "brightness(0.85)" : undefined,
              ...starAnimationStyle,
            }}
          />
        );
      })}
    </svg>
  );
}

