"use client";

/**
 * COSMIC THEME ENGINE — TRIPDAR DATA INTEGRATION (PHASE 5A)
 * ----------------------------------------------------------
 * Guardrail: Do NOT import legacy cosmic-fire-ring code.
 * Guardrail: Do NOT alter geometry math.
 * Guardrail: All animations remain declarative and reversible.
 * Guardrail: All changes logged in docs/cursor-change-history.md.
 * 
 * Phase 4F: Phase-to-phase choreography with smooth blend transitions.
 * Phase 5A: Connected to real Tripdar strain/dose data.
 * Components animate smoothly between phases using choreography descriptors.
 * Guardrail compliance: No geometry modifications, only interpolation and CSS transitions.
 */

import { useMemo, useRef, useEffect, useState } from "react";
import { getDefaultRadarGeometry } from "./CosmicThemeRadar";
import CosmicThemeHalo from "./CosmicThemeHalo";
import CosmicThemeRadar from "./CosmicThemeRadar";
import CosmicThemeStars from "./CosmicThemeStars";
import CosmicThemeMessages from "./CosmicThemeMessages";
import { createPhaseMachine } from "./CosmicThemePhaseMachine";
import type { CosmicPhaseId } from "./config/cosmicThemePhases";
import type { CosmicChoreographyDescriptor } from "./config/cosmicThemeChoreography";
import { getCosmicRadarValues, getCosmicHaloColor, getCosmicStarColor } from "./data/cosmicThemeDataAdapter";
import type { DoseKey } from "@/lib/types";
import type { CosmicThemeId } from "./config/cosmicThemeVisualPresets";
// Phase 6I: Timeline frame integration
import type { CosmicTimelineFrame } from "./choreography/timelineEngine";

/**
 * PHASE 5A — Demo orchestrator with phase-to-phase choreography and real Tripdar data.
 * Renders halo, radar, and stars in a centered container.
 * All components use absolute positioning for proper stacking:
 * - Halo: bottom layer (z-index implicit)
 * - Radar: middle layer
 * - Stars: top layer
 * Passes highlightAxis, messageId, animationContext, choreography, and real data from Tripdar to child components.
 */
