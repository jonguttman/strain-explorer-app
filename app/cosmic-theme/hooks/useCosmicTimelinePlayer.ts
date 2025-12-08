/**
 * useCosmicTimelinePlayer.ts
 * 
 * Phase 8A: RAF-based animation loop for Cosmic theme
 * 
 * This hook provides:
 * - Single requestAnimationFrame loop
 * - Automatic frame computation via timeline engine
 * - Performance throttling support
 * - Optional introspection for debugging
 * - Proper cleanup on unmount
 */

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  buildCosmicTimelineFrame,
  type CosmicTimelineFrame,
  type TimelineConfig,
  LOOP_DURATION_SECONDS,
} from "../choreography/timelineEngine";

// ============================================================================
// TYPES
// ============================================================================

export interface TimelinePlayerOptions {
  /** Whether the player is paused */
  paused?: boolean;
  
  /** Whether to enable reduceMotion accessibility mode */
  reduceMotion?: boolean;
  
  /** Throttle mode for low-power devices (reduces FPS) */
  throttleMode?: "none" | "half" | "quarter";
  
  /** Enable introspection data for debugging */
  enableIntrospection?: boolean;
  
  /** Callback for performance tracing */
  onFrameComplete?: (stats: FrameStats) => void;
}

export interface FrameStats {
  /** Time taken to compute frame in ms */
  computeTimeMs: number;
  
  /** Current FPS estimate */
  fps: number;
  
  /** Frame number since start */
  frameNumber: number;
  
  /** Whether frame was skipped due to throttling */
  wasSkipped: boolean;
}

export interface TimelinePlayerState {
  /** Current animation frame */
  frame: CosmicTimelineFrame;
  
  /** Whether the player is running */
  isPlaying: boolean;
  
  /** Current playback time in seconds */
  currentTime: number;
  
  /** Introspection data (if enabled) */
  introspection?: {
    frameNumber: number;
    averageFps: number;
    averageComputeTimeMs: number;
  };
}

export interface TimelinePlayerControls {
  /** Start playback */
  play: () => void;
  
  /** Pause playback */
  pause: () => void;
  
  /** Toggle play/pause */
  toggle: () => void;
  
  /** Seek to specific time (0 to LOOP_DURATION_SECONDS) */
  seekTo: (timeSeconds: number) => void;
  
  /** Reset to beginning */
  reset: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Main hook for running the Cosmic timeline animation loop
 */
export function useCosmicTimelinePlayer(
  config: TimelineConfig,
  options: TimelinePlayerOptions = {}
): [TimelinePlayerState, TimelinePlayerControls] {
  const {
    paused = false,
    reduceMotion = false,
    throttleMode = "none",
    enableIntrospection = false,
    onFrameComplete,
  } = options;
  
  // Merge reduceMotion into config
  const effectiveConfig = useMemo<TimelineConfig>(() => ({
    ...config,
    reduceMotion: reduceMotion || config.reduceMotion,
  }), [config, reduceMotion]);
  
  // State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(!paused);
  
  // Refs for RAF loop
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const frameNumberRef = useRef<number>(0);
  const skipCountRef = useRef<number>(0);
  
  // Introspection tracking
  const fpsHistoryRef = useRef<number[]>([]);
  const computeTimeHistoryRef = useRef<number[]>([]);
  
  // Compute throttle skip rate
  const skipRate = useMemo(() => {
    switch (throttleMode) {
      case "half": return 2;
      case "quarter": return 4;
      default: return 1;
    }
  }, [throttleMode]);
  
  // Compute current frame
  const frame = useMemo(() => {
    return buildCosmicTimelineFrame(currentTime, effectiveConfig);
  }, [currentTime, effectiveConfig]);
  
  // Introspection data
  const introspection = useMemo(() => {
    if (!enableIntrospection) return undefined;
    
    const avgFps = fpsHistoryRef.current.length > 0
      ? fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
      : 60;
    
    const avgCompute = computeTimeHistoryRef.current.length > 0
      ? computeTimeHistoryRef.current.reduce((a, b) => a + b, 0) / computeTimeHistoryRef.current.length
      : 0;
    
    return {
      frameNumber: frameNumberRef.current,
      averageFps: Math.round(avgFps),
      averageComputeTimeMs: Math.round(avgCompute * 100) / 100,
    };
  }, [enableIntrospection, frameNumberRef.current]);
  
  // Animation loop
  const tick = useCallback((timestamp: number) => {
    if (!isPlaying) return;
    
    const deltaMs = timestamp - lastFrameTimeRef.current;
    
    // Skip frame if throttling
    skipCountRef.current++;
    if (skipCountRef.current % skipRate !== 0) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    
    // Track frame timing
    const computeStart = performance.now();
    
    // Compute delta time and update current time
    const deltaSec = Math.min(deltaMs / 1000, 0.1); // Cap at 100ms to prevent jumps
    const newTime = (currentTime + deltaSec) % LOOP_DURATION_SECONDS;
    
    setCurrentTime(newTime);
    lastFrameTimeRef.current = timestamp;
    frameNumberRef.current++;
    
    // Track performance
    const computeEnd = performance.now();
    const computeTimeMs = computeEnd - computeStart;
    const fps = deltaMs > 0 ? 1000 / deltaMs : 60;
    
    if (enableIntrospection) {
      fpsHistoryRef.current.push(fps);
      computeTimeHistoryRef.current.push(computeTimeMs);
      
      // Keep only last 60 samples
      if (fpsHistoryRef.current.length > 60) fpsHistoryRef.current.shift();
      if (computeTimeHistoryRef.current.length > 60) computeTimeHistoryRef.current.shift();
    }
    
    // Callback for tracing
    if (onFrameComplete) {
      onFrameComplete({
        computeTimeMs,
        fps,
        frameNumber: frameNumberRef.current,
        wasSkipped: false,
      });
    }
    
    // Schedule next frame
    rafRef.current = requestAnimationFrame(tick);
  }, [isPlaying, currentTime, skipRate, enableIntrospection, onFrameComplete]);
  
  // Start/stop animation loop
  useEffect(() => {
    if (isPlaying && !effectiveConfig.reduceMotion) {
      lastFrameTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, tick, effectiveConfig.reduceMotion]);
  
  // Sync with paused prop
  useEffect(() => {
    setIsPlaying(!paused);
  }, [paused]);
  
  // Controls
  const controls = useMemo<TimelinePlayerControls>(() => ({
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    toggle: () => setIsPlaying(p => !p),
    seekTo: (timeSeconds: number) => {
      setCurrentTime(Math.max(0, Math.min(LOOP_DURATION_SECONDS, timeSeconds)));
    },
    reset: () => {
      setCurrentTime(0);
      frameNumberRef.current = 0;
      fpsHistoryRef.current = [];
      computeTimeHistoryRef.current = [];
    },
  }), []);
  
  const state: TimelinePlayerState = {
    frame,
    isPlaying,
    currentTime,
    introspection,
  };
  
  return [state, controls];
}

/**
 * Hook for checking user's reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);
  
  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    
    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };
    
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);
  
  return reduceMotion;
}

/**
 * Simplified hook that just returns the current frame
 * Useful when you don't need full control
 */
export function useCosmicFrame(
  config: TimelineConfig,
  options: Omit<TimelinePlayerOptions, "enableIntrospection"> = {}
): CosmicTimelineFrame {
  const [{ frame }] = useCosmicTimelinePlayer(config, options);
  return frame;
}
