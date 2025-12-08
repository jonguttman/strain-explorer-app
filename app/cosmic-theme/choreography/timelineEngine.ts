// app/cosmic-theme/choreography/timelineEngine.ts
// Phase 6H: Deterministic Cosmic Choreography Timeline Engine
// Guardrails: pure functions only, no side effects, no timers.

import type { UnifiedExperienceState } from "@/app/lib/tripdarExperienceState";

export interface CosmicTimelineFrame {
  halo: {
    intensity: number;   // 0–1, brightness
    rotation: number;    // degrees
  };
  stars: {
    twinkle: number;     // 0–1, opacity factor
    driftX: number;      // px offset
    driftY: number;      // px offset
  };
  radar: {
    wobble: number;      // 0–1, rotation bias
    pulse: number;       // 0.95–1.05, scale
  };
  message: {
    opacity: number;     // 0–1
    scale: number;       // 0.9–1.1
  };
}

export interface CosmicTimeline {
  id: string;
  frames: CosmicTimelineFrame[];
  fps: number;
  durationMs: number;
}

// Small helpers

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOutSine(t: number): number {
  return 0.5 - 0.5 * Math.cos(Math.PI * t);
}

// Build a base "profile" from effectWord + dose

type MotionProfile = {
  baseEnergy: number; // 0–1
  baseSpeed: number;  // multiplier on base cycle
};

function getEffectProfile(effectWord?: string | null): MotionProfile {
  const key = (effectWord ?? "").toLowerCase().trim();

  if (key.includes("creative") || key.includes("create")) {
    return { baseEnergy: 0.85, baseSpeed: 1.2 }; // Creativity
  }
  if (key.includes("clarity") || key.includes("clear")) {
    return { baseEnergy: 0.6, baseSpeed: 0.8 }; // Clarity
  }
  if (key.includes("depth") || key.includes("deep")) {
    return { baseEnergy: 0.9, baseSpeed: 0.6 }; // Depth
  }
  if (key.includes("connect") || key.includes("social")) {
    return { baseEnergy: 0.75, baseSpeed: 1.0 }; // Connect
  }

  // Neutral default
  return { baseEnergy: 0.7, baseSpeed: 1.0 };
}

function getDoseModifier(doseKey: string): number {
  switch (doseKey) {
    case "micro":
      return 0.5;
    case "mini":
      return 0.7;
    case "macro":
      return 1.0;
    case "museum":
      return 1.3;
    case "mega":
      return 1.6;
    case "hero":
      return 2.0;
    default:
      return 1.0;
  }
}

// Derive a stable seed from strain/dose/effect/phase
function getTimelineId(exp: UnifiedExperienceState): string {
  const phaseId = exp.cosmic?.phaseId ?? "strain";
  return `${exp.strainId}-${exp.doseKey}-${exp.effectWord ?? "none"}-${phaseId}`;
}

// Pull a rough "intensity" from traits as a hint
function getTraitEnergy(exp: UnifiedExperienceState): number {
  const t = exp.traits;
  if (!t || !t.values) return 0.7;
  const vals = [
    t.values.visuals,
    t.values.creativity,
    t.values.sociability,
    t.values.euphoria,
    t.values.introspection,
    t.values.spiritual_depth,
  ].filter((v) => typeof v === "number");
  if (!vals.length) return 0.7;
  const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;
  // traits are 0–1 already
  return clamp01(avg);
}

/**
 * Phase 6H: Pure, deterministic timeline builder.
 * No randomness – all "waves" are derived from frame index and normalized params.
 */
export function buildCosmicTimeline(
  experience: UnifiedExperienceState
): CosmicTimeline {
  const fps = 60;
  const durationMs = 8000; // 8 seconds base
  const totalFrames = Math.max(1, Math.round((fps * durationMs) / 1000));

  const profile = getEffectProfile(experience.effectWord);
  const doseMod = getDoseModifier(experience.doseKey);
  const traitEnergy = getTraitEnergy(experience);

  const combinedEnergy = clamp01(
    0.5 * profile.baseEnergy + 0.3 * traitEnergy + 0.2 * clamp01(doseMod / 2)
  );

  // speed is gently scaled by sqrt of dose to avoid extremes
  const speed =
    profile.baseSpeed * (0.75 + 0.25 * Math.sqrt(Math.max(0.1, doseMod)));

  const frames: CosmicTimelineFrame[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const t = i / totalFrames; // 0–1
    const phase = 2 * Math.PI * t * speed;

    // Use a few phase-shifted sines to make motion feel organic but deterministic
    const haloWave = 0.5 + 0.5 * Math.sin(phase);
    const starWaveX = Math.sin(phase * 1.7 + Math.PI / 3);
    const starWaveY = Math.sin(phase * 1.3 + Math.PI / 5);
    const radarWave = 0.5 + 0.5 * Math.sin(phase * 1.2 + Math.PI / 7);
    const msgWave = easeInOutSine(0.5 + 0.5 * Math.sin(phase * 0.8));

    const haloIntensity = clamp01(
      lerp(0.4, 0.8, combinedEnergy * haloWave)
    );

    const haloRotation = (t * 360 * speed) % 360;

    const driftScale = 8 * combinedEnergy * clamp01(doseMod / 2);
    const driftX = driftScale * starWaveX;
    const driftY = driftScale * starWaveY;

    const twinkle = clamp01(0.7 + 0.3 * Math.sin(phase * 2.1));

    const wobble = clamp01(radarWave * combinedEnergy);
    const pulse = lerp(0.97, 1.05, combinedEnergy * radarWave);

    const msgOpacity = clamp01(msgWave);
    const msgScale = lerp(0.9, 1.1, msgWave * combinedEnergy);

    frames.push({
      halo: {
        intensity: haloIntensity,
        rotation: haloRotation,
      },
      stars: {
        twinkle,
        driftX,
        driftY,
      },
      radar: {
        wobble,
        pulse,
      },
      message: {
        opacity: msgOpacity,
        scale: msgScale,
      },
    });
  }

  return {
    id: getTimelineId(experience),
    frames,
    fps,
    durationMs,
  };
}