export default function CosmicThemeDemo({
  phaseId = "prologue1",
  strainSlug,
  doseKey = "macro",
  themeId = "cosmic",
  onDebugStateChange,
  reduceMotion = false,
  currentFrame,
  _themeBlendProgress,
}: {
  phaseId?: CosmicPhaseId;
  strainSlug?: string;
  doseKey?: DoseKey;
  themeId?: CosmicThemeId;
  onDebugStateChange?: (state: {
    cosmicPhaseId: string;
    blendProgress: number;
    choreographyId: string | null;
  }) => void;
  reduceMotion?: boolean;
  // Phase 6I: Timeline frame from choreography engine
  currentFrame?: CosmicTimelineFrame;
  // Phase 7B: Theme blend preparation (reserved for Phase 8A theme transition choreography)
  _themeBlendProgress?: number;
}) {
  // Phase 6A.3: Memoize geometry - it's static and doesn't depend on props
  const geometry = useMemo(() => getDefaultRadarGeometry(), []);
  const phaseMachine = useMemo(() => createPhaseMachine(phaseId), [phaseId]);
  
  // Phase 4F: Track previous phase for choreography
  const prevPhaseIdRef = useRef<CosmicPhaseId>(phaseId);
  const [choreography, setChoreography] = useState<CosmicChoreographyDescriptor | undefined>(undefined);
  const [blendProgress, setBlendProgress] = useState(0);
  const blendAnimationRef = useRef<number | null>(null);
  const blendStartTimeRef = useRef<number | null>(null);
  
  // Phase 4F: Detect phase changes and get choreography descriptor
  useEffect(() => {
    const prevPhase = prevPhaseIdRef.current;
    const nextPhase = phaseId;
    
    if (prevPhase !== nextPhase) {
      // Get choreography descriptor for this transition
      const choreo = phaseMachine.getChoreographyDescriptor(prevPhase, nextPhase);
      setChoreography(choreo);
      
      // Phase 6B: Dev-only logging
      if (process.env.NODE_ENV === "development") {
        const choreographyId = choreo ? `${prevPhase}->${nextPhase}` : null;
        console.debug("[CosmicPhase]", {
          prevPhase,
          nextPhase,
          choreographyId,
        });
      }
      
      // Reset blend progress and animate from 0 to 1
      setBlendProgress(0);
      blendStartTimeRef.current = null;
      
      // Phase 6B: Dev-only logging - blend start
      if (process.env.NODE_ENV === "development") {
        const choreographyId = choreo ? `${prevPhase}->${nextPhase}` : null;
        console.debug("[CosmicBlend]", {
          phase: nextPhase,
          choreographyId,
          progress: 0,
        });
      }
      
      // Cancel any ongoing blend animation
      if (blendAnimationRef.current !== null) {
        cancelAnimationFrame(blendAnimationRef.current);
      }
      
      const blendDuration = 300; // ms
      
      const animateBlend = (currentTime: number) => {
        if (blendStartTimeRef.current === null) {
          blendStartTimeRef.current = currentTime;
        }
        
        const elapsed = currentTime - blendStartTimeRef.current;
        const progress = Math.min(elapsed / blendDuration, 1);
        
        setBlendProgress(progress);
        
        // Phase 6B: Notify debug state change
        if (onDebugStateChange) {
          const choreographyId = choreo ? `${prevPhase}->${nextPhase}` : null;
          onDebugStateChange({
            cosmicPhaseId: nextPhase,
            blendProgress: progress,
            choreographyId,
          });
        }
        
        if (progress < 1) {
          blendAnimationRef.current = requestAnimationFrame(animateBlend);
        } else {
          blendAnimationRef.current = null;
          blendStartTimeRef.current = null;
          
          // Phase 6B: Dev-only logging - blend complete
          if (process.env.NODE_ENV === "development") {
            const choreographyId = choreo ? `${prevPhase}->${nextPhase}` : null;
            console.debug("[CosmicBlend]", {
              phase: nextPhase,
              choreographyId,
              progress: 1,
            });
          }
        }
      };
      
      blendAnimationRef.current = requestAnimationFrame(animateBlend);
      
      // Update previous phase
      prevPhaseIdRef.current = nextPhase;
    }
    
    return () => {
      if (blendAnimationRef.current !== null) {
        cancelAnimationFrame(blendAnimationRef.current);
      }
    };
  }, [phaseId, phaseMachine, onDebugStateChange]);

  // Phase 6B: Notify debug state change on every render (when callback provided)
  useEffect(() => {
    if (onDebugStateChange) {
      const choreographyId = choreography ? `${prevPhaseIdRef.current}->${phaseId}` : null;
      onDebugStateChange({
        cosmicPhaseId: phaseId,
        blendProgress,
        choreographyId,
      });
    }
  }, [phaseId, blendProgress, choreography, onDebugStateChange]);
  
  // Get highlight state and animation context from phase machine
  const highlightAxis = phaseMachine.getHighlightAxis();
  const messageId = phaseMachine.getMessageId();
  const animationContext = phaseMachine.getAnimationContext();
  
  // Phase 5A: Get real Tripdar data
  const radarValues = useMemo(() => {
    if (!strainSlug) return undefined;
    return getCosmicRadarValues(strainSlug, doseKey);
  }, [strainSlug, doseKey]);
  
  const haloColor = useMemo(() => {
    if (!strainSlug) return undefined;
    return getCosmicHaloColor(strainSlug);
  }, [strainSlug]);
  
  const starColor = useMemo(() => {
    if (!strainSlug) return undefined;
    return getCosmicStarColor(strainSlug, doseKey);
  }, [strainSlug, doseKey]);

  // Phase 7D: All components now receive validated themeBlendProgress (unused until Phase 8A)
  return (
    <div className="relative w-[min(360px,80vw)] aspect-square">
      <CosmicThemeHalo 
        animationContext={animationContext}
        highlightAxis={highlightAxis}
        messageId={messageId}
        choreography={choreography}
        blendProgress={blendProgress}
        haloColor={haloColor}
        themeId={themeId}
        reduceMotion={reduceMotion}
        currentFrame={currentFrame}
        _themeBlendProgress={_themeBlendProgress}
      />
      <CosmicThemeRadar 
        geometry={geometry}
        animationContext={animationContext}
        highlightAxis={highlightAxis}
        messageId={messageId}
        choreography={choreography}
        blendProgress={blendProgress}
        radarValues={radarValues}
        themeId={themeId}
        reduceMotion={reduceMotion}
        currentFrame={currentFrame}
        _themeBlendProgress={_themeBlendProgress}
      />
      <CosmicThemeStars 
        geometry={geometry}
        animationContext={animationContext}
        highlightAxisId={highlightAxis}
        messageId={messageId}
        choreography={choreography}
        blendProgress={blendProgress}
        starColor={starColor}
        themeId={themeId}
        reduceMotion={reduceMotion}
        currentFrame={currentFrame}
        _themeBlendProgress={_themeBlendProgress}
      />
      <CosmicThemeMessages 
        messageId={messageId}
        choreography={choreography}
        blendProgress={blendProgress}
        themeId={themeId}
        reduceMotion={reduceMotion}
        currentFrame={currentFrame}
        _themeBlendProgress={_themeBlendProgress}
      />
    </div>
  );
}
