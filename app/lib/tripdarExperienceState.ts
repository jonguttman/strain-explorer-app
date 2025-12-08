/**
 * tripdarExperienceState.ts
 * 
 * Unified experience state shared between Classic and Cosmic themes.
 * This provides the single source of truth for radar data regardless of visual treatment.
 * 
 * Phase 8A: Initial implementation
 */

import type { TraitAxisId, DoseKey, StrainExperienceMeta } from "@/lib/types";

/**
 * Normalized trait values for radar display (0-1 range)
 */
export interface NormalizedTraits {
  values: Record<TraitAxisId, number>;
}

/**
 * Effect word categories used to derive motion profiles
 */
export type EffectWordCategory = 
  | "energetic"    // Create, Explore, Dance
  | "introspective" // Reflect, Transform, Heal
  | "social"       // Connect, Share, Bond
  | "spiritual"    // Transcend, Dissolve, Journey
  | "balanced";    // Default/unknown

/**
 * Dose intensity bucket for motion scaling
 */
export type DoseIntensityBucket = "micro" | "low" | "medium" | "high" | "heroic";

/**
 * Maps dose keys to intensity buckets for motion profile scaling
 */
export function getDoseIntensityBucket(doseKey: DoseKey): DoseIntensityBucket {
  switch (doseKey) {
    case "micro":
      return "micro";
    case "mini":
      return "low";
    case "macro":
      return "medium";
    case "museum":
      return "high";
    case "mega":
    case "hero":
      return "heroic";
    default:
      return "medium";
  }
}

/**
 * Maps effect words to categories for timeline motion profiles
 */
export function getEffectWordCategory(effectWord?: string): EffectWordCategory {
  if (!effectWord) return "balanced";
  
  const word = effectWord.toLowerCase();
  
  // Energetic words
  if (["create", "explore", "dance", "play", "energize", "activate"].includes(word)) {
    return "energetic";
  }
  
  // Introspective words
  if (["reflect", "transform", "heal", "contemplate", "meditate", "introspect"].includes(word)) {
    return "introspective";
  }
  
  // Social words
  if (["connect", "share", "bond", "commune", "socialize", "engage"].includes(word)) {
    return "social";
  }
  
  // Spiritual words
  if (["transcend", "dissolve", "journey", "ascend", "awaken", "enlighten"].includes(word)) {
    return "spiritual";
  }
  
  return "balanced";
}

/**
 * Generates a deterministic hash from a string (e.g., strainId)
 * Used for strain-specific animation signatures
 */
export function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates a deterministic float 0-1 from a hash and seed
 */
export function hashToFloat(hash: number, seed: number = 0): number {
  const combined = hash + seed * 7919; // Prime multiplier for variation
  return ((combined * 9301 + 49297) % 233280) / 233280;
}

/**
 * Core unified state that both Classic and Cosmic themes consume
 */
export interface UnifiedExperienceState {
  // Identity
  strainId: string;
  strainName: string;
  doseKey: DoseKey;
  
  // Visual identity
  accentHex: string;
  
  // Normalized radar values (0-1)
  normalizedTraits: NormalizedTraits;
  
  // Raw radar values (0-100)
  rawTraits: Record<TraitAxisId, number>;
  
  // Axis configuration
  axes: TraitAxisId[];
  
  // Experience metadata
  effectWord?: string;
  effectCategory: EffectWordCategory;
  doseIntensity: DoseIntensityBucket;
  experienceMeta?: StrainExperienceMeta | null;
  
  // Deterministic seed for strain-specific variations
  strainSeed: number;
}

/**
 * Creates a unified experience state from raw dose data
 */
export function createUnifiedState(params: {
  strainId: string;
  strainName: string;
  doseKey: DoseKey;
  accentHex: string;
  rawTraits: Record<TraitAxisId, number>;
  axes: TraitAxisId[];
  experienceMeta?: StrainExperienceMeta | null;
}): UnifiedExperienceState {
  const { strainId, strainName, doseKey, accentHex, rawTraits, axes, experienceMeta } = params;
  
  // Normalize traits to 0-1 range (assuming raw values are 0-100)
  const normalizedValues: Record<TraitAxisId, number> = {} as Record<TraitAxisId, number>;
  for (const axis of axes) {
    normalizedValues[axis] = Math.min(1, Math.max(0, (rawTraits[axis] ?? 0) / 100));
  }
  
  return {
    strainId,
    strainName,
    doseKey,
    accentHex,
    normalizedTraits: { values: normalizedValues },
    rawTraits,
    axes,
    effectWord: experienceMeta?.effectWord,
    effectCategory: getEffectWordCategory(experienceMeta?.effectWord),
    doseIntensity: getDoseIntensityBucket(doseKey),
    experienceMeta,
    strainSeed: deterministicHash(strainId),
  };
}

/**
 * Computes radar vertex positions from normalized traits
 * Shared geometry calculation for both Classic and Cosmic renderers
 */
export function computeRadarVertices(
  normalizedTraits: NormalizedTraits,
  axes: TraitAxisId[],
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number = 0
): { x: number; y: number; axis: TraitAxisId; value: number }[] {
  const axisCount = axes.length;
  const angleStep = (2 * Math.PI) / axisCount;
  const startAngle = -Math.PI / 2; // Start at top
  
  return axes.map((axis, index) => {
    const value = normalizedTraits.values[axis] ?? 0;
    const angle = startAngle + index * angleStep;
    const radius = innerRadius + (outerRadius - innerRadius) * value;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      axis,
      value,
    };
  });
}

/**
 * Applies low-value shaping to prevent radar from collapsing at center
 * Matches the classic radar's shapeAxisValueConfigurable behavior
 */
export function shapeAxisValue(
  rawValue: number,
  minDisplay: number = 0.15,
  maxRaw: number = 100
): number {
  const normalized = rawValue / maxRaw;
  // Apply minimum floor and smooth curve
  return minDisplay + (1 - minDisplay) * normalized;
}
