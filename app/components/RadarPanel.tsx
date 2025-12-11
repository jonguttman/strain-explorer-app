"use client";

// =============================================================================
// RADAR PANEL - Main Tripdar screen radar card
// =============================================================================
// This component wraps TripdarSporeRadar with the strain info header,
// timeline chips, and mode switch for the main user-facing view.
//
// Directional Spin:
// When the strain changes, computes the shortest circular path between
// old and new strain positions and triggers a directional spin animation.
// Moving right in the tabs = clockwise spin, left = counter-clockwise.
// =============================================================================

import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { TraitAxisId, DoseTraits, StrainExperienceMeta, ExperienceLevel, DoseKey, MicroVibes } from "@/lib/types";
import type { TripdarVisualOverrides } from "@/lib/tripdarRadar";
import { TripdarSporeRadar } from "./TripdarSporeRadar";
import { MicrodoseRadialBars } from "./tripdar/MicrodoseRadialBars";
import { TRIPDAR_PRESET } from "@/lib/tripdarPreset";
import { STRAINS } from "./strainConstants";

// =============================================================================
// PROPS
// =============================================================================

type RadarPanelProps = {
  color: string;
  traits: DoseTraits;
  axisLabels: TraitAxisId[];
  experienceMeta?: StrainExperienceMeta;
  modeSwitch?: React.ReactNode;
  // Strain info for card header
  strainName?: string;
  effectWord?: string;
  doseLabel?: string;
  grams?: number | null;
  // Strain ID for directional spin calculation
  strainId?: string;
  // Visual overrides for fine-grained radar tuning
  visualOverrides?: TripdarVisualOverrides;
  // Microdose visualization support
  doseKey?: DoseKey;
  microVibes?: MicroVibes | null;
};

// =============================================================================
// HELPERS
// =============================================================================

// Helper to get level styling config - warm tones
function getLevelConfig(level?: ExperienceLevel) {
  switch (level) {
    case "gentle":
      return { label: "Gentle", dotClass: "bg-emerald-500", textClass: "text-emerald-800" };
    case "intense":
      return { label: "Intense", dotClass: "bg-rose-500", textClass: "text-rose-800" };
    case "balanced":
    default:
      return { label: "Balanced", dotClass: "bg-amber-500", textClass: "text-amber-800" };
  }
}

/**
 * Compute shortest signed distance between two indices in a circular list.
 * Positive = moving right/clockwise, negative = moving left/counter-clockwise.
 */
function shortestSignedDistance(prev: number, next: number, total: number): number {
  if (total === 0) return 0;
  let delta = (next - prev) % total;
  if (delta > total / 2) delta -= total;
  if (delta < -total / 2) delta += total;
  return delta;
}

// Internal Chip component for metadata display - uses CSS variables
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span 
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em]"
      style={{ 
        background: "var(--accent-pill)", 
        color: "var(--ink-soft)",
      }}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full" 
        style={{ background: "var(--accent)" }} 
      />
      {children}
    </span>
  );
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Degrees per step in the strain tab strip
// ~55° feels natural for 6 strains (360/6 ≈ 60°)
const ANGLE_PER_STEP = 55;

// =============================================================================
// COMPONENT
// =============================================================================

// Transition animation styles for microdose viz swap
const TRANSITION_STYLES = `
@keyframes microviz-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes microviz-fade-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(8px); }
}
`;

