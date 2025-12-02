"use client";

// =============================================================================
// TRIPDAR VISUAL ADMIN - CONTROL COCKPIT
// =============================================================================
// A comprehensive tuning panel for the TripdarSporeRadar component.
// Each preset acts as its own "workspace" — tweaks are remembered per-preset.
//
// Features:
// - Sticky center preview on desktop
// - Per-preset state with localStorage persistence
// - Psilly/Tripdar-flavored copy
// - Collapsible control sections
// - Export config for lib/tripdarPreset.ts
// =============================================================================

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { TraitAxisId } from "@/lib/types";
import {
  TripdarSporeRadar,
  type TripdarVisualOverrides,
} from "@/app/components/TripdarSporeRadar";
import { AXIS_LABELS, DEFAULT_VISUAL_OVERRIDES } from "@/lib/tripdarRadar";
import { AdminHeader } from "../AdminHeader";

// =============================================================================
// TYPES
// =============================================================================

type PresetId =
  | "gt-creative"
  | "pe-deep-introspection"
  | "fmp-social"
  | "amazonian-explorer"
  | "low-values"
  | "all-maxed";

type PresetState = {
  axes: Record<TraitAxisId, number>;
  animation: { speed: number; intensity: number };
  visualOverrides: TripdarVisualOverrides;
  strainColor: string;
};

type PresetMeta = {
  id: PresetId;
  label: string;
  description: string;
};

// =============================================================================
// PRESET METADATA (display info only)
// =============================================================================

const PRESET_META: PresetMeta[] = [
  { id: "gt-creative", label: "Golden Teacher · Creative", description: "Balanced creativity boost with moderate visuals" },
  { id: "pe-deep-introspection", label: "Penis Envy · Deep", description: "Intense inner journey with strong spiritual connection" },
  { id: "fmp-social", label: "Full Moon · Social", description: "High energy social experience with euphoric lift" },
  { id: "amazonian-explorer", label: "Amazonian · Explorer", description: "Well-rounded classic profile for adventurous trips" },
  { id: "low-values", label: "Low Values Test", description: "Test how shapeAxisValue handles micro-dose values" },
  { id: "all-maxed", label: "All Maxed · Hero", description: "Maximum values across all axes — hero dose territory" },
];

// =============================================================================
// PRESET DEFAULTS (the original/reset values for each preset)
// =============================================================================

const PRESET_DEFAULTS: Record<PresetId, PresetState> = {
  "gt-creative": {
    axes: { visuals: 70, euphoria: 60, introspection: 55, creativity: 85, spiritual_depth: 45, sociability: 50 },
    animation: { speed: 1.4, intensity: 0.6 },
    visualOverrides: {},
    strainColor: "#f3b34c",
  },
  "pe-deep-introspection": {
    axes: { visuals: 65, euphoria: 50, introspection: 90, creativity: 55, spiritual_depth: 85, sociability: 25 },
    animation: { speed: 1.1, intensity: 0.75 },
    visualOverrides: { gillCount: 280, jaggednessMax: 0.05 },
    strainColor: "#8c6cae",
  },
  "fmp-social": {
    axes: { visuals: 80, euphoria: 85, introspection: 40, creativity: 70, spiritual_depth: 35, sociability: 90 },
    animation: { speed: 1.6, intensity: 0.7 },
    visualOverrides: { breathAmplitude: 0.04 },
    strainColor: "#cf2914",
  },
  "amazonian-explorer": {
    axes: { visuals: 60, euphoria: 55, introspection: 65, creativity: 70, spiritual_depth: 60, sociability: 55 },
    animation: { speed: 1.3, intensity: 0.55 },
    visualOverrides: {},
    strainColor: "#95a751",
  },
  "low-values": {
    axes: { visuals: 15, euphoria: 10, introspection: 20, creativity: 5, spiritual_depth: 12, sociability: 18 },
    animation: { speed: 1.0, intensity: 0.4 },
    visualOverrides: { lowValueShapingStrength: 1.0 },
    strainColor: "#9b8a7a",
  },
  "all-maxed": {
    axes: { visuals: 95, euphoria: 95, introspection: 95, creativity: 95, spiritual_depth: 95, sociability: 95 },
    animation: { speed: 1.8, intensity: 0.9 },
    visualOverrides: { gillCount: 320, jaggednessMax: 0.06, railMaxThickness: 12 },
    strainColor: "#7a5a3a",
  },
};

// =============================================================================
// CONSTANTS
// =============================================================================

