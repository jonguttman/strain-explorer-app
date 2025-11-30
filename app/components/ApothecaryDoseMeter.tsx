"use client";

import { useRef, useMemo, useState, useEffect, useCallback, type MouseEvent, type TouchEvent } from "react";
import type { DoseKey } from "@/lib/types";

type ApothecaryDoseMeterProps = {
  doseKey: DoseKey;
  strainName: string;
  onChangeDoseKey?: (dose: DoseKey) => void;
};

const DOSE_ORDER: DoseKey[] = ["micro", "mini", "macro", "museum", "mega", "hero"];

// SVG dimensions - wider aspect ratio, no labels
const WIDTH = 500;
const HEIGHT = 44;
const TRACK_Y = 22;
const TRACK_HEIGHT = 6;
const X_START = 20;
const X_END = 480;
const TRACK_WIDTH = X_END - X_START;
const TICK_HEIGHT = 16;
const THUMB_RADIUS = 10;

export function ApothecaryDoseMeter({
  doseKey,
  strainName,
  onChangeDoseKey,
}: ApothecaryDoseMeterProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const currentIndex = DOSE_ORDER.indexOf(doseKey);

  // Strain-specific tint colors
  const strainTint = useMemo(() => {
    const map: Record<string, string> = {
      "Golden Teacher": "rgba(212, 163, 58, 0.25)",
      "Penis Envy": "rgba(88, 63, 39, 0.30)",
      "Amazonian": "rgba(90, 132, 78, 0.25)",
      "Enigma": "rgba(103, 62, 140, 0.30)",
      "Full Moon Party": "rgba(220, 90, 48, 0.30)",
      "Cambodian": "rgba(40, 95, 145, 0.28)",
    };
    return map[strainName] ?? "rgba(74, 55, 31, 0.15)";
  }, [strainName]);

  // Brass/antique colors
  const brassLight = "#c9a962";
  const brassMid = "#a68b3d";
  const brassDark = "#7a6428";
  const trackBg = "#e8dcc4";
  const trackBorder = "#c4b393";

  // Convert client X position to dose index
  const getDoseIndexFromClientX = useCallback((clientX: number): number => {
    if (!svgRef.current) return currentIndex;

    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const scaleX = WIDTH / rect.width;
    const scaledX = x * scaleX;

    const relativeX = scaledX - X_START;
    const segmentWidth = TRACK_WIDTH / (DOSE_ORDER.length - 1);
    const newIndex = Math.round(relativeX / segmentWidth);
    return Math.max(0, Math.min(DOSE_ORDER.length - 1, newIndex));
  }, [currentIndex]);

  // Update dose from position
  const updateDoseFromPosition = useCallback((clientX: number) => {
    if (!onChangeDoseKey) return;

    const newIndex = getDoseIndexFromClientX(clientX);
    const newDoseKey = DOSE_ORDER[newIndex];

    if (newDoseKey && newDoseKey !== doseKey) {
      onChangeDoseKey(newDoseKey);
    }
  }, [doseKey, getDoseIndexFromClientX, onChangeDoseKey]);

  // Handle click on track to change dose
  const handleClick = (e: MouseEvent<SVGSVGElement>) => {
    // Don't handle click if we just finished dragging
    if (isDragging) return;
    updateDoseFromPosition(e.clientX);
  };

  // Start dragging (mouse)
  const handleMouseDown = (e: MouseEvent<SVGGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // Start dragging (touch)
  const handleTouchStart = (e: TouchEvent<SVGGElement>) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  // Global mouse/touch move and up handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      e.preventDefault();
      updateDoseFromPosition(e.clientX);
    };

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      if (e.touches.length > 0) {
        updateDoseFromPosition(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    // Add listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isDragging, updateDoseFromPosition]);

  // Calculate thumb position
  const thumbX = X_START + (TRACK_WIDTH / (DOSE_ORDER.length - 1)) * currentIndex;

  return (
    <div className="w-full touch-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto cursor-pointer select-none"
        onClick={handleClick}
        role="slider"
        aria-label="Dose level selector"
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={currentIndex}
        aria-valuetext={DOSE_ORDER[currentIndex]}
      >
        {/* Defs for gradients and filters */}
        <defs>
          {/* Brass gradient for thumb */}
          <linearGradient id="brassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={brassLight} />
            <stop offset="50%" stopColor={brassMid} />
            <stop offset="100%" stopColor={brassDark} />
          </linearGradient>

          {/* Brass gradient for ticks */}
          <linearGradient id="tickGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={brassLight} />
            <stop offset="100%" stopColor={brassDark} />
          </linearGradient>

          {/* Drop shadow for thumb */}
          <filter id="thumbShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#3a2a15" floodOpacity="0.3" />
          </filter>

          {/* Texture pattern */}
          <pattern id="brassTexture" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="transparent" />
            <circle cx="1" cy="1" r="0.3" fill="rgba(255,255,255,0.15)" />
            <circle cx="3" cy="3" r="0.2" fill="rgba(0,0,0,0.08)" />
          </pattern>
        </defs>

        {/* Track background */}
        <rect
          x={X_START}
          y={TRACK_Y - TRACK_HEIGHT / 2}
          width={TRACK_WIDTH}
          height={TRACK_HEIGHT}
          rx={TRACK_HEIGHT / 2}
          fill={trackBg}
          stroke={trackBorder}
          strokeWidth={1}
        />

        {/* Strain tint overlay on track (up to current position) */}
        <rect
          x={X_START}
          y={TRACK_Y - TRACK_HEIGHT / 2}
          width={Math.max(0, thumbX - X_START)}
          height={TRACK_HEIGHT}
          rx={TRACK_HEIGHT / 2}
          fill={strainTint}
          style={{ pointerEvents: "none" }}
        />

        {/* Tick marks */}
        {DOSE_ORDER.map((_, idx) => {
          const tickX = X_START + (TRACK_WIDTH / (DOSE_ORDER.length - 1)) * idx;
          const isActive = idx === currentIndex;
          const tickH = isActive ? TICK_HEIGHT + 2 : TICK_HEIGHT;
          const tickW = isActive ? 2.5 : 2;

          return (
            <g key={idx}>
              {/* Tick base (brass) */}
              <rect
                x={tickX - tickW / 2}
                y={TRACK_Y - tickH / 2}
                width={tickW}
                height={tickH}
                rx={tickW / 2}
                fill="url(#tickGradient)"
                opacity={isActive ? 1 : 0.7}
              />
              {/* Tick highlight */}
              <rect
                x={tickX - tickW / 2 + 0.4}
                y={TRACK_Y - tickH / 2}
                width={0.4}
                height={tickH * 0.6}
                rx={0.2}
                fill="rgba(255,255,255,0.4)"
              />
            </g>
          );
        })}

        {/* Thumb (brass knob) - draggable */}
        <g
          filter="url(#thumbShadow)"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* Larger invisible hit area for easier grabbing */}
          <circle
            cx={thumbX}
            cy={TRACK_Y}
            r={THUMB_RADIUS + 8}
            fill="transparent"
          />
          {/* Outer ring */}
          <circle
            cx={thumbX}
            cy={TRACK_Y}
            r={THUMB_RADIUS}
            fill="url(#brassGradient)"
            stroke={brassDark}
            strokeWidth={1}
          />
          {/* Inner concentric detail */}
          <circle
            cx={thumbX}
            cy={TRACK_Y}
            r={THUMB_RADIUS - 2.5}
            fill="none"
            stroke={brassLight}
            strokeWidth={0.5}
            opacity={0.6}
          />
          {/* Center highlight */}
          <circle
            cx={thumbX - 1.5}
            cy={TRACK_Y - 1.5}
            r={2.5}
            fill="rgba(255,255,255,0.25)"
          />
          {/* Brass texture overlay */}
          <circle
            cx={thumbX}
            cy={TRACK_Y}
            r={THUMB_RADIUS - 1}
            fill="url(#brassTexture)"
          />
        </g>
      </svg>
    </div>
  );
}

export default ApothecaryDoseMeter;
