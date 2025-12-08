/**
 * CosmicThemeDemo.tsx
 * 
 * Phase 8A: Orchestrator component that composes all Cosmic theme layers
 * 
 * This is the main entry point for rendering the Cosmic radar visualization.
 * It manages the timeline player and passes frame data to child components.
 */

"use client";

import React, { useMemo } from "react";
import type { TraitAxisId } from "@/lib/types";
import type { CosmicPresetId } from "./config/cosmicThemeVisualPresets";
import { getCosmicPreset, applyAccentColor } from "./config/cosmicThemeVisualPresets";
import { getChoreographyProfile } from "./config/cosmicThemeChoreography";
import { useCosmicTimelinePlayer, useReducedMotion } from "./hooks/useCosmicTimelinePlayer";
import type { TimelineConfig } from "./choreography/timelineEngine";
import {
  createUnifiedState,
  computeRadarVertices,
  shapeAxisValue,
} from "@/app/lib/tripdarExperienceState";
import type { DoseKey, StrainExperienceMeta } from "@/lib/types";

import { CosmicThemeHalo, CosmicThemeHaloStatic } from "./CosmicThemeHalo";
import { CosmicThemeStars, CosmicThemeStarsStatic } from "./CosmicThemeStars";
import { CosmicThemeRadar, CosmicThemeRadarStatic } from "./CosmicThemeRadar";
import { CosmicThemeMessages, CosmicThemeMessagesStatic } from "./CosmicThemeMessages";

// ============================================================================
// TYPES
// ============================================================================

export interface CosmicThemeDemoProps {
  /** Strain identifier */
  strainId: string;
  
  /** Strain display name */
  strainName: string;
  
  /** Current dose key */
  doseKey: DoseKey;
  
  /** Accent color (strain color) */
  accentHex: string;
  
  /** Raw trait values (0-100) */
  rawTraits: Record<TraitAxisId, number>;
  
  /** Ordered axis list */
  axes: TraitAxisId[];
  
  /** Experience metadata */
  experienceMeta?: StrainExperienceMeta | null;
  
  /** Visual preset ID */
  presetId?: CosmicPresetId;
  
  /** SVG width */
  width?: number;
  
  /** SVG height */
  height?: number;
  
  /** Whether animation is paused */
  paused?: boolean;
  
  /** Whether to show axis labels */
  showLabels?: boolean;
  
  /** Whether to show effect message */
  showMessage?: boolean;
  
