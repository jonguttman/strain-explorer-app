/**
 * CosmicThemeRadar.tsx
 * 
 * Phase 8A: Animated radar polygon renderer
 * 
 * Renders the radar polygon with subtle breathing and wobble animations.
 * Uses same geometry as Classic radar but with Cosmic visual treatment.
 */

"use client";

import React, { useMemo, memo } from "react";
import type { RadarFrame } from "./choreography/timelineEngine";
import type { PolygonStyle, AxisStyle, LabelStyle } from "./config/cosmicThemeVisualPresets";
import type { ChoreographyProfile } from "./config/cosmicThemeChoreography";
import type { TraitAxisId } from "@/lib/types";
import { formatAxisLabel } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export interface RadarVertex {
  x: number;
  y: number;
  axis: TraitAxisId;
  value: number;
}

export interface CosmicThemeRadarProps {
  /** Radar animation frame from timeline */
  frame: RadarFrame;
  
  /** Visual styling for polygon */
  polygonStyle: PolygonStyle;
  
  /** Visual styling for axis lines */
  axisStyle: AxisStyle;
  
  /** Visual styling for labels */
  labelStyle: LabelStyle;
  
  /** Choreography profile for amplitude modifiers */
  choreography: ChoreographyProfile;
  
  /** Radar vertices (computed from traits) */
  vertices: RadarVertex[];
  
  /** Center coordinates */
  cx: number;
  cy: number;
  
  /** Outer radius for axis lines */
  outerRadius: number;
  
  /** Optional accent color override */
  accentColor?: string;
  
  /** Whether to show axis labels */
  showLabels?: boolean;
  
  /** Label offset from outer radius */
  labelOffset?: number;
  
