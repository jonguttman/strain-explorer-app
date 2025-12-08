/**
 * COSMIC THEME REBUILD — PHASE 2
 * --------------------------------
 * This file is part of a fresh rebuild of the cosmic demo.
 * Cursor MUST NOT import or copy logic from:
 * - InlineCosmicFireRadarDemo.tsx
 * - InlineCosmicRadarDemo.tsx
 * - tripdarRadar.ts
 *
 * Phase 2: Core architecture and math foundation only.
 * Phase 6A.2: SSR-safe (no hooks, pure component).
 * No rendering, no SVG, no animations, no timers.
 */

"use client";

import { useMemo } from "react";

/**
 * Message effects configuration.
 * Defines which axes or effects should be emphasized when a message is displayed.
 */
export interface CosmicMessageEffects {
  clarity?: boolean; // Emphasize clarity/clarity axis
  creativity?: boolean; // Emphasize creativity axis
  connect?: boolean; // Emphasize connection/social axis
  introspection?: boolean; // Emphasize introspection axis (for depth message)
}

/**
 * Cosmic theme message definition.
 * Represents a message that can be displayed during the demo.
 */
export interface CosmicMessage {
  id: string;
  title: string;
  subtitle?: string;
  effects?: CosmicMessageEffects;
}

/**
 * Message registry.
 * Maps message IDs to their definitions.
 */
const COSMIC_MESSAGES: Record<string, CosmicMessage> = {
  clarity: {
    id: "clarity",
    title: "Sometimes you want clarity.",
    effects: {
      clarity: true,
    },
  },
  depth: {
    id: "depth",
    title: "Sometimes you need depth.",
    effects: {
      introspection: true,
    },
  },
  creativity: {
    id: "creativity",
    title: "Sometimes you're seeking creativity.",
    effects: {
      creativity: true,
    },
  },
  connect: {
    id: "connect",
    title: "Sometimes you want to connect.",
    effects: {
      connect: true,
    },
  },
};

/**
 * Get a message by its ID.
 * @param messageId - The message identifier
 * @returns The message definition, or undefined if not found
 */
export function getCosmicMessage(messageId: string): CosmicMessage | undefined {
  return COSMIC_MESSAGES[messageId];
}

/**
 * Get all available messages.
 * @returns Array of all message definitions
 */
export function getAllCosmicMessages(): CosmicMessage[] {
  return Object.values(COSMIC_MESSAGES);
}

/**
 * Check if a message has a specific effect.
 * @param message - The message definition
 * @param effectKey - The effect key to check (e.g., "clarity", "creativity", "connect")
 * @returns True if the message has the specified effect
 */
export function messageHasEffect(
  message: CosmicMessage,
  effectKey: keyof CosmicMessageEffects
): boolean {
  return message.effects?.[effectKey] === true;
}

/**
 * Get all effects for a message.
 * @param message - The message definition
 * @returns Array of effect keys that are enabled
 */
export function getMessageEffects(
  message: CosmicMessage
): Array<keyof CosmicMessageEffects> {
  if (!message.effects) {
    return [];
  }
  return Object.keys(message.effects).filter(
    (key) => message.effects?.[key as keyof CosmicMessageEffects] === true
  ) as Array<keyof CosmicMessageEffects>;
}

import type { CosmicChoreographyDescriptor } from "./config/cosmicThemeChoreography";
import { getCosmicVisualPreset, type CosmicThemeId } from "./config/cosmicThemeVisualPresets";
// Phase 6I: Timeline frame integration
import type { CosmicTimelineFrame } from "./choreography/timelineEngine";
import { ensureContrast } from "./utils/ensureContrast";

/**
 * PHASE 5B — Message component with cinematic fade + scale transitions.
 * Renders message text with smooth transitions when messageId changes.
 * Phase 4F: Applies choreography message delay for phase transitions.
 * Phase 5B: Uses preset label styles for text appearance.
 */
