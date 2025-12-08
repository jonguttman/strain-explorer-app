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

// Component exports (Phase 2: all return empty placeholders)
export { default as CosmicThemeDemo } from "./CosmicThemeDemo";
export { default as CosmicThemeRadar } from "./CosmicThemeRadar";
export { default as CosmicThemeHalo } from "./CosmicThemeHalo";
export { default as CosmicThemeStars } from "./CosmicThemeStars";
export { default as CosmicThemeMessages } from "./CosmicThemeMessages";
export { default as CosmicThemePhaseMachineComponent } from "./CosmicThemePhaseMachine";

// Phase Machine class and factory exports
export {
  CosmicThemePhaseMachine,
  createPhaseMachine,
} from "./CosmicThemePhaseMachine";

// Radar geometry exports
export type {
  CosmicAxis,
  CosmicRadarGeometry,
  CosmicStarAnchor,
} from "./CosmicThemeRadar";
export {
  getDefaultRadarGeometry,
  getAxisById,
  getStarAnchors,
  getRadarPoint,
  COSMIC_AXES,
} from "./CosmicThemeRadar";

// Star system exports
export type { CosmicStarPoint, CosmicStarDriftPreset } from "./CosmicThemeStars";
export {
  createBaseStarPoints,
  applyStarDriftPreset,
  getStarFinalPosition,
  getStarByAxisId,
  STAR_DRIFT_PRESETS,
} from "./CosmicThemeStars";

// Halo engine exports
export type { CosmicHaloConfig } from "./CosmicThemeHalo";
export {
  DEFAULT_HALO_CONFIG,
  getHaloRadius,
  getHaloIntensity,
  calculateHaloIntensityAtDistance,
} from "./CosmicThemeHalo";

// Message model exports
export type { CosmicMessage, CosmicMessageEffects } from "./CosmicThemeMessages";
export {
  getCosmicMessage,
  getAllCosmicMessages,
  messageHasEffect,
  getMessageEffects,
} from "./CosmicThemeMessages";

// Phase config exports
export type { CosmicPhaseId, CosmicPhaseDescriptor } from "./config/cosmicThemePhases";
export { getCosmicPhase, COSMIC_PHASES } from "./config/cosmicThemePhases";

// Defaults exports
export {
  COSMIC_RADIUS,
  COSMIC_HALO_RADIUS,
  COSMIC_CENTER_X,
  COSMIC_CENTER_Y,
} from "./config/cosmicThemeDefaults";

