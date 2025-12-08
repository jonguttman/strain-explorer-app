/**
 * COSMIC THEME ENGINE — TRIPDAR DATA INTEGRATION (PHASE 5A)
 * ----------------------------------------------------------
 * Guardrail: Do NOT import legacy cosmic-fire-ring code.
 * Guardrail: Do NOT alter geometry math.
 * Guardrail: All animations remain declarative and reversible.
 * Guardrail: All changes logged in docs/cursor-change-history.md.
 * 
 * Phase 4C: Polygon smooth interpolation with requestAnimationFrame.
 * Phase 5A: Uses real Tripdar radar values instead of static samples.
 * Guardrail compliance: No geometry modifications, only vertex interpolation.
 */

"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  COSMIC_CENTER_X,
  COSMIC_CENTER_Y,
  COSMIC_RADIUS,
} from "./config/cosmicThemeDefaults";
import { getCosmicMessage } from "./CosmicThemeMessages";
import { useCosmicMessageAnimation, getCosmicMessageAnimationKeyframes } from "./hooks/useCosmicMessageAnimation";
import type { CosmicChoreographyDescriptor } from "./config/cosmicThemeChoreography";
import { getCosmicVisualPreset, type CosmicThemeId } from "./config/cosmicThemeVisualPresets";
// Phase 6I: Timeline frame integration
import type { CosmicTimelineFrame } from "./choreography/timelineEngine";
import { ensureContrast } from "./utils/ensureContrast";

/**
 * Radar axis definition.
 * Each axis represents one dimension of the cosmic radar (e.g., creativity, visuals).
 */
export interface CosmicAxis {
  id: string;
  label: string;
  angleDeg: number; // Angle in degrees, where 0° is right, 90° is bottom, -90° is top
}

/**
 * Complete radar geometry configuration.
 * Defines the center point, radius, and all axes of the radar.
 */
export interface CosmicRadarGeometry {
  centerX: number;
  centerY: number;
  radius: number;
  axes: CosmicAxis[];
}

/**
 * Star anchor point on the radar.
 * Defines where a star is positioned relative to an axis.
 */
export interface CosmicStarAnchor {
  axisId: string;
  x: number;
  y: number;
}

/**
 * Canonical axis definitions for the Cosmic Theme radar.
 * Angles are measured in degrees, where:
 * - 0° = right (3 o'clock)
 * - 90° = bottom (6 o'clock)
 * - -90° = top (12 o'clock)
 * - 180° = left (9 o'clock)
 */
export const COSMIC_AXES: CosmicAxis[] = [
  { id: "visuals", label: "Visuals", angleDeg: -90 },
  { id: "creativity", label: "Creativity", angleDeg: -30 },
  { id: "social", label: "Social", angleDeg: 30 },
  { id: "euphoria", label: "Euphoria", angleDeg: 90 },
  { id: "introspection", label: "Introspection", angleDeg: 150 },
  { id: "spiritual", label: "Spiritual", angleDeg: 210 },
];

/**
 * Get the default radar geometry.
 * Uses the canonical center point, radius, and axes.
 * @returns The default radar geometry configuration
 */
export function getDefaultRadarGeometry(): CosmicRadarGeometry {
  return {
    centerX: COSMIC_CENTER_X,
    centerY: COSMIC_CENTER_Y,
    radius: COSMIC_RADIUS,
    axes: COSMIC_AXES,
  };
}

/**
 * Convert an angle from degrees to radians.
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate the x-coordinate of a point on a circle.
 * @param centerX - X coordinate of the circle center
 * @param radius - Radius of the circle
 * @param angleDeg - Angle in degrees (0° = right, 90° = bottom)
 * @returns X coordinate of the point
 */
export function getCircleX(
  centerX: number,
  radius: number,
  angleDeg: number
): number {
  return centerX + radius * Math.cos(degToRad(angleDeg));
}

