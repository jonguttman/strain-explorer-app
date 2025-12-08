/**
 * unifiedRadarTypes.ts
 * 
 * Phase 8C: Shared radar type definitions
 * 
 * These types define the common interfaces that both Classic and Cosmic radar
 * renderers will eventually share. This is scaffolding only - no rendering
 * changes are made in this phase.
 * 
 * Architecture goals:
 * - Single source of truth for radar geometry
 * - Theme-agnostic data model
 * - Extensible visual skin system
 * - Clear separation of data vs presentation
 */

import type { TraitAxisId } from "@/lib/types";

// ============================================================================
// GEOMETRY TYPES
// ============================================================================

/**
 * Radar chart geometry configuration
 * Defines the physical layout of the radar visualization
 */
export interface RadarGeometry {
  /** Center X coordinate in SVG/canvas space */
  centerX: number;
  
  /** Center Y coordinate in SVG/canvas space */
  centerY: number;
  
  /** Inner radius (minimum data display radius) */
  innerRadius: number;
  
  /** Outer radius (maximum data display radius) */
  outerRadius: number;
  
  /** Number of axes in the radar */
  axisCount: number;
  
  /** Axis angles in radians (computed from axisCount) */
  axisAngles: number[];
  
  /** Starting angle offset (default: -π/2 for top-start) */
  startAngle: number;
}

/**
 * Individual axis configuration
 */
export interface RadarAxisConfig {
  /** Axis identifier */
  id: TraitAxisId;
  
  /** Display label */
  label: string;
  
  /** Short label for compact display */
  shortLabel?: string;
  
  /** Angle in radians */
  angle: number;
  
  /** Axis index (0-based) */
  index: number;
}

// ============================================================================
// DATA TYPES
// ============================================================================

/**
 * Single axis data point
 */
export interface RadarAxisData {
  /** Axis identifier */
  id: TraitAxisId;
  
  /** Display label */
  label: string;
  
  /** Normalized value (0-1) */
  value: number;
  
  /** Raw value (typically 0-100) */
  rawValue: number;
  
  /** Shaped value for display (prevents center collapse) */
  shapedValue?: number;
}

/**
 * Complete radar data set
 */
export interface RadarDataSet {
  /** Data for each axis */
  axes: RadarAxisData[];
  
  /** Optional dataset identifier */
  id?: string;
  
  /** Optional dataset label */
  label?: string;
}

/**
 * Computed polygon vertex
 */
export interface RadarVertex {
  /** X coordinate */
  x: number;
  
  /** Y coordinate */
  y: number;
  
  /** Associated axis ID */
  axis: TraitAxisId;
  
  /** Value at this vertex (0-1 normalized) */
  value: number;
  
  /** Axis angle in radians */
  angle: number;
}

/**
 * Computed polygon data
 */
export interface RadarPolygonData {
  /** Vertex positions */
  vertices: RadarVertex[];
  
  /** SVG path string */
  pathD: string;
  
  /** Associated axis data */
  axisData: RadarAxisData[];
}

// ============================================================================
// VISUAL SKIN TYPES
// ============================================================================

/**
 * Polygon visual styling
 */
export interface RadarPolygonSkin {
  /** Fill color or gradient */
  fill: string;
  
  /** Fill opacity (0-1) */
  fillOpacity: number;
  
  /** Stroke color */
  stroke: string;
  
  /** Stroke width */
  strokeWidth: number;
  
  /** Stroke opacity (0-1) */
  strokeOpacity: number;
  
  /** Stroke line join style */
  strokeLinejoin?: "round" | "miter" | "bevel";
  
  /** Optional glow/shadow */
  glow?: {
    color: string;
    blur: number;
    opacity: number;
  };
}

/**
 * Axis line visual styling
 */
export interface RadarAxisSkin {
  /** Line color */
  color: string;
  
  /** Line width */
  width: number;
  
  /** Dash pattern (e.g., "4 4") */
  dashArray?: string;
  
  /** Opacity (0-1) */
  opacity?: number;
}

/**
 * Grid ring visual styling
 */
export interface RadarGridSkin {
  /** Ring color */
  color: string;
  
  /** Ring stroke width */
  width: number;
  
  /** Number of concentric rings */
  ringCount: number;
  
  /** Opacity (0-1) */
  opacity?: number;
}

/**
 * Label visual styling
 */
export interface RadarLabelSkin {
  /** Text color */
  color: string;
  
  /** Font size in pixels */
  fontSize: number;
  
  /** Font weight */
  fontWeight: number;
  
  /** Font family */
  fontFamily: string;
  
  /** Letter spacing */
  letterSpacing?: string;
  
  /** Offset from outer radius */
  offset: number;
}

/**
 * Complete radar visual skin
 */
export interface RadarVisualSkin {
  /** Skin identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Polygon styling */
  polygon: RadarPolygonSkin;
  
  /** Axis line styling */
  axis: RadarAxisSkin;
  
  /** Grid ring styling */
  grid: RadarGridSkin;
  
  /** Label styling */
  label: RadarLabelSkin;
  
  /** Background styling */
  background?: {
    fill: string;
    opacity: number;
  };
}

// ============================================================================
// ANIMATION TYPES
// ============================================================================

/**
 * Animation state for radar polygon
 */
export interface RadarAnimationState {
  /** Scale factor for pulse effect */
  scale: number;
  
  /** Rotation offset in degrees */
  rotation: number;
  
  /** Overall opacity */
  opacity: number;
  
  /** Wobble amount (0-1) */
  wobble: number;
  
  /** Breathing phase (0-1) */
  breathingPhase: number;
}

/**
 * Transition configuration
 */
export interface RadarTransitionConfig {
  /** Duration in milliseconds */
  durationMs: number;
  
  /** Easing function */
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  
  /** Delay before start in milliseconds */
  delayMs?: number;
}

// ============================================================================
// RENDERER INTERFACE
// ============================================================================

/**
 * Abstract radar renderer interface
 * Both Classic and Cosmic renderers should eventually implement this
 */
export interface RadarRenderer {
  /** Renderer identifier */
  readonly id: string;
  
  /** Renderer display name */
  readonly name: string;
  
  /** Compute polygon data from traits and geometry */
  computePolygon(
    data: RadarDataSet,
    geometry: RadarGeometry
  ): RadarPolygonData;
  
  /** Apply visual skin to computed polygon */
  applySkin(
    polygon: RadarPolygonData,
    skin: RadarVisualSkin
  ): void;
}

// ============================================================================
// FACTORY TYPES
// ============================================================================

/**
 * Options for creating radar geometry
 */
export interface CreateGeometryOptions {
  /** Width of container */
  width: number;
  
  /** Height of container */
  height: number;
  
  /** Padding from edges */
  padding?: number;
  
  /** Label offset (reduces effective radius) */
  labelOffset?: number;
  
  /** Number of axes */
  axisCount?: number;
  
  /** Inner radius ratio (0-1, relative to outer) */
  innerRadiusRatio?: number;
}

/**
 * Options for creating axis data
 */
export interface CreateAxisDataOptions {
  /** Raw trait values (0-100) */
  rawTraits: Record<TraitAxisId, number>;
  
  /** Ordered list of axes */
  axes: TraitAxisId[];
  
  /** Minimum display value (prevents center collapse) */
  minDisplay?: number;
  
  /** Maximum raw value */
  maxRaw?: number;
}
