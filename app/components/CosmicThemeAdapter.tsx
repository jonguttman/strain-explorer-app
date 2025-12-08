/**
 * CosmicThemeAdapter.tsx
 * 
 * Phase 8A/8B: Adapter component for integrating Cosmic theme into existing UI
 * 
 * This component bridges the existing StrainExplorerClient data model
 * with the new Cosmic theme visualization system.
 */

"use client";

import React, { useMemo } from "react";
import type { DoseKey, TraitAxisId, DoseTraits, StrainExperienceMeta } from "@/lib/types";
import { CosmicThemeDemo } from "@/app/cosmic-theme";
import type { CosmicPresetId } from "@/app/cosmic-theme/config/cosmicThemeVisualPresets";

// ============================================================================
// TYPES
// ============================================================================

export interface CosmicThemeAdapterProps {
  /** Strain identifier */
  strainId: string;
  
  /** Strain display name */
  strainName: string;
  
  /** Current dose key */
  doseKey: DoseKey;
  
  /** Accent color (strain color) */
  accentHex: string;
  
  /** Trait data from API */
  traits: DoseTraits;
  
  /** Axis labels in order */
  axisLabels: TraitAxisId[];
  
  /** Experience metadata */
  experienceMeta?: StrainExperienceMeta | null;
  
  /** Visual theme preset */
  themeId?: CosmicPresetId;
  
  /** Container width */
  width?: number;
  
  /** Container height */
  height?: number;
  
  /** Whether animation is paused */
  paused?: boolean;
  
  /** Whether to show axis labels */
  showLabels?: boolean;
  
  /** Whether to show effect message */
  showMessage?: boolean;
  
  /** Additional CSS class */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CosmicThemeAdapter({
  strainId,
  strainName,
  doseKey,
  accentHex,
  traits,
  axisLabels,
  experienceMeta,
  themeId = "cosmic",
  width = 400,
  height = 400,
  paused = false,
  showLabels = true,
  showMessage = true,
  className,
}: CosmicThemeAdapterProps) {
  // Convert DoseTraits to raw trait record
  const rawTraits = useMemo(() => {
    const result: Record<TraitAxisId, number> = {} as Record<TraitAxisId, number>;
    for (const axis of axisLabels) {
      result[axis] = traits.values[axis] ?? 0;
    }
    return result;
  }, [traits, axisLabels]);
  
  return (
    <CosmicThemeDemo
      strainId={strainId}
      strainName={strainName}
      doseKey={doseKey}
      accentHex={accentHex}
      rawTraits={rawTraits}
      axes={axisLabels}
      experienceMeta={experienceMeta}
      presetId={themeId}
      width={width}
      height={height}
      paused={paused}
      showLabels={showLabels}
      showMessage={showMessage}
      className={className}
    />
  );
}

export default CosmicThemeAdapter;
