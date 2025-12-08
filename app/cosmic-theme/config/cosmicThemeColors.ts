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
 * Color configuration for the Cosmic Theme system.
 * Phase 4B: Extended with highlight and message effect colors.
 */
export interface CosmicThemeColorConfig {
  // Axis colors (one per axis)
  axisColors: Record<string, string>;
  // Halo gradient colors
  haloColors: {
    inner: string;
    outer: string;
  };
  // Star colors
  starColors: {
    base: string;
    highlight: string;
  };
  // Background colors
  backgroundColors: {
    base: string;
    overlay: string;
  };
  // Phase 4B: Highlight and message effect colors
  highlightColors: {
    starHighlight: string;
    creativityGlow: string;
    clarityGlow: string;
    depthShade: string;
    connectGlow: string;
  };
}

/**
 * Color configuration for Phase 4B with highlight modes.
 * Golden/parchment theme with warm tones and message effect colors.
 */
export const cosmicThemeColors: CosmicThemeColorConfig = {
  axisColors: {
    visuals: "#f3b34c",
    creativity: "#e8a87c",
    social: "#d4a574",
    euphoria: "#c99d5c",
    introspection: "#b89050",
    spiritual: "#a88244",
  },
  haloColors: {
    inner: "rgba(255, 220, 180, 0.4)",
    outer: "rgba(255, 200, 150, 0.2)",
  },
  starColors: {
    base: "rgba(255, 255, 255, 0.6)",
    highlight: "rgba(255, 220, 180, 0.9)",
  },
  backgroundColors: {
    base: "#1a1612",
    overlay: "rgba(0, 0, 0, 0.3)",
  },
  highlightColors: {
    starHighlight: "rgba(255, 240, 200, 1.0)",
    creativityGlow: "rgba(255, 200, 150, 0.06)",
    clarityGlow: "rgba(255, 255, 255, 0.08)",
    depthShade: "rgba(0, 0, 0, 0.10)",
    connectGlow: "rgba(255, 220, 180, 0.05)",
  },
};