  /** Optional className for container */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CosmicThemeDemo({
  strainId,
  strainName,
  doseKey,
  accentHex,
  rawTraits,
  axes,
  experienceMeta,
  presetId = "cosmic",
  width = 400,
  height = 400,
  paused = false,
  showLabels = true,
  showMessage = true,
  className,
}: CosmicThemeDemoProps) {
  // Check reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Create unified experience state
  const experienceState = useMemo(() => 
    createUnifiedState({
      strainId,
      strainName,
      doseKey,
      accentHex,
      rawTraits,
      axes,
      experienceMeta,
    }),
    [strainId, strainName, doseKey, accentHex, rawTraits, axes, experienceMeta]
  );
  
  // Get visual preset and choreography
  const basePreset = useMemo(() => getCosmicPreset(presetId), [presetId]);
  const preset = useMemo(() => 
    applyAccentColor(basePreset, accentHex),
    [basePreset, accentHex]
  );
  const choreography = useMemo(() => getChoreographyProfile(presetId), [presetId]);
  
  // Create timeline config
  const timelineConfig = useMemo<TimelineConfig>(() => ({
    effectCategory: experienceState.effectCategory,
    doseIntensity: experienceState.doseIntensity,
    strainSeed: experienceState.strainSeed,
    reduceMotion: prefersReducedMotion,
  }), [experienceState, prefersReducedMotion]);
  
  // Run timeline player
  const [{ frame }] = useCosmicTimelinePlayer(timelineConfig, {
    paused,
    reduceMotion: prefersReducedMotion,
  });
  
  // Compute geometry
  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = Math.min(width, height) * 0.35;
  const innerRadius = outerRadius * 0.15;
  const haloOuterRadius = outerRadius * 1.4;
  const labelOffset = 25;
  
  // Compute radar vertices with shaping
  const vertices = useMemo(() => {
    // Apply shaping to prevent center collapse
    const shapedTraits: Record<TraitAxisId, number> = {} as Record<TraitAxisId, number>;
    for (const axis of axes) {
      const raw = rawTraits[axis] ?? 0;
      shapedTraits[axis] = shapeAxisValue(raw, 0.15, 100) * 100;
    }
    
    // Create normalized version
    const normalizedValues: Record<TraitAxisId, number> = {} as Record<TraitAxisId, number>;
    for (const axis of axes) {
      normalizedValues[axis] = shapedTraits[axis] / 100;
    }
    
    return computeRadarVertices(
      { values: normalizedValues },
      axes,
      cx,
      cy,
      outerRadius,
      innerRadius
    );
  }, [rawTraits, axes, cx, cy, outerRadius, innerRadius]);
  
  // Star anchors are at the outer radius positions
  const starAnchors = useMemo(() => {
    const angleStep = (2 * Math.PI) / axes.length;
    const startAngle = -Math.PI / 2;
    
    return axes.map((axis, i) => {
      const angle = startAngle + i * angleStep;
      return {
        x: cx + outerRadius * Math.cos(angle),
        y: cy + outerRadius * Math.sin(angle),
        axis,
        value: experienceState.normalizedTraits.values[axis] ?? 0,
      };
    });
  }, [axes, cx, cy, outerRadius, experienceState.normalizedTraits]);
  
  // Message position (below radar)
  const messageY = cy + outerRadius + labelOffset + 30;
  
  // Render static version if reduced motion
  if (prefersReducedMotion || frame.reduceMotion) {
    return (
      <div className={className}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ background: preset.backgroundGradient }}
        >
          {/* Disc background */}
          <circle
            cx={cx}
            cy={cy}
            r={outerRadius * 1.2}
            fill={preset.discStyle.fill}
            opacity={preset.discStyle.opacity}
          />
          
          {/* Halo */}
          <CosmicThemeHaloStatic
            style={preset.haloStyle}
            cx={cx}
            cy={cy}
            outerRadius={haloOuterRadius}
            accentColor={accentHex}
          />
          
          {/* Radar */}
          <CosmicThemeRadarStatic
            polygonStyle={preset.polygonStyle}
            axisStyle={preset.axisStyle}
            labelStyle={preset.labelStyle}
            vertices={vertices}
            cx={cx}
            cy={cy}
            outerRadius={outerRadius}
            accentColor={accentHex}
            showLabels={showLabels}
            labelOffset={labelOffset}
          />
          
          {/* Stars */}
          <CosmicThemeStarsStatic
            style={preset.starStyle}
            anchors={starAnchors}
            accentColor={accentHex}
          />
          
          {/* Messages */}
          {showMessage && (
            <CosmicThemeMessagesStatic
              style={preset.messageStyle}
              effectWord={experienceMeta?.effectWord}
              tagline={experienceMeta?.effectTagline}
              x={cx}
              y={messageY}
              accentColor={accentHex}
            />
          )}
        </svg>
      </div>
    );
  }
  
  // Animated version
  return (
    <div className={className}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ 
          background: preset.backgroundGradient,
          willChange: "contents",
        }}
      >
        {/* Disc background */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius * 1.2}
          fill={preset.discStyle.fill}
          opacity={preset.discStyle.opacity}
          stroke={preset.discStyle.stroke}
          strokeWidth={preset.discStyle.strokeWidth}
        />
        
        {/* Halo (back layer) */}
        <CosmicThemeHalo
          frame={frame.halo}
          style={preset.haloStyle}
          choreography={choreography}
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={haloOuterRadius}
          accentColor={accentHex}
        />
        
        {/* Radar polygon and axes */}
        <CosmicThemeRadar
          frame={frame.radar}
          polygonStyle={preset.polygonStyle}
          axisStyle={preset.axisStyle}
          labelStyle={preset.labelStyle}
          choreography={choreography}
          vertices={vertices}
          cx={cx}
          cy={cy}
          outerRadius={outerRadius}
          accentColor={accentHex}
          showLabels={showLabels}
          labelOffset={labelOffset}
        />
        
        {/* Stars (front layer) */}
        <CosmicThemeStars
          frame={frame.stars}
          style={preset.starStyle}
          choreography={choreography}
          anchors={starAnchors}
          accentColor={accentHex}
        />
        
        {/* Messages */}
        {showMessage && (
          <CosmicThemeMessages
            frame={frame.message}
            style={preset.messageStyle}
            choreography={choreography}
            effectWord={experienceMeta?.effectWord}
            tagline={experienceMeta?.effectTagline}
            x={cx}
            y={messageY}
            accentColor={accentHex}
          />
        )}
      </svg>
    </div>
  );
}

export default CosmicThemeDemo;
