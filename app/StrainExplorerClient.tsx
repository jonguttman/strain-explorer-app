"use client";

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  type CSSProperties,
} from "react";
import { useSearchParams } from "next/navigation";
import { CTA_VARIANTS } from "@/lib/feedbackCtas";
import { hexToRgba } from "@/lib/utils";
import type {
  DoseKey,
  TraitAxisId,
  DoseTraits,
  DoseContent,
  DoseSnapshot,
  StrainMeta,
  DoseConfig,
  AccessKey,
  Product,
  StrainExperienceMeta,
} from "@/lib/types";
import { getProductsForStrainAndDose } from "@/lib/productData";
import { StrainHeader } from "./components/StrainHeader";
import { StrainScroller } from "./components/StrainScroller";
import { RadarPanel } from "./components/RadarPanel";
import { DetailsPanel } from "./components/DetailsPanel";
import { FeedbackOverlay } from "./components/FeedbackOverlay";
import { ModeSwitch } from "./components/ModeSwitch";
import { DoseSlider } from "./components/DoseSlider";
import {
  DEFAULT_DOSE_CONFIG,
  DEFAULT_DOSE_ORDER,
  STRAINS,
} from "./components/strainConstants";

type StrainDosePayload = {
  traits: DoseTraits;
  content: DoseContent;
  strainName: string;
  colorHex: string;
  grams: number | null;
  axisLabels: TraitAxisId[];
  doseLabel: string;
  accentHex: string;
  meta?: StrainMeta | null;
  snapshot?: DoseSnapshot | null;
  testimonials?: string[];
  experienceMeta?: StrainExperienceMeta | null;
};

