// app/components/SporePrint.tsx
"use client";

import * as React from "react";
import { useMemo } from "react";

export type SporeAnimationMode = "none" | "whole" | "gills" | "aura" | "combo";

type SporePrintProps = {
  size?: number;
  className?: string;
  strokeColor?: string;
  centerFill?: string;
  animation?: SporeAnimationMode;
  /** 1 = default, 0.5 = slower, 2 = faster */
  speedScale?: number;
  /** 0 to 1, where 0 = ultra subtle, 1 = max intensity */
  intensity?: number;
};

export const SporePrint: React.FC<SporePrintProps> = ({
  size = 220,
  className,
  strokeColor = "#b89a76",
  centerFill = "#fdf7ec",
  animation = "none",
  speedScale,
  intensity,
}) => {
  // Apply defaults if not provided
  const effectiveSpeed = speedScale ?? 1;
  const effectiveIntensity = intensity ?? 0.7;

  const radius = size / 2;
  const innerRadius = radius * 0.18;
  const outerRadius = radius * 0.9;
  const auraRadius = radius * 1.1; // slightly larger for the aura
  const rays = 120;

  // Base animation durations (in seconds)
  const BASE_WHOLE_DURATION = 6;
  const BASE_AURA_DURATION = 8;
  const BASE_GILL_DURATION = 4;

  // Deterministic pseudo-random based on index for pure rendering
  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  // Memoize paths with opacity and animation timing
  const pathsWithOpacity = useMemo(() => {
    const result: { d: string; baseOpacity: number; durationOffset: number }[] = [];
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2;
      const wobble = Math.sin(i * 0.35) * (radius * 0.04);

      // start slightly inside the inner radius for a soft center
      const r1 = innerRadius + wobble * 0.2;
      const r2 = outerRadius + wobble;

      const x1 = radius + r1 * Math.cos(angle);
      const y1 = radius + r1 * Math.sin(angle);
      const x2 = radius + r2 * Math.cos(angle);
      const y2 = radius + r2 * Math.sin(angle);

      result.push({
        d: `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`,
        baseOpacity: 0.35 + 0.25 * pseudoRandom(i),
        durationOffset: (i % 3) * 0.3, // stagger animation timing
      });
    }
    return result;
  }, [radius, innerRadius, outerRadius]);

  // Determine which animation classes to apply
  const showAura = animation === "aura" || animation === "combo";
  const showWholeBreathing = animation === "whole" || animation === "combo";
  const showGillPulsing = animation === "gills" || animation === "combo";

  // Unique gradient ID to avoid conflicts when multiple SporePrints are rendered
  // Use a deterministic ID based on size to avoid hydration mismatches
  const gradientId = `sporeFill-${size}`;

  // Computed animation durations
  const wholeDuration = BASE_WHOLE_DURATION / effectiveSpeed;
  const auraDuration = BASE_AURA_DURATION / effectiveSpeed;

  // Compute gill opacity based on intensity (0.3 at intensity=0, 0.7 at intensity=1)
  const computeGillOpacity = (baseOpacity: number) => {
    const minOpacity = 0.2;
    const maxOpacity = baseOpacity;
    return minOpacity + (maxOpacity - minOpacity) * effectiveIntensity;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fdf7ec" stopOpacity="1" />
          <stop offset="65%" stopColor="#fdf7ec" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d7c0a0" stopOpacity="0.25" />
        </radialGradient>
      </defs>

      {/* Aura ring (behind everything) - only rendered when aura or combo mode */}
      {showAura && (
        <circle
          className="spore-aura"
          cx={radius}
          cy={radius}
          r={auraRadius}
          style={{
            animationDuration: `${auraDuration}s`,
            opacity: 0.04 + 0.08 * effectiveIntensity, // subtle to more visible based on intensity
          }}
        />
      )}

      {/* Main content wrapper - applies whole-print breathing when enabled */}
      <g
        className={showWholeBreathing ? "spore-breathe" : undefined}
        style={showWholeBreathing ? { animationDuration: `${wholeDuration}s` } : undefined}
      >
        {/* soft background disc */}
        <circle
          cx={radius}
          cy={radius}
          r={outerRadius}
          fill={`url(#${gradientId})`}
        />

        {/* gills */}
        <g stroke={strokeColor} strokeWidth={1.2} strokeLinecap="round">
          {pathsWithOpacity.map((path, idx) => {
            const gillDuration = (BASE_GILL_DURATION + path.durationOffset) / effectiveSpeed;
            const gillOpacity = computeGillOpacity(path.baseOpacity);
            
            return (
              <path
                key={idx}
                d={path.d}
                opacity={gillOpacity}
                className={showGillPulsing ? "spore-gill" : undefined}
                style={showGillPulsing ? { animationDuration: `${gillDuration}s` } : undefined}
              />
            );
          })}
        </g>

        {/* clean center */}
        <circle
          cx={radius}
          cy={radius}
          r={innerRadius * 0.9}
          fill={centerFill}
        />
      </g>
    </svg>
  );
};
