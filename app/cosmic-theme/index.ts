/**
 * @fileoverview Cosmic Theme Module - Phase 8 Megaphase Implementation
 * 
 * This module provides a complete animated radar visualization system with:
 * - Deterministic timeline engine with multi-band halo and dual star layers
 * - Visual presets (cosmic, apothecary, minimal)
 * - Choreography profiles for motion tuning
 * - React components for each visual layer
 * 
 * @example Basic Usage
 * ```tsx
 * import { CosmicThemeDemo } from '@/app/cosmic-theme';
 * 
 * <CosmicThemeDemo
 *   strainId="golden-teacher"
 *   strainName="Golden Teacher"
 *   doseKey="macro"
 *   accentHex="#f3b34c"
 *   rawTraits={traits}
 *   axes={axes}
 *   presetId="cosmic"
 * />
 * ```
 * 
 * @example Using the Timeline Player Hook
 * ```tsx
 * import { useCosmicTimelinePlayer } from '@/app/cosmic-theme';
 * 
 * const [{ frame }, controls] = useCosmicTimelinePlayer(config);
 * ```
 * 
 * @see {@link docs/cursor-change-history.md} for implementation details
 */

// Timeline Engine
export {
  buildCosmicTimelineFrame,
  interpolateFrames,
  getDefaultTimelineConfig,
  LOOP_DURATION_SECONDS,
  TARGET_FPS,
  FRAME_INTERVAL_MS,
} from "./choreography/timelineEngine";

export type {
  CosmicTimelineFrame,
  TimelineConfig,
  HaloFrame,
  HaloBandFrame,
  StarsFrame,
  StarLayerFrame,
  RadarFrame,
  MessageFrame,
} from "./choreography/timelineEngine";

// Timeline Player Hook
export {
  useCosmicTimelinePlayer,
  useReducedMotion,
  useCosmicFrame,
} from "./hooks/useCosmicTimelinePlayer";

export type {
  TimelinePlayerOptions,
  TimelinePlayerState,
  TimelinePlayerControls,
  FrameStats,
} from "./hooks/useCosmicTimelinePlayer";

// Performance Tracer (Phase 8D)
export {
  useCosmicPerfTracer,
  CosmicDebugHud,
} from "./hooks/useCosmicPerfTracer";

export type {
  PerfMetrics,
  PerfTracerOptions,
} from "./hooks/useCosmicPerfTracer";

// Note: useCosmicPerfTracer is in a .tsx file for JSX support

// Visual Presets
export {
  COSMIC_PRESET,
  APOTHECARY_PRESET,
  MINIMAL_PRESET,
  COSMIC_PRESETS,
  getCosmicPreset,
  applyAccentColor,
} from "./config/cosmicThemeVisualPresets";

export type {
  CosmicPresetId,
  CosmicVisualPreset,
  DiscStyle,
  HaloStyle,
  AxisStyle,
  PolygonStyle,
  StarStyle,
  LabelStyle,
  MessageStyle,
} from "./config/cosmicThemeVisualPresets";

// Choreography Profiles
export {
  COSMIC_CHOREOGRAPHY,
  APOTHECARY_CHOREOGRAPHY,
  MINIMAL_CHOREOGRAPHY,
  CHOREOGRAPHY_PROFILES,
  getChoreographyProfile,
  applyChoreographyAmplitudes,
  getTransitionDuration,
  getTransitionEasing,
} from "./config/cosmicThemeChoreography";

export type {
  ChoreographyProfile,
  TransitionConfig,
  MotionAmplitudes,
} from "./config/cosmicThemeChoreography";

// React Components
export { CosmicThemeHalo, CosmicThemeHaloStatic } from "./CosmicThemeHalo";
export { CosmicThemeStars, CosmicThemeStarsStatic } from "./CosmicThemeStars";
export { CosmicThemeRadar, CosmicThemeRadarStatic } from "./CosmicThemeRadar";
export { CosmicThemeMessages, CosmicThemeMessagesStatic } from "./CosmicThemeMessages";
export { CosmicThemeDemo } from "./CosmicThemeDemo";

// Theme Context
export {
  CosmicThemeProvider,
  useCosmicTheme,
  useCosmicEnabled,
  useThemeBlend,
} from "./CosmicThemeContext";

export type {
  ThemeMode,
  CosmicThemeContextValue,
  CosmicThemeProviderProps,
} from "./CosmicThemeContext";

// Default export
export { CosmicThemeDemo as default } from "./CosmicThemeDemo";
