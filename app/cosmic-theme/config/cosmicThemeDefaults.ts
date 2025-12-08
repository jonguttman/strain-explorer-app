/**
 * COSMIC THEME REBUILD — PHASE 2
 * --------------------------------
 * This file is part of a fresh rebuild of the cosmic demo.
 * Cursor MUST NOT import or copy logic from:
 * - InlineCosmicFireRadarDemo.tsx
 * - InlineCosmicRadarDemo.tsx
 * - tripdarRadar.ts
 *
 * Phase 2: Core architecture and math foundation only.
 * No rendering, no SVG, no animations, no timers.
 */

/**
 * Core geometric constants for the Cosmic Theme radar system.
 * These define the base dimensions and positioning of all radar elements.
 */
export const COSMIC_RADIUS = 138;
export const COSMIC_HALO_RADIUS = 198;
export const COSMIC_CENTER_X = 180;
export const COSMIC_CENTER_Y = 180;

/**
 * Inner and outer ring radius multipliers.
 * Used for defining concentric circles within the radar.
 */
export const COSMIC_INNER_RING_MULTIPLIER = 0.5;
export const COSMIC_OUTER_RING_MULTIPLIER = 1.0;