  /** Optional className */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Converts vertices to SVG path points string
 */
function verticesToPathPoints(vertices: RadarVertex[]): string {
  if (vertices.length === 0) return "";
  
  return vertices
    .map((v, i) => `${i === 0 ? "M" : "L"} ${v.x.toFixed(2)} ${v.y.toFixed(2)}`)
    .join(" ") + " Z";
}

/**
 * Applies wobble distortion to vertices
 */
function applyWobble(
  vertices: RadarVertex[],
  wobbleAmount: number,
  secondaryFreq: number,
  breathingPhase: number,
  cx: number,
  cy: number
): RadarVertex[] {
  if (wobbleAmount === 0) return vertices;
  
  return vertices.map((vertex, index) => {
    // Primary wobble
    const primaryWobble = Math.sin(breathingPhase * Math.PI * 2 + index) * wobbleAmount;
    
    // Secondary wobble (higher frequency)
    const secondaryWobble = Math.sin(breathingPhase * Math.PI * 2 * secondaryFreq + index * 1.5) * wobbleAmount * 0.3;
    
    const totalWobble = 1 + (primaryWobble + secondaryWobble) * 0.02;
    
    // Apply wobble as radial displacement
    const dx = vertex.x - cx;
    const dy = vertex.y - cy;
    
    return {
      ...vertex,
      x: cx + dx * totalWobble,
      y: cy + dy * totalWobble,
    };
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CosmicThemeRadar = memo(function CosmicThemeRadar({
  frame,
  polygonStyle,
  axisStyle,
  labelStyle,
  choreography,
  vertices,
  cx,
  cy,
  outerRadius,
  accentColor,
  showLabels = true,
  labelOffset = 20,
  className,
}: CosmicThemeRadarProps) {
  // Apply choreography amplitudes
  const wobbleAmp = choreography.amplitudes.radarWobble;
  const breathingAmp = choreography.amplitudes.radarBreathing;
  
  // Compute wobbled vertices
  const wobbledVertices = useMemo(() => {
    const effectiveWobble = frame.wobble * wobbleAmp;
    return applyWobble(
      vertices,
      effectiveWobble,
      frame.secondaryWobbleFreq,
      frame.breathingPhase,
      cx,
      cy
    );
  }, [vertices, frame, wobbleAmp, cx, cy]);
  
  // Compute polygon path
  const polygonPath = useMemo(() => 
    verticesToPathPoints(wobbledVertices),
    [wobbledVertices]
  );
  
  // Compute axis endpoints (from center to outer radius)
  const axisCount = vertices.length;
  const axisEndpoints = useMemo(() => {
    const angleStep = (2 * Math.PI) / axisCount;
    const startAngle = -Math.PI / 2; // Start at top
    
    return vertices.map((v, i) => {
      const angle = startAngle + i * angleStep;
      return {
        x: cx + outerRadius * Math.cos(angle),
        y: cy + outerRadius * Math.sin(angle),
        axis: v.axis,
      };
    });
  }, [vertices, cx, cy, outerRadius, axisCount]);
  
  // Compute label positions
  const labelPositions = useMemo(() => {
    const angleStep = (2 * Math.PI) / axisCount;
    const startAngle = -Math.PI / 2;
    const labelRadius = outerRadius + labelOffset;
    
    return vertices.map((v, i) => {
      const angle = startAngle + i * angleStep;
      return {
        x: cx + labelRadius * Math.cos(angle),
        y: cy + labelRadius * Math.sin(angle),
        axis: v.axis,
        angle: angle * (180 / Math.PI),
      };
    });
  }, [vertices, cx, cy, outerRadius, labelOffset, axisCount]);
  
  // Compute scale from pulse
  const pulseScale = 1 + frame.pulse * breathingAmp;
  
  // Override polygon colors with accent if provided
  const fillColor = accentColor 
    ? `${accentColor}40` // 25% alpha
    : polygonStyle.fill;
  const strokeColor = accentColor 
    ? `${accentColor}cc` // 80% alpha
    : polygonStyle.stroke;
  
  // Generate stable filter ID based on center position
  const filterId = useMemo(() => 
    `radar-glow-${cx.toFixed(0)}-${cy.toFixed(0)}`,
    [cx, cy]
  );
  
  return (
    <g 
      className={className}
      style={{
        transform: `scale(${pulseScale})`,
        transformOrigin: `${cx}px ${cy}px`,
        transition: "transform 0.1s ease-out",
      }}
    >
      {/* Filter for polygon glow */}
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Axis lines */}
      {axisEndpoints.map((endpoint, index) => (
        <line
          key={`axis-${endpoint.axis}`}
          x1={cx}
          y1={cy}
          x2={endpoint.x}
          y2={endpoint.y}
          stroke={axisStyle.color}
          strokeWidth={axisStyle.width}
          strokeDasharray={axisStyle.dashArray}
          style={{ opacity: 0.6 }}
        />
      ))}
      
      {/* Grid rings (concentric circles) */}
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <circle
          key={`ring-${ratio}`}
          cx={cx}
          cy={cy}
          r={outerRadius * ratio * 0.85} // Scale to fit within label area
          fill="none"
          stroke={axisStyle.color}
          strokeWidth={axisStyle.width * 0.5}
          style={{ opacity: 0.3 }}
        />
      ))}
      
      {/* Polygon fill (glow layer) */}
      <path
        d={polygonPath}
        fill={fillColor}
        fillOpacity={polygonStyle.fillOpacity * 0.5}
        filter={`url(#${filterId})`}
        style={{ willChange: "d, opacity" }}
      />
      
      {/* Polygon fill (main) */}
      <path
        d={polygonPath}
        fill={fillColor}
        fillOpacity={polygonStyle.fillOpacity}
        style={{ willChange: "d" }}
      />
      
      {/* Polygon stroke */}
      <path
        d={polygonPath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={polygonStyle.strokeWidth}
        strokeOpacity={polygonStyle.strokeOpacity}
        strokeLinejoin="round"
        style={{ willChange: "d" }}
      />
      
      {/* Axis labels */}
      {showLabels && labelPositions.map((pos) => {
        // Determine text anchor based on position
        let textAnchor: "start" | "middle" | "end" = "middle";
        let dy = "0.35em";
        
        if (pos.x < cx - 5) textAnchor = "end";
        else if (pos.x > cx + 5) textAnchor = "start";
        
        if (pos.y < cy - outerRadius * 0.5) dy = "0.8em";
        else if (pos.y > cy + outerRadius * 0.5) dy = "-0.3em";
        
        return (
          <text
            key={`label-${pos.axis}`}
            x={pos.x}
            y={pos.y}
            textAnchor={textAnchor}
            dy={dy}
            fill={labelStyle.color}
            fontSize={labelStyle.fontSize}
            fontWeight={labelStyle.fontWeight}
            fontFamily={labelStyle.fontFamily}
            style={{ 
              letterSpacing: labelStyle.letterSpacing,
              userSelect: "none",
            }}
          >
            {formatAxisLabel(pos.axis)}
          </text>
        );
      })}
    </g>
  );
});

/**
 * Static radar for reduceMotion or static renders
 */
export const CosmicThemeRadarStatic = memo(function CosmicThemeRadarStatic({
  polygonStyle,
  axisStyle,
  labelStyle,
  vertices,
  cx,
  cy,
  outerRadius,
  accentColor,
  showLabels = true,
  labelOffset = 20,
  className,
}: Omit<CosmicThemeRadarProps, "frame" | "choreography">) {
  const polygonPath = useMemo(() => 
    verticesToPathPoints(vertices),
    [vertices]
  );
  
  const axisCount = vertices.length;
  const angleStep = (2 * Math.PI) / axisCount;
  const startAngle = -Math.PI / 2;
  
  const fillColor = accentColor ? `${accentColor}40` : polygonStyle.fill;
  const strokeColor = accentColor ? `${accentColor}cc` : polygonStyle.stroke;
  
  return (
    <g className={className}>
      {/* Axis lines */}
      {vertices.map((v, i) => {
        const angle = startAngle + i * angleStep;
        const endX = cx + outerRadius * Math.cos(angle);
        const endY = cy + outerRadius * Math.sin(angle);
        
        return (
          <line
            key={`axis-${v.axis}`}
            x1={cx}
            y1={cy}
            x2={endX}
            y2={endY}
            stroke={axisStyle.color}
            strokeWidth={axisStyle.width}
            strokeDasharray={axisStyle.dashArray}
            style={{ opacity: 0.6 }}
          />
        );
      })}
      
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <circle
          key={`ring-${ratio}`}
          cx={cx}
          cy={cy}
          r={outerRadius * ratio * 0.85}
          fill="none"
          stroke={axisStyle.color}
          strokeWidth={axisStyle.width * 0.5}
          style={{ opacity: 0.3 }}
        />
      ))}
      
