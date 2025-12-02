"use client";

// =============================================================================
// DOSE VISUALIZATION LAB
// =============================================================================
// Lab page for exploring how dose affects the radar visualization.
// Uses the canonical TripdarSporeRadar component.
// =============================================================================

import * as React from "react";
import Link from "next/link";
import type { TraitAxisId } from "@/lib/types";
import { TripdarSporeRadar } from "@/app/components/TripdarSporeRadar";

// Lab uses simplified scores type (0-1 scale internally)
type LabScores = {
  visuals: number;
  euphoria: number;
  introspection: number;
  creativity: number;
  spiritual: number;
  social: number;
};

const DEFAULT_SCORES: LabScores = {
  visuals: 0.7,
  euphoria: 0.65,
  introspection: 0.55,
  creativity: 0.8,
  spiritual: 0.45,
  social: 0.6,
};

const DOSE_LABELS = ["Micro", "Mini", "Macro", "Museum", "Mega", "Hero"];

const PRESETS: { label: string; scores: LabScores; doseLevel: number }[] = [
  {
    label: "Micro Balanced",
    doseLevel: 0.1,
    scores: { visuals: 0.2, euphoria: 0.3, introspection: 0.25, creativity: 0.35, spiritual: 0.15, social: 0.4 },
  },
  {
    label: "Macro Creative",
    doseLevel: 0.5,
    scores: { visuals: 0.6, euphoria: 0.5, introspection: 0.4, creativity: 0.95, spiritual: 0.3, social: 0.55 },
  },
  {
    label: "Museum Visual",
    doseLevel: 0.65,
    scores: { visuals: 0.95, euphoria: 0.7, introspection: 0.6, creativity: 0.75, spiritual: 0.5, social: 0.4 },
  },
  {
    label: "Hero Introspective",
    doseLevel: 1.0,
    scores: { visuals: 0.85, euphoria: 0.6, introspection: 0.95, creativity: 0.7, spiritual: 0.9, social: 0.25 },
  },
];

