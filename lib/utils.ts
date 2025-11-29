// Shared utility functions for the strain explorer application

import type { EditorDataset } from "./types";

/**
 * Formats a trait axis ID into a human-readable label
 * Example: "spiritual_depth" → "Spiritual Depth"
 */
export function formatAxisLabel(label: string): string {
  return label
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Converts a hex color to RGBA format with specified alpha
 * @param hex - Hex color string (with or without #)
 * @param alpha - Alpha value between 0 and 1
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex?.replace("#", "") || "4a371f";
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Deep clones a dataset object
 * Used in the admin editor to manage state
 */
export function cloneDataset(data: EditorDataset): EditorDataset {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Normalizes and validates a hex color string
 * Ensures the value has a # prefix
 */
export function normalizeAccentHex(value: string, fallback = "#4a371f"): string {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

