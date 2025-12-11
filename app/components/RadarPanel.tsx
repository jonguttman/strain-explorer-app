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
//
// Starfield:
// The twinkling starfield renders in the outer dark background area,
// NOT inside the radar disc itself.
// =============================================================================

import { useRef, useState, useEffect, useMemo } from "react";
import type { TraitAxisId, DoseTraits, StrainExperienceMeta, ExperienceLevel } from "@/lib/types";
import type { TripdarVisualOverrides } from "@/lib/tripdarRadar";
import { TripdarSporeRadar } from "./TripdarSporeRadar";
import { TRIPDAR_PRESET } from "@/lib/tripdarPreset";
import { STRAINS } from "./strainConstants";
import type { GoldenAuraSkinOverrides } from "@/lib/tripdarPreset";

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

// Internal Chip component for metadata display - dark theme styling
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span 
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em]"
      style={{ 
        background: "rgba(255, 255, 255, 0.08)", 
        color: "rgba(255, 255, 255, 0.7)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
      }}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full" 
        style={{ background: "#c9a857" }} 
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

// Starfield density for background stars
const STARFIELD_DENSITY = 0.6;

// =============================================================================
// STARFIELD STYLES
// =============================================================================

const STARFIELD_STYLES = `
@keyframes starfield-twinkle {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.95; }
}
`;

// =============================================================================
// STARFIELD COMPONENT - Twinkling stars in the dark outer background
// =============================================================================

function Starfield({ density = 0.5 }: { density?: number }) {
  // Generate stars on mount - using useMemo to prevent regeneration
  const stars = useMemo(() => {
    const starCount = Math.floor(density * 80);
    const result: Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      duration: number;
      delay: number;
      isGlow: boolean;
    }> = [];
    
    for (let i = 0; i < starCount; i++) {
      result.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 3 + Math.random() * 3,
        duration: 5 + Math.random() * 7,
        delay: Math.random() * 8,
        isGlow: false,
      });
    }
    
    const glowCount = Math.floor(starCount * 0.15);
    for (let i = 0; i < glowCount; i++) {
      result.push({
        id: starCount + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 10 + Math.random() * 4,
        duration: 6 + Math.random() * 6,
        delay: Math.random() * 10,
        isGlow: true,
      });
    }
    
    return result;
  }, [density]);

  return (
    <>
      <style>{STARFIELD_STYLES}</style>
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 2 }}
        aria-hidden="true"
      >
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              background: star.isGlow 
                ? "radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.4) 40%, transparent 70%)",
              animation: `starfield-twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

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
}: RadarPanelProps) {
  // Note: axisLabels is kept for API compatibility but TripdarSporeRadar uses fixed axis order
  void _axisLabels;

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
        backgroundColor: "#0a0806",
      }}
    >
      {/* Cosmic aura background - multicolor blur */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 130% 100% at 25% 15%, rgba(199, 111, 156, 0.55) 0%, transparent 45%),
            radial-gradient(ellipse 110% 130% at 75% 85%, rgba(90, 168, 176, 0.5) 0%, transparent 45%),
            radial-gradient(ellipse 90% 90% at 50% 50%, rgba(245, 213, 138, 0.35) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 85% 30%, rgba(168, 140, 200, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(25, 18, 12, 0.98) 0%, rgba(10, 8, 6, 1) 100%)
          `,
          filter: "blur(40px)",
        }}
      />
      {/* Starfield - twinkling stars in the dark outer background */}
      <Starfield density={STARFIELD_DENSITY} />

      {/* Film grain overlay */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main content area - fills available space */}
      <div className="flex-1 flex flex-col px-1 sm:px-2 pt-2 sm:pt-3 min-h-0">
        {/* Strain header: Large golden gradient title */}
        <div className="flex flex-col items-center px-2 mb-2 sm:mb-3 relative z-10 flex-shrink-0">
          {/* Strain name - large golden gradient */}
          <h2 
            className="text-[24px] sm:text-[28px] md:text-[32px] font-semibold leading-tight tracking-[0.2em] uppercase text-center"
            style={{
              background: "linear-gradient(180deg, #e8c86c 0%, #c9a857 40%, #a08040 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 2px 20px rgba(201, 168, 87, 0.3)",
            }}
          >
            {strainName?.toUpperCase() || "\u00A0"}
          </h2>
        </div>

        {/* Tripdar Spore Radar - fills remaining space */}
        <div className="relative z-10 mx-auto flex-1 min-h-0 flex items-center justify-center py-1">
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
            visualSkin="golden-aura"
            goldenAuraOverrides={{
              bloomIntensity: 0.85,
              plateGloss: 0.9,
              starBrightness: 0.95,
              haloIntensity: 0.7,
            }}
            className="drop-shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
          />
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
                  background: "rgba(255, 255, 255, 0.08)", 
                  color: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
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
        <div className="relative z-10 flex-shrink-0 py-3" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <div className="flex items-center justify-center">
            {modeSwitch}
          </div>
        </div>
      )}
    </div>
  );
}
