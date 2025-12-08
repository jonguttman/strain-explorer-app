/**
 * CosmicThemeStars.tsx
 * 
 * Phase 8A: Two-layer star anchor component
 * 
 * Renders star anchors at each radar axis vertex with foreground/background layers.
 * Consumes two-layer star data from timeline frames.
 */

"use client";

import React, { useMemo, memo } from "react";
import type { StarsFrame, StarLayerFrame } from "./choreography/timelineEngine";
import type { StarStyle } from "./config/cosmicThemeVisualPresets";
import type { ChoreographyProfile } from "./config/cosmicThemeChoreography";
import type { TraitAxisId } from "@/lib/types";

// ============================================================================
// TYPES
// ============================================================================

export interface StarAnchor {
  x: number;
  y: number;
  axis: TraitAxisId;
  value: number;
}

export interface CosmicThemeStarsProps {
  /** Star animation frame from timeline */
  frame: StarsFrame;
  
  /** Visual styling */
  style: StarStyle;
  
  /** Choreography profile for amplitude modifiers */
  choreography: ChoreographyProfile;
  
  /** Star anchor positions (one per axis) */
  anchors: StarAnchor[];
  
  /** Optional accent color override */
  accentColor?: string;
  
  /** Optional className for container */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Renders a single star with glow
 */
function StarGlyph({
  x,
  y,
  size,
  color,
  glowColor,
  glowBlur: _glowBlur, // Used in filter definition at caller level
  opacity,
  scale,
  filterId,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  glowBlur: number;
  opacity: number;
  scale: number;
  filterId: string;
}) {
  const effectiveSize = size * scale;
  
  return (
    <g style={{ opacity }}>
      {/* Glow layer */}
      <circle
        cx={x}
        cy={y}
        r={effectiveSize * 1.5}
        fill={glowColor}
        filter={`url(#${filterId})`}
        style={{ 
          opacity: opacity * 0.6,
          willChange: "opacity",
        }}
      />
      
      {/* Core star */}
      <circle
        cx={x}
        cy={y}
        r={effectiveSize * 0.5}
        fill={color}
        style={{ 
          willChange: "opacity, r",
        }}
      />
      
      {/* Bright center */}
      <circle
        cx={x}
        cy={y}
        r={effectiveSize * 0.2}
        fill="#ffffff"
        style={{ 
          opacity: 0.9,
        }}
      />
    </g>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CosmicThemeStars = memo(function CosmicThemeStars({
  frame,
  style,
  choreography,
  anchors,
  accentColor,
  className,
}: CosmicThemeStarsProps) {
  // Determine if dual layers are enabled
  const useDualLayers = choreography.enableDualStarLayers;
  
  // Generate stable filter ID based on first anchor position
  const filterId = useMemo(() => {
    const anchor = anchors[0];
    return `star-glow-${anchor?.x?.toFixed(0) ?? 0}-${anchor?.y?.toFixed(0) ?? 0}`;
  }, [anchors]);
  
  // Compute colors with optional accent override
  const glowColor = accentColor 
    ? `${accentColor}66` // 40% alpha
    : style.glowColor;
  
  // Apply choreography amplitudes
  const driftAmp = choreography.amplitudes.starDrift;
  const twinkleAmp = choreography.amplitudes.starTwinkle;
  
  // Compute positions with drift applied
  const computeLayerPositions = (
    layer: StarLayerFrame,
    isBackground: boolean
  ) => {
    const driftScale = isBackground ? 0.6 : 1.0;
    const sizeScale = isBackground ? 0.7 : 1.0;
    
    return anchors.map((anchor, index) => {
      // Apply drift with some variation per star
      const driftVariation = 1 + (index * 0.1);
      const dx = layer.driftX * driftAmp * driftVariation * 5; // 5px max drift
      const dy = layer.driftY * driftAmp * driftVariation * 5;
      
      return {
        x: anchor.x + dx * driftScale,
        y: anchor.y + dy * driftScale,
        axis: anchor.axis,
        opacity: 0.5 + layer.twinkle * 0.5 * twinkleAmp,
        scale: layer.scale * sizeScale,
      };
    });
  };
  
  const foregroundStars = computeLayerPositions(frame.foreground, false);
  const backgroundStars = useDualLayers 
    ? computeLayerPositions(frame.background, true)
    : [];
  
  return (
    <g className={className}>
      {/* Filter definition */}
      <defs>
        <filter id={filterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={style.glowBlur / 2} />
        </filter>
      </defs>
      
      {/* Background layer (rendered first, behind) */}
      {useDualLayers && backgroundStars.map((star, index) => (
        <StarGlyph
          key={`bg-${star.axis}-${index}`}
          x={star.x}
          y={star.y}
          size={style.size * star.scale}
          color={style.color}
          glowColor={glowColor}
          glowBlur={style.glowBlur}
          opacity={star.opacity * 0.5} // Background is dimmer
          scale={star.scale}
          filterId={filterId}
        />
      ))}
      
      {/* Foreground layer */}
      {foregroundStars.map((star, index) => (
        <StarGlyph
          key={`fg-${star.axis}-${index}`}
          x={star.x}
          y={star.y}
          size={style.size * star.scale}
          color={style.color}
          glowColor={glowColor}
          glowBlur={style.glowBlur}
          opacity={star.opacity}
          scale={star.scale}
          filterId={filterId}
        />
      ))}
    </g>
  );
});

/**
 * Static stars for reduceMotion or static renders
 */
export const CosmicThemeStarsStatic = memo(function CosmicThemeStarsStatic({
  style,
  anchors,
  accentColor,
  className,
}: Omit<CosmicThemeStarsProps, "frame" | "choreography">) {
  // Use stable ID based on first anchor position
  const filterId = useMemo(() => {
    const anchor = anchors[0];
    return `star-glow-static-${anchor?.x?.toFixed(0) ?? 0}-${anchor?.y?.toFixed(0) ?? 0}`;
  }, [anchors]);
  
  const glowColor = accentColor 
    ? `${accentColor}66`
    : style.glowColor;
  
  return (
    <g className={className}>
      <defs>
        <filter id={filterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={style.glowBlur / 2} />
        </filter>
      </defs>
      
      {anchors.map((anchor, index) => (
        <StarGlyph
          key={`static-${anchor.axis}-${index}`}
          x={anchor.x}
          y={anchor.y}
          size={style.size}
          color={style.color}
          glowColor={glowColor}
          glowBlur={style.glowBlur}
          opacity={0.8}
          scale={1}
          filterId={filterId}
        />
      ))}
    </g>
  );
});

export default CosmicThemeStars;
