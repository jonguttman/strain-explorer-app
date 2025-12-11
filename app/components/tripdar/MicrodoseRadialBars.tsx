"use client";

// =============================================================================
// MICRODOSE RADIAL BARS - Specialized visualization for microdose viewing
// =============================================================================
// Displays 6 "micro-vibe" values as radial bars emanating from a golden
// semicircle plate, matching the existing Golden Aura cosmic aesthetic.
// =============================================================================

import { useId } from "react";
import type { MicroVibeId, MicroVibes } from "@/lib/types";

// =============================================================================
// PROPS
// =============================================================================

type MicrodoseRadialBarsProps = {
  vibes: MicroVibes;           // required - the 6 values (0-100)
  size?: number;               // default: 360 (matches Golden Aura radar)
  tintColor?: string;          // strain accent color for optional tinting
  className?: string;
  disableAnimation?: boolean;  // for future admin preview
};

// =============================================================================
// CONSTANTS
// =============================================================================

// Bar arrangement angles (from vertical, degrees)
const MICROVIBE_ANGLES: Record<MicroVibeId, number> = {
  ease: -100,
  desire: -60,
  lift: -20,
  connect: 20,
  create: 60,
  focus: 100,
};

// Color palette (Golden Aura derived)
const MICROVIBE_COLORS: Record<MicroVibeId, string> = {
  ease:    "#89B7FF",  // soft blue
  desire:  "#FF9ACD",  // warm rose
  lift:    "#FFD36E",  // gold
  connect: "#FFC370",  // warm amber
  create:  "#D6A9FF",  // lavender
  focus:   "#7EE8E3",  // aqua
};

// Ordered list for iteration
const MICROVIBE_ORDER: MicroVibeId[] = ["ease", "desire", "lift", "connect", "create", "focus"];

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Ensures minimum bar visibility (values < 10 display as 10)
 */
function getEffectiveValue(value: number): number {
  return value < 10 ? 10 : value;
}

/**
 * Convert degrees to radians
 */
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate point on circle given angle (from vertical/top) and radius
 */
