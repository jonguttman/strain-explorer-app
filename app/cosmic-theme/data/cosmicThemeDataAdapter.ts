/**
 * COSMIC THEME ENGINE — TRIPDAR DATA INTEGRATION (PHASE 5A)
 * ----------------------------------------------------------
 * Guardrail: Do NOT import legacy cosmic-fire-ring code.
 * Guardrail: Do NOT alter geometry math.
 * Guardrail: All animations remain declarative and reversible.
 * Guardrail: All changes logged in docs/cursor-change-history.md.
 * 
 * Data adapter for connecting Cosmic Theme to real Tripdar strain/dose data.
 * Pure data extraction - no UI, no demo logic.
 */

import { getStrainDoseData } from "@/data/strainData";
import { shapeAxisValue } from "@/lib/tripdarRadar";
import type { DoseKey, TraitAxisId } from "@/lib/types";

/**
 * Cosmic Theme axis order.
 * Must match the order in CosmicThemeRadar.tsx COSMIC_AXES array.
 */
export type CosmicAxisId = "visuals" | "creativity" | "social" | "euphoria" | "introspection" | "spiritual";

/**
 * Map Tripdar TraitAxisId to Cosmic Theme axis ID.
 * This mapping ensures we correctly translate Tripdar data to Cosmic Theme axes.
 * Note: Tripdar uses "spiritual_depth" but Cosmic Theme uses "spiritual".
 * Note: Tripdar uses "sociability" but Cosmic Theme uses "social".
 */
const TRIPDAR_TO_COSMIC_AXIS_MAP: Partial<Record<TraitAxisId, CosmicAxisId>> = {
  visuals: "visuals",
  creativity: "creativity",
  sociability: "social",
  euphoria: "euphoria",
  introspection: "introspection",
  spiritual_depth: "spiritual",
};

/**
 * Cosmic Theme axis order (must match COSMIC_AXES in CosmicThemeRadar.tsx).
 */
const COSMIC_AXIS_ORDER: CosmicAxisId[] = [
  "visuals",
  "creativity",
  "social",
  "euphoria",
  "introspection",
  "spiritual",
];

/**
 * Get normalized radar values for Cosmic Theme.
 * Returns 6 values in Cosmic Theme axis order, normalized using Tripdar's shapeAxisValue function.
 * 
 * @param strainSlug - The strain slug (e.g., "golden-teacher")
 * @param doseKey - The dose key (e.g., "macro")
 * @returns Array of 6 normalized values [visuals, creativity, social, euphoria, introspection, spiritual]
 */
export function getCosmicRadarValues(
  strainSlug: string,
  doseKey: DoseKey
): number[] {
  const strainData = getStrainDoseData(strainSlug, doseKey);
  
  if (!strainData) {
    // Return default values if strain not found
    return [0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
  }
  
  const rawValues = strainData.doseData.traits.values;
  
  
  // Map Tripdar values to Cosmic Theme axis order, applying normalization
  const result = COSMIC_AXIS_ORDER.map((cosmicAxisId) => {
    // Find the corresponding Tripdar axis ID
    const tripdarAxisId = Object.keys(TRIPDAR_TO_COSMIC_AXIS_MAP).find(
      (key) => TRIPDAR_TO_COSMIC_AXIS_MAP[key as TraitAxisId] === cosmicAxisId
    ) as TraitAxisId | undefined;
    
    if (!tripdarAxisId) {
      return 0.5; // Default if axis not found
    }
    
    // Get raw value from Tripdar data (0-100 range) and normalize to 0-1
    const rawValue = rawValues[tripdarAxisId] ?? 0;
    const normalizedValue = rawValue / 100; // Convert from 0-100 to 0-1 range
    const shapedValue = shapeAxisValue(normalizedValue);
    
    
    // Apply Tripdar's normalization function
    return shapedValue;
  });
  
  
  return result;
}

/**
 * Get halo color for a strain.
 * Uses the strain's base color from strainData.
 * 
 * @param strainSlug - The strain slug (e.g., "golden-teacher")
 * @returns Hex color string (e.g., "#f3b34c")
 */
export function getCosmicHaloColor(strainSlug: string): string {
  const strainData = getStrainDoseData(strainSlug, "macro"); // Use macro as default for base color
  
  if (!strainData) {
    return "#4a371f"; // Default brown color
  }
  
  return strainData.strain.colorHex;
}

/**
 * Get star color for a strain.
 * Uses the strain's accent color (dose-specific) or falls back to base color.
 * 
 * @param strainSlug - The strain slug (e.g., "golden-teacher")
 * @param doseKey - The dose key (e.g., "macro")
 * @returns Hex color string (e.g., "#f3b34c")
 */
export function getCosmicStarColor(strainSlug: string, doseKey: DoseKey): string {
  const strainData = getStrainDoseData(strainSlug, doseKey);
  
  if (!strainData) {
    return "#4a371f"; // Default brown color
  }
  
  // Use accent color if available, otherwise use base strain color
  return strainData.accentHex || strainData.strain.colorHex;
}