/**
 * Calculate the y-coordinate of a point on a circle.
 * @param centerY - Y coordinate of the circle center
 * @param radius - Radius of the circle
 * @param angleDeg - Angle in degrees (0° = right, 90° = bottom)
 * @returns Y coordinate of the point
 */
export function getCircleY(
  centerY: number,
  radius: number,
  angleDeg: number
): number {
  return centerY + radius * Math.sin(degToRad(angleDeg));
}

/**
 * Get the position of a point on the radar at a given angle and radius.
 * @param geometry - The radar geometry configuration
 * @param angleDeg - Angle in degrees
 * @param radiusMultiplier - Multiplier for the base radius (default: 1.0)
 * @returns Object with x and y coordinates
 */
export function getRadarPoint(
  geometry: CosmicRadarGeometry,
  angleDeg: number,
  radiusMultiplier: number = 1.0
): { x: number; y: number } {
  const radius = geometry.radius * radiusMultiplier;
  return {
    x: getCircleX(geometry.centerX, radius, angleDeg),
    y: getCircleY(geometry.centerY, radius, angleDeg),
  };
}

/**
 * Get an axis by its ID.
 * @param axisId - The axis identifier
 * @param geometry - The radar geometry (defaults to default geometry)
 * @returns The axis definition, or undefined if not found
 */
export function getAxisById(
  axisId: string,
  geometry: CosmicRadarGeometry = getDefaultRadarGeometry()
): CosmicAxis | undefined {
  return geometry.axes.find((axis) => axis.id === axisId);
}

/**
 * Get all star anchor points for the radar.
 * Each anchor point is positioned at the outer edge of the radar along each axis.
 * @param geometry - The radar geometry (defaults to default geometry)
 * @returns Array of star anchor points
 */
export function getStarAnchors(
  geometry: CosmicRadarGeometry = getDefaultRadarGeometry()
): CosmicStarAnchor[] {
  return geometry.axes.map((axis) => {
    const point = getRadarPoint(geometry, axis.angleDeg, 1.0);
    return {
      axisId: axis.id,
      x: point.x,
      y: point.y,
    };
  });
}

/**
 * Sample values for static polygon rendering.
 * Phase 3: Fixed values for blueprint display.
 */
const SAMPLE_VALUES: Record<string, number> = {
  visuals: 0.7,
  creativity: 0.8,
  social: 0.6,
  euphoria: 0.65,
  introspection: 0.55,
  spiritual: 0.6,
};

/**
 * Calculate target polygon vertex positions based on current state.
 * Phase 5A: Uses real radar values if provided, otherwise falls back to samples.
 * Guardrail: No geometry modifications - only calculates target positions.
 */
function calculateTargetPolygonPoints(
  geometry: CosmicRadarGeometry,
  highlightAxis?: string,
  messageId?: string,
  radarValues?: number[]
): Array<{ x: number; y: number }> {
  const isConnectMode = messageId === "connect";
  
  return geometry.axes.map((axis, index) => {
    // Phase 5A: Use real radar values if provided, otherwise use samples
    let value = radarValues && radarValues[index] !== undefined
      ? radarValues[index]
      : (SAMPLE_VALUES[axis.id] || 0.5);
    
    // Phase 4B: Stretch polygon +10% toward highlighted axis
    if (highlightAxis === axis.id) {
      value = Math.min(value * 1.1, 1.0);
    }
    
    // Phase 4B: Connect mode - pull centroid inward 2%
    if (isConnectMode) {
      value = value * 0.98;
    }
    
    return getRadarPoint(geometry, axis.angleDeg, value);
  });
}

/**
 * Linear interpolation helper.
 * Guardrail: Pure math function, no side effects.
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Ease-out cubic easing function.
 * Guardrail: Pure math function, no side effects.
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Ease-in sine easing function.
 * Guardrail: Pure math function, no side effects.
 */
function easeInSine(t: number): number {
  return 1 - Math.cos((t * Math.PI) / 2);
}

/**
 * Ease-in-out quadratic easing function.
 * Guardrail: Pure math function, no side effects.
 */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Ease-out quadratic easing function.
 * Guardrail: Pure math function, no side effects.
 */