function getPointOnCircle(cx: number, cy: number, radius: number, angleDeg: number): { x: number; y: number } {
  // Adjust so 0° is at top (12 o'clock) and positive goes clockwise
  const angleRad = degToRad(angleDeg - 90);
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MicrodoseRadialBars({
  vibes,
  size = 360,
  tintColor,
  className = "",
  disableAnimation = false,
}: MicrodoseRadialBarsProps) {
  // Center point
  const cx = size / 2;
  const cy = size / 2;

  // Geometry calculations
  const plateRadius = size * 0.38;
  const barInnerRadius = plateRadius + 4;
  const barMaxExtension = size * 0.32;
  const barMinExtension = size * 0.04;
  const labelRadius = plateRadius + (barMaxExtension * 0.55);

  // Generate unique IDs for gradients/filters
  const uniqueId = useId();
  const plateGradientId = `plate-gradient${uniqueId}`;
  const bevelGradientId = `bevel-gradient${uniqueId}`;

  // Semicircle arc path (bottom half facing up)
  const platePath = `
    M ${cx - plateRadius} ${cy}
    A ${plateRadius} ${plateRadius} 0 0 0 ${cx + plateRadius} ${cy}
  `;

  // Bevel ring path (slightly larger)
  const bevelRadius = plateRadius + 3;
  const bevelPath = `
    M ${cx - bevelRadius} ${cy}
    A ${bevelRadius} ${bevelRadius} 0 0 0 ${cx + bevelRadius} ${cy}
  `;

  // Animation styles (scoped to this component)
  const animationStyles = disableAnimation ? "" : `
    @keyframes microvibe-breathe {
      0%, 100% { opacity: 0.85; transform-origin: center bottom; }
      50% { opacity: 1; }
    }
  `;

  return (
    <div className={`relative ${className}`}>
      <style>{animationStyles}</style>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Gradient definitions */}
        <defs>
          {/* Main plate gradient - golden */}
          <linearGradient id={plateGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8c86c" />
            <stop offset="50%" stopColor="#d4a84a" />
            <stop offset="100%" stopColor="#c49a4a" />
          </linearGradient>

          {/* Bevel ring gradient */}
          <linearGradient id={bevelGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f5e4a8" />
            <stop offset="50%" stopColor="#d4a84a" />
            <stop offset="100%" stopColor="#a67c3d" />
          </linearGradient>
        </defs>

        {/* Radial bars with glow and tip sparkle */}
        {MICROVIBE_ORDER.map((vibeId, index) => {
          const value = getEffectiveValue(vibes[vibeId] ?? 50);
          const angle = MICROVIBE_ANGLES[vibeId];
          const color = MICROVIBE_COLORS[vibeId];
          
          // Calculate bar length based on value (0-100)
          const barLength = barMinExtension + ((value / 100) * (barMaxExtension - barMinExtension));
          
          // Calculate start and end points
          const start = getPointOnCircle(cx, cy, barInnerRadius, angle);
          const end = getPointOnCircle(cx, cy, barInnerRadius + barLength, angle);

          // Animation delay for staggered breathing
          const animationDelay = `${index * 0.2}s`;

          return (
            <g 
              key={vibeId}
              style={!disableAnimation ? { 
                animation: "microvibe-breathe 4s ease-in-out infinite",
                animationDelay,
              } : undefined}
            >
              {/* Outer glow stroke */}
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={color}
                strokeWidth={20}
                strokeLinecap="round"
                opacity={0.28}
                style={{ filter: "blur(6px)" }}
              />
              
              {/* Core stroke */}
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={color}
                strokeWidth={5}
                strokeLinecap="round"
              />

              {/* Tip sparkle - golden glow */}
              <circle
                cx={end.x}
                cy={end.y}
                r={12}
                fill="rgba(255, 215, 128, 0.45)"
                style={{ filter: "blur(8px)" }}
              />

              {/* Tip sparkle - core dot */}
              <circle
                cx={end.x}
                cy={end.y}
                r={5}
                fill={color}
              />
            </g>
          );
        })}

        {/* Bevel ring (behind plate) */}
        <path
          d={bevelPath}
          fill="none"
          stroke={`url(#${bevelGradientId})`}
          strokeWidth={6}
        />

        {/* Main semicircle plate */}
        <path
          d={platePath}
          fill={`url(#${plateGradientId})`}
        />

        {/* Inner highlight arc */}
        <path
          d={`
            M ${cx - (plateRadius - 8)} ${cy}
            A ${plateRadius - 8} ${plateRadius - 8} 0 0 0 ${cx + (plateRadius - 8)} ${cy}
          `}
          fill="none"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth={2}
        />

        {/* Center logo/stamp */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize={22}
          fontWeight={600}
          fill="#3a2a1a"
          letterSpacing="0.05em"
        >
          Tripdar™
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize={9}
          fontWeight={500}
          fill="#5a4a3a"
          opacity={0.68}
          letterSpacing="0.14em"
        >
          MICRODOSE PROFILE
        </text>

        {/* Labels for each vibe */}
        {MICROVIBE_ORDER.map((vibeId) => {
          const angle = MICROVIBE_ANGLES[vibeId];
          const color = MICROVIBE_COLORS[vibeId];
          const labelPos = getPointOnCircle(cx, cy, labelRadius, angle);
          const labelTilt = angle * 0.15;

          return (
            <text
              key={`label-${vibeId}`}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              transform={`rotate(${labelTilt} ${labelPos.x} ${labelPos.y})`}
              fill={color}
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize={14}
              fontWeight={500}
              letterSpacing="0.1em"
              style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.3))" }}
            >
              {vibeId.toUpperCase()}
            </text>
          );
        })}
      </svg>

      {/* Strain tint indicator (if provided) - small dot in corner */}
      {tintColor && (
        <div 
          className="absolute bottom-2 right-2 w-3 h-3 rounded-full opacity-60"
          style={{ backgroundColor: tintColor }}
        />
      )}
    </div>
  );
}
