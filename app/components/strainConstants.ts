import type { DoseKey, DoseConfig, Strain } from "@/lib/types";
import type { Plugin } from "chart.js";

export const DEFAULT_DOSE_CONFIG: Record<DoseKey, DoseConfig> = {
  micro: { label: "Micro", grams: 0.1 },
  mini: { label: "Mini", grams: 0.5 },
  macro: { label: "Macro", grams: 1.5 },
  museum: { label: "Museum", grams: 3 },
  mega: { label: "Mega", grams: 5 },
  hero: { label: "Hero", grams: 10 },
};

export const DEFAULT_DOSE_ORDER: DoseKey[] = [
  "micro",
  "mini",
  "macro",
  "museum",
  "mega",
  "hero",
];

/**
 * Phase 8E: Enhanced dose styling with Classic+ visual polish
 * 
 * Each dose level has refined opacity, border width, and glow settings
 * that create visual hierarchy and enhance the user experience.
 */
export const DOSE_STYLE: Record<
  DoseKey,
  { 
    fillAlpha: number; 
    borderWidth: number; 
    borderAlpha: number; 
    hasGlow: boolean;
    glowBlur?: number;      // Phase 8E: Custom glow blur radius
    glowOpacity?: number;   // Phase 8E: Custom glow opacity
    pointGlow?: boolean;    // Phase 8E: Enable point glow effect
  }
> = {
  micro: { 
    fillAlpha: 0.28, 
    borderWidth: 2.0, 
    borderAlpha: 0.75, 
    hasGlow: false,
    pointGlow: false,
  },
  mini: { 
    fillAlpha: 0.32, 
    borderWidth: 2.0, 
    borderAlpha: 0.82, 
    hasGlow: false,
    pointGlow: false,
  },
  macro: { 
    fillAlpha: 0.42, 
    borderWidth: 2.2, 
    borderAlpha: 0.88, 
    hasGlow: false,
    pointGlow: true,
  },
  museum: { 
    fillAlpha: 0.55, 
    borderWidth: 2.4, 
    borderAlpha: 0.92, 
    hasGlow: true,
    glowBlur: 20,
    glowOpacity: 0.35,
    pointGlow: true,
  },
  mega: { 
    fillAlpha: 0.65, 
    borderWidth: 2.5, 
    borderAlpha: 0.95, 
    hasGlow: true,
    glowBlur: 28,
    glowOpacity: 0.45,
    pointGlow: true,
  },
  hero: { 
    fillAlpha: 0.75, 
    borderWidth: 3.0, 
    borderAlpha: 1, 
    hasGlow: true,
    glowBlur: 36,
    glowOpacity: 0.55,
    pointGlow: true,
  },
};

/**
 * Phase 8E: Enhanced hero glow plugin with layered effects
 * 
 * Creates a multi-layer glow effect that provides:
 * - Outer diffuse glow for ambiance
 * - Inner sharper glow for definition
 * - Optional point highlights at vertices
 */
export const heroGlowPlugin: Plugin<"radar"> = {
  id: "heroGlow",
  beforeDatasetsDraw(chart, _args, opts) {
    const cfg = opts as {
      enabled?: boolean;
      color?: string;
      blur?: number;
      lineWidth?: number;
      // Phase 8E additions
      innerBlur?: number;
      innerOpacity?: number;
      showPointGlow?: boolean;
    };
    if (!cfg?.enabled) return;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;
    const { ctx } = chart;
    
    // Outer glow layer (diffuse)
    ctx.save();
    ctx.shadowColor = cfg.color ?? "rgba(0,0,0,0.35)";
    ctx.shadowBlur = cfg.blur ?? 30;
    ctx.lineWidth = (cfg.lineWidth ?? 3) + 1;
    ctx.strokeStyle = "transparent";
    ctx.beginPath();
    meta.data.forEach((point, idx) => {
      const { x, y } = point.getProps(["x", "y"], true);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    
    // Inner glow layer (sharper)
    ctx.save();
    const innerOpacity = cfg.innerOpacity ?? 0.5;
    const innerColor = (cfg.color ?? "rgba(255,255,255,0.5)").replace(/[\d.]+\)$/, `${innerOpacity})`);
    ctx.shadowColor = innerColor;
    ctx.shadowBlur = cfg.innerBlur ?? Math.max(8, (cfg.blur ?? 30) * 0.4);
    ctx.lineWidth = cfg.lineWidth ?? 3;
    ctx.strokeStyle = cfg.color ?? "#fff";
    ctx.beginPath();
    meta.data.forEach((point, idx) => {
      const { x, y } = point.getProps(["x", "y"], true);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    
    // Point glow highlights
    if (cfg.showPointGlow) {
      ctx.save();
      ctx.shadowColor = cfg.color ?? "rgba(255,255,255,0.6)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      meta.data.forEach((point) => {
        const { x, y } = point.getProps(["x", "y"], true);
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }
  },
};

export const STRAINS: Strain[] = [
  { id: "golden-teacher", name: "Golden Teacher", colorHex: "#f3b34c" },
  { id: "penis-envy", name: "Penis Envy", colorHex: "#8c6cae" },
  { id: "amazonian", name: "Amazonian", colorHex: "#95a751" },
  { id: "enigma", name: "Enigma", colorHex: "#5f6c6e" },
  { id: "cambodian", name: "Cambodian", colorHex: "#4b7a1b" },
  { id: "full-moon-party", name: "Full Moon Party", colorHex: "#cf2914" },
];

