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

export const DOSE_STYLE: Record<
  DoseKey,
  { fillAlpha: number; borderWidth: number; borderAlpha: number; hasGlow: boolean }
> = {
  micro: { fillAlpha: 0.3, borderWidth: 2.2, borderAlpha: 0.85, hasGlow: false },
  mini: { fillAlpha: 0.32, borderWidth: 2, borderAlpha: 0.9, hasGlow: false },
  macro: { fillAlpha: 0.45, borderWidth: 1.6, borderAlpha: 0.95, hasGlow: false },
  museum: { fillAlpha: 0.6, borderWidth: 1.6, borderAlpha: 0.95, hasGlow: false },
  mega: { fillAlpha: 0.7, borderWidth: 1.6, borderAlpha: 0.98, hasGlow: false },
  hero: { fillAlpha: 0.8, borderWidth: 2.5, borderAlpha: 1, hasGlow: true },
};

export const heroGlowPlugin: Plugin<"radar"> = {
  id: "heroGlow",
  beforeDatasetsDraw(chart, _args, opts) {
    const cfg = opts as {
      enabled?: boolean;
      color?: string;
      blur?: number;
      lineWidth?: number;
    };
    if (!cfg?.enabled) return;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;
    const { ctx } = chart;
    ctx.save();
    ctx.shadowColor = cfg.color ?? "rgba(0,0,0,0.35)";
    ctx.shadowBlur = cfg.blur ?? 30;
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

