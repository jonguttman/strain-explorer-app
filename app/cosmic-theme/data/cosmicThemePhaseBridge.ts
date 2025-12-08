/**
 * COSMIC THEME ENGINE — DEMO PHASE SYNCHRONIZATION (PHASE 5E)
 * -------------------------------------------------------------
 * Phase 5E: Demo phase synchronization (classic + cosmic)
 * Guardrails: No geometry changes. No classic UI behavior changes. No new state machines.
 * 
 * This file provides a bridge between Tripdar demo phases and Cosmic Theme phases.
 * Maps Tripdar demo phase IDs to Cosmic Theme phase IDs for synchronized behavior.
 */

import type { CosmicPhaseId } from "../config/cosmicThemePhases";

/**
 * Tripdar demo phase identifier type.
 * This mirrors the demo phases used in the main Tripdar UI.
 * 
 * Note: If the main UI uses different phase names, update this type to match.
 * The mapping function below will handle the conversion to Cosmic phases.
 */
export type TripdarDemoPhaseId =
  | "idle"
  | "intro"
  | "prologue1"
  | "prologue2"
  | "prologue3"
  | "prologue4"
  | "strain"
  | "dose"
  | "intelligence"
  | "closing"
  | "done";

/**
 * Maps Tripdar demo phases to Cosmic Theme phases.
 * 
 * This ensures that when the guided demo runs, both Classic and Cosmic themes
 * respond to the same phase IDs, axis highlights, and strain focus.
 * 
 * @param tripdarPhaseId - The Tripdar demo phase ID
 * @returns The corresponding Cosmic Theme phase ID
 */
export function mapTripdarDemoPhaseToCosmicPhase(
  tripdarPhaseId: TripdarDemoPhaseId | null | undefined
): CosmicPhaseId {
  // If no phase provided, default to "strain" (stable resting state)
  if (!tripdarPhaseId || tripdarPhaseId === "idle" || tripdarPhaseId === "done") {
    return "strain";
  }

  // Direct mapping for phases that exist in both systems
  switch (tripdarPhaseId) {
    case "prologue1":
    case "prologue2":
    case "prologue3":
    case "prologue4":
    case "strain":
    case "dose":
    case "intelligence":
    case "closing":
      return tripdarPhaseId;

    // Map "intro" to "prologue1" (intro typically transitions to prologue1)
    case "intro":
      return "prologue1";

    // Fallback to "strain" for any unmapped phases
    default:
      return "strain";
  }
}

/**
 * Check if a Tripdar demo phase should trigger Cosmic Theme demo behavior.
 * 
 * @param tripdarPhaseId - The Tripdar demo phase ID
 * @returns True if the phase is part of the active demo sequence
 */
export function isActiveDemoPhase(
  tripdarPhaseId: TripdarDemoPhaseId | null | undefined
): boolean {
  if (!tripdarPhaseId) return false;
  
  // Active demo phases (exclude idle, done, and intro which is transitional)
  const activePhases: TripdarDemoPhaseId[] = [
    "prologue1",
    "prologue2",
    "prologue3",
    "prologue4",
    "strain",
    "dose",
    "intelligence",
    "closing",
  ];
  
  return activePhases.includes(tripdarPhaseId);
}

