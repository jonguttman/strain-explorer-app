// app/components/tripdar/skins/GoldenAuraSkin.tsx
// =============================================================================
// GOLDEN AURA SKIN - Cosmic Apothecary Radar Visualization
// =============================================================================
// A visual-only skin that renders the Tripdar radar with a golden plate,
// cosmic blur background, and elegant star endpoints.
//
// This component receives PRE-SHAPED axis values from TripdarSporeRadar.
// It does NOT re-run radar math - it only renders the visual representation.
//
// NOTE: The twinkling starfield is rendered by RadarPanel.tsx in the outer
// dark background area, NOT inside this component.
//
// v2 Refinements: Larger plate, brighter radar lines, enhanced typography,
// improved contrast throughout.
// =============================================================================

"use client";

import * as React from "react";
import type { TraitAxisId } from "@/lib/types";
import type { GoldenAuraSkinOverrides } from "@/lib/tripdarPreset";
import { polarToCartesian, AXIS_LABELS } from "@/lib/tripdarRadar";

// =============================================================================
// TYPES
// =============================================================================

export type GoldenAuraSkinProps = {
  /** Pre-shaped axis values (0-1 normalized, already processed by radar math) */
  shapedAxes: { id: TraitAxisId; label: string; value: number }[];
  /** Raw axis values (0-100) for percentage display */
  rawAxes: Record<TraitAxisId, number>;
  /** Strain color for accent tinting */
  strainColor: string;
  /** Current animation time for subtle effects */
  time: number;
  /** Current rotation angle for spin animation */
  rotation: number;
  /** Whether animation is disabled */
  disableAnimation: boolean;
  /** Size of the radar (matches parent component) */
  size: number;
  /** Compact mode flag */
  compact: boolean;
  /** Golden Aura-specific visual overrides */
  overrides?: GoldenAuraSkinOverrides;
  /** Optional className */
  className?: string;
  /** Center mark title (default: "Tripdar™") */
  centerTitle?: string;
  /** Center mark subtitle (default: "POWERED BY FUNGAPEDIA") */
  centerSubtitle?: string;
};

// =============================================================================
// CONSTANTS
// =============================================================================

const FULL_CIRCLE = Math.PI * 2;

// Axis order for rendering
const AXIS_ORDER: TraitAxisId[] = [
  "visuals",
  "euphoria",
  "introspection",
  "creativity",
  "spiritual_depth",
  "sociability",
];

// Axis-specific colors for stars and labels
const AXIS_COLORS: Record<TraitAxisId, string> = {
  euphoria: "#e8a855",        // Warm gold/orange
  visuals: "#e888b0",         // Pink
  introspection: "#a8b8d8",   // Soft blue-grey
  creativity: "#d8a8c8",      // Dusty rose
  spiritual_depth: "#88d8e8", // Cyan
  sociability: "#98d8b8",     // Soft teal/green
};

