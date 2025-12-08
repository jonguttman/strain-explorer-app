/**
 * ThemeAwareModeSwitch.tsx
 * 
 * Phase 8B: Enhanced mode switch with Cosmic theme preset support
 * 
 * When cosmic theme is enabled, provides:
 * - Primary toggle: Visual/Details (existing behavior)
 * - Secondary control: Preset selector (cosmic/apothecary/minimal)
 */

"use client";

import React from "react";
import type { CosmicPresetId } from "@/app/cosmic-theme/config/cosmicThemeVisualPresets";

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = "visual" | "details";

interface ThemeAwareModeSwitchProps {
  /** Current view mode */
  mode: ViewMode;
  
  /** View mode change handler */
  onModeChange: (mode: ViewMode) => void;
  
  /** Whether cosmic theme is enabled */
  cosmicEnabled?: boolean;
  
  /** Current cosmic preset ID */
  presetId?: CosmicPresetId;
  
  /** Preset change handler */
  onPresetChange?: (id: CosmicPresetId) => void;
  
  /** Whether to show preset selector (only shown in visual mode) */
  showPresetSelector?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ThemeAwareModeSwitch({
  mode,
  onModeChange,
  cosmicEnabled = false,
  presetId = "cosmic",
  onPresetChange,
  showPresetSelector = true,
}: ThemeAwareModeSwitchProps) {
  const isVisual = mode === "visual";
  
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Primary mode toggle */}
      <div 
        className="inline-flex rounded-full p-1 shadow-inner"
        style={{ background: "var(--card-inner)" }}
      >
        <button
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            isVisual ? "shadow-sm" : ""
          }`}
          style={{ 
            background: isVisual ? "white" : "transparent",
            color: isVisual ? "var(--accent)" : "var(--ink-soft)",
          }}
          onClick={() => onModeChange("visual")}
        >
          Visual
        </button>
        <button
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            !isVisual ? "shadow-sm" : ""
          }`}
          style={{ 
            background: !isVisual ? "white" : "transparent",
            color: !isVisual ? "var(--accent)" : "var(--ink-soft)",
          }}
          onClick={() => onModeChange("details")}
        >
          Details
        </button>
      </div>
      
      {/* Preset selector - only shown when cosmic enabled, in visual mode */}
      {cosmicEnabled && isVisual && showPresetSelector && onPresetChange && (
        <PresetSelector
          presetId={presetId}
          onSelect={onPresetChange}
        />
      )}
    </div>
  );
}

// ============================================================================
// PRESET SELECTOR
// ============================================================================

interface PresetSelectorProps {
  presetId: CosmicPresetId;
  onSelect: (id: CosmicPresetId) => void;
}

const PRESET_OPTIONS: { id: CosmicPresetId; label: string; icon: string }[] = [
  { id: "cosmic", label: "Cosmic", icon: "✦" },
  { id: "apothecary", label: "Apothecary", icon: "⚗" },
  { id: "minimal", label: "Minimal", icon: "○" },
];

function PresetSelector({ presetId, onSelect }: PresetSelectorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span 
        className="text-[10px] uppercase tracking-wider mr-1"
        style={{ color: "var(--ink-soft)" }}
      >
        Style
      </span>
      <div className="flex gap-0.5">
        {PRESET_OPTIONS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              presetId === preset.id 
                ? "shadow-sm" 
                : "opacity-60 hover:opacity-100"
            }`}
            style={{
              background: presetId === preset.id ? "var(--accent-pill)" : "transparent",
              color: presetId === preset.id ? "var(--ink-main)" : "var(--ink-soft)",
            }}
            title={preset.label}
          >
            <span className="mr-1">{preset.icon}</span>
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

interface CompactPresetToggleProps {
  presetId: CosmicPresetId;
  onSelect: (id: CosmicPresetId) => void;
}

/**
 * Compact preset toggle for space-constrained layouts
 */
export function CompactPresetToggle({ presetId, onSelect }: CompactPresetToggleProps) {
  const currentIndex = PRESET_OPTIONS.findIndex(p => p.id === presetId);
  
  const cyclePreset = () => {
    const nextIndex = (currentIndex + 1) % PRESET_OPTIONS.length;
    onSelect(PRESET_OPTIONS[nextIndex].id);
  };
  
  const current = PRESET_OPTIONS[currentIndex] ?? PRESET_OPTIONS[0];
  
  return (
    <button
      onClick={cyclePreset}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all hover:opacity-80"
      style={{
        background: "var(--accent-pill)",
        color: "var(--ink-soft)",
      }}
      title={`Current: ${current.label}. Click to cycle.`}
    >
      <span>{current.icon}</span>
      <span className="uppercase tracking-wider">{current.label}</span>
    </button>
  );
}

export default ThemeAwareModeSwitch;
