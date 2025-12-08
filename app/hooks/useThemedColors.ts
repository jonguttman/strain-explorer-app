/**
 * useThemedColors.ts
 * 
 * Phase 8E: Theme-aware color utilities
 * 
 * Provides color transformation and theming utilities for both
 * Classic and Cosmic radar implementations.
 */

"use client";

import { useMemo } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface ThemedColorPalette {
  /** Primary accent color (strain color) */
  accent: string;
  
  /** Softer accent variant for fills */
  accentSoft: string;
  
  /** Very soft accent for backgrounds */
  accentBg: string;
  
  /** Accent with medium transparency */
  accentMedium: string;
  
  /** Grid line color */
  gridColor: string;
  
  /** Axis line color */
  axisColor: string;
  
  /** Label text color */
  labelColor: string;
  
  /** Glow color for effects */
  glowColor: string;
}

export interface ClassicPlusEnhancements {
  /** Polygon fill with enhanced opacity */
  polygonFill: string;
  
  /** Polygon stroke with refined styling */
  polygonStroke: string;
  
  /** Glow filter CSS value */
  glowFilter: string;
  
  /** Breathing animation keyframes */
  breathingKeyframes: string;
  
  /** Should show enhanced glow effects */
  showGlow: boolean;
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Converts a hex color to RGBA
 */
export function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex?.replace("#", "") || "4a371f";
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Extracts RGB values from hex
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const sanitized = hex?.replace("#", "") || "4a371f";
  const bigint = parseInt(sanitized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Adjusts color brightness
 * @param hex Hex color
 * @param factor Factor > 1 brightens, < 1 darkens
 */
export function adjustBrightness(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (c: number) => Math.min(255, Math.max(0, Math.round(c * factor)));
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
}

/**
 * Blends two colors
 * @param color1 First hex color
 * @param color2 Second hex color
 * @param ratio Blend ratio (0 = color1, 1 = color2)
 */
export function blendColors(color1: string, color2: string, ratio: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const blend = (c1: number, c2: number) => Math.round(c1 + (c2 - c1) * ratio);
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  
  const r = blend(rgb1.r, rgb2.r);
  const g = blend(rgb1.g, rgb2.g);
  const b = blend(rgb1.b, rgb2.b);
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Generates a themed color palette from an accent color
 */
export function useThemedColors(accentHex: string): ThemedColorPalette {
  return useMemo(() => ({
    accent: accentHex,
    accentSoft: hexToRgba(accentHex, 0.16),
    accentBg: hexToRgba(accentHex, 0.08),
    accentMedium: hexToRgba(accentHex, 0.4),
    gridColor: "rgba(229, 212, 191, 0.6)", // Warm grid
    axisColor: "rgba(138, 108, 74, 0.8)",  // Brown axes
    labelColor: "rgba(63, 48, 31, 0.9)",   // Dark brown labels
    glowColor: hexToRgba(accentHex, 0.5),
  }), [accentHex]);
}

/**
 * Generates Classic+ enhancements for radar styling
 */
export function useClassicPlusEnhancements(
  accentHex: string,
  doseKey: string,
  isHero: boolean = false
): ClassicPlusEnhancements {
  return useMemo(() => {
    // Determine if enhanced glow should show
    const showGlow = isHero || doseKey === "hero" || doseKey === "mega";
    
    // Calculate fill opacity based on dose
    const fillOpacity = doseKey === "micro" ? 0.25 : 
                        doseKey === "mini" ? 0.30 :
                        doseKey === "macro" ? 0.40 :
                        doseKey === "museum" ? 0.50 :
                        doseKey === "mega" ? 0.60 : 0.70;
    
    // Calculate stroke opacity
    const strokeOpacity = Math.min(0.95, fillOpacity + 0.35);
    
    return {
      polygonFill: hexToRgba(accentHex, fillOpacity),
      polygonStroke: hexToRgba(accentHex, strokeOpacity),
      glowFilter: showGlow 
        ? `drop-shadow(0 0 8px ${hexToRgba(accentHex, 0.4)}) drop-shadow(0 0 16px ${hexToRgba(accentHex, 0.2)})`
        : "none",
      breathingKeyframes: `
        @keyframes radarBreathing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.95; }
        }
      `,
      showGlow,
    };
  }, [accentHex, doseKey, isHero]);
}

/**
 * Generates CSS variables for themed styling
 */
export function useThemedCssVariables(accentHex: string): React.CSSProperties {
  const colors = useThemedColors(accentHex);
  
  return useMemo(() => ({
    "--dose-accent": colors.accent,
    "--dose-accent-soft": colors.accentSoft,
    "--dose-accent-bg": colors.accentBg,
    "--dose-accent-medium": colors.accentMedium,
    "--dose-glow": colors.glowColor,
  } as React.CSSProperties), [colors]);
}

export default useThemedColors;
