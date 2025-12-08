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

import {
  getCosmicPhase,
  type CosmicPhaseId,
  type CosmicPhaseDescriptor,
} from "./config/cosmicThemePhases";
import {
  getChoreographyDescriptor,
  type CosmicChoreographyDescriptor,
} from "./config/cosmicThemeChoreography";

/**
 * Phase machine state.
 * Tracks the current phase and provides methods to query phase properties.
 * Phase 2: No timers, no automatic transitions, only query functions.
 */
export class CosmicThemePhaseMachine {
  private currentPhaseId: CosmicPhaseId;

  /**
   * Create a new phase machine.
   * @param initialPhaseId - The initial phase ID (defaults to "prologue1")
   */
  constructor(initialPhaseId: CosmicPhaseId = "prologue1") {
    this.currentPhaseId = initialPhaseId;
  }

  /**
   * Get the current phase ID.
   * @returns The current phase identifier
   */
  getCurrentPhaseId(): CosmicPhaseId {
    return this.currentPhaseId;
  }

  /**
   * Get the current phase descriptor.
   * @returns The current phase descriptor, or undefined if invalid
   */
  getCurrentPhase(): CosmicPhaseDescriptor | undefined {
    return getCosmicPhase(this.currentPhaseId);
  }

  /**
   * Set the current phase.
   * Phase 2: Manual transition only, no automatic progression.
   * @param phaseId - The phase ID to transition to
   */
  setPhase(phaseId: CosmicPhaseId): void {
    const phase = getCosmicPhase(phaseId);
    if (phase) {
      this.currentPhaseId = phaseId;
    }
  }

  /**
   * Get the axis to highlight in the current phase.
   * @returns The axis ID to highlight, or undefined if none
   */
  getHighlightAxis(): string | undefined {
    const phase = this.getCurrentPhase();
    return phase?.highlightAxis;
  }

  /**
   * Get the strain to highlight in the current phase.
   * @returns The strain slug to highlight, or undefined if none
   */
  getHighlightStrain(): string | undefined {
    const phase = this.getCurrentPhase();
    return phase?.highlightStrain;
  }

  /**
   * Get the message ID to display in the current phase.
   * @returns The message ID, or undefined if none
   */
  getMessageId(): string | undefined {
    const phase = this.getCurrentPhase();
    return phase?.messageId;
  }

  /**
   * Get the star preset to use in the current phase.
   * @returns The star preset ID, or undefined if none
   */
  getStarPreset(): string | undefined {
    const phase = this.getCurrentPhase();
    return phase?.starPreset;
  }

  /**
   * Check if a specific axis should be highlighted.
   * @param axisId - The axis ID to check
   * @returns True if the axis should be highlighted
   */
  shouldHighlightAxis(axisId: string): boolean {
    return this.getHighlightAxis() === axisId;
  }

  /**
   * Check if a specific strain should be highlighted.
   * @param strainSlug - The strain slug to check
   * @returns True if the strain should be highlighted
   */
  shouldHighlightStrain(strainSlug: string): boolean {
    return this.getHighlightStrain() === strainSlug;
  }

  /**
   * Phase 4C: Get animation context for the current phase.
   * Returns normalized animation hints for cinematic transitions.
   * @returns Animation context with rotation bias, energy bias, and star emphasis
   */
  getAnimationContext(): {
    haloRotationBiasDeg: number;
    polygonEnergyBias: number;
    starEmphasis: "low" | "medium" | "high";
  } {
    const phase = this.getCurrentPhase();
    return {
      haloRotationBiasDeg: phase?.haloRotationBiasDeg ?? 0,
      polygonEnergyBias: phase?.polygonEnergyBias ?? 0.4,
      starEmphasis: phase?.starEmphasis ?? "medium",
    };
  }

  /**
   * Get choreography descriptor for a phase transition.
   * Phase 4F: Returns transition configuration for smooth phase-to-phase animations.
   * @param prevPhase - The previous phase ID
   * @param nextPhase - The next phase ID
   * @returns The choreography descriptor for this transition
   */
  getChoreographyDescriptor(
    prevPhase: CosmicPhaseId,
    nextPhase: CosmicPhaseId
  ): CosmicChoreographyDescriptor {
    return getChoreographyDescriptor(prevPhase, nextPhase);
  }
}

/**
 * Create a new phase machine instance.
 * @param initialPhaseId - The initial phase ID (defaults to "prologue1")
 * @returns A new phase machine instance
 */
export function createPhaseMachine(
  initialPhaseId: CosmicPhaseId = "prologue1"
): CosmicThemePhaseMachine {
  return new CosmicThemePhaseMachine(initialPhaseId);
}

/**
 * PHASE 2 — Default export placeholder
 * Phase machine is implemented as a class and factory function.
 * This default export is for compatibility with the index.ts barrel file.
 */
export default function CosmicThemePhaseMachineComponent() {
  // Phase 2: No component rendering, only class-based state machine
  return null;
}

