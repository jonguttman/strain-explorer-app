/**
 * unifiedRadarGeometry.ts
 * 
 * Phase 8C: Shared radar geometry computation helpers
 * 
 * These functions provide geometry calculations that are identical between
 * Classic and Cosmic renderers. This is scaffolding only - existing components
 * continue to use their own implementations.
 * 
 * Future phases will migrate existing components to use these shared helpers.
 */

import type { TraitAxisId } from "@/lib/types";
import type {
  RadarGeometry,
  RadarAxisConfig,
  RadarAxisData,
  RadarDataSet,
  RadarVertex,
  RadarPolygonData,
  CreateGeometryOptions,
  CreateAxisDataOptions,
} from "./unifiedRadarTypes";
import { RADAR_AXES_ORDER, RADAR_AXIS_LABELS } from "@/lib/radarTheme";

// ============================================================================
// CONSTANTS
// ============================================================================

/** Default number of axes (6 for hexagonal radar) */
export const DEFAULT_AXIS_COUNT = 6;

/** Default starting angle (top of radar) */
export const DEFAULT_START_ANGLE = -Math.PI / 2;

/** Default inner radius ratio */
export const DEFAULT_INNER_RADIUS_RATIO = 0;

/** Default minimum display value (prevents center collapse) */
export const DEFAULT_MIN_DISPLAY = 0.15;

/** Default maximum raw value */
export const DEFAULT_MAX_RAW = 100;

// ============================================================================
// GEOMETRY CREATION
// ============================================================================

/**
 * Creates radar geometry from container dimensions
 */
export function createRadarGeometry(options: CreateGeometryOptions): RadarGeometry {
  const {
    width,
    height,
    padding = 40,
    labelOffset = 25,
    axisCount = DEFAULT_AXIS_COUNT,
    innerRadiusRatio = DEFAULT_INNER_RADIUS_RATIO,
  } = options;
  
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2 - padding;
  const outerRadius = maxRadius - labelOffset;
  const innerRadius = outerRadius * innerRadiusRatio;
  
  // Compute axis angles
  const angleStep = (2 * Math.PI) / axisCount;
  const axisAngles: number[] = [];
  for (let i = 0; i < axisCount; i++) {
    axisAngles.push(DEFAULT_START_ANGLE + i * angleStep);
  }
  
  return {
    centerX,
    centerY,
    innerRadius,
    outerRadius,
    axisCount,
    axisAngles,
    startAngle: DEFAULT_START_ANGLE,
  };
}

/**
 * Creates axis configurations from geometry
 */
export function createAxisConfigs(
  geometry: RadarGeometry,
  axes: TraitAxisId[] = RADAR_AXES_ORDER
): RadarAxisConfig[] {
  return axes.map((id, index) => ({
    id,
    label: RADAR_AXIS_LABELS[id] ?? id,
    angle: geometry.axisAngles[index] ?? DEFAULT_START_ANGLE + (index * 2 * Math.PI) / axes.length,
    index,
  }));
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

/**
 * Creates axis data from raw trait values
 */
export function createAxisData(options: CreateAxisDataOptions): RadarAxisData[] {
  const {
    rawTraits,
    axes,
    minDisplay = DEFAULT_MIN_DISPLAY,
    maxRaw = DEFAULT_MAX_RAW,
  } = options;
  
  return axes.map((id) => {
    const rawValue = rawTraits[id] ?? 0;
    const normalizedValue = Math.min(1, Math.max(0, rawValue / maxRaw));
    
    // Apply shaping to prevent center collapse
    const shapedValue = minDisplay + (1 - minDisplay) * normalizedValue;
    
    return {
      id,
      label: RADAR_AXIS_LABELS[id] ?? id,
      value: normalizedValue,
      rawValue,
      shapedValue,
    };
  });
}

/**
 * Creates a complete radar data set
 */
export function createRadarDataSet(
  options: CreateAxisDataOptions,
  id?: string,
  label?: string
): RadarDataSet {
  return {
    axes: createAxisData(options),
    id,
    label,
  };
}

// ============================================================================
// VERTEX COMPUTATION
// ============================================================================

/**
 * Computes radar vertices from data and geometry
 */
export function computeRadarVertices(
  data: RadarDataSet,
  geometry: RadarGeometry,
  useShaped: boolean = true
): RadarVertex[] {
  const { centerX, centerY, innerRadius, outerRadius, axisAngles } = geometry;
  const radiusRange = outerRadius - innerRadius;
  
  return data.axes.map((axisData, index) => {
    const angle = axisAngles[index] ?? DEFAULT_START_ANGLE + (index * 2 * Math.PI) / data.axes.length;
    const value = useShaped && axisData.shapedValue !== undefined
      ? axisData.shapedValue
      : axisData.value;
    
    const radius = innerRadius + radiusRange * value;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      axis: axisData.id,
      value: axisData.value,
      angle,
    };
  });
}

