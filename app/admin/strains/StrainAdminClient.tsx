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
import type { Product } from "@/lib/types";
import { cloneDataset, formatAxisLabel, normalizeAccentHex } from "@/lib/utils";

type Props = {
  initialData: EditorDataset;
  allProducts: Product[];
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

export default function StrainAdminClient({ initialData, allProducts }: Props) {
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

  // Product linking state
  const [productsState, setProductsState] = useState<Product[]>(allProducts);
  const [productsSaveStatus, setProductsSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  // Collapsible section states
  const [strainsOpen, setStrainsOpen] = useState(true);
  const [doseSettingsOpen, setDoseSettingsOpen] = useState(false);
  const [radarOpen, setRadarOpen] = useState(true);
  const [productsOpen, setProductsOpen] = useState(true);

  useEffect(() => {
    setNameDraft(selectedStrainName);
  }, [selectedStrainName]);

  const initialSnapshot = useMemo(() => cloneDataset(initialData), [initialData]);

  const strainNames = Object.keys(dataset.strains);
  const currentStrain = dataset.strains[selectedStrainName];
  const doseIndex = dataset.doses.indexOf(selectedDose);
  const currentAccentHex =
    currentStrain?.visual?.[selectedDose]?.colorHex ?? DEFAULT_ACCENT;

  // Product linking derived values
  // Map strain name to slug for product linking
  const STRAIN_NAME_TO_SLUG: Record<string, string> = {
    "Golden Teacher": "golden-teacher",
    "Penis Envy": "penis-envy",
    "Amazonian": "amazonian",
    "Enigma": "enigma",
    "Cambodian": "cambodian",
    "Full Moon Party": "full-moon-party",
  };
  const selectedStrainSlug = STRAIN_NAME_TO_SLUG[selectedStrainName] ?? selectedStrainName.toLowerCase().replace(/\s+/g, "-");
  
  const globalProducts = useMemo(
    () => productsState.filter((p) => p.strainIds.length === 0),
    [productsState]
  );
  const strainScopedProducts = useMemo(
    () => productsState.filter((p) => p.strainIds.length > 0),
    [productsState]
  );
  const isLinkedToCurrentStrain = (p: Product) =>
    p.strainIds.includes(selectedStrainSlug);

  const handleToggleProductLink = (productId: string, linked: boolean) => {
    setProductsState((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newStrainIds = linked
          ? [...p.strainIds.filter((id) => id !== selectedStrainSlug), selectedStrainSlug]
          : p.strainIds.filter((id) => id !== selectedStrainSlug);
        return { ...p, strainIds: newStrainIds };
      })
    );
  };

  const handleSaveProductLinks = async () => {
    setProductsSaveStatus("saving");
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: productsState }),
      });
      if (!res.ok) {
        throw new Error(`Save failed: ${res.status}`);
      }
      setProductsSaveStatus("success");
      setTimeout(() => setProductsSaveStatus("idle"), 2500);
    } catch {
      setProductsSaveStatus("error");
      setTimeout(() => setProductsSaveStatus("idle"), 3000);
    }
  };

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
    <div className="flex h-full bg-slate-50 text-slate-900">
      <aside className="w-64 border-r border-slate-200 p-4 flex flex-col gap-2 overflow-y-auto">
        {/* Dose Selector - Compact horizontal */}
        <div className="rounded-xl border border-slate-200 bg-white p-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5 px-1">
            Dose
          </div>
          <div className="flex flex-wrap gap-1">
            {dataset.doses.map((dose) => (
              <button
                key={dose}
                onClick={() => setSelectedDose(dose)}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize transition ${
                  selectedDose === dose
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {dose}
              </button>
            ))}
          </div>
        </div>

        {/* Strains Section - Collapsible */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setStrainsOpen(!strainsOpen)}
            className="flex w-full items-center justify-between px-3 py-2 text-left"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Strains
            </span>
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform ${strainsOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {strainsOpen && (
            <div className="px-3 pb-3 space-y-2">
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {strainNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleSelectStrain(name)}
                    className={`w-full rounded px-3 py-2 text-left text-sm ${
                      name === selectedStrainName
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <button
                className="w-full rounded border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-400 hover:text-slate-600 transition"
                onClick={handleAddStrain}
              >
                + Add New Strain
              </button>
            </div>
          )}
        </section>

        {/* Dose Settings - Collapsible */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setDoseSettingsOpen(!doseSettingsOpen)}
            className="flex w-full items-center justify-between px-3 py-2 text-left"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dose Settings
            </span>
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform ${doseSettingsOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {doseSettingsOpen && (
            <div className="px-3 pb-3 space-y-3 max-h-56 overflow-y-auto">
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
                        className="w-16 rounded border border-slate-300 px-2 py-1 text-sm"
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
          )}
        </section>

        {/* Radar Preview - Collapsible */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setRadarOpen(!radarOpen)}
            className="flex w-full items-center justify-between px-3 py-2 text-left"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Radar Preview
            </span>
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform ${radarOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {radarOpen && (
            <div className="px-2 pb-2">
              <MiniRadarPreview
                axes={dataset.axes}
                strain={currentStrain}
                doseIndex={doseIndex}
              />
            </div>
          )}
        </section>
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

      <main className="flex-1 overflow-y-auto p-4">
        {!currentStrain ? (
          <div className="text-slate-500">Select or add a strain to edit.</div>
        ) : (
          <div className="space-y-4">
            {/* 1. SLIDERS - Compact 3-column grid */}
            <section className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="grid gap-x-4 gap-y-2 md:grid-cols-3">
                {dataset.axes.map((axis) => (
                  <div key={axis} className="flex items-center gap-2">
                    <span className="w-16 text-xs font-medium text-slate-600 truncate">
                      {formatAxisLabel(axis)}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={currentStrain.radar[axis][doseIndex] ?? 0}
                      onChange={(e) => handleRadarChange(axis, Number(e.target.value))}
                      className="flex-1 h-1.5"
                    />
                    <span className="w-6 text-xs text-slate-500 text-right">
                      {currentStrain.radar[axis][doseIndex]?.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. ACCENT COLOR - Compact inline */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <span className="text-xs font-medium text-slate-600">Accent</span>
              <input
                type="color"
                className="h-6 w-6 rounded border border-slate-300 bg-transparent p-0 cursor-pointer"
                value={currentAccentHex}
                onChange={(e) => handleAccentChange(e.target.value)}
              />
              <input
                className="w-20 rounded border border-slate-300 px-2 py-1 text-xs font-mono text-slate-700"
                value={currentAccentHex}
                onChange={(e) => handleAccentChange(e.target.value)}
              />
              <div
                className="h-4 flex-1 rounded"
                style={{ backgroundColor: currentAccentHex }}
              />
            </div>

            {/* 3. BLURB */}
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Blurb
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                value={currentStrain.blurb[selectedDose]}
                onChange={(e) => handleContentChange("blurb", e.target.value)}
                placeholder="Short description for this dose..."
              />
            </div>

            {/* 4. DETAILS */}
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Details
              </label>
              <textarea
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                rows={3}
                value={currentStrain.details[selectedDose]}
                onChange={(e) => handleContentChange("details", e.target.value)}
                placeholder="Longer description of the experience..."
              />
            </div>

            {/* Suggested Products Panel */}
            <section className="rounded-xl border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setProductsOpen(!productsOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Suggested Products for {selectedStrainName}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage which products appear in the kiosk for this strain
                  </p>
                </div>
                <svg
                  className={`h-4 w-4 text-slate-400 transition-transform ${productsOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {productsOpen && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Global Products */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Global Products
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        Always shown
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      These appear for all strains automatically.
                    </p>
                    {globalProducts.length === 0 ? (
                      <div className="text-xs text-slate-400 italic py-2">
                        No global products. Create one in Products Admin with no strains selected.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {globalProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-3 py-2"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-slate-700">{p.name}</span>
                              <span className="text-xs text-slate-400">{p.brand}</span>
                              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                GLOBAL
                              </span>
                              {p.doseKey && (
                                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 uppercase">
                                  {p.doseKey}
                                </span>
                              )}
                              {p.dosingDirection && (
                                <span className="text-xs text-slate-500 italic">
                                  &ldquo;{p.dosingDirection}&rdquo;
                                </span>
                              )}
                            </div>
                            <a
                              href="/admin/products"
                              className="text-xs text-slate-500 hover:text-slate-700 underline flex-shrink-0"
                            >
                              Edit
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Strain-linked Products */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Strain-specific Products
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      Toggle which products show for {selectedStrainName}.
                    </p>
                    {strainScopedProducts.length === 0 ? (
                      <div className="text-xs text-slate-400 italic py-2">
                        No strain-specific products yet. Create one in Products Admin.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {strainScopedProducts
                          .sort((a, b) => {
                            // House picks first, then alphabetical
                            if (a.isHousePick && !b.isHousePick) return -1;
                            if (!a.isHousePick && b.isHousePick) return 1;
                            return a.name.localeCompare(b.name);
                          })
                          .map((p) => {
                            const isLinked = isLinkedToCurrentStrain(p);
                            return (
                              <div
                                key={p.id}
                                className={`flex items-center justify-between rounded border px-3 py-2 ${
                                  isLinked
                                    ? "border-emerald-200 bg-emerald-50"
                                    : "border-slate-100 bg-white"
                                }`}
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-medium text-slate-700">{p.name}</span>
                                  <span className="text-xs text-slate-400">{p.brand}</span>
                                  {p.doseKey && (
                                    <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 uppercase">
                                      {p.doseKey}
                                    </span>
                                  )}
                                  {p.isHousePick && (
                                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                      HOUSE PICK
                                    </span>
                                  )}
                                  {isLinked && (
                                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                                      LINKED
                                    </span>
                                  )}
                                  {p.dosingDirection && (
                                    <span className="text-xs text-slate-500 italic">
                                      &ldquo;{p.dosingDirection}&rdquo;
                                    </span>
                                  )}
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                                  <span className="text-xs text-slate-500">
                                    {isLinked ? "Showing" : "Hidden"}
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={isLinked}
                                    onChange={(e) => handleToggleProductLink(p.id, e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                  />
                                </label>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Save button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      {productsSaveStatus === "success" && (
                        <span className="text-emerald-600">✓ Product links saved</span>
                      )}
                      {productsSaveStatus === "error" && (
                        <span className="text-rose-600">Failed to save. Try again.</span>
                      )}
                    </div>
                    <button
                      onClick={handleSaveProductLinks}
                      disabled={productsSaveStatus === "saving"}
                      className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      {productsSaveStatus === "saving" ? "Saving…" : "Save Product Links"}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* 6. STRAIN NAME - Rarely used, at bottom */}
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-500 whitespace-nowrap">
                  Strain Name
                </label>
                <input
                  className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm font-medium text-slate-900"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onBlur={handleRenameStrain}
                />
              </div>
            </div>

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

