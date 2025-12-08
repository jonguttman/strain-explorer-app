/**
 * useCosmicPerfTracer.tsx
 * 
 * Phase 8D: Performance instrumentation for Cosmic theme
 * 
 * Provides:
 * - Frame timing metrics
 * - FPS monitoring
 * - Render count tracking
 * - Performance warnings
 * 
 * Only active in development mode or when explicitly enabled.
 * 
 * @note This file intentionally uses patterns that may trigger React compiler
 * warnings. These patterns are necessary for accurate performance tracking.
 */

/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/rules-of-hooks */

"use client";

import { useRef, useEffect, useCallback, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface PerfMetrics {
  /** Current frames per second */
  fps: number;
  
  /** Average frame time in ms */
  avgFrameTimeMs: number;
  
  /** Maximum frame time in ms (last 60 frames) */
  maxFrameTimeMs: number;
  
  /** Total frames rendered */
  frameCount: number;
  
  /** Total renders */
  renderCount: number;
  
  /** Dropped frame count (>16.67ms) */
  droppedFrames: number;
  
  /** Time since start in seconds */
  elapsedSeconds: number;
  
  /** Whether performance is degraded */
  isDegraded: boolean;
}

export interface PerfTracerOptions {
  /** Enable tracer (defaults to false in production) */
  enabled?: boolean;
  
  /** FPS warning threshold */
  fpsWarningThreshold?: number;
  
  /** Frame time warning threshold in ms */
  frameTimeWarningMs?: number;
  
  /** Callback when performance degrades */
  onPerformanceWarning?: (metrics: PerfMetrics) => void;
  
  /** Sample size for averaging */
  sampleSize?: number;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Performance tracer hook for Cosmic theme components
 */
export function useCosmicPerfTracer(options: PerfTracerOptions = {}) {
  const {
    enabled = process.env.NODE_ENV === "development",
    fpsWarningThreshold = 45,
    frameTimeWarningMs = 20,
    onPerformanceWarning,
    sampleSize = 60,
  } = options;
  
  // Refs for tracking
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef(0);
  const renderCountRef = useRef(0);
  const droppedFramesRef = useRef(0);
  const startTimeRef = useRef<number>(performance.now());
  const lastWarningTimeRef = useRef<number>(0);
  
  // State for metrics display
  const [metrics, setMetrics] = useState<PerfMetrics>({
    fps: 60,
    avgFrameTimeMs: 16.67,
    maxFrameTimeMs: 16.67,
    frameCount: 0,
    renderCount: 0,
    droppedFrames: 0,
    elapsedSeconds: 0,
    isDegraded: false,
  });
  
  /**
   * Record a frame tick
   */
  const recordFrame = useCallback(() => {
    if (!enabled) return;
    
    const now = performance.now();
    const frameTime = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;
    
    frameTimesRef.current.push(frameTime);
    if (frameTimesRef.current.length > sampleSize) {
      frameTimesRef.current.shift();
    }
    
    frameCountRef.current++;
    
    // Track dropped frames (>16.67ms)
    if (frameTime > 16.67) {
      droppedFramesRef.current++;
    }
    
    // Check for severe frame drops
    if (frameTime > frameTimeWarningMs) {
      const timeSinceLastWarning = now - lastWarningTimeRef.current;
      if (timeSinceLastWarning > 5000 && onPerformanceWarning) { // Throttle warnings to 5s
        lastWarningTimeRef.current = now;
        const currentMetrics = computeMetrics();
        onPerformanceWarning(currentMetrics);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sampleSize, frameTimeWarningMs, onPerformanceWarning]);
  
  /**
   * Record a render
   */
  const recordRender = useCallback(() => {
    if (!enabled) return;
    renderCountRef.current++;
  }, [enabled]);
  
  /**
   * Compute current metrics
   */
  const computeMetrics = useCallback((): PerfMetrics => {
    const frameTimes = frameTimesRef.current;
    const now = performance.now();
    
    if (frameTimes.length === 0) {
      return {
        fps: 60,
        avgFrameTimeMs: 16.67,
        maxFrameTimeMs: 16.67,
        frameCount: 0,
        renderCount: 0,
        droppedFrames: 0,
        elapsedSeconds: (now - startTimeRef.current) / 1000,
        isDegraded: false,
      };
    }
    
    const avgFrameTimeMs = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const maxFrameTimeMs = Math.max(...frameTimes);
    const fps = avgFrameTimeMs > 0 ? 1000 / avgFrameTimeMs : 60;
    const isDegraded = fps < fpsWarningThreshold || maxFrameTimeMs > frameTimeWarningMs;
    
    return {
      fps: Math.round(fps * 10) / 10,
      avgFrameTimeMs: Math.round(avgFrameTimeMs * 100) / 100,
      maxFrameTimeMs: Math.round(maxFrameTimeMs * 100) / 100,
      frameCount: frameCountRef.current,
      renderCount: renderCountRef.current,
      droppedFrames: droppedFramesRef.current,
      elapsedSeconds: Math.round((now - startTimeRef.current) / 1000),
      isDegraded,
    };
  }, [fpsWarningThreshold, frameTimeWarningMs]);
  
  /**
   * Reset metrics
   */
  const reset = useCallback(() => {
    frameTimesRef.current = [];
    frameCountRef.current = 0;
    renderCountRef.current = 0;
    droppedFramesRef.current = 0;
    startTimeRef.current = performance.now();
    lastFrameTimeRef.current = performance.now();
    lastWarningTimeRef.current = 0;
    
    setMetrics({
      fps: 60,
      avgFrameTimeMs: 16.67,
      maxFrameTimeMs: 16.67,
      frameCount: 0,
      renderCount: 0,
      droppedFrames: 0,
      elapsedSeconds: 0,
      isDegraded: false,
    });
  }, []);
  
  // Update metrics display periodically
  useEffect(() => {
    if (!enabled) return;
    
    const interval = setInterval(() => {
      setMetrics(computeMetrics());
    }, 500); // Update every 500ms
    
    return () => clearInterval(interval);
  }, [enabled, computeMetrics]);
  
  return {
    metrics,
    recordFrame,
    recordRender,
    reset,
    enabled,
  };
}

// ============================================================================
// DEBUG HUD COMPONENT
// ============================================================================

interface CosmicDebugHudProps {
  metrics: PerfMetrics;
  visible?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

/**
 * Debug HUD component for displaying performance metrics
 * Only renders when visible is true
 */
export function CosmicDebugHud({ 
  metrics, 
  visible = false,
  position = "top-right",
}: CosmicDebugHudProps) {
  if (!visible) return null;
  
  const positionStyles: Record<string, React.CSSProperties> = {
    "top-left": { top: 8, left: 8 },
    "top-right": { top: 8, right: 8 },
    "bottom-left": { bottom: 8, left: 8 },
    "bottom-right": { bottom: 8, right: 8 },
  };
  
  return (
    <div
      style={{
        position: "fixed",
        ...positionStyles[position],
        background: "rgba(0, 0, 0, 0.85)",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 11,
        fontFamily: "monospace",
        zIndex: 9999,
        minWidth: 140,
      }}
    >
      <div style={{ 
        color: metrics.isDegraded ? "#ff6b6b" : "#6bff6b",
        fontWeight: 600,
        marginBottom: 4,
      }}>
        {metrics.fps.toFixed(1)} FPS
      </div>
      <div style={{ color: "#aaa" }}>
        Frame: {metrics.avgFrameTimeMs.toFixed(2)}ms avg
      </div>
      <div style={{ color: "#aaa" }}>
        Max: {metrics.maxFrameTimeMs.toFixed(2)}ms
      </div>
      <div style={{ color: "#aaa" }}>
        Dropped: {metrics.droppedFrames}
      </div>
      <div style={{ color: "#666", marginTop: 4 }}>
        Renders: {metrics.renderCount}
      </div>
    </div>
  );
}

export default useCosmicPerfTracer;
