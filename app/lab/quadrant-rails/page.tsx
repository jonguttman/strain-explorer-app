"use client";

// =============================================================================
// QUADRANT RAILS LAB
// =============================================================================
// Test page for the quadrant rails feature in TripdarSporeRadar.
// Demonstrates how axis strength is shown via outer rail arcs.
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

const STRAIN_PRESETS = [
  { 
    id: "golden-teacher", 
    name: "Golden Teacher", 
    color: "#c9a857",
    scores: { visuals: 0.7, euphoria: 0.65, introspection: 0.55, creativity: 0.8, spiritual: 0.45, social: 0.6 } 
  },
  { 
    id: "penis-envy", 
    name: "Penis Envy", 
    color: "#9b6b4a",
    scores: { visuals: 0.9, euphoria: 0.5, introspection: 0.85, creativity: 0.6, spiritual: 0.8, social: 0.3 } 
  },
  { 
    id: "amazonian", 
    name: "Amazonian", 
    color: "#7a9b5a",
    scores: { visuals: 0.75, euphoria: 0.8, introspection: 0.4, creativity: 0.7, spiritual: 0.5, social: 0.75 } 
  },
];

// Color for each axis bar in data view
const AXIS_COLORS: Record<keyof LabScores, string> = {
  visuals: "#9b59b6",
  euphoria: "#e74c3c",
  introspection: "#3498db",
  creativity: "#f39c12",
  spiritual: "#1abc9c",
  social: "#e91e63",
};

export default function QuadrantRailsLabPage() {
  const [scores, setScores] = React.useState<LabScores>(DEFAULT_SCORES);
  const [intensity, setIntensity] = React.useState(0.5);
  const [speed, setSpeed] = React.useState(1.2);
  const [selectedStrain, setSelectedStrain] = React.useState(STRAIN_PRESETS[0]);
  const [showDetails, setShowDetails] = React.useState(false);
  const [showRails, setShowRails] = React.useState(true);
  const [spinKey, setSpinKey] = React.useState(0);
  const [spinAngle, setSpinAngle] = React.useState(0);

  // Convert lab scores (0-1) to TripdarSporeRadar axes (0-100)
  const axes: Record<TraitAxisId, number> = {
    visuals: scores.visuals * 100,
    euphoria: scores.euphoria * 100,
    introspection: scores.introspection * 100,
    creativity: scores.creativity * 100,
    spiritual_depth: scores.spiritual * 100,
    sociability: scores.social * 100,
  };

  const handleScoreChange = (key: keyof LabScores, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const handleStrainChange = (strainId: string) => {
    const preset = STRAIN_PRESETS.find((s) => s.id === strainId);
    if (preset) {
      const prevIndex = STRAIN_PRESETS.findIndex((s) => s.id === selectedStrain.id);
      const nextIndex = STRAIN_PRESETS.findIndex((s) => s.id === strainId);
      
      setSelectedStrain(preset);
      setScores(preset.scores);
      
      // Compute directional spin angle
      const delta = nextIndex - prevIndex;
      const angle = delta * 55; // ~55° per step
      setSpinAngle(angle);
      setSpinKey((k) => k + 1);
    }
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
            Quadrant Rails + Data View
          </h1>
          <p className="text-sm text-[var(--ink-soft)] max-w-xl">
            Outer rails make axis strength dead obvious at a glance. 
            Click the radar to reveal a conventional bar chart.
            Uses the canonical TripdarSporeRadar component.
          </p>
        </header>

        {/* Controls */}
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 sm:px-6 py-4 space-y-5">
          {/* Strain selector + rails toggle */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1 flex-1 min-w-[180px]">
              <label className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)]">
                Test Strain
              </label>
              <select
                value={selectedStrain.id}
                onChange={(e) => handleStrainChange(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-inner)] px-3 py-2 text-sm text-[var(--ink-main)]"
              >
                {STRAIN_PRESETS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showRails}
                onChange={(e) => setShowRails(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--accent)]"
              />
              <span className="text-sm text-[var(--ink-main)]">Show Quadrant Rails</span>
            </label>
          </div>

          {/* Intensity + speed */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Intensity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)]">
                  Pointiness
                </label>
                <span className="text-xs font-mono text-[var(--accent)] bg-[var(--accent-pill)] px-2 py-0.5 rounded">
                  {(intensity * 100).toFixed(0)}%
                </span>
              </div>
              <input
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
                <span>Spiky</span>
              </div>
            </div>

            {/* Speed */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)]">
                  Animation Speed
                </label>
                <span className="text-xs font-mono text-[var(--accent)] bg-[var(--accent-pill)] px-2 py-0.5 rounded">
                  {speed.toFixed(1)}×
                </span>
              </div>
              <input
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
          </div>

          {/* Axis sliders */}
          <div className="pt-3 border-t border-[var(--card-border)]">
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)] mb-3">
              Axis Scores
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              {LABELS.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-medium text-[var(--ink-main)]">
                      {label}
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
        </section>

        {/* Radar preview with quadrant rails */}
        <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] px-6 py-8">
          <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-[var(--ink-subtle)] mb-4">
            TripdarSporeRadar with Quadrant Rails
          </p>
          <p className="text-center text-xs text-[var(--ink-soft)] mb-6 max-w-md mx-auto">
            Click on the radar to reveal the data view panel below.
          </p>

          {/* Radar container - clickable */}
          <div
            className="relative w-full max-w-[400px] mx-auto cursor-pointer"
            onClick={() => setShowDetails(!showDetails)}
            onMouseEnter={() => setShowDetails(true)}
          >
            <TripdarSporeRadar
              axes={axes}
              strainColor={selectedStrain.color}
              animationPreset={{ speed, intensity }}
              showQuadrantRails={showRails}
              showCenterMark
              spinAngle={spinAngle}
              spinKey={spinKey}
              className="w-full h-auto"
            />
          </div>

          {/* Caption */}
          <p className="text-center text-xs text-[var(--ink-soft)] mt-4">
            The thick outer rails show axis strength at a glance. Wider + thicker = stronger vibe.
          </p>
        </section>

        {/* Details panel (conventional bar chart) */}
        {showDetails && (
          <section
            className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-inner)] px-5 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
            onClick={() => setShowDetails(false)}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)]">
                Data View
              </p>
              <button
                type="button"
                className="text-xs text-[var(--ink-soft)] hover:text-[var(--ink-main)]"
                onClick={() => setShowDetails(false)}
              >
                Close ×
              </button>
            </div>

            {/* Bar chart */}
            <div className="space-y-3">
              {LABELS.map(({ key, label }) => {
                const value = scores[key];
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-[var(--ink-main)]">{label}</span>
                      <span className="tabular-nums text-[var(--ink-soft)]">
                        {(value * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative h-3 bg-[var(--card-border)] rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                        style={{
                          width: `${value * 100}%`,
                          backgroundColor: AXIS_COLORS[key],
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-[var(--ink-subtle)] mt-4 text-center">
              Colored bars show axis strength. Click anywhere to close.
            </p>
          </section>
        )}

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