export default function CosmicThemeMessages({
  messageId,
  choreography,
  blendProgress = 0,
  themeId = "cosmic",
  reduceMotion = false,
  currentFrame,
  _themeBlendProgress, // Phase 7B: Reserved for Phase 8A
}: {
  messageId?: string;
  choreography?: CosmicChoreographyDescriptor;
  blendProgress?: number;
  themeId?: CosmicThemeId;
  // Phase 6J: Reduced motion mode
  reduceMotion?: boolean;
  // Phase 6I: Timeline frame integration
  currentFrame?: CosmicTimelineFrame;
  // Phase 7B: Theme blend preparation (reserved for Phase 8A theme transition choreography)
  // Phase 7D: _themeBlendProgress fully threaded; no visual logic attached yet.
  _themeBlendProgress?: number;
}) {
  // Phase 7: Theme blend effects - fade in messages as Cosmic appears
  const blend = _themeBlendProgress ?? 1; // Default to full cosmic for lab pages
  const messageOpacity = blend;
  
  // Phase 6A.3: Memoize message and preset lookups
  const message = useMemo(() => messageId ? getCosmicMessage(messageId) : null, [messageId]);
  const preset = useMemo(() => getCosmicVisualPreset(themeId), [themeId]);
  
  // Phase 6C.3: Get target contrast ratio based on theme
  const targetContrastRatio = useMemo(() => {
    switch (themeId) {
      case "cosmic": return 4.0;
      case "apothecary": return 3.5;
      case "minimal": return 4.5;
      default: return 4.0;
    }
  }, [themeId]);
  
  // Phase 6C.3: Get background color for contrast calculation
  const bgColorHex = useMemo(() => {
    switch (themeId) {
      case "cosmic": return "#b89050"; // Darker gold from gradient
      case "apothecary": return "#b4a488"; // Darker sepia from gradient
      case "minimal": return "#e8e8e8"; // Light gray from gradient
      default: return "#b89050";
    }
  }, [themeId]);
  
  // Phase 6C.3: Calculate contrast-adjusted message text color
  const adjustedMessageColor = useMemo(() => {
    // Extract hex from rgba color string
    const labelColorMatch = preset.labelStyle.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!labelColorMatch) return preset.labelStyle.color;
    
    const r = parseInt(labelColorMatch[1], 10);
    const g = parseInt(labelColorMatch[2], 10);
    const b = parseInt(labelColorMatch[3], 10);
    const labelColorHex = `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`;
    
    return ensureContrast(labelColorHex, bgColorHex, targetContrastRatio);
  }, [preset.labelStyle.color, bgColorHex, targetContrastRatio]);
  
  if (!messageId || !message) {
    return null;
  }
  
  // Phase 4F: Apply message delay from choreography
  const messageDelay = choreography?.messageDelay ?? 0;
  const effectiveOpacity = blendProgress > 0 && messageDelay > 0 
    ? Math.min(blendProgress * (1000 / messageDelay), 1) 
    : 1;

  // Phase 6I: Blend timeline message values with existing transitions
  // Phase 6J.3.4: When reduceMotion, reduce scale range closer to 0.98–1.02
  const timelineOpacity = currentFrame?.message.opacity ?? 1;
  const rawTimelineScale = currentFrame?.message.scale ?? 1;
  const timelineScale = reduceMotion 
    ? 1.0 + (rawTimelineScale - 1.0) * 0.3  // Reduce scale overshoot to 30%
    : rawTimelineScale;
  const finalOpacity = effectiveOpacity * timelineOpacity;
  const finalScale = timelineScale;

  return (
    <div
      key={messageId}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        opacity: finalOpacity * messageOpacity,
        transform: `scale(${finalScale})`,
        // Phase 6J.3.4: When reduceMotion, ensure duration ≤ 300ms and simpler easing
        transition: reduceMotion
          ? "opacity 300ms ease-out, transform 300ms ease-out"
          : "opacity 400ms ease-out, transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        // Phase 4F: Apply message delay
        transitionDelay: messageDelay > 0 ? `${messageDelay}ms` : undefined,
      }}
    >
      <div className="text-center px-4">
        <h2 
          className="text-lg font-semibold mb-1"
          style={{
            color: adjustedMessageColor,
            fontWeight: preset.labelStyle.fontWeight,
            letterSpacing: preset.labelStyle.letterSpacing,
            opacity: preset.labelStyle.opacity ?? 1.0,
            // Phase 6C.3: Add subtle text-shadow for additional contrast safety
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
          }}
        >
          {message.title}
        </h2>
        {message.subtitle && (
          <p 
            className="text-sm"
            style={{
              color: adjustedMessageColor,
              fontWeight: preset.labelStyle.fontWeight,
              letterSpacing: preset.labelStyle.letterSpacing,
              opacity: (preset.labelStyle.opacity ?? 1.0) * 0.8,
              // Phase 6C.3: Add subtle text-shadow for additional contrast safety
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
            }}
          >
            {message.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

