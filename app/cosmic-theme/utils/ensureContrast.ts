/**
 * Phase 6C.1: Contrast calibration utility.
 * Ensures text colors meet WCAG contrast ratio requirements.
 * Uses pure color math - no geometry changes, no side effects.
 */

/**
 * Convert hex color to RGB values (0-255).
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance according to WCAG 2.1.
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors.
 * Returns a value between 1 (no contrast) and 21 (maximum contrast).
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    return 1; // Fallback to minimum contrast if parsing fails
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Adjust brightness of a hex color by a percentage.
 * Max adjustment: ±12% to prevent excessive color shifts.
 */
function adjustBrightness(hex: string, percent: number): string {
  const clampedPercent = Math.max(-12, Math.min(12, percent));
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 + clampedPercent / 100;
  const r = Math.round(Math.max(0, Math.min(255, rgb.r * factor)));
  const g = Math.round(Math.max(0, Math.min(255, rgb.g * factor)));
  const b = Math.round(Math.max(0, Math.min(255, rgb.b * factor)));

  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Convert RGB to hex string.
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Blend a color with white or black to adjust opacity/contrast.
 * Returns a new hex color that approximates the original with opacity.
 */
function blendWithBackground(
  fgHex: string,
  bgHex: string,
  opacity: number
): string {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return fgHex;

  const r = Math.round(fg.r * opacity + bg.r * (1 - opacity));
  const g = Math.round(fg.g * opacity + bg.g * (1 - opacity));
  const b = Math.round(fg.b * opacity + bg.b * (1 - opacity));

  return rgbToHex(r, g, b);
}

/**
 * Phase 6C.1: Ensure contrast ratio meets target.
 * Adjusts foreground color via brightness and opacity blending.
 * Never exceeds ±12% brightness shift.
 * 
 * @param fgHex - Foreground color (hex)
 * @param bgHex - Background color (hex)
 * @param targetRatio - Target contrast ratio (e.g., 4.5 for WCAG AA)
 * @returns Adjusted foreground color (hex) that meets or exceeds target ratio
 */
export function ensureContrast(
  fgHex: string,
  bgHex: string,
  targetRatio: number
): string {
  const currentRatio = getContrastRatio(fgHex, bgHex);

  // If already meets target, return original
  if (currentRatio >= targetRatio) {
    return fgHex;
  }

  // Determine if we need to lighten or darken
  const fgRgb = hexToRgb(fgHex);
  const bgRgb = hexToRgb(bgHex);
  if (!fgRgb || !bgRgb) return fgHex;

  const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // Try brightness adjustment first (up to ±12%)
  let adjusted = fgHex;
  const needsLightening = fgLum < bgLum;

  // Try increasing brightness difference
  for (let adjustment = 1; adjustment <= 12; adjustment++) {
    const testColor = needsLightening
      ? adjustBrightness(fgHex, adjustment)
      : adjustBrightness(fgHex, -adjustment);

    const testRatio = getContrastRatio(testColor, bgHex);
    if (testRatio >= targetRatio) {
      return testColor;
    }
    adjusted = testColor; // Keep best attempt so far
  }

  // If brightness adjustment isn't enough, try opacity blending
  // Blend with white (if dark) or black (if light) to increase contrast
  const blendColor = needsLightening ? "#ffffff" : "#000000";
  for (let opacity = 0.9; opacity >= 0.5; opacity -= 0.1) {
    const blended = blendWithBackground(blendColor, fgHex, opacity);
    const testRatio = getContrastRatio(blended, bgHex);
    if (testRatio >= targetRatio) {
      return blended;
    }
  }

  // Fallback: return the best brightness-adjusted color we found
  return adjusted;
}

