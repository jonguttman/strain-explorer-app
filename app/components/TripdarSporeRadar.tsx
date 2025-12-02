// app/components/TripdarSporeRadar.tsx
// =============================================================================
// CANONICAL TRIPDAR RADAR COMPONENT
// =============================================================================
// This is the single source of truth for the animated spore-radar visualization.
// All radar rendering (main screen + lab pages) should use this component.
//
// Features included:
// - Spore gills with Gaussian angular falloff
// - Configurable low-value shaping for visibility
// - Vibe cast wedges highlighting maxed axes
// - Quadrant rails/arches at the edge (optional)
// - Tripdar center mark with "t" monogram (optional)
// - Smooth tweening between axis value changes
// - Organic breathing animation
// - Curved axis labels
// - Directional spin animation on strain change
// - Full visual overrides for admin tuning
//
// Usage:
//   <TripdarSporeRadar
//     axes={{ visuals: 75, euphoria: 60, ... }}  // 0-100 values
//     strainColor="#c9a857"
//     showQuadrantRails
//     showCenterMark
//     visualOverrides={{ gillCount: 300, railMaxThickness: 12 }}
//   />
// =============================================================================

"use client";

import * as React from "react";
import type { TraitAxisId } from "@/lib/types";
import {
  shapeAxisValueConfigurable,
  polarToCartesian,
  shortestAngle,
  buildArc,
  describeArc,
  AXIS_LABELS,
  QUADRANT_COLORS,
  DEFAULT_RADAR_PRESET,
  mergeVisualOverrides,
  type TripdarVisualOverrides,
} from "@/lib/tripdarRadar";

// =============================================================================
// TYPES
// =============================================================================

export type TripdarSporeRadarProps = {
  /** Axis values (0-100 scale for each trait) */
  axes: Record<TraitAxisId, number>;

  /** Optional: 0-1 weights for each vibe quadrant (future use) */
  vibeWeights?: {
    create: number;
    connect: number;
    introspect: number;
    transcend: number;
  };

  /** Strain color used as base tint */
  strainColor?: string;

  /** Animation knobs */
  animationPreset?: {
    speed: number; // e.g. 0.5-3
    intensity: number; // e.g. 0-1
  };

  /** When true, shows quadrant rails/arches visualization */
  showQuadrantRails?: boolean;

  /** When true, shows vibe cast wedges for maxed axes */
  showVibeCast?: boolean;

  /** When true, shows the Tripdar "t" center mark (default: true) */
  showCenterMark?: boolean;

  /** Compact mode for mobile layouts (smaller radius) */
  compact?: boolean;

  /** Disable animation (static render) */
  disableAnimation?: boolean;

  /**
   * Signed spin angle in degrees for directional spin animation.
   * Positive = clockwise, negative = counter-clockwise.
   * The radar will animate from this angle back to 0.
   */
  spinAngle?: number;

  /**
   * Spin key - increment to trigger a new spin animation.
   * Each change triggers the radar to spin from spinAngle to 0.
   */
  spinKey?: number;

  /**
   * Visual overrides for fine-grained control over appearance.
   * Any values provided here override the defaults.
   */
  visualOverrides?: TripdarVisualOverrides;

  className?: string;
};

// Re-export the type for convenience
export type { TripdarVisualOverrides };

// Internal axis representation for animation
type InternalAxis = {
  id: TraitAxisId;
  label: string;
  value: number; // 0-1 normalized
};

// =============================================================================
// CONSTANTS
// =============================================================================

const AXIS_ORDER: TraitAxisId[] = [
  "visuals",
  "euphoria",
  "introspection",
  "creativity",
  "spiritual_depth",
  "sociability",
];

const FULL_CIRCLE = Math.PI * 2;
const MAX_THRESHOLD = 0.92;

// =============================================================================
// CENTER MARK SUB-COMPONENT
// =============================================================================

