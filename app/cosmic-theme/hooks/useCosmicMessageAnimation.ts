/**
 * COSMIC THEME REBUILD — PHASE 4E
 * --------------------------------
 * Message-driven animation overlay hook.
 * Returns CSS animation styles for label, star, halo, and polygon effects
 * based on the current messageId.
 * 
 * Guardrail compliance: CSS-only animations, no geometry modifications.
 */

import { useMemo } from "react";

export type CosmicMessageId = "creativity" | "clarity" | "depth" | "connect" | null;

export interface CosmicMessageAnimationStyles {
  labelEffectStyle: React.CSSProperties;
  starEffectStyle: React.CSSProperties;
  haloEffectStyle: React.CSSProperties;
  polygonEffectStyle: React.CSSProperties;
  // Additional styles for special effects (e.g., inner disc overlay)
  innerDiscStyle?: React.CSSProperties;
  centerGlowStyle?: React.CSSProperties;
}

/**
 * Phase 4E: Message animation hook.
 * Returns CSS animation styles based on messageId.
 * All animations are interruptible, reversible, and stateless.
 * Phase 6C.6: Supports reduced motion mode.
 */
export function useCosmicMessageAnimation(
  messageId: CosmicMessageId,
  reduceMotion: boolean = false
): CosmicMessageAnimationStyles {
  return useMemo(() => {
    // Default: no animation effects
    const defaultStyles: CosmicMessageAnimationStyles = {
      labelEffectStyle: {},
      starEffectStyle: {},
      haloEffectStyle: {},
      polygonEffectStyle: {},
    };

    if (!messageId) {
      return defaultStyles;
    }

    switch (messageId) {
      case "creativity": {
        // ✨ Creativity: shimmer/wobble on label, star shimmer pulse
        // Phase 6C.6: Disable creativity wobble when reduceMotion is enabled
        return {
          labelEffectStyle: reduceMotion ? {} : {
            animation: "creativityLabelShimmer 350ms cubic-bezier(0.25, 0.9, 0.35, 1) forwards",
          },
          starEffectStyle: reduceMotion ? {} : {
            animation: "creativityStarPulse 350ms cubic-bezier(0.25, 0.9, 0.35, 1) forwards",
          },
          haloEffectStyle: {},
          polygonEffectStyle: {},
        };
      }

      case "clarity": {
        // 🔍 Clarity: focus-in effect (letter-spacing, stroke-width, halo brightness)
        return {
          labelEffectStyle: {
            animation: "clarityLabelFocus 250ms ease-out forwards",
          },
          starEffectStyle: {},
          haloEffectStyle: {
            animation: "clarityHaloBrightness 250ms ease-out forwards",
          },
          polygonEffectStyle: {
            animation: "clarityPolygonStroke 250ms ease-out forwards",
          },
        };
      }

      case "depth": {
        // 🌑 Depth: descending inward (inner disc overlay, polygon opacity)
        return {
          labelEffectStyle: {},
          starEffectStyle: {},
          haloEffectStyle: {},
          polygonEffectStyle: {
            animation: "depthPolygonOpacity 400ms ease-in-out forwards",
          },
          innerDiscStyle: {
            animation: "depthInnerDisc 400ms ease-in-out forwards",
          },
        };
      }

      case "connect": {
        // 🤝 Connect: merge motion (stars shift inward, polygon shrink, center glow)
        return {
          labelEffectStyle: {},
          starEffectStyle: {
            animation: "connectStarMerge 300ms cubic-bezier(0.2, 0, 0.2, 1) forwards",
          },
          haloEffectStyle: {},
          polygonEffectStyle: {
            animation: "connectPolygonMerge 300ms cubic-bezier(0.2, 0, 0.2, 1) forwards",
          },
          centerGlowStyle: {
            animation: "connectCenterGlow 300ms cubic-bezier(0.2, 0, 0.2, 1) forwards",
          },
        };
      }

      default:
        return defaultStyles;
    }
  }, [messageId]);
}

/**
 * Get CSS keyframes string for all message animations.
 * This should be injected into a <style> tag in the component tree.
 */
export function getCosmicMessageAnimationKeyframes(): string {
  return `
    /* ✨ Creativity animations */
    @keyframes creativityLabelShimmer {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.06);
      }
      100% {
        transform: scale(1);
      }
    }

    @keyframes creativityStarPulse {
      0% {
        opacity: 0.7;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0.8;
      }
    }

    /* 🔍 Clarity animations */
    @keyframes clarityLabelFocus {
      0% {
        letter-spacing: 1.5px;
      }
      100% {
        letter-spacing: 0.5px;
      }
    }

    @keyframes clarityHaloBrightness {
      0% {
        filter: brightness(1);
      }
      100% {
        filter: brightness(1.1);
      }
    }

    @keyframes clarityPolygonStroke {
      0% {
        stroke-width: 1;
      }
      100% {
        stroke-width: 2;
      }
    }

    /* 🌑 Depth animations */
    @keyframes depthPolygonOpacity {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.85;
      }
      100% {
        opacity: 1;
      }
    }

    @keyframes depthInnerDisc {
      0% {
        opacity: 0;
      }
      50% {
        opacity: 0.6;
      }
      100% {
        opacity: 0.3;
      }
    }

    /* 🤝 Connect animations */
    @keyframes connectStarMerge {
      0% {
        transform: translate(0, 0) scale(1);
      }
      50% {
        transform: translate(-2px, -2px) scale(0.95);
      }
      100% {
        transform: translate(0, 0) scale(1);
      }
    }

    @keyframes connectPolygonMerge {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(0.97);
      }
      100% {
        transform: scale(1);
      }
    }

    @keyframes connectCenterGlow {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }
      50% {
        opacity: 0.4;
        transform: scale(1.1);
      }
      100% {
        opacity: 0;
        transform: scale(1);
      }
    }
  `;
}

