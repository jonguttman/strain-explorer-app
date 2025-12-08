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
 * Phase identifier type.
 * Defines all possible phases in the Cosmic Theme demo sequence.
 */
export type CosmicPhaseId =
  | "prologue1"
  | "prologue2"
  | "prologue3"
  | "prologue4"
  | "strain"
  | "dose"
  | "intelligence"
  | "closing";

/**
 * Phase descriptor.
 * Describes the state and behavior of a single phase in the demo.
 * Phase 4C: Extended with optional animation hints for cinematic transitions.
 */
export interface CosmicPhaseDescriptor {
  id: CosmicPhaseId;
  highlightAxis?: string; // Axis ID to highlight (e.g., "creativity", "visuals")
  highlightStrain?: string; // Strain slug to highlight (e.g., "full-moon-party")
  messageId?: string; // Message ID to display
  starPreset?: string; // Star animation preset (e.g., "creativitySpark", "clarityFocus")
  // Phase 4C: Animation hints for cinematic transitions
  haloRotationBiasDeg?: number; // +/- degrees from neutral for halo rotation
  polygonEnergyBias?: number; // 0-1 "how energetic" the morph feels
  starEmphasis?: "low" | "medium" | "high"; // Star emphasis level
}

/**
 * Phase configuration map.
 * Maps phase IDs to their descriptors.
 */
export const COSMIC_PHASES: Record<CosmicPhaseId, CosmicPhaseDescriptor> = {
  prologue1: {
    id: "prologue1",
    haloRotationBiasDeg: 0,
    polygonEnergyBias: 0.3,
    starEmphasis: "low",
  },
  prologue2: {
    id: "prologue2",
    highlightStrain: "full-moon-party",
    haloRotationBiasDeg: 5,
    polygonEnergyBias: 0.5,
    starEmphasis: "medium",
  },
  prologue3: {
    id: "prologue3",
    highlightAxis: "creativity",
    messageId: "creativity",
    haloRotationBiasDeg: -8,
    polygonEnergyBias: 0.7,
    starEmphasis: "high",
  },
  prologue4: {
    id: "prologue4",
    highlightAxis: "visuals",
    haloRotationBiasDeg: -12,
    polygonEnergyBias: 0.6,
    starEmphasis: "medium",
  },
  strain: {
    id: "strain",
    haloRotationBiasDeg: 0,
    polygonEnergyBias: 0.4,
    starEmphasis: "medium",
  },
  dose: {
    id: "dose",
    haloRotationBiasDeg: 0,
    polygonEnergyBias: 0.5,
    starEmphasis: "medium",
  },
  intelligence: {
    id: "intelligence",
    haloRotationBiasDeg: 0,
    polygonEnergyBias: 0.6,
    starEmphasis: "high",
  },
  closing: {
    id: "closing",
    haloRotationBiasDeg: 0,
    polygonEnergyBias: 0.3,
    starEmphasis: "low",
  },
};

/**
 * Get a phase descriptor by ID.
 * @param phaseId - The phase identifier
 * @returns The phase descriptor, or undefined if not found
 */
export function getCosmicPhase(
  phaseId: CosmicPhaseId
): CosmicPhaseDescriptor | undefined {
  return COSMIC_PHASES[phaseId];
}

