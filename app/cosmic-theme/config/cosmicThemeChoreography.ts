/**
 * COSMIC THEME REBUILD — PHASE 4F
 * --------------------------------
 * Phase-to-phase choreography configuration.
 * Defines how the system transitions smoothly between two phases.
 * 
 * Guardrail compliance: Pure data, no timers or animation logic.
 */

import type { CosmicPhaseId } from "./cosmicThemePhases";

/**
 * Choreography descriptor for phase transitions.
 * Defines timing, easing, and animation parameters for smooth phase-to-phase transitions.
 */
export interface CosmicChoreographyDescriptor {
  /**
   * Halo rotation delta in degrees.
   * How much the halo should rotate during this transition.
   */
  haloRotation: number;
  
  /**
   * Star drift multiplier (0-1).
   * Multiplies existing star drift values during transition.
   */
  starDrift: number;
  
  /**
   * Label fade timing in milliseconds.
   * Duration for label opacity transitions.
   */
  labelFade: number;
  
  /**
   * Polygon ease profile.
   * Easing function name for polygon interpolation.
   */
  polygonEase: "easeOutCubic" | "easeInSine" | "easeInOutQuad" | "easeOutQuad";
  
  /**
   * Message delay in milliseconds.
   * Delay before message entry animation starts.
   */
  messageDelay: number;
}

/**
 * Choreography map for phase transitions.
 * Maps phase pair keys (e.g., "prologue1->prologue2") to choreography descriptors.
 */
export type CosmicChoreographyKey = `${CosmicPhaseId}->${CosmicPhaseId}`;

/**
 * Default choreography descriptor.
 * Used as fallback when no specific transition is defined.
 */
export const DEFAULT_CHOREOGRAPHY: CosmicChoreographyDescriptor = {
  haloRotation: 0,
  starDrift: 0.5,
  labelFade: 250,
  polygonEase: "easeOutCubic",
  messageDelay: 100,
};

/**
 * Choreography configuration map.
 * Defines specific transition behaviors for phase pairs.
 * Uses Partial to allow only specific transitions to be defined.
 */
export const COSMIC_CHOREOGRAPHY: Partial<Record<
  CosmicChoreographyKey | "default",
  CosmicChoreographyDescriptor
>> & { default: CosmicChoreographyDescriptor } = {
  // Default fallback
  default: DEFAULT_CHOREOGRAPHY,

  // Prologue transitions
  "prologue1->prologue2": {
    haloRotation: 8,
    starDrift: 0.4,
    labelFade: 180,
    polygonEase: "easeOutCubic",
    messageDelay: 120,
  },
  "prologue2->prologue3": {
    haloRotation: -12,
    starDrift: 0.6,
    labelFade: 220,
    polygonEase: "easeInOutQuad",
    messageDelay: 80,
  },
  "prologue3->prologue4": {
    haloRotation: -4,
    starDrift: 0.5,
    labelFade: 200,
    polygonEase: "easeOutCubic",
    messageDelay: 150,
  },

  // Prologue to main phases
  "prologue4->strain": {
    haloRotation: 0,
    starDrift: 0.3,
    labelFade: 250,
    polygonEase: "easeOutQuad",
    messageDelay: 100,
  },

  // Main phase transitions
  "strain->dose": {
    haloRotation: 0,
    starDrift: 0.5,
    labelFade: 250,
    polygonEase: "easeOutCubic",
    messageDelay: 100,
  },
  "dose->intelligence": {
    haloRotation: 0,
    starDrift: 0.6,
    labelFade: 280,
    polygonEase: "easeInSine",
    messageDelay: 120,
  },
  "intelligence->closing": {
    haloRotation: 0,
    starDrift: 0.4,
    labelFade: 300,
    polygonEase: "easeOutQuad",
    messageDelay: 150,
  },

  // Reverse transitions (for reversibility)
  "prologue2->prologue1": {
    haloRotation: -8,
    starDrift: 0.4,
    labelFade: 180,
    polygonEase: "easeOutCubic",
    messageDelay: 120,
  },
  "prologue3->prologue2": {
    haloRotation: 12,
    starDrift: 0.6,
    labelFade: 220,
    polygonEase: "easeInOutQuad",
    messageDelay: 80,
  },
  "prologue4->prologue3": {
    haloRotation: 4,
    starDrift: 0.5,
    labelFade: 200,
    polygonEase: "easeOutCubic",
    messageDelay: 150,
  },
  "strain->prologue4": {
    haloRotation: 0,
    starDrift: 0.3,
    labelFade: 250,
    polygonEase: "easeOutQuad",
    messageDelay: 100,
  },
  "dose->strain": {
    haloRotation: 0,
    starDrift: 0.5,
    labelFade: 250,
    polygonEase: "easeOutCubic",
    messageDelay: 100,
  },
  "intelligence->dose": {
    haloRotation: 0,
    starDrift: 0.6,
    labelFade: 280,
    polygonEase: "easeInSine",
    messageDelay: 120,
  },
  "closing->intelligence": {
    haloRotation: 0,
    starDrift: 0.4,
    labelFade: 300,
    polygonEase: "easeOutQuad",
    messageDelay: 150,
  },
};

/**
 * Get choreography descriptor for a phase transition.
 * @param fromPhase - The source phase ID
 * @param toPhase - The target phase ID
 * @returns The choreography descriptor for this transition
 */
export function getChoreographyDescriptor(
  fromPhase: CosmicPhaseId,
  toPhase: CosmicPhaseId
): CosmicChoreographyDescriptor {
  // If same phase, return default (no transition needed)
  if (fromPhase === toPhase) {
    return DEFAULT_CHOREOGRAPHY;
  }

  const key: CosmicChoreographyKey = `${fromPhase}->${toPhase}`;
  return COSMIC_CHOREOGRAPHY[key] || COSMIC_CHOREOGRAPHY.default;
}