/**
 * Converts vertices to SVG path data string
 */
export function verticesToPathD(vertices: RadarVertex[]): string {
  if (vertices.length === 0) return "";
  
  const commands = vertices.map((v, i) => {
    const command = i === 0 ? "M" : "L";
    return `${command} ${v.x.toFixed(2)} ${v.y.toFixed(2)}`;
  });
  
  return commands.join(" ") + " Z";
}

/**
 * Computes complete polygon data
 */
export function computeRadarPolygon(
  data: RadarDataSet,
  geometry: RadarGeometry,
  useShaped: boolean = true
): RadarPolygonData {
  const vertices = computeRadarVertices(data, geometry, useShaped);
  const pathD = verticesToPathD(vertices);
  
  return {
    vertices,
    pathD,
    axisData: data.axes,
  };
}

// ============================================================================
// POSITION HELPERS
// ============================================================================

/**
 * Computes axis endpoint positions (for drawing axis lines)
 */
export function computeAxisEndpoints(
  geometry: RadarGeometry
): { x: number; y: number; angle: number }[] {
  const { centerX, centerY, outerRadius, axisAngles } = geometry;
  
  return axisAngles.map((angle) => ({
    x: centerX + outerRadius * Math.cos(angle),
    y: centerY + outerRadius * Math.sin(angle),
    angle,
  }));
}

/**
 * Computes label positions with smart text anchoring
 */
export function computeLabelPositions(
  geometry: RadarGeometry,
  labelOffset: number = 25
): {
  x: number;
  y: number;
  angle: number;
  textAnchor: "start" | "middle" | "end";
  dy: string;
}[] {
  const { centerX, centerY, outerRadius, axisAngles } = geometry;
  const labelRadius = outerRadius + labelOffset;
  
  return axisAngles.map((angle) => {
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    
    // Determine text anchor based on position
    let textAnchor: "start" | "middle" | "end" = "middle";
    if (x < centerX - 5) textAnchor = "end";
    else if (x > centerX + 5) textAnchor = "start";
    
    // Determine vertical alignment
    let dy = "0.35em";
    if (y < centerY - outerRadius * 0.5) dy = "0.8em";
    else if (y > centerY + outerRadius * 0.5) dy = "-0.3em";
    
    return { x, y, angle, textAnchor, dy };
  });
}

/**
 * Computes grid ring radii
 */
export function computeGridRings(
  geometry: RadarGeometry,
  ringCount: number = 4
): number[] {
  const { innerRadius, outerRadius } = geometry;
  const radiusRange = outerRadius - innerRadius;
  
  const rings: number[] = [];
  for (let i = 1; i <= ringCount; i++) {
    rings.push(innerRadius + (radiusRange * i) / ringCount);
  }
  
  return rings;
}

// ============================================================================
// INTERPOLATION HELPERS
// ============================================================================

/**
 * Linearly interpolates between two vertex sets
 * Used for smooth transitions between strain/dose changes
 */
export function interpolateVertices(
  verticesA: RadarVertex[],
  verticesB: RadarVertex[],
  t: number
): RadarVertex[] {
  if (verticesA.length !== verticesB.length) {
    throw new Error("Vertex arrays must have same length for interpolation");
  }
  
  return verticesA.map((vA, i) => {
    const vB = verticesB[i];
    return {
      x: vA.x + (vB.x - vA.x) * t,
      y: vA.y + (vB.y - vA.y) * t,
      axis: vA.axis,
      value: vA.value + (vB.value - vA.value) * t,
      angle: vA.angle,
    };
  });
}

/**
 * Interpolates between two polygon data sets
 */
export function interpolatePolygons(
  polygonA: RadarPolygonData,
  polygonB: RadarPolygonData,
  t: number
): RadarPolygonData {
  const vertices = interpolateVertices(polygonA.vertices, polygonB.vertices, t);
  const pathD = verticesToPathD(vertices);
  
  // Use source axis data (values interpolated in vertices)
  return {
    vertices,
    pathD,
    axisData: polygonA.axisData,
  };
}
