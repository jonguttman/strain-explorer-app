"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import Link from "next/link";
import { SporePrint, type SporeAnimationMode } from "@/app/components/SporePrint";

const MODES: { id: SporeAnimationMode; label: string; description: string }[] = [
  { 
    id: "whole", 
    label: "Whole Print Breathing", 
    description: "Subtle inhale/exhale of the entire spore print." 
  },
  { 
    id: "gills", 
    label: "Pulsing Gills", 
    description: "Radial gills gently thicken and fade like shimmering spores." 
  },
  { 
    id: "aura", 
    label: "Breathing Aura", 
    description: "Soft halo behind the print that expands and contracts." 
  },
  { 
    id: "combo", 
    label: "Combo Mode", 
    description: "Whole print breathing plus a subtle aura for a magical feel." 
  },
];

function getIntensityLabel(value: number): string {
  if (value < 0.35) return "Subtle";
  if (value < 0.65) return "Medium";
  return "Strong";
}

export default function SporeAnimationsPage() {
  // Animation state
  const [mode, setMode] = useState<SporeAnimationMode>("combo");
  const [speed, setSpeed] = useState(1);
  const [intensity, setIntensity] = useState(0.7);
  const [clickBoost, setClickBoost] = useState(true);
  
  // Boost state for click interaction
  const [isBoosted, setIsBoosted] = useState(false);
  
  const handlePreviewClick = useCallback(() => {
    if (!clickBoost) return;
    setIsBoosted(true);
    const timeout = window.setTimeout(() => setIsBoosted(false), 900);
    return () => window.clearTimeout(timeout);
  }, [clickBoost]);

  // Compute effective values for main preview
  const effectiveSpeed = isBoosted ? speed * 1.6 : speed;
  const effectiveIntensity = isBoosted ? Math.min(1, intensity + 0.25) : intensity;

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-8 py-6 space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-[#3e2b1a] flex items-center justify-center text-[18px]">
            🍄
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[var(--ink-main)]">
              Spore Print Animation Lab
            </h1>
            <p className="text-sm text-[var(--ink-soft)]">
              Tweak speed, intensity, and click behavior for the Tripdar spore print
            </p>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 sm:p-5">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--ink-subtle)] mb-4">
          Animation Controls
        </p>
        
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Speed slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="speed" className="text-sm font-medium text-[var(--ink-main)]">
                Speed
              </label>
              <span className="text-xs font-mono text-[var(--accent)] bg-[var(--accent-pill)] px-2 py-0.5 rounded">
                {speed.toFixed(1)}×
              </span>
            </div>
            <input
              id="speed"
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
              <span>0.5× Slow</span>
              <span>2× Fast</span>
            </div>
          </div>

          {/* Intensity slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="intensity" className="text-sm font-medium text-[var(--ink-main)]">
                Intensity
              </label>
              <span className="text-xs font-medium text-[var(--ink-soft)] bg-[var(--accent-pill)] px-2 py-0.5 rounded">
                {getIntensityLabel(intensity)}
              </span>
            </div>
            <input
              id="intensity"
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
              <span>Subtle</span>
              <span>Max</span>
            </div>
          </div>

          {/* Click boost toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="clickBoost" className="text-sm font-medium text-[var(--ink-main)]">
                Click Boost
              </label>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  id="clickBoost"
                  type="checkbox"
                  checked={clickBoost}
                  onChange={(e) => setClickBoost(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 rounded-full transition-colors bg-[var(--card-border)] peer-checked:bg-[var(--accent)]" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-xs text-[var(--ink-soft)]">
                {clickBoost ? "Boost on click" : "Click disabled"}
              </span>
            </label>
            <p className="text-[10px] text-[var(--ink-subtle)]">
              Click the preview for a brief intensity pulse
            </p>
          </div>
        </div>
      </section>

      {/* Big preview - clickable when boost enabled */}
      <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 sm:p-8 flex flex-col items-center">
        <div className="mb-4 text-center">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--ink-subtle)]">
            {isBoosted ? "✨ Boosted!" : "Active Mode"}
          </p>
          <p className="text-base font-medium text-[var(--ink-main)] mt-1">
            {MODES.find(m => m.id === mode)?.label}
          </p>
        </div>
        
        <button
          type="button"
          onClick={handlePreviewClick}
          disabled={!clickBoost}
          className={[
            "relative inline-flex items-center justify-center rounded-full border transition-all duration-300",
            clickBoost 
              ? "cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]" 
              : "cursor-default",
            isBoosted 
              ? "border-[var(--accent)] bg-[var(--accent-pill)] shadow-lg ring-4 ring-[var(--accent)]/20" 
              : "border-[var(--card-border)] bg-[var(--card-inner)]",
          ].join(" ")}
          style={{ padding: "1.5rem" }}
        >
          <SporePrint 
            size={260} 
            animation={mode}
            speedScale={effectiveSpeed}
            intensity={effectiveIntensity}
            strokeColor="#b48a5a"
            centerFill="#fdf1dd"
          />
        </button>

        <p className="mt-4 text-sm text-[var(--ink-soft)] text-center max-w-md">
          {MODES.find(m => m.id === mode)?.description}
        </p>
        
        {clickBoost && (
          <p className="mt-2 text-xs text-[var(--ink-subtle)]">
            👆 Click the spore print to see a boost effect
          </p>
        )}
      </section>

      {/* Mode selector grid with mini previews */}
      <section>
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--ink-subtle)] mb-3">
          Animation Modes
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map((modeItem) => {
            const isActive = mode === modeItem.id;
            return (
              <button
                key={modeItem.id}
                type="button"
                onClick={() => setMode(modeItem.id)}
                className={[
                  "group flex flex-col items-center rounded-2xl border p-4 transition-all duration-200",
                  isActive
                    ? "border-[var(--accent)] bg-[var(--card-inner)] shadow-md ring-2 ring-[var(--accent)]/20"
                    : "border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent)]/60 hover:shadow-sm"
                ].join(" ")}
              >
                <div className="mb-3">
                  {/* Mini previews use current speed/intensity but no click boost */}
                  <SporePrint 
                    size={96} 
                    animation={modeItem.id}
                    speedScale={speed}
                    intensity={intensity}
                    strokeColor="#b48a5a"
                    centerFill="#fdf1dd"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className={[
                    "text-xs font-semibold tracking-wide uppercase transition-colors",
                    isActive ? "text-[var(--accent)]" : "text-[var(--ink-main)]"
                  ].join(" ")}>
                    {modeItem.label}
                  </p>
                  <p className="text-[11px] text-[var(--ink-soft)] leading-snug">
                    {modeItem.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Static (no animation) comparison */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <SporePrint 
            size={80} 
            animation="none"
            strokeColor="#b48a5a"
            centerFill="#fdf1dd"
          />
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--ink-subtle)]">
              Static Reference
            </p>
            <p className="text-sm text-[var(--ink-soft)] mt-1">
              Compare with the static version (no animation) to see the effect of each mode.
            </p>
          </div>
        </div>
      </section>

      {/* Back link */}
      <footer className="text-center pt-4">
        <Link 
          href="/"
          className="text-sm text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors"
        >
          ← Back to Tripdar
        </Link>
      </footer>
    </main>
  );
}
