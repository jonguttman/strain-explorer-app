"use client";

import * as React from "react";
import { SporePrint } from "@/app/components/SporePrint";

type StrainMeta = {
  id: string;
  name: string;
  effect: string;
  dose: string; // e.g. "Macro · 1.5 g"
};

const LAB_STRAINS: StrainMeta[] = [
  { id: "golden-teacher", name: "Golden Teacher", effect: "Create", dose: "Macro · 1.5 g" },
  { id: "penis-envy",     name: "Penis Envy",     effect: "Transform", dose: "Macro · 1.5 g" },
  { id: "amazonian",      name: "Amazonian",      effect: "Energize",  dose: "Macro · 1.5 g" },
  { id: "enigma",         name: "Enigma",         effect: "Transcendent", dose: "Macro · 1.5 g" },
  { id: "full-moon-party",name: "Full Moon Party",effect: "Connect",   dose: "Macro · 1.5 g" },
];

export default function SporeDialLabPage() {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const active = LAB_STRAINS[activeIndex];

  // Rotation angle based on index (evenly spaced around the circle)
  const anglePerStrain = 360 / LAB_STRAINS.length;
  const rotation = activeIndex * anglePerStrain;

  // Simple swipe left/right to change strains
  const touchStartX = React.useRef<number | null>(null);

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(delta) > 40) {
      // swipe right → previous, swipe left → next
      setActiveIndex((prev) => {
        if (delta > 0) {
          return (prev - 1 + LAB_STRAINS.length) % LAB_STRAINS.length;
        }
        return (prev + 1) % LAB_STRAINS.length;
      });
    }

    touchStartX.current = null;
  };

  return (
    <main className="min-h-screen bg-[var(--shell-bg,#f5eee1)] text-[var(--ink-main,#3f3024)] flex flex-col items-center">
      {/* Tiny lab header */}
      <header className="w-full max-w-md px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-[#3e2b1a] flex items-center justify-center text-[18px] text-[#fdf7ec] font-bold">
            🍄
          </div>
          <div className="leading-tight">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#8b6d48]">
              Tripdar Lab
            </div>
            <div className="text-[11px] text-[#a48a66]">
              Spore Dial Experiment
            </div>
          </div>
        </div>
        <div className="text-[11px] text-[#b6a189]">
          {activeIndex + 1}/{LAB_STRAINS.length}
        </div>
      </header>

      {/* Spore dial area */}
      <section
        className="w-full max-w-md px-5 pb-4 flex-1 flex flex-col items-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full flex items-center justify-center">
          {/* Rotating spore print */}
          <div
            className="transition-transform duration-[700ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <SporePrint
              size={260}
              strokeColor="#b48a5a"
              centerFill="#fdf1dd"
              className="opacity-85"
            />
          </div>

          {/* Center chip with current strain */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl bg-[var(--card-bg,#fdf7ec)]/95 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)] text-center min-w-[180px]">
              <div className="text-[12px] uppercase tracking-[0.16em] text-[#b18c63] mb-1">
                Current strain
              </div>
              <div className="text-[18px] font-semibold text-[#3e2b1a] leading-tight">
                {active.name}
              </div>
              <div className="text-[13px] text-[#8b6d48] mt-0.5">
                {active.effect} · {active.dose}
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[#c0a98a]">
                Swipe left / right
              </div>
            </div>
          </div>

          {/* Little ticks around the circle for each strain */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {LAB_STRAINS.map((strain, i) => {
              const angle = i * anglePerStrain;
              const isActive = i === activeIndex;
              const radius = 128; // distance from center

              const rad = (angle * Math.PI) / 180;
              const x = 256 + radius * Math.cos(rad);
              const y = 256 + radius * Math.sin(rad);

              const pctX = (x / 512) * 100;
              const pctY = (y / 512) * 100;

              return (
                <div
                  key={strain.id}
                  className="absolute"
                  style={{
                    left: `${pctX}%`,
                    top: `${pctY}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className={`rounded-full border border-[#c8ac84] bg-[#fdf7ec]/90
                                transition-all duration-300 ${
                                  isActive
                                    ? "w-[14px] h-[14px] shadow-[0_0_0_6px_rgba(190,150,100,0.35)]"
                                    : "w-[9px] h-[9px] opacity-70"
                                }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Text list controls */}
        <div className="mt-5 w-full">
          <div className="text-[11px] uppercase tracking-[0.16em] text-center text-[#b18c63] mb-2">
            Tap to jump
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {LAB_STRAINS.map((strain, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={strain.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] 
                    transition-colors ${
                      isActive
                        ? "border-[#a7763b] bg-[#f8ecdd] text-[#4a341f]"
                        : "border-[#e0cbaa] bg-[#fbf3e4] text-[#9d7f5a]"
                    }`}
                >
                  {strain.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}