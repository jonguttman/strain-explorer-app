/**
 * cosmicThemeVisualPresets.ts
 * 
 * Phase 8A/8B: Visual preset configurations for Cosmic theme variants
 * 
 * Presets control visual styling (colors, gradients, blur) but NOT geometry or motion.
 * Each preset can be applied to any Cosmic component.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Visual preset IDs
 */
export type CosmicPresetId = "cosmic" | "apothecary" | "minimal";

/**
 * Disc (background circle) styling
 */
export interface DiscStyle {
  fill: string;           // CSS fill value (can include gradients)
  opacity: number;        // 0-1
  stroke?: string;        // Optional border
  strokeWidth?: number;
}

/**
 * Halo glow styling
 */
export interface HaloStyle {
  innerColor: string;     // Center color (typically with alpha)
  outerColor: string;     // Edge color (typically transparent)
  blur: number;           // Blur radius in px
  opacity: number;        // Layer opacity
}

/**
 * Radar axis line styling
 */
export interface AxisStyle {
  color: string;
  width: number;
  dashArray?: string;     // SVG dash pattern
}

/**
 * Radar polygon styling
 */
export interface PolygonStyle {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
}

/**
 * Star anchor styling
 */
export interface StarStyle {
  color: string;
  glowColor: string;
  size: number;           // Base size in px
  glowBlur: number;       // Glow blur radius
}

/**
 * Axis label styling
 */
export interface LabelStyle {
  color: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  letterSpacing?: string;
}

/**
 * Message text styling
 */
export interface MessageStyle {
  color: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  glowColor?: string;
}

/**
 * Complete visual preset configuration
 */
export interface CosmicVisualPreset {
  id: CosmicPresetId;
  name: string;
  description?: string;
  
  // Component styles
  discStyle: DiscStyle;
  haloStyle: HaloStyle;
  axisStyle: AxisStyle;
  polygonStyle: PolygonStyle;
  starStyle: StarStyle;
  labelStyle: LabelStyle;
  messageStyle: MessageStyle;
  
  // Global modifiers
  backgroundGradient?: string;  // Overall container background
  accentColorOverride?: string; // Override strain accent color
}

// ============================================================================
// PRESET: COSMIC (Default)
// ============================================================================

export const COSMIC_PRESET: CosmicVisualPreset = {
  id: "cosmic",
  name: "Cosmic",
  description: "Deep space aesthetic with nebula gradients and starfield",
  
  discStyle: {
    fill: "radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 60%, #050510 100%)",
    opacity: 0.95,
    stroke: "rgba(100, 100, 180, 0.15)",
    strokeWidth: 1,
  },
  
  haloStyle: {
    innerColor: "rgba(138, 100, 200, 0.35)",
    outerColor: "rgba(80, 60, 140, 0)",
    blur: 20,
    opacity: 0.8,
  },
  
  axisStyle: {
    color: "rgba(150, 150, 200, 0.25)",
    width: 1,
    dashArray: "4 4",
  },
  
  polygonStyle: {
    fill: "rgba(138, 100, 200, 0.3)",
    fillOpacity: 0.4,
    stroke: "rgba(180, 150, 255, 0.8)",
    strokeWidth: 2,
    strokeOpacity: 0.9,
  },
  
  starStyle: {
    color: "#ffffff",
    glowColor: "rgba(200, 180, 255, 0.6)",
    size: 6,
    glowBlur: 8,
  },
  
  labelStyle: {
    color: "rgba(200, 200, 230, 0.9)",
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "'Inter', -apple-system, sans-serif",
    letterSpacing: "0.02em",
  },
  
  messageStyle: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 18,
    fontWeight: 600,
    fontFamily: "'Inter', -apple-system, sans-serif",
    glowColor: "rgba(138, 100, 200, 0.5)",
  },
  
  backgroundGradient: "linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #0a0a15 100%)",
};

// ============================================================================
// PRESET: APOTHECARY
// ============================================================================

/**
 * Apothecary Preset - Phase 8B Enhanced
 * 
 * Design notes:
 * - Warm sepia/parchment tones reminiscent of old botanical illustrations
 * - "Candle glow" effect with amber halo gradients
 * - Softer, more organic feel compared to Cosmic
 * - Serif typography for classic apothecary aesthetic
 */