// Default overrides - v2 refined values
const DEFAULT_OVERRIDES: Required<GoldenAuraSkinOverrides> = {
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

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

/** 5-pointed star SVG path centered at origin - v2 enhanced with stronger glow */
function StarMarker({
  x,
  y,
  size,
  color,
  brightness,
  pulsePhase,
  disableAnimation,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  brightness: number;
  pulsePhase: number;
  disableAnimation: boolean;
}) {
  const pulse = disableAnimation ? 1 : 0.85 + 0.15 * Math.sin(pulsePhase);
  const actualSize = size * pulse;
  const outerR = actualSize;
  const innerR = actualSize * 0.4;
  const points = 5;

  // Generate star path
  const pathPoints: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    pathPoints.push(`${i === 0 ? "M" : "L"} ${px} ${py}`);
  }
  pathPoints.push("Z");

  return (
    <g>
      {/* Outer soft halo */}
      <circle
        cx={x}
        cy={y}
        r={actualSize * 2.5}
        fill={color}
        opacity={brightness * 0.15 * pulse}
        style={{ filter: "blur(6px)" }}
      />
      {/* Inner glow */}
      <circle
        cx={x}
        cy={y}
        r={actualSize * 1.5}
        fill={color}
        opacity={brightness * 0.35 * pulse}
        style={{ filter: "blur(3px)" }}
      />
      {/* Star shape with enhanced glow */}
      <path
        d={pathPoints.join(" ")}
        fill={color}
        opacity={brightness}
        style={{ filter: `drop-shadow(0 0 ${actualSize}px ${color})` }}
      />
    </g>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function GoldenAuraSkin({
  shapedAxes,
  rawAxes,
  strainColor,
  time,
  rotation,
  disableAnimation,
  size,
  compact,
  overrides,
  className,
  centerTitle = "Tripdar™",
  centerSubtitle = "POWERED BY FUNGAPEDIA",
}: GoldenAuraSkinProps) {
  // Merge overrides with defaults
  const v: Required<GoldenAuraSkinOverrides> = {
    ...DEFAULT_OVERRIDES,
    ...overrides,
  };

  // ==========================================================================
  // GEOMETRY CALCULATIONS - v2.5: Even larger plate for visual dominance
  // ==========================================================================
  const viewBoxPadding = 90;
  const viewBoxSize = size + viewBoxPadding * 2;
  const cx = viewBoxSize / 2;
  const cy = viewBoxSize / 2;
  
  // v2.5: Larger plate (0.48) with increased label spacing
  const plateRadius = size * 0.48;
  
  // v2.5: Increased label gap for better readability
  const labelRadius = plateRadius + 60;
  
  const axisCount = shapedAxes.length;
  const axisAngles = shapedAxes.map((_, i) => (FULL_CIRCLE * i) / axisCount - Math.PI / 2);

  // Unique IDs for gradients
  const instanceId = React.useId();
  const plateGradientId = `golden-plate-${instanceId}`;
  const haloGradientId = `golden-halo-${instanceId}`;
  const ringGradientId = `golden-ring-${instanceId}`;

  // ==========================================================================
  // RADAR POLYGON POINTS
  // ==========================================================================
  const polygonPoints = shapedAxes.map((axis, i) => {
    const angle = axisAngles[i];
    const radius = plateRadius * 0.18 + plateRadius * 0.78 * axis.value;
    return polarToCartesian(cx, cy, radius, angle);
  });

  const polygonPath = polygonPoints
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
    .join(" ") + " Z";

  // v2.5: Even brighter radar line with stronger glow
  const radarLineColor = "rgba(255, 215, 130, 0.9)";
  const radarGlowFilter = `drop-shadow(0 0 6px rgba(255, 210, 120, 0.55))`;

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className={`relative ${className ?? ""}`} style={{ width: size, height: size }}>
      {/* ================================================================== */}
      {/* COSMIC BLUR BACKGROUND (base layer) - v2.5: softer vignette */}
      {/* ================================================================== */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{ opacity: v.bloomIntensity * 0.85, zIndex: 1 }}
      >
        {/* Main cosmic gradient - reduced outer darkness by 15% */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 100% at 30% 20%, rgba(199, 111, 156, 0.425) 0%, transparent 50%),
              radial-gradient(ellipse 100% 120% at 70% 80%, rgba(90, 168, 176, 0.38) 0%, transparent 50%),
              radial-gradient(ellipse 80% 80% at 50% 50%, rgba(245, 213, 138, 0.44) 0%, transparent 60%),
              radial-gradient(circle at 50% 50%, rgba(20, 15, 10, 0.81) 0%, rgba(10, 8, 6, 0.92) 100%)
            `,
          }}
        />
        {/* Film grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            opacity: v.grainOpacity,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ================================================================== */}
      {/* SVG LAYER - v2.5: vertically centered with translateY */}
      {/* ================================================================== */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="relative"
        aria-hidden="true"
        style={{ 
          overflow: "visible", 
          zIndex: 10,
          transform: "translateY(-8px)",
        }}
      >
        <defs>
          {/* Golden plate gradient */}
          <radialGradient id={plateGradientId} cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#e8c86c" stopOpacity={0.95 * v.plateGloss} />
            <stop offset="40%" stopColor="#d9b35a" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#c49a4a" stopOpacity={0.85} />
          </radialGradient>

          {/* Halo glow gradient - v2.5: increased intensity by ~10% */}
          <radialGradient id={haloGradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f5d58a" stopOpacity={0.385 * v.haloIntensity} />
            <stop offset="60%" stopColor="#d4a853" stopOpacity={0.132 * v.haloIntensity} />
            <stop offset="100%" stopColor="#c49a4a" stopOpacity={0} />
          </radialGradient>

          {/* Ring gradient for subtle bevel */}
          <linearGradient id={ringGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0d878" />
            <stop offset="50%" stopColor="#c9a857" />
            <stop offset="100%" stopColor="#a08040" />
          </linearGradient>
        </defs>

        {/* Rotating group */}
        <g transform={`rotate(${rotation} ${cx} ${cy})`}>
          {/* ============================================================ */}
          {/* BACKLIGHT HALO - v2.5: 10% stronger center glow */}
          {/* ============================================================ */}
          <circle
            cx={cx}
            cy={cy}
            r={plateRadius * 1.25}
            fill={`url(#${haloGradientId})`}
            opacity={1.1}
          />

          {/* ============================================================ */}
          {/* GOLDEN PLATE */}
          {/* ============================================================ */}
          {/* Outer bevel ring */}
          <circle
            cx={cx}
            cy={cy}
            r={plateRadius + 4}
            fill="none"
            stroke={`url(#${ringGradientId})`}
            strokeWidth={3}
            opacity={0.7}
          />
          {/* Main plate */}
          <circle
            cx={cx}
            cy={cy}
            r={plateRadius}
            fill={`url(#${plateGradientId})`}
          />
          {/* Inner highlight ring */}
          <circle
            cx={cx}
            cy={cy}
            r={plateRadius - 3}
            fill="none"
            stroke="#f0d878"
            strokeWidth={1.5}
            opacity={0.45 * v.plateGloss}
          />

          {/* ============================================================ */}
          {/* CONCENTRIC RINGS - v2: lighter color for contrast */}
          {/* ============================================================ */}
          {[0.25, 0.5, 0.75].map((ratio, i) => (
            <circle
              key={`ring-${i}`}
              cx={cx}
              cy={cy}
              r={plateRadius * ratio}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={0.75}
              opacity={v.ringOpacity + 0.1}
            />
          ))}

          {/* ============================================================ */}
          {/* RADIAL SPOKES - v2: lighter for visibility */}
          {/* ============================================================ */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * FULL_CIRCLE - Math.PI / 2;
            const inner = polarToCartesian(cx, cy, plateRadius * 0.15, angle);
            const outer = polarToCartesian(cx, cy, plateRadius * 0.95, angle);
            return (
              <line
                key={`spoke-${i}`}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={0.75}
                opacity={v.ringOpacity + 0.05}
              />
            );
          })}

          {/* ============================================================ */}
          {/* RADAR POLYGON - v2.5: stronger contrast and weight */}
          {/* ============================================================ */}
          {/* Outer glow layer */}
          <path
            d={polygonPath}
            fill="none"
            stroke={radarLineColor}
            strokeWidth={v.radarStrokeWidth + 10}
            strokeLinejoin="round"
            opacity={0.25 * v.radarBrightness}
            style={{ filter: "blur(8px)" }}
          />
          {/* Mid glow layer */}
          <path
            d={polygonPath}
            fill="none"
            stroke={radarLineColor}
            strokeWidth={v.radarStrokeWidth + 5}
            strokeLinejoin="round"
            opacity={0.4 * v.radarBrightness}
            style={{ filter: "blur(4px)" }}
          />
          {/* Main stroke with enhanced drop shadow */}
          <path
            d={polygonPath}
            fill="rgba(255, 215, 130, 0.08)"
            stroke={radarLineColor}
            strokeWidth={v.radarStrokeWidth + 0.5}
            strokeLinejoin="round"
            opacity={0.95}
            style={{ filter: radarGlowFilter }}
          />

          {/* ============================================================ */}
          {/* STAR VERTEX MARKERS - v2.5: increased size for emphasis */}
          {/* ============================================================ */}
          {polygonPoints.map((pt, i) => {
            const axisId = AXIS_ORDER[i];
            const starColor = AXIS_COLORS[axisId];
            const pulsePhase = time * 1.5 + i * 1.2;
            return (
              <StarMarker
                key={`star-${axisId}`}
                x={pt.x}
                y={pt.y}
                size={compact ? 7.8 : 11.2}
                color={starColor}
                brightness={v.starBrightness}
                pulsePhase={pulsePhase}
                disableAnimation={disableAnimation}
              />
            );
          })}

        </g>

        {/* ============================================================ */}
        {/* CENTER MARK - v2.5: 20-25% larger with improved positioning */}
        {/* (outside rotating group so it stays stationary) */}
        {/* ============================================================ */}
        <g>
          {/* Center background circle - larger for 50% text increase */}
          <circle
            cx={cx}
            cy={cy}
            r={plateRadius * 0.23}
            fill="#d4a853"
            opacity={0.92}
          />
          <circle
            cx={cx}
            cy={cy}
            r={plateRadius * 0.23}
            fill="none"
            stroke="#f0d878"
            strokeWidth={1.5}
            opacity={0.55}
          />
          {/* Title text - v2.5: 50% larger, shifted up for visual balance */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            fontSize={compact ? 28.5 : 33}
            fontWeight="600"
            fill="#3a2a1a"
            letterSpacing="0.05em"
          >
            {centerTitle}
          </text>
          {/* Subtitle text - v2.5: 50% larger */}
          <text
            x={cx}
            y={cy + (compact ? 16 : 18)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            fontSize={compact ? 9 : 11.25}
            fontWeight="500"
            fill="#5a4a3a"
            letterSpacing="0.12em"
          >
            {centerSubtitle}
          </text>
        </g>

        {/* ============================================================== */}
        {/* AXIS LABELS (outside rotating group so they stay upright) */}
        {/* ============================================================== */}
        {shapedAxes.map((axis, i) => {
          const angle = axisAngles[i];
          const pt = polarToCartesian(cx, cy, labelRadius, angle);
          const axisColor = AXIS_COLORS[axis.id];
          const rawValue = rawAxes[axis.id] ?? 0;
          // v2.5: 20% larger labels, 25% larger percentages
          const fontSize = (compact ? 13.2 : 16.8) * v.labelScale;
          const percentFontSize = (compact ? 12.5 : 16.25) * v.labelScale;

          // Determine text anchor based on position around the circle
          const angleDeg = ((angle * 180) / Math.PI + 360) % 360;
          
          // More nuanced text anchor: left side = end, right side = start, top/bottom = middle
          let textAnchor: "start" | "middle" | "end" = "middle";
          if (angleDeg > 60 && angleDeg < 120) textAnchor = "middle"; // bottom right
          else if (angleDeg >= 120 && angleDeg <= 240) textAnchor = "end"; // left side
          else if (angleDeg > 240 && angleDeg < 300) textAnchor = "middle"; // top left
          else textAnchor = "start"; // right side

          // Adjust y offset for top/bottom labels
          const isTop = angleDeg >= 240 && angleDeg <= 300;
          const isBottom = angleDeg >= 60 && angleDeg <= 120;
          const yOffset = isTop ? -6 : isBottom ? 6 : 0;

          return (
            <g key={`label-${axis.id}`}>
              {/* Glow behind text */}
              <text
                x={pt.x}
                y={pt.y + yOffset}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                fontSize={fontSize}
                fontWeight="600"
                fill={axisColor}
                opacity={0.4}
                style={{ filter: "blur(4px)" }}
                letterSpacing="0.12em"
              >
                {AXIS_LABELS[axis.id].toUpperCase()}
              </text>
              {/* Main label - v2.5: added text-shadow for readability */}
              <text
                x={pt.x}
                y={pt.y + yOffset}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                fontSize={fontSize}
                fontWeight="600"
                fill={axisColor}
                letterSpacing="0.12em"
                style={{ 
                  filter: "drop-shadow(0 0 4px rgba(0,0,0,0.3))",
                }}
              >
                {AXIS_LABELS[axis.id].toUpperCase()}
              </text>
              {/* Percentage value - v2.5: added text-shadow, increased spacing */}
              <text
                x={pt.x}
                y={pt.y + yOffset + (compact ? 17 : 20)}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                fontSize={percentFontSize}
                fontWeight="500"
                fill={axisColor}
                opacity={0.9}
                style={{ 
                  filter: "drop-shadow(0 0 4px rgba(0,0,0,0.3))",
                }}
              >
                {Math.round(rawValue)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default GoldenAuraSkin;