const AXIS_ORDER: TraitAxisId[] = [
  "visuals", "euphoria", "introspection", "creativity", "spiritual_depth", "sociability",
];

const LOCAL_STORAGE_KEY = "tripdarPresetStates";

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function Section({
  title,
  helper,
  children,
  defaultOpen = true,
}: {
  title: string;
  helper?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[var(--card-border)] rounded-xl bg-[var(--card-bg)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-[var(--accent-pill)] transition-colors"
      >
        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--ink-subtle)]">
          {title}
        </span>
        <span className="text-[var(--ink-soft)] text-sm">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-[var(--card-border)]">
          {helper && (
            <p className="text-[9px] text-[var(--ink-soft)] pt-2 -mb-1">{helper}</p>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}) {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(step < 1 ? 2 : 0);
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-medium text-[var(--ink-main)]">{label}</label>
        <span className="text-[9px] font-mono text-[var(--accent)] bg-[var(--accent-pill)] px-1.5 py-0.5 rounded">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${percent}%, var(--card-border) ${percent}%, var(--card-border) 100%)`,
        }}
      />
    </div>
  );
}

function ToggleControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1">
      <span className="text-[10px] font-medium text-[var(--ink-main)]">{label}</span>
      <div
        className={`w-8 h-4 rounded-full transition-colors ${checked ? "bg-[var(--accent)]" : "bg-[var(--card-border)]"}`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`w-3 h-3 rounded-full bg-white shadow transition-transform mt-0.5 ${checked ? "translate-x-4.5 ml-0.5" : "translate-x-0.5"}`}
        />
      </div>
    </label>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TripdarVisualAdminPage() {
  // ==========================================================================
  // PER-PRESET STATE (each preset is its own workspace)
  // ==========================================================================
  const [presetStates, setPresetStates] = useState<Record<PresetId, PresetState>>(() => {
    if (typeof window === "undefined") return PRESET_DEFAULTS;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<PresetId, PresetState>;
        // Merge with defaults so new fields still get defaults
        const merged: Record<PresetId, PresetState> = { ...PRESET_DEFAULTS };
        for (const key of Object.keys(PRESET_DEFAULTS) as PresetId[]) {
          if (parsed[key]) {
            merged[key] = {
              ...PRESET_DEFAULTS[key],
              ...parsed[key],
              axes: { ...PRESET_DEFAULTS[key].axes, ...parsed[key].axes },
              animation: { ...PRESET_DEFAULTS[key].animation, ...parsed[key].animation },
              visualOverrides: { ...PRESET_DEFAULTS[key].visualOverrides, ...parsed[key].visualOverrides },
            };
          }
        }
        return merged;
      }
    } catch {}
    return PRESET_DEFAULTS;
  });

  const [activePresetId, setActivePresetId] = useState<PresetId>("gt-creative");
  const activePreset = presetStates[activePresetId];

  // Persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(presetStates));
  }, [presetStates]);

  // Update active preset helper
  const updateActivePreset = useCallback((partial: Partial<PresetState>) => {
    setPresetStates(prev => ({
      ...prev,
      [activePresetId]: {
        ...prev[activePresetId],
        ...partial,
      },
    }));
  }, [activePresetId]);

  // Reset current preset to defaults
  const resetActivePreset = useCallback(() => {
    setPresetStates(prev => ({
      ...prev,
      [activePresetId]: PRESET_DEFAULTS[activePresetId],
    }));
  }, [activePresetId]);

  // ==========================================================================
  // UI STATE
  // ==========================================================================
  const [spinKey, setSpinKey] = useState(0);
  const [spinAngle, setSpinAngle] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [showRails, setShowRails] = useState(true);
  const [showCast, setShowCast] = useState(true);
  const [showMark, setShowMark] = useState(true);

  // Merged overrides for display
  const mergedOverrides: Required<TripdarVisualOverrides> = {
    ...DEFAULT_VISUAL_OVERRIDES,
    ...activePreset.visualOverrides,
  };

  // ==========================================================================
  // UPDATERS
  // ==========================================================================
  const updateAxis = (axisId: TraitAxisId, value: number) => {
    updateActivePreset({ axes: { ...activePreset.axes, [axisId]: value } });
  };

  const updateAnimation = (key: keyof PresetState["animation"], value: number) => {
    updateActivePreset({ animation: { ...activePreset.animation, [key]: value } });
  };

  const updateOverride = <K extends keyof TripdarVisualOverrides>(key: K, value: TripdarVisualOverrides[K]) => {
    updateActivePreset({ visualOverrides: { ...activePreset.visualOverrides, [key]: value } });
  };

  const updateStrainColor = (color: string) => {
    updateActivePreset({ strainColor: color });
  };

  // ==========================================================================
  // ACTIONS
  // ==========================================================================
  const handleSpinPreview = () => {
    const angle = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 60);
    setSpinAngle(angle);
    setSpinKey((k) => k + 1);
  };

  // ==========================================================================
  // EXPORT CONFIG
  // ==========================================================================
  const exportConfig = `// lib/tripdarPreset.ts
// Generated from Tripdar Visual Admin

import type { TripdarVisualOverrides } from "./tripdarRadar";

export type TripdarPreset = {
  speed: number;
  intensity: number;
};

export const TRIPDAR_PRESET: TripdarPreset = {
  speed: ${activePreset.animation.speed.toFixed(2)},
  intensity: ${activePreset.animation.intensity.toFixed(2)},
};

export const TRIPDAR_VISUAL_OVERRIDES: TripdarVisualOverrides = ${JSON.stringify(activePreset.visualOverrides, null, 2)};

// Axes for "${PRESET_META.find(p => p.id === activePresetId)?.label}"
export const EXAMPLE_AXES = {
  visuals: ${activePreset.axes.visuals},
  euphoria: ${activePreset.axes.euphoria},
  introspection: ${activePreset.axes.introspection},
  creativity: ${activePreset.axes.creativity},
  spiritual_depth: ${activePreset.axes.spiritual_depth},
  sociability: ${activePreset.axes.sociability},
};

// Strain color: "${activePreset.strainColor}"
`;

  const handleCopyExport = () => {
    void navigator.clipboard.writeText(exportConfig);
    alert("Config copied to clipboard!");
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <main className="min-h-screen bg-[var(--shell-bg)] text-[var(--ink-main)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4">
        {/* Shared Admin Header */}
        <AdminHeader />

        {/* Page Title */}
        <header className="mb-4">
          <h1 className="text-xl font-semibold">Tripdar Visual</h1>
          <p className="text-xs text-[var(--ink-soft)] mt-1">
            Fine-tune every aspect of the radar visualization. Each preset is its own workspace.
          </p>
        </header>

        {/* Preset Pills + Reset */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {PRESET_META.map(({ id, label }) => {
            const isActive = activePresetId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActivePresetId(id)}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-full border transition-all ${
                  isActive
                    ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                    : "bg-[var(--card-inner)] border-[var(--card-border)] text-[var(--ink-soft)] hover:border-[var(--accent)]"
                }`}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={resetActivePreset}
            className="text-[10px] text-[var(--ink-soft)] underline ml-2 hover:text-[var(--accent)]"
          >
            Reset this preset to default
          </button>
        </div>

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-4">
          {/* LEFT PANEL - Trip Motion & Appearance */}
          <div className="space-y-3">
            <Section
              title="Trip Motion & Texture"
              helper="Control how alive and textured the spore print feels."
            >
              <SliderControl
                label="Tempo"
                value={activePreset.animation.speed}
                min={0.5}
                max={3}
                step={0.1}
                onChange={(v) => updateAnimation("speed", v)}
                formatValue={(v) => `${v.toFixed(1)}×`}
              />
              <SliderControl
                label="Edge Sharpness"
                value={activePreset.animation.intensity}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => updateAnimation("intensity", v)}
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <SliderControl
                label="Spin Time"
                value={mergedOverrides.spinDurationMs}
                min={200}
                max={1200}
                step={50}
                onChange={(v) => updateOverride("spinDurationMs", v)}
                formatValue={(v) => `${v}ms`}
              />
              <SliderControl
                label="Breath Depth"
                value={mergedOverrides.breathAmplitude}
                min={0}
                max={0.1}
                step={0.005}
                onChange={(v) => updateOverride("breathAmplitude", v)}
              />
              <SliderControl
                label="Organic Drift"
                value={mergedOverrides.noiseAmount}
                min={0}
                max={0.1}
                step={0.005}
                onChange={(v) => updateOverride("noiseAmount", v)}
              />
              <SliderControl
                label="Drift Speed"
                value={mergedOverrides.noiseSpeed}
                min={0}
                max={2}
                step={0.1}
                onChange={(v) => updateOverride("noiseSpeed", v)}
              />
            </Section>

            <Section
              title="Aura & Vibe Cast"
              helper="Tune the soft color wash behind the gills."
            >
              <ToggleControl
                label="Enable Aura"
                checked={mergedOverrides.castEnabled}
                onChange={(v) => updateOverride("castEnabled", v)}
              />
              <SliderControl
                label="Aura Strength"
                value={mergedOverrides.castBaseOpacity}
                min={0}
                max={0.25}
                step={0.01}
                onChange={(v) => updateOverride("castBaseOpacity", v)}
              />
              <SliderControl
                label="Aura Start Radius"
                value={mergedOverrides.castInnerRadius}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => updateOverride("castInnerRadius", v)}
              />
              <SliderControl
                label="Aura Reach Radius"
                value={mergedOverrides.castOuterRadius}
                min={0.5}
                max={1}
                step={0.01}
                onChange={(v) => updateOverride("castOuterRadius", v)}
              />
              <SliderControl
                label="Aura Blend Amount"
                value={mergedOverrides.castBlendStrength}
                min={0}
                max={1}
                step={0.1}
                onChange={(v) => updateOverride("castBlendStrength", v)}
              />
            </Section>

            <Section title="Appearance" defaultOpen={false}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-[var(--ink-main)]">Strain Color</span>
                <input
                  type="color"
                  value={activePreset.strainColor}
                  onChange={(e) => updateStrainColor(e.target.value)}
                  className="w-6 h-6 rounded border border-[var(--card-border)] cursor-pointer"
                />
                <span className="text-[9px] font-mono text-[var(--ink-soft)]">{activePreset.strainColor}</span>
              </div>
              <ToggleControl label="Show Rails" checked={showRails} onChange={setShowRails} />
              <ToggleControl label="Show Aura Cast" checked={showCast} onChange={setShowCast} />
              <ToggleControl label="Show Center Mark" checked={showMark} onChange={setShowMark} />
            </Section>
          </div>

          {/* CENTER - Sticky Radar Preview */}
          <div className="lg:sticky lg:top-6 self-start">
            <div className="rounded-[24px] border border-[var(--card-border)] bg-[var(--card-bg)] p-4 sm:p-6">
              <TripdarSporeRadar
                axes={activePreset.axes}
                strainColor={activePreset.strainColor}
                animationPreset={activePreset.animation}
                showQuadrantRails={showRails}
                showVibeCast={showCast}
                showCenterMark={showMark}
                spinAngle={spinAngle}
                spinKey={spinKey}
                visualOverrides={activePreset.visualOverrides}
                className="w-full h-auto"
              />
              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleSpinPreview}
                  className="px-4 py-1.5 text-[10px] font-medium rounded-full border border-[var(--card-border)] bg-[var(--card-inner)] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  🔄 Spin Preview
                </button>
                <p className="text-[9px] text-[var(--ink-soft)] text-center">
                  {PRESET_META.find(p => p.id === activePresetId)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Vibes, Rails, Gills */}
          <div className="space-y-3">
            <Section
              title="Trip Vibes (0–100)"
              helper="Set the strength of each experience dimension."
            >
              {AXIS_ORDER.map((axisId) => (
                <SliderControl
                  key={axisId}
                  label={AXIS_LABELS[axisId]}
                  value={activePreset.axes[axisId]}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(v) => updateAxis(axisId, v)}
                  formatValue={(v) => `${v}%`}
                />
              ))}
            </Section>

            <Section
              title="Dose Rails & Markers"
              helper="Adjust the outer rails that show vibe strength at a glance."
            >
              <SliderControl
                label="Rail Width (Min)"
                value={mergedOverrides.railMinAngleWidth}
                min={2}
                max={20}
                step={1}
                onChange={(v) => updateOverride("railMinAngleWidth", v)}
                formatValue={(v) => `${v}°`}
              />
              <SliderControl
                label="Rail Width (Max)"
                value={mergedOverrides.railMaxAngleWidth}
                min={20}
                max={70}
                step={1}
                onChange={(v) => updateOverride("railMaxAngleWidth", v)}
                formatValue={(v) => `${v}°`}
              />
              <SliderControl
                label="Rail Thickness (Min)"
                value={mergedOverrides.railMinThickness}
                min={1}
                max={8}
                step={0.5}
                onChange={(v) => updateOverride("railMinThickness", v)}
                formatValue={(v) => `${v}px`}
              />
              <SliderControl
                label="Rail Thickness (Max)"
                value={mergedOverrides.railMaxThickness}
                min={4}
                max={16}
                step={0.5}
                onChange={(v) => updateOverride("railMaxThickness", v)}
                formatValue={(v) => `${v}px`}
              />
              <SliderControl
                label="Rail Fade (Min)"
                value={mergedOverrides.railMinOpacity}
                min={0.1}
                max={0.8}
                step={0.05}
                onChange={(v) => updateOverride("railMinOpacity", v)}
              />
              <SliderControl
                label="Rail Fade (Max)"
                value={mergedOverrides.railMaxOpacity}
                min={0.5}
                max={1}
                step={0.05}
                onChange={(v) => updateOverride("railMaxOpacity", v)}
              />
              <SliderControl
                label="Bounce Threshold"
                value={mergedOverrides.railEdgeBounceThreshold}
                min={0.5}
                max={1}
                step={0.05}
                onChange={(v) => updateOverride("railEdgeBounceThreshold", v)}
              />
              <SliderControl
                label="Bounce Amount"
                value={mergedOverrides.railEdgeBounceAmount}
                min={0}
                max={0.2}
                step={0.01}
                onChange={(v) => updateOverride("railEdgeBounceAmount", v)}
              />
              <SliderControl
                label="Rail Radius Offset"
                value={mergedOverrides.railRadiusOffset}
                min={-10}
                max={20}
                step={1}
                onChange={(v) => updateOverride("railRadiusOffset", v)}
                formatValue={(v) => `${v}px`}
              />
            </Section>

            <Section title="Gills & Spore Texture" defaultOpen={false} helper="Fine-tune gill density and jaggedness.">
              <SliderControl
                label="Gill Count"
                value={mergedOverrides.gillCount}
                min={120}
                max={400}
                step={10}
                onChange={(v) => updateOverride("gillCount", v)}
              />
              <SliderControl
                label="Gill Thickness (Base)"
                value={mergedOverrides.gillBaseThickness}
                min={0.2}
                max={1}
                step={0.1}
                onChange={(v) => updateOverride("gillBaseThickness", v)}
                formatValue={(v) => `${v}px`}
              />
              <SliderControl
                label="Gill Thickness (Max)"
                value={mergedOverrides.gillMaxThickness}
                min={0.5}
                max={2}
                step={0.1}
                onChange={(v) => updateOverride("gillMaxThickness", v)}
                formatValue={(v) => `${v}px`}
              />
              <SliderControl
                label="Jaggedness (Min)"
                value={mergedOverrides.jaggednessMin}
                min={0}
                max={0.02}
                step={0.001}
                onChange={(v) => updateOverride("jaggednessMin", v)}
              />
              <SliderControl
                label="Jaggedness (Max)"
                value={mergedOverrides.jaggednessMax}
                min={0.01}
                max={0.1}
                step={0.005}
                onChange={(v) => updateOverride("jaggednessMax", v)}
              />
              <SliderControl
                label="Low-Value Shaping"
                value={mergedOverrides.lowValueShapingStrength}
                min={0}
                max={1}
                step={0.1}
                onChange={(v) => updateOverride("lowValueShapingStrength", v)}
              />
              <SliderControl
                label="Low-Value Baseline"
                value={mergedOverrides.lowValueBaseline}
                min={0}
                max={0.2}
                step={0.01}
                onChange={(v) => updateOverride("lowValueBaseline", v)}
              />
            </Section>
          </div>
        </div>

        {/* Bottom Actions */}
        <section className="mt-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[var(--ink-soft)]">
              Editing: <span className="font-medium text-[var(--ink-main)]">{PRESET_META.find(p => p.id === activePresetId)?.label}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowExport(!showExport)}
              className="px-3 py-1.5 text-[10px] font-medium rounded-full border border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              📋 Apply to Main Tripdar
            </button>
          </div>

          {showExport && (
            <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--ink-subtle)]">
                  Export Config
                </span>
                <button type="button" onClick={handleCopyExport} className="text-[10px] text-[var(--accent)] hover:underline">
                  Copy to clipboard
                </button>
              </div>
              <pre className="p-2 rounded-lg bg-[var(--card-inner)] border border-[var(--card-border)] text-[9px] font-mono text-[var(--ink-soft)] overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                {exportConfig}
              </pre>
            </div>
          )}
        </section>

        {/* Footer Links */}
        <footer className="mt-6 flex justify-center gap-4 text-[10px] text-[var(--ink-soft)]">
          <Link href="/lab/spore-data-radar" className="hover:text-[var(--accent)]">Lab: Spore Radar</Link>
          <Link href="/lab/quadrant-rails" className="hover:text-[var(--accent)]">Lab: Quadrant Rails</Link>
          <Link href="/lab/dose-visual-lab" className="hover:text-[var(--accent)]">Lab: Dose Visual</Link>
        </footer>
      </div>
    </main>
  );
}