function TripdarCenterMark({ size }: { size: number }) {
  const brownFill = "#8b6a44";
  const creamAccent = "#f7f0e3";
  const markSize = size * 0.26;

  return (
    <g transform={`translate(${size / 2 - 64}, ${size / 2 - 64})`}>
      <svg
        viewBox="-64 -64 128 128"
        width={markSize}
        height={markSize}
        x={64 - markSize / 2}
        y={64 - markSize / 2}
      >
        <circle cx="0" cy="0" r="48" fill={brownFill} />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
          return (
            <line
              key={i}
              x1={32 * Math.cos(angle)}
              y1={32 * Math.sin(angle)}
              x2={40 * Math.cos(angle)}
              y2={40 * Math.sin(angle)}
              stroke={creamAccent}
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.6}
            />
          );
        })}
        <text
          x="0"
          y="5"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontSize="34"
          fontWeight="600"
          fill={creamAccent}
        >
          t
        </text>
        <line x1="0" y1="0" x2="22" y2="-22" stroke={creamAccent} strokeWidth="3" strokeLinecap="round" />
        <circle cx="28" cy="-28" r="4" fill={creamAccent} />
        <path d={describeArc(0, 0, 42, -70, -20)} fill="none" stroke={creamAccent} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      </svg>
    </g>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TripdarSporeRadar({
  axes,
  strainColor,
  animationPreset,
  showQuadrantRails = false,
  showVibeCast = true,
  showCenterMark = true,
  compact = false,
  disableAnimation = false,
  spinAngle = 0,
  spinKey,
  visualOverrides,
  className,
}: TripdarSporeRadarProps) {
  // ==========================================================================
  // MERGE VISUAL OVERRIDES WITH DEFAULTS
  // ==========================================================================
  const v = React.useMemo(() => mergeVisualOverrides(visualOverrides), [visualOverrides]);

  // Animation time state
  const [time, setTime] = React.useState(0);

  // Directional spin rotation state (degrees)
  const [currentRotation, setCurrentRotation] = React.useState(0);

  // Merge preset with defaults
  const speed = animationPreset?.speed ?? DEFAULT_RADAR_PRESET.speed;
  const intensity = animationPreset?.intensity ?? DEFAULT_RADAR_PRESET.intensity;

  // Convert 0-100 axes to 0-1 internal format
  const normalizedAxes: InternalAxis[] = React.useMemo(
    () =>
      AXIS_ORDER.map((id) => ({
        id,
        label: AXIS_LABELS[id],
        value: Math.max(0, Math.min(1, (axes[id] ?? 0) / 100)),
      })),
    [axes]
  );

  // Animated axes for smooth morphing between changes
  const [animatedAxes, setAnimatedAxes] = React.useState<InternalAxis[]>(normalizedAxes);

  // Smooth tween when axes change
  React.useEffect(() => {
    const from = animatedAxes;
    const to = normalizedAxes;
    const duration = 350;
    const start = performance.now();
    let frame: number;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t * t * (3 - 2 * t);
      setAnimatedAxes(
        to.map((target, i) => {
          const prev = from[i] ?? target;
          return { ...target, value: prev.value + (target.value - prev.value) * eased };
        })
      );
      if (t < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(normalizedAxes)]);

  // RAF-based time source for organic motion
  React.useEffect(() => {
    if (disableAnimation) return;
    let frameId: number;
    const start = performance.now();
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      setTime(t);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [disableAnimation]);

  // ==========================================================================
  // DIRECTIONAL SPIN ANIMATION
  // ==========================================================================
  React.useEffect(() => {
    if (spinKey === undefined || spinAngle === 0 || disableAnimation) {
      setCurrentRotation(0);
      return;
    }

    const startAngle = spinAngle;
    const startTime = performance.now();
    let frameId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / v.spinDurationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const value = startAngle * (1 - eased);
      setCurrentRotation(value);
      if (t < 1) frameId = requestAnimationFrame(animate);
    };

    setCurrentRotation(startAngle);
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [spinKey, spinAngle, disableAnimation, v.spinDurationMs]);

  // ==========================================================================
  // GEOMETRY CALCULATIONS (using overrides)
  // ==========================================================================
  const size = compact ? 280 : 360;
  const cx = size / 2;
  const cy = size / 2;
  const innerRadius = size * v.gillBaseLength;
  const outerRadius = size * v.gillMaxLength;

  const axisCount = animatedAxes.length;
  const axisAngles = animatedAxes.map((_, i) => (FULL_CIRCLE * i) / axisCount - Math.PI / 2);
  const anglePerAxis = FULL_CIRCLE / axisCount;

  // Label and quadrant positioning
  const labelRingRadius = outerRadius + 22;
  const quadrantRingRadius = outerRadius + 10;
  const tickInner = outerRadius + 4;
  const tickOuter = outerRadius + 14;
  const arcHalfWidth = anglePerAxis * 0.45;

  // Rail geometry from overrides
  const railOuterRadius = outerRadius + v.railRadiusOffset;

  // Colors
  const tintColor = strainColor ?? "#8b5a2b";

  // ==========================================================================
  // VIBE CAST WEDGES (using overrides)
  // ==========================================================================
  const maxValue = Math.max(...animatedAxes.map((a) => a.value));
  const maxAxes = maxValue > 0.5 ? animatedAxes.filter((a) => a.value >= MAX_THRESHOLD * maxValue) : [];

  const castInnerRadius = innerRadius * v.castInnerRadius;
  const castOuterRadius = outerRadius * v.castOuterRadius;

  const vibeCastPaths =
    v.castEnabled && showVibeCast
      ? maxAxes
          .map((axis) => {
            const idx = animatedAxes.findIndex((a) => a.id === axis.id);
            if (idx === -1) return null;

            const centerAngle = axisAngles[idx];
            const halfSpan = anglePerAxis * 0.48;
            const startAngle = centerAngle - halfSpan;
            const endAngle = centerAngle + halfSpan;

            const path = [
              `M ${cx + castInnerRadius * Math.cos(startAngle)} ${cy + castInnerRadius * Math.sin(startAngle)}`,
              `L ${cx + castOuterRadius * Math.cos(startAngle)} ${cy + castOuterRadius * Math.sin(startAngle)}`,
              `A ${castOuterRadius} ${castOuterRadius} 0 0 1 ${cx + castOuterRadius * Math.cos(endAngle)} ${cy + castOuterRadius * Math.sin(endAngle)}`,
              `L ${cx + castInnerRadius * Math.cos(endAngle)} ${cy + castInnerRadius * Math.sin(endAngle)}`,
              `A ${castInnerRadius} ${castInnerRadius} 0 0 0 ${cx + castInnerRadius * Math.cos(startAngle)} ${cy + castInnerRadius * Math.sin(startAngle)}`,
              "Z",
            ].join(" ");

            return (
              <path
                key={`vibe-cast-${axis.id}`}
                d={path}
                fill={tintColor}
                fillOpacity={v.castBaseOpacity * v.castBlendStrength}
              />
            );
          })
          .filter(Boolean)
      : [];

  // ==========================================================================
  // QUADRANT RAILS (using overrides)
  // ==========================================================================
  const quadrantRails: React.ReactNode[] = [];

  if (showQuadrantRails) {
    animatedAxes.forEach((axis, i) => {
      const raw = axis.value;
      const axisVal = Math.max(0, Math.min(1, raw));
      if (axisVal <= 0.01) return;

      const axisAngle = axisAngles[i];

      // Width interpolation using overrides
      const widthRange = v.railMaxAngleWidth - v.railMinAngleWidth;
      const spanDeg = v.railMinAngleWidth + widthRange * axisVal;

      // Thickness interpolation
      const thicknessRange = v.railMaxThickness - v.railMinThickness;
      const thickness = v.railMinThickness + thicknessRange * Math.pow(axisVal, 1.5);
      const railInnerRadius = railOuterRadius - thickness;

      // Bounce at high values
      let bounceOffset = 0;
      if (axisVal >= v.railEdgeBounceThreshold && !disableAnimation) {
        const bounceStrength = (axisVal - v.railEdgeBounceThreshold) / (1 - v.railEdgeBounceThreshold);
        bounceOffset = Math.sin(time / 0.6 + i * 1.5) * v.railEdgeBounceAmount * spanDeg * bounceStrength;
      }

      const totalSpanDeg = Math.min(v.railMaxAngleWidth, spanDeg + bounceOffset);
      const halfSpanRad = (totalSpanDeg * Math.PI) / 180 / 2;

      const outerStartAngle = axisAngle - halfSpanRad;
      const outerEndAngle = axisAngle + halfSpanRad;

      const outerStart = polarToCartesian(cx, cy, railOuterRadius, outerStartAngle);
      const outerEnd = polarToCartesian(cx, cy, railOuterRadius, outerEndAngle);
      const innerEnd = polarToCartesian(cx, cy, railInnerRadius, outerEndAngle);
      const innerStart = polarToCartesian(cx, cy, railInnerRadius, outerStartAngle);

      const largeArcFlag = totalSpanDeg > 180 ? 1 : 0;

      const d = [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${railOuterRadius} ${railOuterRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${railInnerRadius} ${railInnerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
        "Z",
      ].join(" ");

      // Opacity interpolation
      const opacityRange = v.railMaxOpacity - v.railMinOpacity;
      const opacity = v.railMinOpacity + opacityRange * axisVal;

      quadrantRails.push(
        <path
          key={`rail-${axis.id}`}
          d={d}
          fill="#5a3d2b"
          fillOpacity={opacity}
          style={{ transition: disableAnimation ? "none" : "fill-opacity 300ms ease-out" }}
        />
      );
    });
  }

  // ==========================================================================
  // GILL LINES (using overrides)
  // ==========================================================================
  const sigma = v.gaussianSigmaMax - (v.gaussianSigmaMax - v.gaussianSigmaMin) * intensity;

  const gillLines = Array.from({ length: v.gillCount }).map((_, gillIndex) => {
    const theta = (FULL_CIRCLE * gillIndex) / v.gillCount - Math.PI / 2;

    // Gaussian-weighted blend of all axes
    let weighted = 0;
    let weightSum = 0;
    let maxFalloff = 0;

    for (let i = 0; i < axisCount; i++) {
      const axisAngle = axisAngles[i];
      const diff = shortestAngle(theta, axisAngle);
      const w = Math.exp(-(diff * diff) / (2 * sigma * sigma));
      const shapedValue = shapeAxisValueConfigurable(
        animatedAxes[i].value,
        v.lowValueShapingStrength,
        v.lowValueBaseline
      );
      weighted += shapedValue * w;
      weightSum += w;
      if (w > maxFalloff) maxFalloff = w;
    }

    const normalized = weightSum > 0 ? weighted / weightSum : 0;
    const shapePow = 1 + 2 * intensity;
    const shaped = Math.pow(normalized, shapePow);

    // Base length calculation
    const base = innerRadius;
    const maxExtra = outerRadius - innerRadius;
    let length = base + shaped * maxExtra;

    // Breathing motion using overrides
    const breathSpeed = (2 * Math.PI) / (v.breathDurationMs / 1000);
    const wave = disableAnimation
      ? 0
      : Math.sin(time * breathSpeed * speed + gillIndex * 0.18) *
        v.breathAmplitude *
        (0.3 + intensity * 0.7) *
        (0.5 + shaped);

    // Jaggedness using overrides
    const jitterAmount = v.jaggednessMin + (v.jaggednessMax - v.jaggednessMin) * intensity;
    const jitterSeed = Math.sin(gillIndex * 1.73 + gillIndex * 0.37) * 0.5;

    // Add noise
    const noiseOffset = disableAnimation
      ? 0
      : Math.sin(time * v.noiseSpeed * 2 + gillIndex * 0.31) * v.noiseAmount * maxExtra * intensity;

    const jitter = jitterSeed * jitterAmount * maxExtra + noiseOffset;
    length = length * (1 + wave) + jitter;

    const x1 = cx + innerRadius * Math.cos(theta);
    const y1 = cy + innerRadius * Math.sin(theta);
    const x2 = cx + length * Math.cos(theta);
    const y2 = cy + length * Math.sin(theta);

    // Stroke width interpolation
    const strokeWidth = v.gillBaseThickness + (v.gillMaxThickness - v.gillBaseThickness) * maxFalloff;
    const opacity = 0.25 + 0.55 * maxFalloff;

    return (
      <line
        key={gillIndex}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#7A5A3B"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={opacity}
      />
    );
  });

  // ==========================================================================
  // UNIQUE IDS
  // ==========================================================================
  const instanceId = React.useId();
  const bgGradientId = `tripdar-bg-${instanceId}`;
  const tintGradientId = `tripdar-tint-${instanceId}`;
  const clipId = `tripdar-clip-${instanceId}`;

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={bgGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F9F0E5" stopOpacity="1" />
          <stop offset="100%" stopColor="#E4D4C0" stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id={tintGradientId} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor={tintColor} stopOpacity="0.06" />
          <stop offset="60%" stopColor={tintColor} stopOpacity="0.12" />
          <stop offset="100%" stopColor={tintColor} stopOpacity="0" />
        </radialGradient>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={outerRadius} />
        </clipPath>
      </defs>

      {/* Base background disc */}
      <circle cx={cx} cy={cy} r={outerRadius + 12} fill={`url(#${bgGradientId})`} />
      {/* Strain tint layer */}
      <circle cx={cx} cy={cy} r={outerRadius + 12} fill={`url(#${tintGradientId})`} />

      {/* ROTATING GROUP */}
      <g transform={`rotate(${currentRotation} ${cx} ${cy})`}>
        {/* Vibe cast wedges */}
        <g clipPath={`url(#${clipId})`} pointerEvents="none">
          {vibeCastPaths}
        </g>

        {/* Quadrant labels and tints */}
        {animatedAxes.map((axis, index) => {
          const midAngle = axisAngles[index];
          const angleDeg = ((midAngle * 180) / Math.PI + 360) % 360;
          const isBottom = angleDeg >= 20 && angleDeg <= 180;

          const quad = buildArc(cx, cy, midAngle, quadrantRingRadius, arcHalfWidth, false);
          const labelArc = buildArc(cx, cy, midAngle, labelRingRadius, arcHalfWidth, isBottom);
          const pathId = `tripdar-arc-${axis.id}-${instanceId}`;

          return (
            <React.Fragment key={axis.id}>
              <path
                d={quad.d}
                fill="none"
                stroke={QUADRANT_COLORS[index % QUADRANT_COLORS.length]}
                strokeWidth={12}
                strokeLinecap="round"
                opacity={0.16}
              />
              <line
                x1={cx + tickInner * Math.cos(midAngle)}
                y1={cy + tickInner * Math.sin(midAngle)}
                x2={cx + tickOuter * Math.cos(midAngle)}
                y2={cy + tickOuter * Math.sin(midAngle)}
                stroke="rgba(122,90,59,0.35)"
                strokeWidth={1.2}
                strokeLinecap="round"
              />
              <path id={pathId} d={labelArc.d} fill="none" stroke="none" />
              <text
                fontSize={compact ? 10 : 11}
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                fill="rgba(90,66,43,0.85)"
              >
                <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                  {axis.label}
                </textPath>
              </text>
            </React.Fragment>
          );
        })}

        {/* Gill lines */}
        {gillLines}

        {/* Quadrant rails */}
        {showQuadrantRails && <g>{quadrantRails}</g>}

        {/* Inner core */}
        <circle cx={cx} cy={cy} r={innerRadius * 0.7} fill="#F9F0E5" />

        {/* Center mark */}
        {showCenterMark && <TripdarCenterMark size={size} />}
      </g>
    </svg>
  );
}
