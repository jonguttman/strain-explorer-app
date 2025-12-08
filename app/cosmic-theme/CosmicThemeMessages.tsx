/**
 * CosmicThemeMessages.tsx
 * 
 * Phase 8A: Animated message display component
 * 
 * Renders effect words and taglines with animated opacity, scale, and glow.
 * Consumes message animation data from timeline frames.
 */

"use client";

import React, { useMemo, memo } from "react";
import type { MessageFrame } from "./choreography/timelineEngine";
import type { MessageStyle } from "./config/cosmicThemeVisualPresets";
import type { ChoreographyProfile } from "./config/cosmicThemeChoreography";

// ============================================================================
// TYPES
// ============================================================================

export interface CosmicThemeMessagesProps {
  /** Message animation frame from timeline */
  frame: MessageFrame;
  
  /** Visual styling */
  style: MessageStyle;
  
  /** Choreography profile for amplitude modifiers */
  choreography: ChoreographyProfile;
  
  /** Main effect word (e.g., "Create", "Connect") */
  effectWord?: string;
  
  /** Effect tagline description */
  tagline?: string;
  
  /** Position X coordinate */
  x: number;
  
  /** Position Y coordinate */
  y: number;
  
  /** Maximum width for text wrapping */
  maxWidth?: number;
  
  /** Optional accent color override */
  accentColor?: string;
  
  /** Optional className */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CosmicThemeMessages = memo(function CosmicThemeMessages({
  frame,
  style,
  choreography,
  effectWord,
  tagline,
  x,
  y,
  maxWidth: _maxWidth = 200, // Reserved for text wrapping
  accentColor: _accentColor, // Reserved for accent override
  className,
}: CosmicThemeMessagesProps) {
  // Apply choreography amplitude to glow
  const glowAmp = choreography.amplitudes.messageGlow;
  const effectiveGlow = frame.glowIntensity * glowAmp;
  
  // Generate stable filter ID based on position
  const filterId = useMemo(() => 
    `message-glow-${x.toFixed(0)}-${y.toFixed(0)}`,
    [x, y]
  );
  
  // Don't render if no content
  if (!effectWord && !tagline) {
    return null;
  }
  
  return (
    <g 
      className={className}
      style={{
        opacity: frame.opacity,
        transform: `scale(${frame.scale})`,
        transformOrigin: `${x}px ${y}px`,
        transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
      }}
    >
      {/* Glow filter */}
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={4 * effectiveGlow} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Effect word (main) */}
      {effectWord && (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={style.color}
          fontSize={style.fontSize}
          fontWeight={style.fontWeight}
          fontFamily={style.fontFamily}
          filter={effectiveGlow > 0.1 ? `url(#${filterId})` : undefined}
          style={{
            userSelect: "none",
            willChange: "opacity, transform",
          }}
        >
          {effectWord}
        </text>
      )}
      
      {/* Tagline (secondary, below effect word) */}
      {tagline && (
        <text
          x={x}
          y={y + (effectWord ? style.fontSize * 1.4 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={style.color}
          fontSize={style.fontSize * 0.65}
          fontWeight={Math.max(style.fontWeight - 100, 400)}
          fontFamily={style.fontFamily}
          style={{
            opacity: 0.8,
            userSelect: "none",
          }}
        >
          {tagline.length > 40 ? `${tagline.slice(0, 40)}...` : tagline}
        </text>
      )}
    </g>
  );
});

/**
 * Static messages for reduceMotion or static renders
 */
export const CosmicThemeMessagesStatic = memo(function CosmicThemeMessagesStatic({
  style,
  effectWord,
  tagline,
  x,
  y,
  accentColor: _accentColor, // Reserved for accent override
  className,
}: Omit<CosmicThemeMessagesProps, "frame" | "choreography" | "maxWidth">) {
  if (!effectWord && !tagline) {
    return null;
  }
  
  return (
    <g className={className}>
      {effectWord && (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={style.color}
          fontSize={style.fontSize}
          fontWeight={style.fontWeight}
          fontFamily={style.fontFamily}
          style={{ userSelect: "none" }}
        >
          {effectWord}
        </text>
      )}
      
      {tagline && (
        <text
          x={x}
          y={y + (effectWord ? style.fontSize * 1.4 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={style.color}
          fontSize={style.fontSize * 0.65}
          fontWeight={Math.max(style.fontWeight - 100, 400)}
          fontFamily={style.fontFamily}
          style={{ opacity: 0.8, userSelect: "none" }}
        >
          {tagline.length > 40 ? `${tagline.slice(0, 40)}...` : tagline}
        </text>
      )}
    </g>
  );
});

export default CosmicThemeMessages;