export const APOTHECARY_PRESET: CosmicVisualPreset = {
  id: "apothecary",
  name: "Apothecary",
  description: "Warm parchment tones with candle-glow ambiance",
  
  discStyle: {
    // Layered parchment texture effect
    fill: "radial-gradient(ellipse at 30% 30%, #fff9f0 0%, #faf6ef 20%, #f6eddc 50%, #e8dcc8 80%, #d8c8b0 100%)",
    opacity: 0.97,
    stroke: "rgba(139, 120, 100, 0.15)",
    strokeWidth: 1,
  },
  
  haloStyle: {
    // Warm candle glow - amber/golden tones
    innerColor: "rgba(220, 180, 120, 0.4)",
    outerColor: "rgba(200, 160, 100, 0)",
    blur: 28,
    opacity: 0.65,
  },
  
  axisStyle: {
    // Subtle brown axis lines like aged ink
    color: "rgba(120, 100, 80, 0.3)",
    width: 1,
  },
  
  polygonStyle: {
    // Warm botanical illustration colors
    fill: "rgba(180, 140, 80, 0.2)",
    fillOpacity: 0.32,
    stroke: "rgba(120, 90, 50, 0.7)",
    strokeWidth: 2.5,
    strokeOpacity: 0.8,
  },
  
  starStyle: {
    // Subtle amber glow points
    color: "#c4a060",
    glowColor: "rgba(220, 180, 100, 0.45)",
    size: 5,
    glowBlur: 8,
  },
  
  labelStyle: {
    // Classic apothecary typography
    color: "rgba(63, 48, 31, 0.85)",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Libre Baskerville', Georgia, serif",
    letterSpacing: "0.02em",
  },
  
  messageStyle: {
    // Elegant, readable effect word
    color: "rgba(63, 48, 31, 0.92)",
    fontSize: 20,
    fontWeight: 600,
    fontFamily: "'Libre Baskerville', Georgia, serif",
    glowColor: "rgba(200, 160, 80, 0.25)",
  },
  
  // Warm parchment background with subtle vignette
  backgroundGradient: "radial-gradient(ellipse at center, #faf6ef 0%, #f4e8d8 70%, #e8dcc8 100%)",
};

// ============================================================================
// PRESET: MINIMAL
// ============================================================================

export const MINIMAL_PRESET: CosmicVisualPreset = {
  id: "minimal",
  name: "Minimal",
  description: "Clean, modern aesthetic with subtle animations",
  
  discStyle: {
    fill: "#ffffff",
    opacity: 1,
    stroke: "rgba(0, 0, 0, 0.08)",
    strokeWidth: 1,
  },
  
  haloStyle: {
    innerColor: "rgba(100, 100, 100, 0.1)",
    outerColor: "rgba(100, 100, 100, 0)",
    blur: 16,
    opacity: 0.5,
  },
  
  axisStyle: {
    color: "rgba(0, 0, 0, 0.1)",
    width: 1,
  },
  
  polygonStyle: {
    fill: "rgba(0, 0, 0, 0.05)",
    fillOpacity: 0.3,
    stroke: "rgba(0, 0, 0, 0.6)",
    strokeWidth: 1.5,
    strokeOpacity: 0.8,
  },
  
  starStyle: {
    color: "#333333",
    glowColor: "rgba(0, 0, 0, 0.1)",
    size: 4,
    glowBlur: 4,
  },
  
  labelStyle: {
    color: "rgba(0, 0, 0, 0.7)",
    fontSize: 11,
    fontWeight: 500,
    fontFamily: "'Inter', -apple-system, sans-serif",
    letterSpacing: "0.03em",
  },
  
  messageStyle: {
    color: "rgba(0, 0, 0, 0.9)",
    fontSize: 16,
    fontWeight: 500,
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  
  backgroundGradient: "#ffffff",
};

// ============================================================================
// PRESET MAP
// ============================================================================

export const COSMIC_PRESETS: Record<CosmicPresetId, CosmicVisualPreset> = {
  cosmic: COSMIC_PRESET,
  apothecary: APOTHECARY_PRESET,
  minimal: MINIMAL_PRESET,
};

/**
 * Gets a visual preset by ID, falling back to cosmic if not found
 */
export function getCosmicPreset(id: CosmicPresetId): CosmicVisualPreset {
  return COSMIC_PRESETS[id] ?? COSMIC_PRESET;
}

/**
 * Applies accent color override to a preset's polygon style
 * Used when strain-specific colors should override preset defaults
 */
export function applyAccentColor(
  preset: CosmicVisualPreset,
  accentHex: string
): CosmicVisualPreset {
  // Convert hex to rgba helper
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  return {
    ...preset,
    polygonStyle: {
      ...preset.polygonStyle,
      fill: hexToRgba(accentHex, 0.25),
      stroke: hexToRgba(accentHex, 0.8),
    },
    starStyle: {
      ...preset.starStyle,
      glowColor: hexToRgba(accentHex, 0.4),
    },
    haloStyle: {
      ...preset.haloStyle,
      innerColor: hexToRgba(accentHex, 0.25),
    },
  };
}