export function RadarPanel({ 
  color, 
  traits, 
  axisLabels: _axisLabels, 
  experienceMeta, 
  modeSwitch, 
  strainName, 
  effectWord, 
  doseLabel, 
  grams,
  strainId,
  visualOverrides,
  doseKey,
  microVibes,
}: RadarPanelProps) {
  // Note: axisLabels is kept for API compatibility but TripdarSporeRadar uses fixed axis order
  void _axisLabels;

  // Admin override for testing microdose visualization
  const searchParams = useSearchParams();
  const forceMicroviz = searchParams.get("microviz") === "1";

  // Show microdose visualization when forced or when viewing micro dose with valid data
  const showMicrodose = forceMicroviz || (doseKey === "micro" && microVibes != null);

  // ==========================================================================
  // DIRECTIONAL SPIN STATE
  // ==========================================================================

  const [spinKey, setSpinKey] = useState(0);
  const [spinAngle, setSpinAngle] = useState(0);
  const prevStrainIndexRef = useRef<number>(-1);

  // Compute current strain index
  const currentStrainIndex = strainId 
    ? STRAINS.findIndex((s) => s.id === strainId)
    : -1;

  // When strain changes, compute directional spin
  useEffect(() => {
    const total = STRAINS.length;
    const prev = prevStrainIndexRef.current;
    const next = currentStrainIndex;

    // Skip if this is the first render or same strain
    if (prev === -1 || prev === next || next === -1 || total === 0) {
      prevStrainIndexRef.current = next;
      return;
    }

    // Compute shortest signed distance (positive = right/CW, negative = left/CCW)
    const delta = shortestSignedDistance(prev, next, total);

    // Convert steps to degrees
    // Positive delta (moving right) = spin clockwise (positive angle starting point)
    // The radar animates FROM spinAngle TO 0, so:
    // - Spin CW: start at positive angle, ease to 0
    // - Spin CCW: start at negative angle, ease to 0
    const angle = delta * ANGLE_PER_STEP;

    setSpinAngle(angle);
    setSpinKey((k) => k + 1);
    prevStrainIndexRef.current = next;
  }, [currentStrainIndex]);

  // ==========================================================================
  // AXES CONVERSION
  // ==========================================================================

  // Convert trait values to the axes record format (0-100 scale)
  // TripdarSporeRadar expects Record<TraitAxisId, number> with 0-100 values
  const axes: Record<TraitAxisId, number> = {
    visuals: traits.values.visuals ?? 0,
    euphoria: traits.values.euphoria ?? 0,
    introspection: traits.values.introspection ?? 0,
    creativity: traits.values.creativity ?? 0,
    spiritual_depth: traits.values.spiritual_depth ?? 0,
    sociability: traits.values.sociability ?? 0,
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div 
      className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ 
        backgroundColor: "var(--card-inner)",
      }}
    >
      {/* Premium sunburst pattern background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/sunburst-pattern.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.5,
        }}
      />

      {/* Main content area - fills available space */}
      <div className="flex-1 flex flex-col px-2 sm:px-4 pt-3 sm:pt-4 min-h-0">
        {/* Strain header: FIXED HEIGHT - name + metadata on left, trip profile on right */}
        <div className="flex items-start justify-between gap-4 px-2 mb-2 sm:mb-3 relative z-10 flex-shrink-0 h-[52px] sm:h-[56px]">
          {/* Left: Strain name + metadata */}
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-semibold leading-tight text-[var(--ink-main)]">
              {strainName || "\u00A0"}
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[var(--ink-soft)]">
              {[effectWord, doseLabel, grams != null ? `${grams.toFixed(grams % 1 === 0 ? 0 : 1)} g` : null].filter(Boolean).join(" · ") || "\u00A0"}
            </p>
          </div>
          {/* Right: Trip profile + tagline - always reserve space */}
          <div className="text-right flex-shrink-0 w-[140px] sm:w-[180px]">
            {experienceMeta?.effectTagline ? (
              <>
                <p 
                  className="text-[13px] sm:text-[14px] font-medium"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Trip profile
                </p>
                <p 
                  className="mt-0.5 text-[12px] sm:text-[13px] leading-snug line-clamp-2"
                  style={{ color: "var(--ink-main)" }}
                >
                  {experienceMeta.effectTagline}
                </p>
              </>
            ) : (
              <span className="invisible">placeholder</span>
            )}
          </div>
        </div>

        {/* Tripdar visualization - swaps based on dose with transition */}
        <div className="relative z-20 mx-auto flex-1 min-h-0 flex items-center justify-center py-1">
          <style>{TRANSITION_STYLES}</style>
          {showMicrodose ? (
            <div 
              style={{ animation: "microviz-fade-in 260ms ease-out forwards" }}
            >
              <MicrodoseRadialBars
                vibes={microVibes ?? { ease: 50, desire: 50, lift: 50, connect: 50, create: 50, focus: 50 }}
                tintColor={color}
              />
            </div>
          ) : (
            <div
              style={{ animation: spinKey > 0 ? undefined : "microviz-fade-in 260ms ease-out forwards" }}
            >
              <TripdarSporeRadar
                axes={axes}
                strainColor={color}
                animationPreset={{
                  speed: TRIPDAR_PRESET.speed,
                  intensity: TRIPDAR_PRESET.intensity,
                }}
                showQuadrantRails
                showVibeCast
                showCenterMark
                spinAngle={spinAngle}
                spinKey={spinKey}
                visualOverrides={visualOverrides}
                className="drop-shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Timeline chips + intensity badge below radar - fixed height */}
      <div className="relative z-10 flex-shrink-0 flex justify-center items-center gap-2 sm:gap-3 py-2 px-4 flex-wrap h-[44px]">
        {experienceMeta?.timeline && (
          <>
            <Chip>
              {experienceMeta.timeline.peakMinHours}–{experienceMeta.timeline.peakMaxHours}hr peak
            </Chip>
            {/* Intensity badge centered between timeline chips */}
            {experienceMeta.experienceLevel && (
              <span 
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em]"
                style={{ 
                  background: "var(--accent-pill)", 
                  color: "var(--ink-soft)",
                }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${getLevelConfig(experienceMeta.experienceLevel).dotClass}`} />
                {getLevelConfig(experienceMeta.experienceLevel).label}
              </span>
            )}
            <Chip>
              {experienceMeta.timeline.onsetMinMinutes}–{experienceMeta.timeline.onsetMaxMinutes}min onset
            </Chip>
          </>
        )}
      </div>

      {/* Mode switch at bottom - fixed height */}
      {modeSwitch && (
        <div className="relative z-10 flex-shrink-0 py-3" style={{ borderTop: "1px solid var(--card-border)" }}>
          <div className="flex items-center justify-center">
            {modeSwitch}
          </div>
        </div>
      )}
    </div>
  );
}