function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Get easing function by name.
 * Phase 4F: Returns the appropriate easing function for polygon interpolation.
 */
function getEasingFunction(easeName: string): (t: number) => number {
  switch (easeName) {
    case "easeInSine":
      return easeInSine;
    case "easeInOutQuad":
      return easeInOutQuad;
    case "easeOutQuad":
      return easeOutQuad;
    case "easeOutCubic":
    default:
      return easeOutCubic;
  }
}

/**
 * PHASE 4C — SVG radar rendering with requestAnimationFrame polygon interpolation.
 * Renders golden disc, guide rings, axis lines, polygon, and labels.
 * Polygon vertices interpolate smoothly using requestAnimationFrame (12-18 frames, ~350ms).
 * Other elements use CSS transitions.
 */
export default function CosmicThemeRadar({
  geometry = getDefaultRadarGeometry(),
  animationContext,
  highlightAxis,
  messageId,
  choreography,
  blendProgress = 0,
  radarValues,
  themeId = "cosmic",
  reduceMotion = false,
  currentFrame,
  _themeBlendProgress, // Phase 7B: Reserved for Phase 8A
}: {
  geometry?: CosmicRadarGeometry;
  animationContext?: {
    haloRotationBiasDeg: number;
    polygonEnergyBias: number;
    starEmphasis: "low" | "medium" | "high";
  };
  highlightAxis?: string;
  messageId?: string;
  choreography?: CosmicChoreographyDescriptor;
  blendProgress?: number;
  radarValues?: number[];
  themeId?: CosmicThemeId;
  reduceMotion?: boolean;
  // Phase 6I: Timeline frame integration
  currentFrame?: CosmicTimelineFrame;
  // Phase 7B: Theme blend preparation (reserved for Phase 8A theme transition choreography)
  // Phase 7D: _themeBlendProgress fully threaded; no visual logic attached yet.
  _themeBlendProgress?: number;
}) {
  // Phase 6A.3: Memoize visual preset - depends only on themeId
  // Phase 5B: Get visual preset styles
  const preset = useMemo(() => getCosmicVisualPreset(themeId), [themeId]);
  
  // Phase 6C.1: Get target contrast ratio based on theme
  const targetContrastRatio = useMemo(() => {
    switch (themeId) {
      case "cosmic": return 4.0;
      case "apothecary": return 3.5;
      case "minimal": return 4.5;
      default: return 4.0;
    }
  }, [themeId]);
  
  // Phase 6C.1: Get background color for contrast calculation
  // Extract base color from disc fill (approximate for gradient backgrounds)
  const bgColorHex = useMemo(() => {
    switch (themeId) {
      case "cosmic": return "#b89050"; // Darker gold from gradient
      case "apothecary": return "#b4a488"; // Darker sepia from gradient
      case "minimal": return "#e8e8e8"; // Light gray from gradient
      default: return "#b89050";
    }
  }, [themeId]);
  
  // Phase 6C.1: Calculate contrast-adjusted label color
  const adjustedLabelColor = useMemo(() => {
    // Extract hex from rgba color string
    const labelColorMatch = preset.labelStyle.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!labelColorMatch) return preset.labelStyle.color;
    
    const r = parseInt(labelColorMatch[1], 10);
    const g = parseInt(labelColorMatch[2], 10);
    const b = parseInt(labelColorMatch[3], 10);
    const labelColorHex = `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`;
    
    return ensureContrast(labelColorHex, bgColorHex, targetContrastRatio);
  }, [preset.labelStyle.color, bgColorHex, targetContrastRatio]);
  
  // Phase 6A.3: Memoize message - depends only on messageId
  // Get message for effect calculations
  const message = useMemo(() => messageId ? getCosmicMessage(messageId) : undefined, [messageId]);
  const isConnectMode = messageId === "connect";
  const isClarityMode = messageId === "clarity";
  const isDepthMode = messageId === "depth";
  
  // Phase 4E: Get message animation styles
  // Phase 6C.6: Pass reduceMotion to disable creativity wobble
  const messageAnimationStyles = useCosmicMessageAnimation(messageId as any, reduceMotion ?? false);
  
  // Phase 7: Theme blend effects for Classic→Cosmic crossfade
  // At blend=0: invisible (Classic mode). At blend=1: fully Cosmic.
  const blend = _themeBlendProgress ?? 1; // Default to full cosmic for lab pages
  const discBrightnessFromBlend = 1.0 + (blend - 0.5) * 0.15; // Subtle glow at full cosmic
  const ringOpacityMultiplier = blend;
  const polygonOpacityMultiplier = blend;
  const polygonScaleFromBlend = 0.95 + blend * 0.05; // 0.95 → 1.0
  const labelOpacityMultiplier = blend;
  
  // Phase 4C: Polygon interpolation state
  const [displayPoints, setDisplayPoints] = useState<Array<{ x: number; y: number }>>(() =>
    calculateTargetPolygonPoints(geometry, highlightAxis, messageId, radarValues)
  );
  const previousPointsRef = useRef<Array<{ x: number; y: number }>>(displayPoints);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Phase 4C: Calculate target points when props change
  // Phase 5A: Include radarValues in dependency array so polygon updates when data changes
  // Phase 6C.5: Skip animation if reduceMotion is enabled
  useEffect(() => {
    const targetPoints = calculateTargetPolygonPoints(geometry, highlightAxis, messageId, radarValues);
    
    // Phase 6C.5: If reduceMotion is enabled, skip interpolation
    if (reduceMotion) {
      setDisplayPoints(targetPoints);
      previousPointsRef.current = targetPoints;
      return;
    }
    
    // Check if points actually changed (avoid unnecessary animations)
    const hasChanged = previousPointsRef.current.some((prev, i) => {
      const target = targetPoints[i];
      return Math.abs(prev.x - target.x) > 0.1 || Math.abs(prev.y - target.y) > 0.1;
    });
    
    if (!hasChanged) {
      setDisplayPoints(targetPoints);
      previousPointsRef.current = targetPoints;
      return;
    }
    
    // Cancel any ongoing animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    const startPoints = [...previousPointsRef.current];
    const duration = 350; // ms
    const targetFrames = 15; // 12-18 frames target
    const frameTime = duration / targetFrames;
    let frameCount = 0;
    
    // Phase 4F: Get easing function from choreography
    const easingFunction = choreography 
      ? getEasingFunction(choreography.polygonEase)
      : easeOutCubic;
    
    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }
      
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easingFunction(progress);
      
      // Interpolate each vertex
      const interpolated = startPoints.map((start, i) => {
        const target = targetPoints[i];
        return {
          x: lerp(start.x, target.x, eased),
          y: lerp(start.y, target.y, eased),
        };
      });
      
      setDisplayPoints(interpolated);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setDisplayPoints(targetPoints);
        previousPointsRef.current = targetPoints;
        animationFrameRef.current = null;
        startTimeRef.current = null;
      }
    };
    
    startTimeRef.current = null;
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Cleanup on unmount or prop change
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [geometry, highlightAxis, messageId, radarValues, reduceMotion]);
  
  // Convert display points to SVG points string
  const polygonPoints = displayPoints.map((p) => `${p.x},${p.y}`).join(" ");
  
  // Calculate polygon fill opacity (Depth mode reduces to 0.75)
  const polygonFillOpacity = isDepthMode ? 0.75 : 0.3;
  
  // Calculate stroke width (Clarity mode adds +1)
  const strokeWidth = isClarityMode ? 3 : 2;
  
  // Phase 4C: Polygon energy scale based on animation context
  const energyScale = 1 + (animationContext?.polygonEnergyBias ?? 0.4) * 0.06;

  // SVG viewBox dimensions (360x360 to match center coordinates)
  const svgSize = 360;

  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      className="absolute inset-0"
    >
      <defs>
        {/* Polygon ease-in animation */}
        <style>{`
          @keyframes polygonEaseIn {
            0% {
              transform: scale(0);
              transform-origin: ${geometry.centerX}px ${geometry.centerY}px;
            }
            100% {
              transform: scale(1);
              transform-origin: ${geometry.centerX}px ${geometry.centerY}px;
            }
          }
          ${getCosmicMessageAnimationKeyframes()}
        `}</style>
      </defs>

      {/* Background disc - Phase 5B: Use preset disc style */}
      <circle
        cx={geometry.centerX}
        cy={geometry.centerY}
        r={geometry.radius}
        fill={preset.discStyle.fill}
        opacity={preset.discStyle.opacity}
        style={{
          filter: `brightness(${discBrightnessFromBlend})`,
        }}
      />

      {/* Guide rings (concentric circles) - Phase 5B: Use preset ring style */}
      {[0.25, 0.5, 0.75].map((multiplier) => (
        <circle
          key={multiplier}
          cx={geometry.centerX}
          cy={geometry.centerY}
          r={geometry.radius * multiplier}
          fill="none"
          stroke={preset.ringStyle.color}
          strokeWidth={preset.ringStyle.strokeWidth}
          opacity={(isDepthMode ? preset.ringStyle.opacity * 0.85 : preset.ringStyle.opacity) * ringOpacityMultiplier}
        />
      ))}

      {/* Axis lines from center outward - Phase 5B: Use preset axis style */}
      {geometry.axes.map((axis) => {
        const endPoint = getRadarPoint(geometry, axis.angleDeg, 1.0);
        return (
          <line
            key={axis.id}
            x1={geometry.centerX}
            y1={geometry.centerY}
            x2={endPoint.x}
            y2={endPoint.y}
            stroke={preset.axisStyle.color}
            strokeWidth={preset.axisStyle.strokeWidth}
            opacity={preset.axisStyle.opacity}
          />
        );
      })}

      {/* Polygon from sample values with ease-in animation and message effects */}
      <polygon
        points={polygonPoints}
        fill={`rgba(255, 220, 180, ${polygonFillOpacity})`}
        stroke="rgba(255, 200, 150, 0.6)"
        strokeWidth={strokeWidth}
        style={{
          transformOrigin: `${geometry.centerX}px ${geometry.centerY}px`,
          animation: "polygonEaseIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards",
          // Phase 4C: Cinematic morph transitions
          // Phase 6I: Add timeline wobble (rotation bias) and pulse (scale multiplier)
          // Phase 6J.3.3: When reduceMotion, clamp wobble/pulse to near-static
          transform: (() => {
            const rawWobble = (currentFrame?.radar.wobble ?? 0) * 4; // degrees
            const rawPulse = currentFrame?.radar.pulse ?? 1;
            // When reduced motion, clamp wobble to 10-20% and pulse to ±2%
            const timelineWobble = reduceMotion ? rawWobble * 0.15 : rawWobble;
            const timelinePulse = reduceMotion 
              ? 1.0 + (rawPulse - 1.0) * 0.2  // Reduce pulse amplitude to 20%
              : rawPulse;
            // Phase 7: Multiply timeline effects by blend scale
            const finalScale = energyScale * timelinePulse * polygonScaleFromBlend;
            const creativityRotation = messageId === "creativity" ? 1.5 : 0;
            const totalRotation = creativityRotation + timelineWobble;
            return `rotate(${totalRotation}deg) scale(${finalScale})`;
          })(),
          transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms ease-out",
          // Phase 7: Apply blend opacity multiplier
          opacity: 0.9 * polygonOpacityMultiplier,
          // Phase 4E: Message animation effects (polygon)
          // Phase 6C.2: Highlight visibility safety - boost stroke opacity for highlighted polygon
          strokeOpacity: highlightAxis ? Math.min(0.4, 0.6 + 0.1) : 0.6,
          ...messageAnimationStyles.polygonEffectStyle,
        }}
      />
      
      {/* Phase 4E: Depth mode - inner disc overlay */}
      {isDepthMode && messageAnimationStyles.innerDiscStyle && (
        <circle
          cx={geometry.centerX}
          cy={geometry.centerY}
          r={geometry.radius * 0.4}
          fill="rgba(0, 0, 0, 0.3)"
          style={{
            ...messageAnimationStyles.innerDiscStyle,
          }}
        />
      )}
      
      {/* Phase 4E: Connect mode - center glow */}
      {isConnectMode && messageAnimationStyles.centerGlowStyle && (
        <circle
          cx={geometry.centerX}
          cy={geometry.centerY}
          r={geometry.radius * 0.3}
          fill="rgba(255, 200, 150, 0.2)"
          style={{
            ...messageAnimationStyles.centerGlowStyle,
            transformOrigin: `${geometry.centerX}px ${geometry.centerY}px`,
          }}
        />
      )}

      {/* Axis labels at anchor positions with highlight opacity and cinematic transitions */}
      {geometry.axes.map((axis) => {
        const labelPoint = getRadarPoint(geometry, axis.angleDeg, 1.15);
        const isHighlighted = highlightAxis === axis.id;
        const labelOpacity = isHighlighted ? 1.0 : 0.55;
        const isCreativityLabel = messageId === "creativity" && axis.id === "creativity";
        const isClarityLabel = messageId === "clarity" && isHighlighted;
        
        // Phase 4E: Apply message animation styles to labels
        const labelAnimationStyle = (isCreativityLabel || isClarityLabel) 
          ? messageAnimationStyles.labelEffectStyle 
          : {};
        
        // Phase 4F: Use choreography label fade timing
        const labelFadeDuration = choreography?.labelFade ?? 250;
        
        // Phase 6C.2: Highlight visibility safety - add text-shadow if needed
        // Check if halo brightness might obscure the label
        const needsTextShadow = isHighlighted && (messageId === "clarity" || animationContext?.haloRotationBiasDeg !== undefined);
        
        return (
          <text
            key={axis.id}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={adjustedLabelColor}
            fontSize="12"
            fontWeight={preset.labelStyle.fontWeight}
            className="select-none"
            opacity={(() => {
              // Phase 6I: Multiply label opacity with subtle radar pulse breathing
              const radarPulse = currentFrame?.radar.pulse ?? 1;
              const breathingMultiplier = 0.95 + 0.05 * radarPulse;
              // Phase 7: Apply blend opacity multiplier
              return labelOpacity * (preset.labelStyle.opacity ?? 1.0) * breathingMultiplier * labelOpacityMultiplier;
            })()}
            style={{
              // Phase 4B: Clarity mode - sharpen labels (remove text-shadow)
              // Phase 6C.2: Highlight visibility safety - add text-shadow for highlighted labels
              textShadow: isClarityMode ? "none" : (needsTextShadow ? "0 0 2px rgba(0, 0, 0, 0.5)" : undefined),
              // Phase 4C: Cinematic label transitions
              // Phase 4F: Use choreography label fade duration
              // Phase 6J.3.3: When reduceMotion, ensure transitions are 200–300ms
              transform: isHighlighted ? "translateY(-2px)" : "translateY(0px)",
              letterSpacing: isHighlighted ? preset.labelStyle.letterSpacing : preset.labelStyle.letterSpacing,
              transition: reduceMotion
                ? `opacity ${Math.min(labelFadeDuration, 300)}ms ease-out, transform ${Math.min(labelFadeDuration, 300)}ms ease-out, letter-spacing ${Math.min(labelFadeDuration, 300)}ms ease-out`
                : `opacity ${labelFadeDuration}ms ease-out, transform ${labelFadeDuration}ms ease-out, letter-spacing ${labelFadeDuration}ms ease-out`,
              // Phase 4E: Message animation effects (label)
              ...labelAnimationStyle,
              transformOrigin: `${labelPoint.x}px ${labelPoint.y}px`,
            }}
          >
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}

