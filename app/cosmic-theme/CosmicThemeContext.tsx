/**
 * CosmicThemeContext.tsx
 * 
 * Phase 8B: Theme context for managing Cosmic theme state
 * 
 * Provides:
 * - Theme mode (classic vs cosmic)
 * - Theme preset ID (cosmic, apothecary, minimal)
 * - Theme blend progress for crossfade transitions
 * - Feature flag for enabling/disabling cosmic theme
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { CosmicPresetId } from "./config/cosmicThemeVisualPresets";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Theme mode determines which renderer is active
 * - "classic": Original Chart.js based radar
 * - "cosmic": New SVG-based Cosmic theme renderer
 */
export type ThemeMode = "classic" | "cosmic";

/**
 * Theme context value
 */
export interface CosmicThemeContextValue {
  /** Whether cosmic theme feature is enabled */
  cosmicEnabled: boolean;
  
  /** Current theme mode */
  themeMode: ThemeMode;
  
  /** Current cosmic preset ID (only relevant when themeMode is "cosmic") */
  presetId: CosmicPresetId;
  
  /** Blend progress for crossfade (0 = fully classic, 1 = fully cosmic) */
  blendProgress: number;
  
  /** Whether crossfade animation is in progress */
  isTransitioning: boolean;
  
  /** Set theme mode */
  setThemeMode: (mode: ThemeMode) => void;
  
  /** Set cosmic preset */
  setPresetId: (id: CosmicPresetId) => void;
  
  /** Toggle between classic and cosmic */
  toggleTheme: () => void;
  
  /** Start crossfade transition to target mode */
  startCrossfade: (targetMode: ThemeMode, durationMs?: number) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const defaultValue: CosmicThemeContextValue = {
  cosmicEnabled: true,
  themeMode: "classic",
  presetId: "cosmic",
  blendProgress: 0,
  isTransitioning: false,
  setThemeMode: () => {},
  setPresetId: () => {},
  toggleTheme: () => {},
  startCrossfade: () => {},
};

const CosmicThemeContext = createContext<CosmicThemeContextValue>(defaultValue);

// ============================================================================
// PROVIDER
// ============================================================================

export interface CosmicThemeProviderProps {
  children: ReactNode;
  /** Override feature flag */
  enabled?: boolean;
  /** Initial theme mode */
  initialMode?: ThemeMode;
  /** Initial preset ID */
  initialPreset?: CosmicPresetId;
  /** Default crossfade duration */
  defaultCrossfadeDurationMs?: number;
}

export function CosmicThemeProvider({
  children,
  enabled = true,
  initialMode = "classic",
  initialPreset = "cosmic",
  defaultCrossfadeDurationMs = 500,
}: CosmicThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialMode);
  const [presetId, setPresetId] = useState<CosmicPresetId>(initialPreset);
  const [blendProgress, setBlendProgress] = useState(initialMode === "cosmic" ? 1 : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Animation ref for cleanup
  const animationRef = React.useRef<number | null>(null);
  
  // Set theme mode immediately (no animation)
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    setBlendProgress(mode === "cosmic" ? 1 : 0);
    setIsTransitioning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);
  
  // Toggle between modes
  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === "classic" ? "cosmic" : "classic");
  }, [themeMode, setThemeMode]);
  
  // Animated crossfade
  const startCrossfade = useCallback((
    targetMode: ThemeMode,
    durationMs = defaultCrossfadeDurationMs
  ) => {
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    const startProgress = blendProgress;
    const targetProgress = targetMode === "cosmic" ? 1 : 0;
    const startTime = performance.now();
    
    setIsTransitioning(true);
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      
      // Ease-in-out curve
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const newBlend = startProgress + (targetProgress - startProgress) * eased;
      setBlendProgress(newBlend);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setThemeModeState(targetMode);
        setBlendProgress(targetProgress);
        setIsTransitioning(false);
        animationRef.current = null;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [blendProgress, defaultCrossfadeDurationMs]);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  const value = useMemo<CosmicThemeContextValue>(() => ({
    cosmicEnabled: enabled,
    themeMode,
    presetId,
    blendProgress,
    isTransitioning,
    setThemeMode,
    setPresetId,
    toggleTheme,
    startCrossfade,
  }), [
    enabled,
    themeMode,
    presetId,
    blendProgress,
    isTransitioning,
    setThemeMode,
    setPresetId,
    toggleTheme,
    startCrossfade,
  ]);
  
  return (
    <CosmicThemeContext.Provider value={value}>
      {children}
    </CosmicThemeContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Use the cosmic theme context
 */
export function useCosmicTheme(): CosmicThemeContextValue {
  return useContext(CosmicThemeContext);
}

/**
 * Check if cosmic theme is enabled
 */
export function useCosmicEnabled(): boolean {
  const { cosmicEnabled } = useCosmicTheme();
  return cosmicEnabled;
}

/**
 * Get current theme mode and blend progress
 */
export function useThemeBlend(): {
  mode: ThemeMode;
  blend: number;
  isTransitioning: boolean;
} {
  const { themeMode, blendProgress, isTransitioning } = useCosmicTheme();
  return { mode: themeMode, blend: blendProgress, isTransitioning };
}

export default CosmicThemeContext;
