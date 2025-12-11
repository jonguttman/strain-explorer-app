"use client";

// =============================================================================
// TRIPDAR VISUAL ADMIN - COSMIC CONTROL COCKPIT (v2)
// =============================================================================
// A comprehensive tuning panel for the TripdarSporeRadar component.
// v2: Dark cosmic theme matching the main Golden Aura UI, improved labels,
// better layout hierarchy, and radarBrightness control.
// =============================================================================

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { TraitAxisId, TripdarVisualSkin } from "@/lib/types";
import type { GoldenAuraSkinOverrides } from "@/lib/tripdarPreset";
import {
  TripdarSporeRadar,
  type TripdarVisualOverrides,
} from "@/app/components/TripdarSporeRadar";
import { AXIS_LABELS, DEFAULT_VISUAL_OVERRIDES } from "@/lib/tripdarRadar";

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
  visualSkin: TripdarVisualSkin;
  goldenAuraOverrides: GoldenAuraSkinOverrides;
};

type PresetMeta = {
  id: PresetId;
  label: string;
  description: string;
};

// =============================================================================
// PRESET METADATA
// =============================================================================

const PRESET_META: PresetMeta[] = [
  { id: "gt-creative", label: "Golden Teacher", description: "Balanced creativity boost with moderate visuals" },
  { id: "pe-deep-introspection", label: "Penis Envy", description: "Intense inner journey with spiritual connection" },
  { id: "fmp-social", label: "Full Moon Party", description: "High energy social experience with euphoric lift" },
  { id: "amazonian-explorer", label: "Amazonian", description: "Well-rounded classic profile for adventurous trips" },
  { id: "low-values", label: "Low Values", description: "Test micro-dose appearance" },
  { id: "all-maxed", label: "Hero Dose", description: "Maximum values — hero dose territory" },
];

// =============================================================================
// DEFAULT OVERRIDES (v2 refined values)
// =============================================================================

const DEFAULT_GOLDEN_AURA_OVERRIDES: Required<GoldenAuraSkinOverrides> = {
  bloomIntensity: 0.65,
  grainOpacity: 0.025,
  plateGloss: 0.85,
  starBrightness: 1.0,
  radarStrokeWidth: 2.5,
  ringOpacity: 0.15,
  labelScale: 1.3,
  haloIntensity: 0.7,
  starfieldDensity: 0.6,
  radarBrightness: 0.95,
};

const PRESET_DEFAULTS: Record<PresetId, PresetState> = {
  "gt-creative": {
    axes: { visuals: 70, euphoria: 60, introspection: 55, creativity: 85, spiritual_depth: 45, sociability: 50 },
    animation: { speed: 1.4, intensity: 0.6 },
    visualOverrides: {},
    strainColor: "#f3b34c",
    visualSkin: "golden-aura",
    goldenAuraOverrides: {},
  },
  "pe-deep-introspection": {
    axes: { visuals: 65, euphoria: 50, introspection: 90, creativity: 55, spiritual_depth: 85, sociability: 25 },
    animation: { speed: 1.1, intensity: 0.75 },
    visualOverrides: { gillCount: 280, jaggednessMax: 0.05 },
    strainColor: "#8c6cae",
    visualSkin: "golden-aura",
    goldenAuraOverrides: {},
  },
  "fmp-social": {
    axes: { visuals: 80, euphoria: 85, introspection: 40, creativity: 70, spiritual_depth: 35, sociability: 90 },
    animation: { speed: 1.6, intensity: 0.7 },
    visualOverrides: { breathAmplitude: 0.04 },
    strainColor: "#cf2914",
    visualSkin: "golden-aura",
    goldenAuraOverrides: {},
  },
  "amazonian-explorer": {
    axes: { visuals: 60, euphoria: 55, introspection: 65, creativity: 70, spiritual_depth: 60, sociability: 55 },
    animation: { speed: 1.3, intensity: 0.55 },
    visualOverrides: {},
    strainColor: "#95a751",
    visualSkin: "golden-aura",
    goldenAuraOverrides: {},
  },
  "low-values": {
    axes: { visuals: 15, euphoria: 10, introspection: 20, creativity: 5, spiritual_depth: 12, sociability: 18 },
    animation: { speed: 1.0, intensity: 0.4 },
    visualOverrides: { lowValueShapingStrength: 1.0 },
    strainColor: "#9b8a7a",
    visualSkin: "golden-aura",
    goldenAuraOverrides: {},
  },
  "all-maxed": {
    axes: { visuals: 95, euphoria: 95, introspection: 95, creativity: 95, spiritual_depth: 95, sociability: 95 },
    animation: { speed: 1.8, intensity: 0.9 },
    visualOverrides: { gillCount: 320, jaggednessMax: 0.06, railMaxThickness: 12 },
    strainColor: "#7a5a3a",
    visualSkin: "golden-aura",
    goldenAuraOverrides: {},
  },
};