export function StrainExplorerClient() {
  const searchParams = useSearchParams();
  const accessKeyParam = searchParams.get("key");

  const [selectedStrainId, setSelectedStrainId] = useState<string>(
    "golden-teacher"
  );
  const [selectedDoseKey, setSelectedDoseKey] = useState<DoseKey>("macro");
  const [doseOrder, setDoseOrder] =
    useState<DoseKey[]>(DEFAULT_DOSE_ORDER);
  const [doseConfig, setDoseConfig] = useState<Record<DoseKey, DoseConfig>>(
    DEFAULT_DOSE_CONFIG
  );
  const [mode, setMode] = useState<"visual" | "details">("visual");
  const [showFeedbackQR, setShowFeedbackQR] = useState(false);
  const [welcomeLabel, setWelcomeLabel] = useState<string | undefined>(undefined);
  const activeCta = useMemo(
    () => CTA_VARIANTS[Math.floor(Math.random() * CTA_VARIANTS.length)],
    []
  );

  useEffect(() => {
    if (mode !== "visual") {
      setShowFeedbackQR(false);
    }
  }, [mode]);

  const [doseData, setDoseData] = useState<StrainDosePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Record<string, StrainDosePayload>>({});

  const fallbackStrain = STRAINS.find((s) => s.id === selectedStrainId);
  const currentDoseMeta = doseConfig[selectedDoseKey];
  const currentDoseLabel =
    doseData?.doseLabel ?? currentDoseMeta?.label ?? selectedDoseKey;
  const currentDoseGrams =
    doseData?.grams ?? currentDoseMeta?.grams ?? null;
  const strainDisplayName =
    doseData?.strainName ?? fallbackStrain?.name ?? selectedStrainId;

  const accentHex =
    doseData?.accentHex ?? fallbackStrain?.colorHex ?? "#4a371f";
  const accentSoft = hexToRgba(accentHex, 0.16);
  const accentStyle = useMemo(
    () =>
      ({
        "--dose-accent": accentHex,
        "--dose-accent-soft": accentSoft,
      }) as CSSProperties,
    [accentHex, accentSoft]
  );

  // Compute products for current strain/dose selection
  const productsForSelection = useMemo<Product[]>(
    () => getProductsForStrainAndDose(selectedStrainId, selectedDoseKey),
    [selectedStrainId, selectedDoseKey]
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed", err);
      });
    }
  }, []);

  useEffect(() => {
    async function loadAccessKeyLabel() {
      if (!accessKeyParam) {
        setWelcomeLabel(undefined);
        return;
      }
      try {
        const res = await fetch("/api/access-keys");
        if (!res.ok) return;
        const data = await res.json() as { keys: AccessKey[] };
        const match = data.keys.find(k => k.id === accessKeyParam && k.isActive);
        if (match) {
          setWelcomeLabel(match.label);
        } else {
          setWelcomeLabel(undefined);
        }
      } catch {
        // fail silently; no welcome label if API fails
        setWelcomeLabel(undefined);
      }
    }
    loadAccessKeyLabel();
  }, [accessKeyParam]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dose-config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const order = (data.order ?? DEFAULT_DOSE_ORDER) as DoseKey[];
        if (order.length) {
          setDoseOrder(order);
          setSelectedDoseKey((prev) =>
            order.includes(prev) ? prev : order[0]
          );
        }
        if (data.config) {
          setDoseConfig((prev) => ({
            ...prev,
            ...(data.config as Record<DoseKey, DoseConfig>),
          }));
        }
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cacheKey = `${selectedStrainId}:${selectedDoseKey}`;
    const cached = cacheRef.current[cacheKey];

    if (cached) {
      setDoseData(cached);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/strains/${selectedStrainId}/dose/${selectedDoseKey}`
        );
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        const payload: StrainDosePayload = {
          traits: data.traits,
          content: data.content,
          strainName: data.strainName,
          colorHex: data.colorHex,
          grams: data.grams ?? null,
          axisLabels: data.axes ?? [],
          doseLabel: data.doseLabel ?? selectedDoseKey,
          accentHex: data.accentHex ?? data.colorHex,
          meta: data.meta ?? null,
          snapshot: data.snapshot ?? null,
          testimonials: data.testimonials ?? [],
          experienceMeta: data.experienceMeta ?? null,
        };
        cacheRef.current[cacheKey] = payload;
        if (!cancelled) {
          setDoseData(payload);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch dose data", err);
          setError("Unable to load data for this strain/dose.");
          setDoseData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [selectedStrainId, selectedDoseKey]);

  if (loading && !doseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6eddc] text-[#3f301f]">
        Loading strain data…
      </div>
    );
  }

  if (error || !doseData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6eddc] text-[#3f301f] px-6 text-center">
        <div className="mb-2 font-semibold text-lg">
          Something went sideways.
        </div>
        <div className="text-sm mb-4">
          {error ?? "No data available for this selection."}
        </div>
        <button
          className="px-4 py-2 rounded-full bg-[#3f301f] text-[#f6eddc]"
          onClick={() => setSelectedDoseKey((prev) => prev)}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6eddc] text-[#3f301f] flex flex-col">
      <StrainHeader
        strainName={strainDisplayName}
        grams={currentDoseGrams}
        doseLabel={currentDoseLabel}
        accentHex={accentHex}
        ctaLabel={activeCta.label}
        onShowFeedback={() => setShowFeedbackQR(true)}
        feedbackActive={showFeedbackQR}
        welcomeLabel={welcomeLabel}
        effectWord={doseData.experienceMeta?.effectWord}
      />

      <StrainScroller
        strains={STRAINS}
        selectedId={selectedStrainId}
        onSelect={setSelectedStrainId}
      />

      <div className="flex-1 w-full px-4 pb-10 sm:px-6 lg:px-8">
        <div
          className="mx-auto flex h-full w-full max-w-xl flex-col gap-3"
          style={accentStyle}
        >
          <section className="mt-6 flex flex-1 flex-col rounded-3xl border border-[#ddcbaa] shadow-sm overflow-hidden">
            {mode === "visual" ? (
              showFeedbackQR ? (
                <div className="flex-1 flex flex-col bg-white">
                  <div className="flex-1 flex items-center justify-center px-4 py-6">
                    <div className="h-64 w-full md:h-80 lg:h-96">
                      <FeedbackOverlay
                        accentHex={accentHex}
                        strainId={selectedStrainId}
                        doseKey={selectedDoseKey}
                        ctaKey={activeCta.key}
                        ctaLabel={activeCta.label}
                        accessKeyId={accessKeyParam ?? undefined}
                        onClose={() => setShowFeedbackQR(false)}
                      />
                    </div>
                  </div>
                  <div className="border-t border-[#e2d3b5]/70 py-2">
                    <div className="flex items-center justify-center">
                      <ModeSwitch mode={mode} onChange={setMode} />
                    </div>
                  </div>
                </div>
              ) : (
                <RadarPanel
                  color={accentHex}
                  traits={doseData.traits}
                  axisLabels={doseData.axisLabels}
                  doseKey={selectedDoseKey}
                  experienceMeta={doseData.experienceMeta ?? undefined}
                  modeSwitch={<ModeSwitch mode={mode} onChange={setMode} />}
                />
              )
            ) : (
              <div className="flex-1 flex flex-col bg-white">
                <div className="flex-1 px-4 py-6 overflow-auto">
                  <DetailsPanel
                    content={doseData.content}
                    strainName={strainDisplayName}
                    doseLabel={currentDoseLabel}
                    grams={currentDoseGrams}
                    meta={doseData.meta ?? null}
                    snapshot={doseData.snapshot ?? null}
                    accentHex={accentHex}
                    testimonials={doseData.testimonials ?? []}
                    accessKeyId={accessKeyParam ?? undefined}
                    products={productsForSelection}
                  />
                </div>
                <div className="border-t border-[#e2d3b5]/70 py-2">
                  <div className="flex items-center justify-center">
                    <ModeSwitch mode={mode} onChange={setMode} />
                  </div>
                </div>
              </div>
            )}
          </section>

          <DoseSlider
            order={doseOrder}
            config={doseConfig}
            selected={selectedDoseKey}
            onSelect={setSelectedDoseKey}
            currentDoseLabel={currentDoseLabel}
            currentGrams={currentDoseGrams}
            strainName={strainDisplayName}
          />
        </div>
      </div>
    </div>
  );
}