export default function DoseVisualLabPage() {
  const [scores, setScores] = React.useState<LabScores>(DEFAULT_SCORES);
  const [doseLevel, setDoseLevel] = React.useState(0.5);
  const [intensity, setIntensity] = React.useState(0.5);
  const [speed, setSpeed] = React.useState(1.2);
  const [showRails, setShowRails] = React.useState(true);

  // Apply dose level as a multiplier to the base scores
  // Higher doses = more pronounced effects
  const doseScaledScores: LabScores = {
    visuals: scores.visuals * (0.3 + 0.7 * doseLevel),
    euphoria: scores.euphoria * (0.3 + 0.7 * doseLevel),
    introspection: scores.introspection * (0.3 + 0.7 * doseLevel),
    creativity: scores.creativity * (0.3 + 0.7 * doseLevel),
    spiritual: scores.spiritual * (0.3 + 0.7 * doseLevel),
    social: scores.social * (0.3 + 0.7 * doseLevel),
  };

  // Convert to TripdarSporeRadar axes (0-100)
  const axes: Record<TraitAxisId, number> = {
    visuals: doseScaledScores.visuals * 100,
    euphoria: doseScaledScores.euphoria * 100,
    introspection: doseScaledScores.introspection * 100,
    creativity: doseScaledScores.creativity * 100,
    spiritual_depth: doseScaledScores.spiritual * 100,
    sociability: doseScaledScores.social * 100,
  };

  const currentDoseLabel = DOSE_LABELS[Math.min(Math.floor(doseLevel * 6), 5)];

  const handleScoreChange = (key: keyof LabScores, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setScores(preset.scores);
    setDoseLevel(preset.doseLevel);
  };

  // Intensity scales with dose for more dramatic effect at higher doses
  const effectiveIntensity = intensity * (0.5 + 0.5 * doseLevel);

  return (
    <main className="min-h-screen bg-[var(--shell-bg)] text-[var(--ink-main)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-6 space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--ink-subtle)]">
            Lab · Experimental
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--ink-main)]">
            Dose Visualization Lab
          </h1>
          <p className="text-sm text-[var(--ink-soft)] max-w-xl">
            Explore how dose affects the radar visualization. Higher doses scale axis values
            and increase intensity for more dramatic spore gills.
          </p>
        </header>

        {/* Main card with controls + radar */}
        <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Controls */}
            <div className="flex-1 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-[var(--card-border)] space-y-5">
              {/* Dose slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="dose-slider"
                    className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)]"
                  >
                    Dose Level
                  </label>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--accent-pill)] text-[var(--accent)]">
                    {currentDoseLabel}
                  </span>
                </div>
                <input
                  id="dose-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={doseLevel}
                  onChange={(e) => setDoseLevel(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${doseLevel * 100}%, var(--card-border) ${doseLevel * 100}%, var(--card-border) 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-[var(--ink-subtle)]">
                  {DOSE_LABELS.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>

              {/* Intensity slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="intensity-slider"
                    className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)]"
                  >
                    Base Intensity (pointiness)
                  </label>
                  <span className="text-xs font-mono text-[var(--accent)] bg-[var(--accent-pill)] px-2 py-0.5 rounded">
                    {(intensity * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  id="intensity-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${intensity * 100}%, var(--card-border) ${intensity * 100}%, var(--card-border) 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-[var(--ink-subtle)]">
                  <span>Soft</span>
                  <span>Pointy</span>
                </div>
              </div>

              {/* Speed slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="speed-slider"
                    className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)]"
                  >
                    Animation Speed
                  </label>
                  <span className="text-xs font-mono text-[var(--accent)] bg-[var(--accent-pill)] px-2 py-0.5 rounded">
                    {speed.toFixed(1)}×
                  </span>
                </div>
                <input
                  id="speed-slider"
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((speed - 0.5) / 1.5) * 100}%, var(--card-border) ${((speed - 0.5) / 1.5) * 100}%, var(--card-border) 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-[var(--ink-subtle)]">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Rails toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRails}
                  onChange={(e) => setShowRails(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--accent)]"
                />
                <span className="text-sm text-[var(--ink-main)]">Show Quadrant Rails</span>
              </label>

              {/* Presets */}
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)]">
                  Presets
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="rounded-full border border-[var(--card-border)] bg-[var(--card-inner)] px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Axis score sliders */}
              <div className="space-y-3 pt-2 border-t border-[var(--card-border)]">
                <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)]">
                  Base Axis Scores
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {(Object.keys(scores) as (keyof LabScores)[]).map((key) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-medium text-[var(--ink-main)] capitalize">
                          {key}
                        </label>
                        <span className="text-[10px] tabular-nums text-[var(--ink-soft)]">
                          {(scores[key] * 100).toFixed(0)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={scores[key]}
                        onChange={(e) => handleScoreChange(key, parseFloat(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--card-border)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Radar preview */}
            <div className="flex-1 p-5 sm:p-6 bg-[var(--card-inner)] flex flex-col items-center justify-center">
              <div className="w-full max-w-[400px] space-y-4">
                {/* Dose label */}
                <div className="text-center">
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--ink-subtle)]">
                    Dose Level
                  </p>
                  <p className="text-lg font-semibold text-[var(--ink-main)]">
                    {currentDoseLabel}
                  </p>
                  <p className="text-xs text-[var(--ink-soft)]">
                    Effective intensity: {(effectiveIntensity * 100).toFixed(0)}%
                  </p>
                </div>

                {/* Radar */}
                <TripdarSporeRadar
                  axes={axes}
                  strainColor="#8b5a2b"
                  animationPreset={{ speed, intensity: effectiveIntensity }}
                  showQuadrantRails={showRails}
                  showCenterMark
                  className="w-full h-auto drop-shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
                />

                {/* Description */}
                <p className="text-center text-xs text-[var(--ink-soft)] max-w-xs mx-auto">
                  Dose level scales axis values and increases intensity.
                  Higher doses = more pronounced, spikier gills.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Back link */}
        <footer className="text-center pt-2">
          <Link
            href="/lab"
            className="text-sm text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors"
          >
            ← Back to Lab
          </Link>
        </footer>
      </div>
    </main>
  );
}
