/**
 * Unified Radar Module
 * 
 * Phase 8C: Shared radar abstractions
 * 
 * This module provides:
 * - Shared type definitions for radar data and geometry
 * - Common geometry computation helpers
 * - Interpolation utilities for smooth transitions
 * 
 * NOTE: This is scaffolding only. Existing Classic and Cosmic renderers
 * continue to use their own implementations. Future phases will migrate
 * to these shared abstractions.
 */

// Types
export type {
  RadarGeometry,
  RadarAxisConfig,
  RadarAxisData,
  RadarDataSet,
  RadarVertex,
  RadarPolygonData,
  RadarPolygonSkin,
  RadarAxisSkin,
  RadarGridSkin,
  RadarLabelSkin,
  RadarVisualSkin,
  RadarAnimationState,
  RadarTransitionConfig,
  RadarRenderer,
  CreateGeometryOptions,
  CreateAxisDataOptions,
} from "./unifiedRadarTypes";

// Geometry helpers
export {
  DEFAULT_AXIS_COUNT,
  DEFAULT_START_ANGLE,
  DEFAULT_INNER_RADIUS_RATIO,
  DEFAULT_MIN_DISPLAY,
  DEFAULT_MAX_RAW,
  createRadarGeometry,
  createAxisConfigs,
  createAxisData,
  createRadarDataSet,
  computeRadarVertices,
  verticesToPathD,
  computeRadarPolygon,
  computeAxisEndpoints,
  computeLabelPositions,
  computeGridRings,
  interpolateVertices,
  interpolatePolygons,
} from "./unifiedRadarGeometry";
