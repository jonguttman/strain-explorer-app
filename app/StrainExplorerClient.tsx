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
import { HowItWorksModal } from "./components/HowItWorksModal";

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
  const [isStrainSheetOpen, setIsStrainSheetOpen] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
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

  // Service worker registration disabled - uncomment when PWA is needed
  // useEffect(() => {
  //   if ("serviceWorker" in navigator) {
  //     navigator.serviceWorker.register("/sw.js").catch(() => {});
  //   }
  // }, []);

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
    <div className="min-h-screen bg-[#0a0806] text-[#f5eee1] flex flex-col">
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

      {/* Mobile: strain selector pill */}
      <div className="sm:hidden px-4 pb-3 bg-transparent">
        <button
          type="button"
          onClick={() => setIsStrainSheetOpen(true)}
          className="inline-flex items-center rounded-full px-4 py-2 text-[14px] font-medium shadow-lg"
          style={{
            background: "linear-gradient(180deg, #f3b34c 0%, #d4913f 100%)",
            color: "#1a1612",
            boxShadow: "0 4px 12px rgba(243, 179, 76, 0.35)",
          }}
        >
          {strainDisplayName}
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Desktop: strain tabs */}
      <StrainScroller
        strains={STRAINS}
        selectedId={selectedStrainId}
        onSelect={setSelectedStrainId}
      />

      <div className="w-full px-4 pb-10 sm:px-6 lg:px-8">
        <div
          className="mx-auto w-full max-w-xl flex flex-col gap-2"
          style={accentStyle}
        >
          {/* Main card with FIXED height - prevents all jumping */}
          <section 
            className="mt-4 rounded-3xl overflow-hidden h-[475px] sm:h-[550px] md:h-[625px]"
            style={{ 
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Content fills the fixed-height section */}
            <div className="h-full flex flex-col">
              {mode === "visual" ? (
                showFeedbackQR ? (
                  <div className="flex-1 flex flex-col min-h-0" style={{ background: "#0a0806" }}>
                    <div className="flex-1 flex items-center justify-center px-4 py-6 overflow-auto">
                      <div className="w-full max-w-sm rounded-2xl p-4" style={{ background: "#fdf7ec" }}>
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
                    <div className="flex-shrink-0 py-3" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
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
                    experienceMeta={doseData.experienceMeta ?? undefined}
                    modeSwitch={<ModeSwitch mode={mode} onChange={setMode} />}
                    strainName={strainDisplayName}
                    effectWord={doseData.experienceMeta?.effectWord}
                    doseLabel={currentDoseLabel}
                    grams={currentDoseGrams}
                    strainId={selectedStrainId}
                  />
                )
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 px-4 py-6 overflow-auto rounded-2xl m-2" style={{ background: "#fdf7ec" }}>
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
                  <div className="flex-shrink-0 py-3" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <div className="flex items-center justify-center">
                      <ModeSwitch mode={mode} onChange={setMode} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <DoseSlider
            order={doseOrder}
            config={doseConfig}
            selected={selectedDoseKey}
            onSelect={setSelectedDoseKey}
            currentDoseLabel={currentDoseLabel}
            currentGrams={currentDoseGrams}
            strainName={strainDisplayName}
            onShowHowItWorks={() => setShowHowItWorks(true)}
          />
        </div>
      </div>

      {/* How it works modal */}
      <HowItWorksModal 
        isOpen={showHowItWorks} 
        onClose={() => setShowHowItWorks(false)} 
      />

      {/* Mobile: strain selection bottom sheet */}
      {isStrainSheetOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsStrainSheetOpen(false)}
          />
          
          {/* Sheet */}
          <div 
            className="absolute inset-x-0 bottom-0 rounded-t-2xl shadow-xl max-h-[70vh] overflow-hidden flex flex-col"
            style={{
              background: "linear-gradient(180deg, #1a1612 0%, #0a0806 100%)",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
            >
              <h2 className="text-[16px] font-semibold text-white/90">
                Choose a strain
              </h2>
              <button
                type="button"
                onClick={() => setIsStrainSheetOpen(false)}
                className="text-white/50 hover:text-white p-1"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Strain list */}
            <div className="flex-1 overflow-y-auto">
              {STRAINS.map((strain) => {
                const isSelected = strain.id === selectedStrainId;
                // Get effect word from cache if available
                const cacheKey = `${strain.id}:${selectedDoseKey}`;
                const cachedData = cacheRef.current[cacheKey];
                const effectWord = cachedData?.experienceMeta?.effectWord;

                return (
                  <button
                    key={strain.id}
                    type="button"
                    onClick={() => {
                      setSelectedStrainId(strain.id);
                      setIsStrainSheetOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
                  >
                    <div className="flex flex-col items-start">
                      <span 
                        className="text-[15px]"
                        style={{
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? "#f3b34c" : "rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        {strain.name}
                      </span>
                      {effectWord && (
                        <span className="text-[12px] text-white/50">
                          {effectWord}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div 
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: "#f3b34c" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

