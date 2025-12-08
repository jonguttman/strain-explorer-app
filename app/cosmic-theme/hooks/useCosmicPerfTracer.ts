"use client";

import { useEffect, useRef, useState } from "react";

export type CosmicPerfSnapshot = {
  fps: number | null;
  lastFrameMs: number | null;
  frameCount: number;
};

/**
 * Phase 6B: Performance tracer hook for Cosmic Theme.
 * Measures FPS and frame duration using requestAnimationFrame.
 * Only active when enabled=true, otherwise returns stable null values.
 */
export function useCosmicPerfTracer(enabled: boolean): CosmicPerfSnapshot {
  const [snapshot, setSnapshot] = useState<CosmicPerfSnapshot>({
    fps: null,
    lastFrameMs: null,
    frameCount: 0,
  });

  const frameCountRef = useRef(0);
  const previousTimestampRef = useRef<number | null>(null);
  const frameDeltasRef = useRef<number[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastLogTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      // Clean up any running animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      // Reset to stable null state
      setSnapshot({
        fps: null,
        lastFrameMs: null,
        frameCount: 0,
      });
      frameCountRef.current = 0;
      previousTimestampRef.current = null;
      frameDeltasRef.current = [];
      return;
    }

    // Start performance tracing
    const measureFrame = (timestamp: number) => {
      if (previousTimestampRef.current === null) {
        previousTimestampRef.current = timestamp;
        rafIdRef.current = requestAnimationFrame(measureFrame);
        return;
      }

      const delta = timestamp - previousTimestampRef.current;
      previousTimestampRef.current = timestamp;

      // Track frame deltas (rolling window of last 20 frames)
      frameDeltasRef.current.push(delta);
      if (frameDeltasRef.current.length > 20) {
        frameDeltasRef.current.shift();
      }

      // Calculate average delta for FPS
      const avgDelta = frameDeltasRef.current.reduce((a, b) => a + b, 0) / frameDeltasRef.current.length;
      const fps = Math.round((1000 / avgDelta) * 10) / 10; // Round to 1 decimal

      frameCountRef.current += 1;

      setSnapshot({
        fps,
        lastFrameMs: delta,
        frameCount: frameCountRef.current,
      });

      // Dev-only throttled logging (once every ~1-2 seconds)
      if (process.env.NODE_ENV === "development") {
        const now = Date.now();
        if (now - lastLogTimeRef.current > 2000) {
          console.debug("[CosmicPerf]", {
            fps,
            lastFrameMs: delta.toFixed(2),
            frameCount: frameCountRef.current,
          });
          lastLogTimeRef.current = now;
        }
      }

      rafIdRef.current = requestAnimationFrame(measureFrame);
    };

    // Initialize
    previousTimestampRef.current = null;
    rafIdRef.current = requestAnimationFrame(measureFrame);

    // Cleanup
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [enabled]);

  return snapshot;
}

