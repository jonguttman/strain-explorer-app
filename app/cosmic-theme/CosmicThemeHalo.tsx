/**
 * CosmicThemeHalo.tsx
 * 
 * Phase 8A: Multi-band gradient halo component
 * 
 * Renders 1-3 animated gradient rings around the radar, creating depth and glow.
 * Consumes multi-band halo data from timeline frames.
 */

"use client";

import React, { useMemo, memo } from "react";
import type { HaloFrame } from "./choreography/timelineEngine";
import type { HaloStyle } from "./config/cosmicThemeVisualPresets";
import type { ChoreographyProfile } from "./config/cosmicThemeChoreography";

// ============================================================================
// TYPES
// ============================================================================

export interface CosmicThemeHaloProps {
  /** Halo animation frame from timeline */
  frame: HaloFrame;
  
  /** Visual styling */
  style: HaloStyle;
  
  /** Choreography profile for amplitude modifiers */
  choreography: ChoreographyProfile;
  
  /** Center X coordinate */
  cx: number;
  
  /** Center Y coordinate */
  cy: number;
  
  /** Inner radius of halo */
  innerRadius: number;
  
  /** Outer radius of halo */
  outerRadius: number;
  
  /** Optional accent color override */
  accentColor?: string;
  
  /** Optional className for container */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CosmicThemeHalo = memo(function CosmicThemeHalo({
  frame,
  style,
  choreography,
  cx,
  cy,
  innerRadius: _innerRadius, // Reserved for future use
  outerRadius,
  accentColor,
  className,
}: CosmicThemeHaloProps) {
  // Determine number of bands to render
  const bandCount = choreography.enableMultiBandHalo 
    ? Math.min(frame.bands.length, 3) 
    : 1;
  
  // Generate stable gradient IDs based on band count (avoid Math.random in render)
  const gradientIds = useMemo(() => 
    Array.from({ length: bandCount }, (_, i) => `halo-gradient-${i}-${cx.toFixed(0)}-${cy.toFixed(0)}`),
    [bandCount, cx, cy]
  );
  
  // Compute colors with optional accent override
  const innerColor = accentColor 
    ? `${accentColor}59` // 35% alpha
    : style.innerColor;
  
  return (
    <g className={className}>
      {/* SVG Definitions for gradients */}
      <defs>
        {frame.bands.slice(0, bandCount).map((band, index) => {
          // bandScale used in rendered ellipse below for sizing
          return (
            <radialGradient
              key={gradientIds[index]}
              id={gradientIds[index]}
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop 
                offset="0%" 
                stopColor={innerColor}
                stopOpacity={band.intensity * band.layerOpacity}
              />
              <stop 
                offset="60%" 
                stopColor={innerColor}
                stopOpacity={band.intensity * band.layerOpacity * 0.5}
              />
              <stop 
                offset="100%" 
                stopColor={style.outerColor}
                stopOpacity={0}
              />
            </radialGradient>
          );
        })}
        
        {/* Blur filter */}
        <filter id="halo-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={style.blur / 2} />
        </filter>
      </defs>
      
      {/* Render halo bands from back to front */}
      {frame.bands.slice(0, bandCount).reverse().map((band, reverseIndex) => {
        const index = bandCount - 1 - reverseIndex;
        const bandScale = 1 + index * 0.12;
        const bandRadius = outerRadius * bandScale;
        
        // Apply choreography amplitude to rotation
        const rotationAmplitude = choreography.amplitudes.haloRotation;
        const effectiveRotation = band.rotation * rotationAmplitude;
        
        return (
          <g
            key={index}
            style={{
              transform: `rotate(${effectiveRotation}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: "transform 0.1s linear",
            }}
          >
            <ellipse
              cx={cx}
              cy={cy}
              rx={bandRadius}
              ry={bandRadius * 0.95} // Slight vertical compression
              fill={`url(#${gradientIds[index]})`}
              opacity={style.opacity * band.layerOpacity}
              filter="url(#halo-blur)"
              style={{
                willChange: "opacity, transform",
              }}
            />
          </g>
        );
      })}
    </g>
  );
});

/**
 * Static halo for reduceMotion or static renders
 */
export const CosmicThemeHaloStatic = memo(function CosmicThemeHaloStatic({
  style,
  cx,
  cy,
  outerRadius,
  accentColor,
  className,
}: Omit<CosmicThemeHaloProps, "frame" | "choreography" | "innerRadius">) {
  // Use stable ID based on position
  const gradientId = useMemo(() => 
    `halo-gradient-static-${cx.toFixed(0)}-${cy.toFixed(0)}`,
    [cx, cy]
  );
  
  const innerColor = accentColor 
    ? `${accentColor}40`
    : style.innerColor;
  
  return (
    <g className={className}>
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={innerColor} stopOpacity={0.5} />
          <stop offset="100%" stopColor={style.outerColor} stopOpacity={0} />
        </radialGradient>
        <filter id="halo-blur-static" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={style.blur / 2} />
        </filter>
      </defs>
      
      <ellipse
        cx={cx}
        cy={cy}
        rx={outerRadius}
        ry={outerRadius * 0.95}
        fill={`url(#${gradientId})`}
        opacity={style.opacity}
        filter="url(#halo-blur-static)"
      />
    </g>
  );
});

export default CosmicThemeHalo;
