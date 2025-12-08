"use client";

import type { DoseKey } from "@/lib/types";
import type { TripdarDemoPhaseId } from "@/app/cosmic-theme/data/cosmicThemePhaseBridge";
// Phase 6E: Unified experience state
import type { UnifiedExperienceState } from "@/app/lib/tripdarExperienceState";
// Phase 6G: Telemetry snapshot
import type { TripdarExperienceTelemetry } from "@/app/lib/tripdarExperienceTelemetry";
// Phase 7A: Feature flag system
import { COSMIC_THEME_ENABLED } from "../../config/featureFlags";

type CosmicDebugHudProps = {
  visible: boolean;
  themeMode: "classic" | "cosmic";
  strainId: string;
  doseKey: DoseKey;
  cosmicPhaseId: string | null;
  demoPhaseId?: TripdarDemoPhaseId | null;
  choreographyId?: string | null;
  blendProgress?: number; // 0–1
  fps?: number | null;
  lastFrameMs?: number | null;
  lazyState?: "idle" | "loading" | "loaded" | "error";
  // Phase 6E: Unified experience state (optional, dev-only)
  experience?: UnifiedExperienceState | null;
  // Phase 6G: Telemetry snapshot (optional, dev-only)
  telemetry?: TripdarExperienceTelemetry | null;
};

export function CosmicDebugHud({
  visible,
  themeMode,
  strainId,
  doseKey,
  cosmicPhaseId,
  demoPhaseId,
  choreographyId,
  blendProgress,
  fps,
  lastFrameMs,
  lazyState,
  experience,
  telemetry,
}: CosmicDebugHudProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-[99999] bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/10 max-w-sm max-h-[80vh] overflow-y-auto"
      style={{ fontFamily: "monospace" }}
    >
      <div className="text-[11px] text-white/90 space-y-0.5">
        <div>Theme: <span className="text-white">{themeMode}</span></div>
        <div>Strain: <span className="text-white">{strainId}</span></div>
        <div>Dose: <span className="text-white">{doseKey}</span></div>
        <div>Cosmic Phase: <span className="text-white">{cosmicPhaseId ?? "—"}</span></div>
        <div>Demo Phase: <span className="text-white">{demoPhaseId ?? "—"}</span></div>
        <div>Choreo: <span className="text-white">{choreographyId ?? "—"}</span></div>
        <div>Blend: <span className="text-white">{blendProgress?.toFixed(2) ?? "—"}</span></div>
        <div>FPS: <span className="text-white">{fps ?? "—"}</span></div>
        <div>Frame: <span className="text-white">{lastFrameMs?.toFixed(2) ?? "—"}ms</span></div>
        <div>Lazy: <span className="text-white">{lazyState ?? "idle"}</span></div>
      </div>

      {/* Phase 6E: Unified Experience State Section */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <h3 className="text-[10px] uppercase tracking-wider text-white/60 mb-1.5">
          Unified Experience
        </h3>
        {!experience ? (
          <p className="text-[10px] text-white/40 italic">No unified state yet</p>
        ) : (
          <pre className="text-[9px] leading-snug bg-white/5 rounded-md p-2 overflow-x-auto text-white/80">
            {JSON.stringify(
              {
                strainId: experience.strainId,
                doseKey: experience.doseKey,
                effectWord: experience.effectWord,
                doseLabel: experience.doseLabel,
                demoPhaseId: experience.demoPhaseId,
                cosmic: {
                  phaseId: experience.cosmic?.phaseId,
                  messageId: experience.cosmic?.messageId,
                  choreographyId: experience.cosmic?.choreographyId,
                  blendProgress: experience.cosmic?.blendProgress,
                },
                classic: {
                  labelOpacityMap: experience.classic?.labelOpacityMap,
                },
                traits: {
                  visuals: experience.traits?.values?.visuals,
                  creativity: experience.traits?.values?.creativity,
                  social: experience.traits?.values?.sociability,
                  euphoria: experience.traits?.values?.euphoria,
                  introspection: experience.traits?.values?.introspection,
                  spiritual: experience.traits?.values?.spiritual_depth,
                },
              },
              null,
              2
            )}
          </pre>
        )}
      </div>

      {/* Phase 6G: Telemetry Snapshot Section */}
      {telemetry && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <h3 className="text-[10px] uppercase tracking-wider text-white/60 mb-1.5">
            Telemetry Snapshot
          </h3>
          <pre className="text-[9px] leading-snug bg-white/5 rounded-md p-2 overflow-x-auto text-white/80">
            {JSON.stringify(telemetry, null, 2)}
          </pre>
        </div>
      )}

      {/* Phase 6I: Timeline Frame Section */}
      {experience && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <h3 className="text-[10px] uppercase tracking-wider text-white/60 mb-1.5">
            Timeline Frame
          </h3>
          <div className="text-[10px] text-white/80 space-y-0.5 font-mono">
            <div className="text-white/50">Halo:</div>
            <div className="ml-2">
              intensity: <span className="text-white">{experience.cosmic?.blendProgress?.toFixed(3) ?? "—"}</span>
            </div>
            <div className="ml-2">
              rotation: <span className="text-white">{choreographyId?.split("-")[0] ?? "—"}°</span>
            </div>
            <div className="text-white/50 mt-1">Stars:</div>
            <div className="ml-2">
              twinkle: <span className="text-white">~0.8</span>
            </div>
            <div className="ml-2">
              drift: <span className="text-white">dynamic</span>
            </div>
            <div className="text-white/50 mt-1">Radar:</div>
            <div className="ml-2">
              wobble: <span className="text-white">{(blendProgress ?? 0).toFixed(3)}</span>
            </div>
            <div className="ml-2">
              pulse: <span className="text-white">~1.0</span>
            </div>
            <div className="text-white/50 mt-1">Message:</div>
            <div className="ml-2">
              opacity: <span className="text-white">{experience.cosmic?.messageId ? "active" : "idle"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Phase 6J.6: Accessibility Indicators */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <h3 className="text-[10px] uppercase tracking-wider text-white/60 mb-1.5">
          Accessibility
        </h3>
        <div className="text-[10px] text-white/80 space-y-0.5 font-mono">
          <div>
            Reduced Motion: <span className={`font-semibold ${(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ? "text-green-400" : "text-white/50"}`}>
              {typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "ON (OS)" : "OFF"}
            </span>
          </div>
          <div>
            Motion Profile: <span className="text-white">
              {(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ? "reduced" : "full"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

