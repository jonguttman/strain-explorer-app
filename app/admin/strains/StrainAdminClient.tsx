<<<<<<< Current (Your changes)
=======
"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  type DoseKey,
  type EditorDataset,
  type TraitAxisId,
  type VisualConfig,
  type StrainJsonEntry,
  type DoseConfigMap,
  type DoseSnapshot,
  type StrainMeta,
} from "./types";
import { cloneDataset, formatAxisLabel, normalizeAccentHex } from "@/lib/utils";

type Props = {
  initialData: EditorDataset;
};

const DEFAULT_ACCENT = "#4a371f";

const MiniRadarPreview = dynamic(() => import("./MiniRadarPreview"), {
  ssr: false,
  loading: () => (
    <div className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-4 text-center text-xs text-slate-500">
      Loading preview…
    </div>
  ),
});

export default function StrainAdminClient({ initialData }: Props) {
  const [dataset, setDataset] = useState<EditorDataset>(() =>
    cloneDataset(initialData)
  );
  const [selectedStrainName, setSelectedStrainName] = useState<string>(() => {
    const keys = Object.keys(initialData.strains);
    return keys[0] ?? "";
  });
  const [nameDraft, setNameDraft] = useState(selectedStrainName);
  const [selectedDose, setSelectedDose] = useState<DoseKey>(
    initialData.doses[0]
  );
  const [exportText, setExportText] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setNameDraft(selectedStrainName);
  }, [selectedStrainName]);

  const initialSnapshot = useMemo(() => cloneDataset(initialData), [initialData]);

  const strainNames = Object.keys(dataset.strains);
  const currentStrain = dataset.strains[selectedStrainName];
  const doseIndex = dataset.doses.indexOf(selectedDose);
  const currentAccentHex =
    currentStrain?.visual?.[selectedDose]?.colorHex ?? DEFAULT_ACCENT;

  const handleSelectStrain = (name: string) => {
    setSelectedStrainName(name);
  };

  const ensureUniqueName = (base: string) => {
    const name = base.trim() || "Untitled Strain";
    const existing = new Set(Object.keys(dataset.strains));
    if (!existing.has(name)) return name;
    let suffix = 2;
    while (existing.has(`${name} ${suffix}`)) {
      suffix += 1;
    }
    return `${name} ${suffix}`;
  };

  const handleAddStrain = () => {
    const blank = createBlankStrain(dataset.axes, dataset.doses);
    const newName = ensureUniqueName("New Strain");
    setDataset((prev) => ({
      ...prev,
      strains: {
        ...prev.strains,
        [newName]: blank,
      },
    }));
    setSelectedStrainName(newName);
    setNameDraft(newName);
  };

  const handleRenameStrain = () => {
    if (!currentStrain || !nameDraft.trim()) return;
    const trimmed = nameDraft.trim();
    if (trimmed === selectedStrainName) return;
    const uniqueName = ensureUniqueName(trimmed);
    setDataset((prev) => {
      const { [selectedStrainName]: target, ...rest } = prev.strains;
      return {
        ...prev,
        strains: {
          ...rest,
          [uniqueName]: target ?? createBlankStrain(prev.axes, prev.doses),
        },
      };
    });
    setSelectedStrainName(uniqueName);
    setNameDraft(uniqueName);
  };

  const updateCurrentStrain = (
    updater: (entry: StrainJsonEntry) => StrainJsonEntry
  ) => {
    if (!currentStrain) return;
    setDataset((prev) => ({
      ...prev,
      strains: {
        ...prev.strains,
        [selectedStrainName]: updater(prev.strains[selectedStrainName]),
      },
    }));
  };

  const handleRadarChange = (axis: TraitAxisId, value: number) => {
    if (doseIndex === -1) return;
    updateCurrentStrain((entry) => ({
      ...entry,
      radar: {
        ...entry.radar,
        [axis]: entry.radar[axis].map((val, idx) =>
          idx === doseIndex ? value : val
        ),
      },
    }));
  };

  const handleContentChange = (
    field: "blurb" | "details",
    value: string
  ) => {
    updateCurrentStrain((entry) => ({
      ...entry,
      [field]: {
        ...entry[field],
        [selectedDose]: value,
      },
    }));
  };

  const handleProductChange = (index: number, value: string) => {
    updateCurrentStrain((entry) => {
      const nextProducts = [...entry.products[selectedDose]];
      nextProducts[index] = value;
      return {
        ...entry,
        products: {
          ...entry.products,
          [selectedDose]: nextProducts,
        },
      };
    });
  };

  const handleAccentChange = (value: string) => {
    const normalized = normalizeAccentHex(value, DEFAULT_ACCENT);
    setDataset((prev) => {
      const target = prev.strains[selectedStrainName];
      if (!target) return prev;
      const visual = { ...(target.visual ?? {}) };
      visual[selectedDose] = { colorHex: normalized };
      return {
        ...prev,
        strains: {
          ...prev.strains,
          [selectedStrainName]: {
            ...target,
            visual,
          },
        },
      };
    });
  };

  const handleDoseConfigChange = (
    dose: DoseKey,
    field: "label" | "grams",
    rawValue: string
  ) => {
    setDataset((prev) => {
      const nextConfig: DoseConfigMap = {
        ...(prev.doseConfig ?? ({} as DoseConfigMap)),
      };
      const current = nextConfig[dose] ?? {
        label: dose,
        grams: 0,
      };
      nextConfig[dose] =
        field === "label"
          ? { ...current, label: rawValue }
          : {
              ...current,
              grams: Number(rawValue) || 0,
            };
      return {
        ...prev,
        doseConfig: nextConfig,
      };
    });
  };

  const handleAddProduct = () => {
    updateCurrentStrain((entry) => ({
      ...entry,
      products: {
        ...entry.products,
        [selectedDose]: [...entry.products[selectedDose], ""],
      },
    }));
  };

  const handleRemoveProduct = (index: number) => {
    updateCurrentStrain((entry) => {
      const nextProducts = entry.products[selectedDose].filter(
        (_item, idx) => idx !== index
      );
      return {
        ...entry,
        products: {
          ...entry.products,
          [selectedDose]: nextProducts,
        },
      };
    });
  };

  const handleReset = () => {
    const clone = cloneDataset(initialSnapshot);
    setDataset(clone);
    const names = Object.keys(clone.strains);
    setSelectedStrainName(names[0] ?? "");
    setSelectedDose(clone.doses[0]);
    setExportText("");
  };

  const handleExport = () => {
    setExportText(JSON.stringify(dataset, null, 2));
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(dataset, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "strains.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToServer = async () => {
    try {
      setSaveStatus("saving");
      setSaveMessage("");
      await saveDatasetToServer(dataset);
      setSaveStatus("success");
      setSaveMessage("Saved to server.");
      setTimeout(() => {
        setSaveStatus("idle");
        setSaveMessage("");
      }, 2000);
    } catch (err) {
      console.error("Save failed", err);
      setSaveStatus("error");
      setSaveMessage(
        err instanceof Error
          ? err.message
          : "Save failed. Check token/env or use Export JSON."
      );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 border-r border-slate-200 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Strains</h1>
          <button
            className="rounded bg-slate-900 px-2 py-1 text-sm text-white"
            onClick={handleAddStrain}
          >
            + Add
          </button>
        </div>
        <section className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-sm font-semibold text-slate-800 mb-2">
            Dose Settings
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {dataset.doses.map((dose) => {
              const config = dataset.doseConfig[dose] ?? {
                label: dose,
                grams: 0,
              };
              return (
                <div key={dose} className="space-y-1">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    {dose}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
                      value={config.label}
                      onChange={(e) =>
                        handleDoseConfigChange(dose, "label", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      step="0.1"
                      className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                      value={config.grams ?? 0}
                      onChange={(e) =>
                        handleDoseConfigChange(dose, "grams", e.target.value)
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <div className="flex-1 min-h-0 space-y-2 overflow-y-auto">
          {strainNames.map((name) => (
            <button
              key={name}
              onClick={() => handleSelectStrain(name)}
              className={`w-full rounded px-3 py-2 text-left text-sm ${
                name === selectedStrainName
                  ? "bg-slate-900 text-white"
                  : "bg-white hover:bg-slate-100"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <MiniRadarPreview
          axes={dataset.axes}
          strain={currentStrain}
          doseIndex={doseIndex}
        />
        <div className="space-y-2">
          <button
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            onClick={handleReset}
          >
            Reset Changes
          </button>
          <button
            className="w-full rounded bg-emerald-600 px-3 py-2 text-sm text-white"
            onClick={handleExport}
          >
            Export JSON
          </button>
          <button
            className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            onClick={handleSaveToServer}
            disabled={saveStatus === "saving"}
          >
            {saveStatus === "saving" ? "Saving…" : "Save to Server"}
          </button>
          {saveMessage ? (
            <div
              className={`text-xs ${
                saveStatus === "success" ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {saveMessage}
            </div>
          ) : null}
          {exportText ? (
            <button
              className="w-full rounded bg-emerald-500 px-3 py-2 text-sm text-white"
              onClick={handleDownload}
            >
              Download JSON
            </button>
          ) : null}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {!currentStrain ? (
          <div className="text-slate-500">Select or add a strain to edit.</div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-500">
                Strain Name
              </label>
              <input
                className="w-full rounded border border-slate-300 px-3 py-2 text-lg font-semibold"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={handleRenameStrain}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {dataset.doses.map((dose) => (
                <button
                  key={dose}
                  onClick={() => setSelectedDose(dose)}
                  className={`rounded-full px-4 py-2 text-sm capitalize ${
                    selectedDose === dose
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  {dose}
                </button>
              ))}
            </div>

            <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
              {dataset.axes.map((axis) => (
                <div key={axis} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>{formatAxisLabel(axis)}</span>
                    <span>{currentStrain.radar[axis][doseIndex]?.toFixed(0)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={currentStrain.radar[axis][doseIndex] ?? 0}
                    onChange={(e) => handleRadarChange(axis, Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}
            </section>

            <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Blurb
                </label>
                <input
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  value={currentStrain.blurb[selectedDose]}
                  onChange={(e) => handleContentChange("blurb", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Details
                </label>
                <textarea
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  rows={4}
                  value={currentStrain.details[selectedDose]}
                  onChange={(e) => handleContentChange("details", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Dose Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="h-9 w-9 rounded border border-slate-300 bg-transparent p-0"
                    value={currentAccentHex}
                    onChange={(e) => handleAccentChange(e.target.value)}
                  />
                  <input
                    className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm font-mono"
                    value={currentAccentHex}
                    onChange={(e) => handleAccentChange(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  This accent color is used by the kiosk radar and dose UI for this
                  strain and dose.
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Products
                </span>
                <button
                  className="rounded bg-slate-900 px-3 py-1 text-xs text-white"
                  onClick={handleAddProduct}
                >
                  + Add Product
                </button>
              </div>
              <div className="space-y-2">
                {currentStrain.products[selectedDose].map((product, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
                      value={product}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      placeholder="Product name / SKU"
                    />
                    <button
                      className="rounded border border-slate-300 px-2 text-xs text-slate-600"
                      onClick={() => handleRemoveProduct(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {currentStrain.products[selectedDose].length === 0 && (
                  <div className="text-xs text-slate-500">
                    No products for this dose yet.
                  </div>
                )}
              </div>
            </section>

            {exportText && (
              <section className="rounded-xl border border-emerald-300 bg-emerald-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-900">
                    Exported JSON
                  </span>
                  <button
                    className="rounded bg-emerald-600 px-2 py-1 text-xs text-white"
                    onClick={() => navigator.clipboard.writeText(exportText)}
                  >
                    Copy
                  </button>
                </div>
                <textarea
                  className="h-64 w-full rounded border border-emerald-200 bg-white p-2 text-xs font-mono text-emerald-900"
                  readOnly
                  value={exportText}
                />
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

async function saveDatasetToServer(dataset: EditorDataset) {
  const response = await fetch("/api/admin/strains", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataset),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Save failed (${response.status})`);
  }
}

function createBlankStrain(
  axes: TraitAxisId[],
  doses: DoseKey[]
): StrainJsonEntry {
  const radar = axes.reduce<Record<TraitAxisId, number[]>>((acc, axis) => {
    acc[axis] = doses.map(() => 0);
    return acc;
  }, {} as Record<TraitAxisId, number[]>);

  const blankStringMap = () =>
    doses.reduce<Record<DoseKey, string>>((acc, dose) => {
      acc[dose] = "";
      return acc;
    }, {} as Record<DoseKey, string>);

  const blankProducts = () =>
    doses.reduce<Record<DoseKey, string[]>>((acc, dose) => {
      acc[dose] = [];
      return acc;
    }, {} as Record<DoseKey, string[]>);

  const blankVisual = () => ({} as VisualConfig);
  
  const blankMeta = (): StrainMeta => ({
    origin: "",
    history: "",
    tags: [],
  });

  const blankSnapshots = () =>
    doses.reduce<Record<DoseKey, DoseSnapshot>>((acc, dose) => {
      acc[dose] = {
        onset: "",
        duration: "",
        intensity: "",
        bestFor: [],
        setting: [],
      };
      return acc;
    }, {} as Record<DoseKey, DoseSnapshot>);

  const blankTestimonials = () =>
    doses.reduce<Record<DoseKey, string[]>>((acc, dose) => {
      acc[dose] = [];
      return acc;
    }, {} as Record<DoseKey, string[]>);

  return {
    radar,
    blurb: blankStringMap(),
    details: blankStringMap(),
    products: blankProducts(),
    visual: blankVisual(),
    meta: blankMeta(),
    snapshots: blankSnapshots(),
    testimonials: blankTestimonials(),
  };
}

>>>>>>> Incoming (Background Agent changes)