      {/* Polygon */}
      <path
        d={polygonPath}
        fill={fillColor}
        fillOpacity={polygonStyle.fillOpacity}
        stroke={strokeColor}
        strokeWidth={polygonStyle.strokeWidth}
        strokeOpacity={polygonStyle.strokeOpacity}
        strokeLinejoin="round"
      />
      
      {/* Labels */}
      {showLabels && vertices.map((v, i) => {
        const angle = startAngle + i * angleStep;
        const labelRadius = outerRadius + labelOffset;
        const x = cx + labelRadius * Math.cos(angle);
        const y = cy + labelRadius * Math.sin(angle);
        
        let textAnchor: "start" | "middle" | "end" = "middle";
        let dy = "0.35em";
        
        if (x < cx - 5) textAnchor = "end";
        else if (x > cx + 5) textAnchor = "start";
        
        if (y < cy - outerRadius * 0.5) dy = "0.8em";
        else if (y > cy + outerRadius * 0.5) dy = "-0.3em";
        
        return (
          <text
            key={`label-${v.axis}`}
            x={x}
            y={y}
            textAnchor={textAnchor}
            dy={dy}
            fill={labelStyle.color}
            fontSize={labelStyle.fontSize}
            fontWeight={labelStyle.fontWeight}
            fontFamily={labelStyle.fontFamily}
            style={{ letterSpacing: labelStyle.letterSpacing }}
          >
            {formatAxisLabel(v.axis)}
          </text>
        );
      })}
    </g>
  );
});

export default CosmicThemeRadar;
