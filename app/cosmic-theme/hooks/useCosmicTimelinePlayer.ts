// app/cosmic-theme/hooks/useCosmicTimelinePlayer.ts
// Phase 6H: rAF-based timeline frame player
// Guardrails: single rAF loop, no setInterval/setTimeout, clean cleanup.

"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CosmicTimeline,
  CosmicTimelineFrame,
} from "@/app/cosmic-theme/choreography/timelineEngine";

function createIdleFrame(): CosmicTimelineFrame {
  return {
    halo: {
      intensity: 0.5,
      rotation: 0,
    },
    stars: {
      twinkle: 0.8,
      driftX: 0,
      driftY: 0,
    },
    radar: {
      wobble: 0,
      pulse: 1,
    },
    message: {
      opacity: 1,
      scale: 1,
    },
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolateFrames(
  a: CosmicTimelineFrame,
  b: CosmicTimelineFrame,
  t: number
): CosmicTimelineFrame {
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;

  return {
    halo: {
      intensity: lerp(a.halo.intensity, b.halo.intensity, clamped),
      rotation: lerp(a.halo.rotation, b.halo.rotation, clamped),
    },
    stars: {
      twinkle: lerp(a.stars.twinkle, b.stars.twinkle, clamped),
      driftX: lerp(a.stars.driftX, b.stars.driftX, clamped),
      driftY: lerp(a.stars.driftY, b.stars.driftY, clamped),
    },
    radar: {
      wobble: lerp(a.radar.wobble, b.radar.wobble, clamped),
      pulse: lerp(a.radar.pulse, b.radar.pulse, clamped),
    },
    message: {
      opacity: lerp(a.message.opacity, b.message.opacity, clamped),
      scale: lerp(a.message.scale, b.message.scale, clamped),
    },
  };
}

export function useCosmicTimelinePlayer(
  timeline: CosmicTimeline,
  isPlaying: boolean,
  reduceMotion: boolean
): { currentFrame: CosmicTimelineFrame; progress: number } {
  const [currentFrame, setCurrentFrame] = useState<CosmicTimelineFrame>(
    () => createIdleFrame()
  );
  const [progress, setProgress] = useState(0);

  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // If we don't have a timeline, or playback is disabled, or reduceMotion is on,
    // just return an idle frame and stop any active loop.
    if (!timeline || !timeline.frames.length || !isPlaying || reduceMotion) {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setCurrentFrame(createIdleFrame());
      setProgress(0);
      startTimeRef.current = null;
      return;
    }

    const { durationMs, frames } = timeline;
    const frameCount = frames.length;

    if (frameCount === 0 || durationMs <= 0) {
      setCurrentFrame(createIdleFrame());
      setProgress(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (startTimeRef.current == null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const loopProgress = (elapsed % durationMs) / durationMs; // 0–1

      const exactIndex = loopProgress * frameCount;
      const index1 = Math.floor(exactIndex) % frameCount;
      const index2 = (index1 + 1) % frameCount;
      const frameProgress = exactIndex - index1;

      const frame1 = frames[index1];
      const frame2 = frames[index2];

      const interpolatedFrame = interpolateFrames(frame1, frame2, frameProgress);

      setCurrentFrame(interpolatedFrame);
      setProgress(loopProgress);

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      startTimeRef.current = null;
    };
  }, [timeline, isPlaying, reduceMotion]);

  return { currentFrame, progress };
}
