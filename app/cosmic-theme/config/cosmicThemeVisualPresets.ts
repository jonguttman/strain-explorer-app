/**
 * COSMIC THEME ENGINE — VISUAL PRESET SYSTEM (PHASE 5B)
 * ------------------------------------------------------
 * Guardrail: Do NOT alter geometry math.
 * Guardrail: Do NOT touch animation logic (4A–4F).
 * Guardrail: All changes remain inside app/cosmic-theme/.
 * Guardrail: All animations remain reversible and identical to pre-Phase 5B behavior.
 * 
 * Visual preset configurations for different aesthetic themes.
 * Each preset defines styling for disc, halo, axes, rings, labels, and stars.
 */

export type CosmicThemeId = "cosmic" | "apothecary" | "minimal";

export interface CosmicDiscStyle {
  fill: string; // Solid color, gradient, or texture URL
  opacity?: number;
}

export interface CosmicHaloStyle {
  innerColor: string;
  outerColor: string;
  opacity: number;
  blur: number;
}

export interface CosmicAxisStyle {
  color: string;
  opacity: number;
  strokeWidth: number;
}

export interface CosmicRingStyle {
  color: string;
  opacity: number;
  strokeWidth: number;
}

export interface CosmicLabelStyle {
  color: string;
  fontWeight: string | number;
  letterSpacing: string;
  opacity?: number;
}

export interface CosmicStarStyle {
  baseColor: string;
  highlightColor: string;
  glowColor?: string;
  baseOpacity: number;
  highlightOpacity: number;
}

export interface CosmicVisualPreset {
  id: CosmicThemeId;
  name: string;
  discStyle: CosmicDiscStyle;
  haloStyle: CosmicHaloStyle;
  axisStyle: CosmicAxisStyle;
  ringStyle: CosmicRingStyle;
  labelStyle: CosmicLabelStyle;
  starStyle: CosmicStarStyle;
}

/**
 * Cosmic preset - current golden/parchment design.
 * Warm tones, organic feel, mystical aesthetic.
 */
export const COSMIC_PRESET: CosmicVisualPreset = {
  id: "cosmic",
  name: "Cosmic",
  discStyle: {
    fill: "radial-gradient(circle at center, #f3b34c 0%, #d4a574 70%, #b89050 100%)",
    opacity: 0.9,
  },
  haloStyle: {
    innerColor: "rgba(255, 220, 180, 0.4)",
    outerColor: "rgba(255, 200, 150, 0.2)",
    opacity: 0.525,
    blur: 20,
  },
  axisStyle: {
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 1.0,
    strokeWidth: 1.5,
  },
  ringStyle: {
    color: "rgba(255, 255, 255, 0.15)",
    opacity: 1.0,
    strokeWidth: 1,
  },
  labelStyle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: 500,
    letterSpacing: "0.04em",
    opacity: 1.0,
  },
  starStyle: {
    baseColor: "rgba(255, 255, 255, 0.6)",
    highlightColor: "rgba(255, 240, 200, 1.0)",
    glowColor: "rgba(255, 220, 180, 0.3)",
    baseOpacity: 0.85,
    highlightOpacity: 1.0,
  },
};

/**
 * Apothecary preset - vintage parchment aesthetic.
 * Sepia tones, aged paper texture, herbal medicine feel.
 */
export const APOTHECARY_PRESET: CosmicVisualPreset = {
  id: "apothecary",
  name: "Apothecary",
  discStyle: {
    fill: "url(/cosmic-theme/textures/parchment-base.jpg), radial-gradient(circle at center, #d4c4a8 0%, #c4b498 70%, #b4a488 100%)",
    opacity: 0.95,
  },
  haloStyle: {
    innerColor: "rgba(212, 196, 168, 0.35)",
    outerColor: "rgba(196, 180, 152, 0.18)",
    opacity: 0.5,
    blur: 24,
  },
  axisStyle: {
    color: "rgba(139, 120, 100, 0.4)",
    opacity: 1.0,
    strokeWidth: 1.2,
  },
  ringStyle: {
    color: "rgba(139, 120, 100, 0.25)",
    opacity: 1.0,
    strokeWidth: 0.8,
  },
  labelStyle: {
    color: "rgba(101, 84, 66, 0.9)",
    fontWeight: 600,
    letterSpacing: "0.05em",
    opacity: 1.0,
  },
  starStyle: {
    baseColor: "rgba(139, 120, 100, 0.7)",
    highlightColor: "rgba(180, 150, 120, 1.0)",
    glowColor: "rgba(212, 196, 168, 0.4)",
    baseOpacity: 0.8,
    highlightOpacity: 1.0,
  },
};

/**
 * Minimal preset - clean Apple-style UI.
 * High contrast, sharp edges, modern aesthetic.
 */
export const MINIMAL_PRESET: CosmicVisualPreset = {
  id: "minimal",
  name: "Minimal",
  discStyle: {
    fill: "radial-gradient(circle at center, #ffffff 0%, #f5f5f5 70%, #e8e8e8 100%)",
    opacity: 0.98,
  },
  haloStyle: {
    innerColor: "rgba(255, 255, 255, 0.15)",
    outerColor: "rgba(240, 240, 240, 0.08)",
    opacity: 0.4,
    blur: 16,
  },
  axisStyle: {
    color: "rgba(0, 0, 0, 0.15)",
    opacity: 1.0,
    strokeWidth: 1,
  },
  ringStyle: {
    color: "rgba(0, 0, 0, 0.1)",
    opacity: 1.0,
    strokeWidth: 0.5,
  },
  labelStyle: {
    color: "rgba(0, 0, 0, 0.8)",
    fontWeight: 400,
    letterSpacing: "0.02em",
    opacity: 1.0,
  },
  starStyle: {
    baseColor: "rgba(0, 0, 0, 0.5)",
    highlightColor: "rgba(0, 0, 0, 0.9)",
    glowColor: "rgba(0, 0, 0, 0.1)",
    baseOpacity: 0.9,
    highlightOpacity: 1.0,
  },
};

/**
 * Preset registry.
 * Maps theme IDs to their preset configurations.
 */
export const COSMIC_VISUAL_PRESETS: Record<CosmicThemeId, CosmicVisualPreset> = {
  cosmic: COSMIC_PRESET,
  apothecary: APOTHECARY_PRESET,
  minimal: MINIMAL_PRESET,
};

/**
 * Get a visual preset by ID.
 * @param themeId - The theme identifier
 * @returns The visual preset, or cosmic preset as fallback
 */
export function getCosmicVisualPreset(themeId: CosmicThemeId = "cosmic"): CosmicVisualPreset {
  return COSMIC_VISUAL_PRESETS[themeId] || COSMIC_PRESET;
}

