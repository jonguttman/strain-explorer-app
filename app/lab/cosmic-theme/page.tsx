/**
 * Cosmic Theme Lab Page
 * 
 * Phase 8A: Interactive demo for testing the Cosmic theme visualization
 */

"use client";

import React, { useState, useMemo } from "react";
import { CosmicThemeDemo } from "@/app/cosmic-theme";
import type { CosmicPresetId } from "@/app/cosmic-theme/config/cosmicThemeVisualPresets";
import type { DoseKey, TraitAxisId } from "@/lib/types";

// Sample strain data for testing
const SAMPLE_STRAINS = [
  {
    id: "golden-teacher",
    name: "Golden Teacher",
    colorHex: "#f3b34c",
    effectWord: "Create",
    effectTagline: "Unlock creative potential",
    traits: { visuals: 65, euphoria: 70, introspection: 60, creativity: 85, spiritual_depth: 55, sociability: 75 },
  },
  {
    id: "penis-envy",
    name: "Penis Envy",
    colorHex: "#8c6cae",
    effectWord: "Transform",
    effectTagline: "Deep perspective shifts",
    traits: { visuals: 90, euphoria: 60, introspection: 85, creativity: 70, spiritual_depth: 90, sociability: 40 },
  },
  {
    id: "amazonian",
    name: "Amazonian",
    colorHex: "#95a751",
    effectWord: "Connect",
    effectTagline: "Feel the natural bond",
    traits: { visuals: 55, euphoria: 80, introspection: 50, creativity: 60, spiritual_depth: 45, sociability: 85 },
  },
];

const DOSE_OPTIONS: DoseKey[] = ["micro", "mini", "macro", "museum", "mega", "hero"];
const PRESET_OPTIONS: CosmicPresetId[] = ["cosmic", "apothecary", "minimal"];
const AXES: TraitAxisId[] = ["visuals", "euphoria", "introspection", "creativity", "spiritual_depth", "sociability"];

export default function CosmicThemeLabPage() {
  const [selectedStrainIndex, setSelectedStrainIndex] = useState(0);
  const [selectedDose, setSelectedDose] = useState<DoseKey>("macro");
  const [selectedPreset, setSelectedPreset] = useState<CosmicPresetId>("cosmic");
  const [isPaused, setIsPaused] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showMessage, setShowMessage] = useState(true);
  
  const currentStrain = SAMPLE_STRAINS[selectedStrainIndex];
  
  // Apply dose modifier to traits
  const doseModifier = useMemo(() => {
    switch (selectedDose) {
      case "micro": return 0.3;
      case "mini": return 0.5;
      case "macro": return 1.0;
      case "museum": return 1.2;
      case "mega": return 1.3;
      case "hero": return 1.5;
      default: return 1.0;
    }
  }, [selectedDose]);
  
  const modifiedTraits = useMemo(() => {
    const result: Record<TraitAxisId, number> = {} as Record<TraitAxisId, number>;
    for (const axis of AXES) {
      result[axis] = Math.min(100, Math.round(currentStrain.traits[axis] * doseModifier));
    }
    return result;
  }, [currentStrain.traits, doseModifier]);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Cosmic Theme Lab</h1>
        <p className="text-gray-400 mb-8">Phase 8A: Multi-band Timeline Animation System</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visualization */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Visualization</h2>
            <div className="flex justify-center">
              <CosmicThemeDemo
                strainId={currentStrain.id}
                strainName={currentStrain.name}
                doseKey={selectedDose}
                accentHex={currentStrain.colorHex}
                rawTraits={modifiedTraits}
                axes={AXES}
                experienceMeta={{
                  effectWord: currentStrain.effectWord,
                  effectTagline: currentStrain.effectTagline,
                  tripProfileBullets: [],
                  bestForTags: [],
                  experienceLevel: "balanced",
                  timeline: {
                    onsetMinMinutes: 20,
                    onsetMaxMinutes: 45,
                    peakMinHours: 2,
                    peakMaxHours: 4,
                    tailMinHours: 4,
                    tailMaxHours: 6,
                  },
                }}
                presetId={selectedPreset}
                width={400}
                height={450}
                paused={isPaused}
                showLabels={showLabels}
                showMessage={showMessage}
              />
            </div>
          </div>
          
          {/* Controls */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Controls</h2>
            
            <div className="space-y-6">
              {/* Strain selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Strain
                </label>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_STRAINS.map((strain, index) => (
                    <button
                      key={strain.id}
                      onClick={() => setSelectedStrainIndex(index)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        index === selectedStrainIndex
                          ? "text-white shadow-lg"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                      style={{
                        backgroundColor: index === selectedStrainIndex ? strain.colorHex : undefined,
                      }}
                    >
                      {strain.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Dose selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dose Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {DOSE_OPTIONS.map((dose) => (
                    <button
                      key={dose}
                      onClick={() => setSelectedDose(dose)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        dose === selectedDose
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {dose.charAt(0).toUpperCase() + dose.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preset selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visual Preset
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_OPTIONS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSelectedPreset(preset)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        preset === selectedPreset
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {preset.charAt(0).toUpperCase() + preset.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Toggle options */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!isPaused}
                    onChange={(e) => setIsPaused(!e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-300">Animate</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-300">Show Labels</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMessage}
                    onChange={(e) => setShowMessage(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-300">Show Message</span>
                </label>
              </div>
              
              {/* Current traits display */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trait Values
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AXES.map((axis) => (
                    <div key={axis} className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-300 capitalize">
                        {axis.replace("_", " ")}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {modifiedTraits[axis]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Info panel */}
        <div className="mt-8 bg-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Phase 8A Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-indigo-400 mb-2">Multi-Band Halo</h3>
              <p className="text-sm text-gray-400">
                Up to 3 independent halo bands with offset rotations and phase-shifted intensity waves.
                Creates depth and ethereal glow effects.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-indigo-400 mb-2">Two Star Layers</h3>
              <p className="text-sm text-gray-400">
                Foreground stars with higher twinkle and drift, background stars with subtle parallax.
                Creates dimensionality at radar vertices.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-indigo-400 mb-2">Motion Profiles</h3>
              <p className="text-sm text-gray-400">
                Effect word categories drive animation personality. Dose intensity scales motion amplitude.
                Strain-specific seeds create unique signatures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
