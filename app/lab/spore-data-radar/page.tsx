"use client";

// =============================================================================
// SPORE DATA RADAR LAB
// =============================================================================
// Full control panel for testing TripdarSporeRadar settings.
// Allows tweaking all animation knobs, axis values, and visualization options.
// =============================================================================

import * as React from "react";
import Link from "next/link";
import type { TraitAxisId } from "@/lib/types";
import { TripdarSporeRadar } from "@/app/components/TripdarSporeRadar";

// Lab uses simplified scores type (0-1 scale internally, converted to 0-100 for component)
type LabScores = {
  visuals: number;
  euphoria: number;
  introspection: number;
  creativity: number;
  spiritual: number;
  social: number;
};

const LABELS: { key: keyof LabScores; axisId: TraitAxisId; label: string }[] = [
  { key: "visuals", axisId: "visuals", label: "Visuals" },
  { key: "euphoria", axisId: "euphoria", label: "Euphoria" },
  { key: "introspection", axisId: "introspection", label: "Introspection" },
  { key: "creativity", axisId: "creativity", label: "Creativity" },
  { key: "spiritual", axisId: "spiritual_depth", label: "Spiritual" },
  { key: "social", axisId: "sociability", label: "Social" },
];

const DEFAULT_SCORES: LabScores = {
  visuals: 0.7,
  euphoria: 0.65,
  introspection: 0.55,
  creativity: 0.8,
  spiritual: 0.45,
  social: 0.6,
};