const AXIS_ORDER: TraitAxisId[] = [
  "visuals", "euphoria", "introspection", "creativity", "spiritual_depth", "sociability",
];

const LOCAL_STORAGE_KEY = "tripdarPresetStates";

// =============================================================================
// DARK THEME STYLES
// =============================================================================

const darkTheme = {
  bg: "#050505",
  bgGradient: "linear-gradient(180deg, #0a0806 0%, #050505 100%)",
  card: "rgba(255, 255, 255, 0.03)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  cardHover: "rgba(255, 255, 255, 0.06)",
  accent: "#f6c56f",
  accentSoft: "rgba(246, 197, 111, 0.15)",
  accentGlow: "rgba(246, 197, 111, 0.25)",
  text: "rgba(255, 255, 255, 0.9)",
  textSoft: "rgba(255, 255, 255, 0.55)",
  textMuted: "rgba(255, 255, 255, 0.35)",
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function Section({
  title,
  description,
  children,
  defaultOpen = true,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div 
      className="rounded-2xl overflow-hidden"
      style={{ 
        background: darkTheme.card,
        border: `1px solid ${darkTheme.cardBorder}`,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors"
        style={{ background: open ? darkTheme.accentSoft : "transparent" }}
      >
        <div className="flex flex-col items-start gap-0.5">
          <span 
            className="text-[11px] font-semibold tracking-[0.1em] uppercase"
            style={{ 
              color: open ? darkTheme.accent : darkTheme.text,
            }}
          >
            {title}
          </span>
          {description && (
            <span className="text-[9px]" style={{ color: darkTheme.textMuted }}>
              {description}
            </span>
          )}
        </div>
        <span style={{ color: darkTheme.textSoft }} className="text-sm font-light">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div 
          className="px-4 pb-4 space-y-4"
          style={{ borderTop: `1px solid ${darkTheme.cardBorder}` }}
        >
          <div className="pt-3" />
          {children}
        </div>
      )}
    </div>
  );
}

function SliderControl({
  label,
  description,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
}: {
  label: string;
  description?: string;
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
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <label className="text-[11px] font-medium" style={{ color: darkTheme.text }}>
            {label}
          </label>
          {description && (
            <span className="text-[9px]" style={{ color: darkTheme.textMuted }}>
              {description}
            </span>
          )}
        </div>
        <span 
          className="text-[10px] font-mono px-2 py-0.5 rounded-md"
          style={{ 
            background: darkTheme.accentSoft,
            color: darkTheme.accent,
          }}
        >
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
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${darkTheme.accent} 0%, ${darkTheme.accent} ${percent}%, ${darkTheme.cardBorder} ${percent}%, ${darkTheme.cardBorder} 100%)`,
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
      <span className="text-[11px] font-medium" style={{ color: darkTheme.text }}>{label}</span>
      <div
        className="w-9 h-5 rounded-full transition-colors flex items-center px-0.5"
        style={{ background: checked ? darkTheme.accent : darkTheme.cardBorder }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="w-4 h-4 rounded-full shadow transition-transform"
          style={{ 
            background: "#fff",
            transform: checked ? "translateX(16px)" : "translateX(0)",
          }}
        />
      </div>
    </label>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TripdarVisualAdminPage() {
  const [presetStates, setPresetStates] = useState<Record<PresetId, PresetState>>(PRESET_DEFAULTS);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const [activePresetId, setActivePresetId] = useState<PresetId>("gt-creative");
  const activePreset = presetStates[activePresetId];

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<PresetId, PresetState>;
        const merged: Record<PresetId, PresetState> = { ...PRESET_DEFAULTS };
        for (const key of Object.keys(PRESET_DEFAULTS) as PresetId[]) {
          if (parsed[key]) {
            merged[key] = {
              ...PRESET_DEFAULTS[key],
              ...parsed[key],
              axes: { ...PRESET_DEFAULTS[key].axes, ...parsed[key].axes },
              animation: { ...PRESET_DEFAULTS[key].animation, ...parsed[key].animation },
              visualOverrides: { ...PRESET_DEFAULTS[key].visualOverrides, ...parsed[key].visualOverrides },
              visualSkin: parsed[key].visualSkin ?? PRESET_DEFAULTS[key].visualSkin,
              goldenAuraOverrides: { ...PRESET_DEFAULTS[key].goldenAuraOverrides, ...(parsed[key].goldenAuraOverrides ?? {}) },
            };
          }
        }
        setPresetStates(merged);
      }
    } catch {
      // Ignore
    }
    setHasLoadedFromStorage(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!hasLoadedFromStorage) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(presetStates));
  }, [presetStates, hasLoadedFromStorage]);

  const updateActivePreset = useCallback((partial: Partial<PresetState>) => {
    setPresetStates(prev => ({
      ...prev,
      [activePresetId]: { ...prev[activePresetId], ...partial },
    }));
  }, [activePresetId]);

  const resetActivePreset = useCallback(() => {
    setPresetStates(prev => ({ ...prev, [activePresetId]: PRESET_DEFAULTS[activePresetId] }));
  }, [activePresetId]);

  // UI State
  const [spinKey, setSpinKey] = useState(0);
  const [spinAngle, setSpinAngle] = useState(0);
  const [showRails, setShowRails] = useState(true);
  const [showCast, setShowCast] = useState(true);
  const [showMark, setShowMark] = useState(true);

  const mergedOverrides: Required<TripdarVisualOverrides> = {
    ...DEFAULT_VISUAL_OVERRIDES,
    ...activePreset.visualOverrides,
  };

  const mergedGoldenAuraOverrides: Required<GoldenAuraSkinOverrides> = {
    ...DEFAULT_GOLDEN_AURA_OVERRIDES,
    ...activePreset.goldenAuraOverrides,
  };

  // Updaters
  const updateAxis = (axisId: TraitAxisId, value: number) => {
    updateActivePreset({ axes: { ...activePreset.axes, [axisId]: value } });
  };

  const updateGoldenAuraOverride = <K extends keyof GoldenAuraSkinOverrides>(key: K, value: GoldenAuraSkinOverrides[K]) => {
    updateActivePreset({ goldenAuraOverrides: { ...activePreset.goldenAuraOverrides, [key]: value } });
  };

  const updateVisualSkin = (skin: TripdarVisualSkin) => {
    updateActivePreset({ visualSkin: skin });
  };

  const handleSpinPreview = () => {
    const angle = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 60);
    setSpinAngle(angle);
    setSpinKey((k) => k + 1);
  };

  return (
    <main 
      className="min-h-screen"
      style={{ 
        background: darkTheme.bgGradient,
        color: darkTheme.text,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 
                className="text-2xl font-semibold tracking-wide"
                style={{ 
                  background: `linear-gradient(180deg, ${darkTheme.accent} 0%, #d4913f 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Tripdar Visual
              </h1>
              <p className="text-[11px] mt-1" style={{ color: darkTheme.textSoft }}>
                Fine-tune the radar visualization. Each preset is its own workspace.
              </p>
            </div>
            <Link 
              href="/"
              className="text-[11px] px-4 py-2 rounded-full transition-colors"
              style={{ 
                background: darkTheme.card,
                border: `1px solid ${darkTheme.cardBorder}`,
                color: darkTheme.textSoft,
              }}
            >
              ← Back to Tripdar
            </Link>
          </div>

          {/* Preset Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_META.map(({ id, label }) => {
              const isActive = activePresetId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActivePresetId(id)}
                  className="px-3 py-1.5 text-[10px] font-medium rounded-full transition-all"
                  style={{
                    background: isActive ? darkTheme.accent : darkTheme.card,
                    border: `1px solid ${isActive ? darkTheme.accent : darkTheme.cardBorder}`,
                    color: isActive ? "#1a1612" : darkTheme.textSoft,
                    boxShadow: isActive ? `0 4px 12px ${darkTheme.accentGlow}` : "none",
                  }}
                >
                  {label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={resetActivePreset}
              className="text-[10px] ml-2 underline transition-colors"
              style={{ color: darkTheme.textMuted }}
            >
              Reset preset
            </button>
          </div>
        </header>

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6">
          {/* LEFT PANEL */}
          <div className="space-y-4">
            {/* Skin Selector */}
            <Section title="Visual Skin" description="Choose the radar style">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateVisualSkin("classic")}
                  className="flex-1 px-3 py-2.5 text-[10px] font-medium rounded-xl transition-all"
                  style={{
                    background: activePreset.visualSkin === "classic" ? darkTheme.accent : darkTheme.card,
                    border: `1px solid ${activePreset.visualSkin === "classic" ? darkTheme.accent : darkTheme.cardBorder}`,
                    color: activePreset.visualSkin === "classic" ? "#1a1612" : darkTheme.textSoft,
                  }}
                >
                  Classic
                </button>
                <button
                  type="button"
                  onClick={() => updateVisualSkin("golden-aura")}
                  className="flex-1 px-3 py-2.5 text-[10px] font-medium rounded-xl transition-all"
                  style={{
                    background: activePreset.visualSkin === "golden-aura" ? darkTheme.accent : darkTheme.card,
                    border: `1px solid ${activePreset.visualSkin === "golden-aura" ? darkTheme.accent : darkTheme.cardBorder}`,
                    color: activePreset.visualSkin === "golden-aura" ? "#1a1612" : darkTheme.textSoft,
                  }}
                >
                  Golden Aura
                </button>
              </div>
            </Section>

            {/* Golden Aura Controls */}
            {activePreset.visualSkin === "golden-aura" && (
              <>
                <Section title="Plate & Geometry" description="Golden plate appearance">
                  <SliderControl
                    label="Golden Plate Shine"
                    description="Metallic sheen on the radar plate"
                    value={mergedGoldenAuraOverrides.plateGloss}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(v) => updateGoldenAuraOverride("plateGloss", v)}
                  />
                  <SliderControl
                    label="Guide Ring Visibility"
                    description="Concentric circles inside the plate"
                    value={mergedGoldenAuraOverrides.ringOpacity}
                    min={0}
                    max={0.5}
                    step={0.025}
                    onChange={(v) => updateGoldenAuraOverride("ringOpacity", v)}
                  />
                  <SliderControl
                    label="Radar Line Thickness"
                    description="Width of the main radar polygon"
                    value={mergedGoldenAuraOverrides.radarStrokeWidth}
                    min={1}
                    max={5}
                    step={0.25}
                    onChange={(v) => updateGoldenAuraOverride("radarStrokeWidth", v)}
                    formatValue={(v) => `${v}px`}
                  />
                  <SliderControl
                    label="Radar Line Brightness"
                    description="Contrast and glow of radar lines"
                    value={mergedGoldenAuraOverrides.radarBrightness ?? 0.95}
                    min={0.5}
                    max={1}
                    step={0.05}
                    onChange={(v) => updateGoldenAuraOverride("radarBrightness", v)}
                  />
                </Section>

                <Section title="Stars & Effects" description="Vertex stars and background">
                  <SliderControl
                    label="Vertex Star Glow"
                    description="Brightness of stars at data points"
                    value={mergedGoldenAuraOverrides.starBrightness}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(v) => updateGoldenAuraOverride("starBrightness", v)}
                  />
                  <SliderControl
                    label="Background Stars"
                    description="Twinkling starfield density"
                    value={mergedGoldenAuraOverrides.starfieldDensity}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(v) => updateGoldenAuraOverride("starfieldDensity", v)}
                    formatValue={(v) => v === 0 ? "Off" : `${(v * 100).toFixed(0)}%`}
                  />
                  <SliderControl
                    label="Backlight Halo"
                    description="Golden glow behind the plate"
                    value={mergedGoldenAuraOverrides.haloIntensity}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(v) => updateGoldenAuraOverride("haloIntensity", v)}
                  />
                </Section>

                <Section title="Background" description="Cosmic blur and grain">
                  <SliderControl
                    label="Background Glow"
                    description="Cosmic blur intensity"
                    value={mergedGoldenAuraOverrides.bloomIntensity}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(v) => updateGoldenAuraOverride("bloomIntensity", v)}
                  />
                  <SliderControl
                    label="Film Grain"
                    description="Subtle texture overlay"
                    value={mergedGoldenAuraOverrides.grainOpacity}
                    min={0}
                    max={0.1}
                    step={0.005}
                    onChange={(v) => updateGoldenAuraOverride("grainOpacity", v)}
                  />
                </Section>

                <Section title="Labels" description="Axis label appearance">
                  <SliderControl
                    label="Label Size"
                    description="Size of axis labels around radar"
                    value={mergedGoldenAuraOverrides.labelScale}
                    min={0.8}
                    max={1.5}
                    step={0.05}
                    onChange={(v) => updateGoldenAuraOverride("labelScale", v)}
                    formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                </Section>
              </>
            )}

            <Section title="Display Options" description="Toggle visibility" defaultOpen={false}>
              <ToggleControl label="Show Rails" checked={showRails} onChange={setShowRails} />
              <ToggleControl label="Show Aura Cast" checked={showCast} onChange={setShowCast} />
              <ToggleControl label="Show Center Mark" checked={showMark} onChange={setShowMark} />
            </Section>
          </div>

          {/* CENTER - Radar Preview */}
          <div className="lg:sticky lg:top-6 self-start">
            <div 
              className="rounded-3xl p-6 flex flex-col items-center"
              style={{ 
                background: darkTheme.card,
                border: `1px solid ${darkTheme.cardBorder}`,
              }}
            >
              <div className="w-full max-w-[400px]">
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
                  visualSkin={activePreset.visualSkin}
                  goldenAuraOverrides={activePreset.goldenAuraOverrides}
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-6 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleSpinPreview}
                  className="px-5 py-2 text-[11px] font-medium rounded-full transition-all"
                  style={{ 
                    background: darkTheme.card,
                    border: `1px solid ${darkTheme.cardBorder}`,
                    color: darkTheme.textSoft,
                  }}
                >
                  Spin Preview
                </button>
                <p className="text-[10px] text-center max-w-[280px]" style={{ color: darkTheme.textMuted }}>
                  {PRESET_META.find(p => p.id === activePresetId)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-4">
            <Section title="Trip Vibes" description="Experience dimension strength (0-100)">
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

            <Section title="Animation" description="Motion and texture" defaultOpen={false}>
              <SliderControl
                label="Tempo"
                description="Animation speed multiplier"
                value={activePreset.animation.speed}
                min={0.5}
                max={3}
                step={0.1}
                onChange={(v) => updateActivePreset({ animation: { ...activePreset.animation, speed: v } })}
                formatValue={(v) => `${v.toFixed(1)}×`}
              />
              <SliderControl
                label="Edge Sharpness"
                description="Gill pointiness intensity"
                value={activePreset.animation.intensity}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => updateActivePreset({ animation: { ...activePreset.animation, intensity: v } })}
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <SliderControl
                label="Spin Time"
                description="Directional spin duration"
                value={mergedOverrides.spinDurationMs}
                min={200}
                max={1200}
                step={50}
                onChange={(v) => updateActivePreset({ visualOverrides: { ...activePreset.visualOverrides, spinDurationMs: v } })}
                formatValue={(v) => `${v}ms`}
              />
            </Section>

            <Section title="Advanced" description="Fine-grained controls" defaultOpen={false}>
              <SliderControl
                label="Breath Depth"
                value={mergedOverrides.breathAmplitude}
                min={0}
                max={0.1}
                step={0.005}
                onChange={(v) => updateActivePreset({ visualOverrides: { ...activePreset.visualOverrides, breathAmplitude: v } })}
              />
              <SliderControl
                label="Organic Drift"
                value={mergedOverrides.noiseAmount}
                min={0}
                max={0.1}
                step={0.005}
                onChange={(v) => updateActivePreset({ visualOverrides: { ...activePreset.visualOverrides, noiseAmount: v } })}
              />
              <SliderControl
                label="Gill Count"
                value={mergedOverrides.gillCount}
                min={120}
                max={400}
                step={10}
                onChange={(v) => updateActivePreset({ visualOverrides: { ...activePreset.visualOverrides, gillCount: v } })}
              />
            </Section>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 flex justify-center gap-6 text-[10px]" style={{ color: darkTheme.textMuted }}>
          <Link href="/lab/spore-data-radar" className="hover:underline">Lab: Spore Radar</Link>
          <Link href="/lab/quadrant-rails" className="hover:underline">Lab: Quadrant Rails</Link>
          <Link href="/" className="hover:underline">Main Tripdar</Link>
        </footer>
      </div>
    </main>
  );
}