export default function SporeDataRadarLabPage() {
  const [scores, setScores] = React.useState<LabScores>(DEFAULT_SCORES);
  const [speed, setSpeed] = React.useState(1.0);
  const [intensity, setIntensity] = React.useState(0.5);
  const [animate, setAnimate] = React.useState(true);
  const [showRails, setShowRails] = React.useState(true);
  const [showMark, setShowMark] = React.useState(true);
  const [compact, setCompact] = React.useState(false);
  const [strainColor, setStrainColor] = React.useState("#c9a857");

  const handleChange = (key: keyof LabScores, value: number) => {
    setScores((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Convert lab scores (0-1) to TripdarSporeRadar axes (0-100)
  const axes: Record<TraitAxisId, number> = {
    visuals: scores.visuals * 100,
    euphoria: scores.euphoria * 100,
    introspection: scores.introspection * 100,
    creativity: scores.creativity * 100,
    spiritual_depth: scores.spiritual * 100,
    sociability: scores.social * 100,
  };

  // Export current config as code snippet
  const exportConfig = () => {
    const config = {
      speed,
      intensity,
      strainColor,
      scores,
    };

    const asCode =
      "export const TRIPDAR_PRESET = " +
      JSON.stringify(config, null, 2) +
      " as const;";

    void navigator.clipboard.writeText(asCode);
    alert("Tripdar preset copied to clipboard!");
  };

  return (
    <main className="min-h-screen bg-[var(--shell-bg)] text-[var(--ink-main)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-6 space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--ink-subtle)]">
            Lab · Experimental
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--ink-main)]">
            Spore Data Radar
          </h1>
          <p className="text-sm text-[var(--ink-soft)] max-w-xl">
            Full control panel for the canonical TripdarSporeRadar component.
            Changes here reflect exactly what appears on the main Tripdar screen.
          </p>
        </header>

        {/* Animation Controls */}
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 sm:px-6 py-4">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)] mb-4">
            Animation Controls
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Speed Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="speed-slider"
                  className="text-sm font-medium text-[var(--ink-main)]"
                >
                  Speed
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
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--card-border)]"
                style={{
                  background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((speed - 0.5) / 1.5) * 100}%, var(--card-border) ${((speed - 0.5) / 1.5) * 100}%, var(--card-border) 100%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-[var(--ink-subtle)]">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Intensity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="intensity-slider"
                  className="text-sm font-medium text-[var(--ink-main)]"
                >
                  Intensity
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
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--card-border)]"
                style={{
                  background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${intensity * 100}%, var(--card-border) ${intensity * 100}%, var(--card-border) 100%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-[var(--ink-subtle)]">
                <span>Subtle</span>
                <span>Strong</span>
              </div>
            </div>

            {/* Strain Color Picker */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="strain-color"
                  className="text-sm font-medium text-[var(--ink-main)]"
                >
                  Strain Tint
                </label>
                <span 
                  className="w-5 h-5 rounded-full border border-[var(--card-border)]"
                  style={{ backgroundColor: strainColor }}
                />
              </div>
              <input
                id="strain-color"
                type="color"
                value={strainColor}
                onChange={(e) => setStrainColor(e.target.value)}
                className="w-full h-9 rounded-lg border border-[var(--card-border)] bg-[var(--card-inner)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--ink-subtle)]">
                <span>Background tint</span>
                <span>{strainColor}</span>
              </div>
            </div>

            {/* Animation Toggle */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[var(--ink-main)]">
                  Animation
                </label>
                <span className="text-xs font-mono text-[var(--ink-soft)]">
                  {animate ? "On" : "Off"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAnimate(!animate)}
                className={`w-full h-9 rounded-full border transition-all ${
                  animate
                    ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                    : "bg-[var(--card-inner)] border-[var(--card-border)] text-[var(--ink-soft)]"
                }`}
              >
                {animate ? "Breathing" : "Static"}
              </button>
            </div>
          </div>

          {/* Feature toggles */}
          <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showRails}
                onChange={(e) => setShowRails(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--ink-main)]">Quadrant Rails</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMark}
                onChange={(e) => setShowMark(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--ink-main)]">Center Mark</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={compact}
                onChange={(e) => setCompact(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--ink-main)]">Compact Mode</span>
            </label>
          </div>
        </section>

        {/* Dimension Controls */}
        <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 sm:px-6 py-4 sm:py-6">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)] mb-4">
            Experience Dimensions
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {LABELS.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor={`slider-${key}`}
                    className="text-sm font-medium text-[var(--ink-main)]"
                  >
                    {label}
                  </label>
                  <span className="text-xs font-mono text-[var(--accent)] bg-[var(--accent-pill)] px-2 py-0.5 rounded">
                    {(scores[key] * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  id={`slider-${key}`}
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={scores[key]}
                  onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${scores[key] * 100}%, var(--card-border) ${scores[key] * 100}%, var(--card-border) 100%)`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Quick Presets */}
          <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)] mb-2">
              Presets
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setScores({
                    visuals: 0.9,
                    euphoria: 0.6,
                    introspection: 0.7,
                    creativity: 0.95,
                    spiritual: 0.5,
                    social: 0.4,
                  })
                }
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-[var(--card-border)] bg-[var(--card-inner)] hover:border-[var(--accent)] transition-colors"
              >
                Creative Peak
              </button>
              <button
                type="button"
                onClick={() =>
                  setScores({
                    visuals: 0.4,
                    euphoria: 0.5,
                    introspection: 0.95,
                    creativity: 0.6,
                    spiritual: 0.9,
                    social: 0.3,
                  })
                }
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-[var(--card-border)] bg-[var(--card-inner)] hover:border-[var(--accent)] transition-colors"
              >
                Deep Introspection
              </button>
              <button
                type="button"
                onClick={() =>
                  setScores({
                    visuals: 0.5,
                    euphoria: 0.9,
                    introspection: 0.4,
                    creativity: 0.6,
                    spiritual: 0.3,
                    social: 0.95,
                  })
                }
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-[var(--card-border)] bg-[var(--card-inner)] hover:border-[var(--accent)] transition-colors"
              >
                Social Euphoria
              </button>
              <button
                type="button"
                onClick={() =>
                  setScores({
                    visuals: 0.95,
                    euphoria: 0.7,
                    introspection: 0.6,
                    creativity: 0.8,
                    spiritual: 0.85,
                    social: 0.5,
                  })
                }
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-[var(--card-border)] bg-[var(--card-inner)] hover:border-[var(--accent)] transition-colors"
              >
                Visionary
              </button>
              <button
                type="button"
                onClick={() =>
                  setScores({
                    visuals: 0.1,
                    euphoria: 0.15,
                    introspection: 0.2,
                    creativity: 0.25,
                    spiritual: 0.1,
                    social: 0.3,
                  })
                }
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-[var(--card-border)] bg-[var(--card-inner)] hover:border-[var(--accent)] transition-colors"
              >
                Low Values Test
              </button>
              <button
                type="button"
                onClick={() => setScores(DEFAULT_SCORES)}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-[var(--card-border)] bg-[var(--card-inner)] hover:border-[var(--accent)] transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Export config button */}
            <button
              type="button"
              onClick={exportConfig}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card-inner)] px-4 py-1.5 text-xs font-medium text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              📋 Copy preset as code
            </button>
          </div>
        </section>

        {/* Preview Card */}
        <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] px-6 py-8 flex flex-col items-center gap-4">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--ink-subtle)]">
            TripdarSporeRadar Preview
          </p>

          <TripdarSporeRadar
            axes={axes}
            strainColor={strainColor}
            animationPreset={{ speed, intensity }}
            showQuadrantRails={showRails}
            showCenterMark={showMark}
            compact={compact}
            disableAnimation={!animate}
            className="drop-shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
          />

          <p className="text-sm text-[var(--ink-soft)] text-center max-w-md">
            This is the exact same component used on the main Tripdar screen.
            The shapeAxisValue curve ensures low values (0-35%) are visually distinct.
          </p>
        </section>

        {/* Back link */}
        <footer className="text-center pt-4">
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
