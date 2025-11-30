"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { TraitAxisId, DoseKey, AxisExperienceScores, Product } from "@/lib/types";
import { FeedbackRadarPreview } from "./FeedbackRadarPreview";

type StrainOption = {
  id: string;
  name: string;
};

type DoseOption = {
  key: DoseKey;
  label: string;
};

type FeedbackFormClientProps = {
  initialStrainId?: string;
  initialDoseKey?: string;
  accessKeyId?: string;
  ctaKey?: string;
  strainOptions: StrainOption[];
  doseOptions: DoseOption[];
  axes: TraitAxisId[];
  initialAxisValues: Partial<Record<TraitAxisId, number>>;
  allProducts: Product[];
};

const BEST_FOR_OPTIONS = [
  "Creativity",
  "Social connection",
  "Introspection",
  "Relaxation",
  "Energy",
  "Focus",
  "Meditation",
  "Nature walks",
];

const SETTING_OPTIONS = [
  "At home",
  "Outdoors",
  "With friends",
  "Solo",
  "Music/concert",
  "Art museum",
  "Ceremony/ritual",
  "Therapeutic",
];

// Labels for sliders
const AXIS_LABELS: Record<TraitAxisId, string> = {
  visuals: "Visuals",
  euphoria: "Euphoria",
  introspection: "Introspection",
  creativity: "Creativity",
  spiritual_depth: "Spiritual",
  sociability: "Social",
};

export function FeedbackFormClient({
  initialStrainId,
  initialDoseKey,
  accessKeyId,
  ctaKey,
  strainOptions,
  doseOptions,
  axes,
  initialAxisValues,
  allProducts,
}: FeedbackFormClientProps) {
  // Session context (editable)
  const [selectedStrainId, setSelectedStrainId] = useState(
    initialStrainId && strainOptions.some(s => s.id === initialStrainId)
      ? initialStrainId
      : strainOptions[0]?.id ?? ""
  );
  const [selectedDoseKey, setSelectedDoseKey] = useState<DoseKey>(
    initialDoseKey && doseOptions.some(d => d.key === initialDoseKey)
      ? (initialDoseKey as DoseKey)
      : doseOptions[0]?.key ?? "macro"
  );

  // Product selection
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showOtherProduct, setShowOtherProduct] = useState(false);
  const [otherProductName, setOtherProductName] = useState("");

  // Filter products based on selected strain and dose
  const relevantProducts = useMemo(() => {
    return allProducts.filter(p => {
      if (p.status !== "active") return false;
      // Global products (empty strainIds) or products matching the strain
      const strainMatch = p.strainIds.length === 0 || p.strainIds.includes(selectedStrainId);
      // Products with no doseKey match any dose, otherwise must match
      const doseMatch = !p.doseKey || p.doseKey === selectedDoseKey;
      return strainMatch && doseMatch;
    });
  }, [allProducts, selectedStrainId, selectedDoseKey]);

  // Reset product selection when strain/dose changes
  useEffect(() => {
    setSelectedProductId(null);
    setShowOtherProduct(false);
    setOtherProductName("");
  }, [selectedStrainId, selectedDoseKey]);

  // Expected axes (from strain/dose data, scaled 0-10)
  const [expectedAxes, setExpectedAxes] = useState<AxisExperienceScores>(() => {
    const initial: AxisExperienceScores = {};
    for (const axis of axes) {
      initial[axis] = initialAxisValues[axis] ?? 5;
    }
    return initial;
  });

  // Axis sliders (feltAxes) - what user actually experienced
  const [feltAxes, setFeltAxes] = useState<AxisExperienceScores>(() => {
    const initial: AxisExperienceScores = {};
    for (const axis of axes) {
      initial[axis] = initialAxisValues[axis] ?? 5;
    }
    return initial;
  });

  // Existing feedback fields
  const [overallExperience, setOverallExperience] = useState<number>(0);
  const [intensityRating, setIntensityRating] = useState<number>(0);
  const [testimonial, setTestimonial] = useState("");
  const [bestFor, setBestFor] = useState<string[]>([]);
  const [setting, setSetting] = useState<string[]>([]);
  const [contact, setContact] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // When strain or dose changes, fetch new expected values
  useEffect(() => {
    async function loadExpectedValues() {
      if (!selectedStrainId || !selectedDoseKey) return;
      try {
        const res = await fetch(`/api/strains/${selectedStrainId}/dose/${selectedDoseKey}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.traits?.values) {
          const newAxes: AxisExperienceScores = {};
          for (const axis of axes) {
            const rawValue = data.traits.values[axis];
            if (typeof rawValue === "number") {
              newAxes[axis] = Math.round(rawValue / 10);
            }
          }
          // Update both expected and felt to the new baseline
          setExpectedAxes(newAxes);
          setFeltAxes(newAxes);
        }
      } catch {
        // Keep existing values if fetch fails
      }
    }
    
    // Only fetch if user changed strain/dose from initial
    if (selectedStrainId !== initialStrainId || selectedDoseKey !== initialDoseKey) {
      loadExpectedValues();
    }
  }, [selectedStrainId, selectedDoseKey, axes, initialStrainId, initialDoseKey]);

  // Track double-tap state for lowering below expected (silent friction)
  const lastTapAxisRef = useRef<TraitAxisId | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const tapCountRef = useRef<number>(0);
  const DOUBLE_TAP_MS = 500; // Time window for double-tap
  const FORCE_THROUGH_TAPS = 5; // Number of taps to force through without double-tap

  function toggleOption(value: string, list: string[], setList: (v: string[]) => void) {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  }

  // Slider drag - applies silent friction when first going below expected
  function handleSliderChange(axis: TraitAxisId, value: number) {
    const expected = expectedAxes[axis] ?? 5;
    const current = feltAxes[axis] ?? expected;
    
    // If trying to go below expected (and not already below), snap back silently
    if (value < expected && current >= expected) {
      const now = Date.now();
      const isDoubleTap = lastTapAxisRef.current === axis && (now - lastTapTimeRef.current) < DOUBLE_TAP_MS;
      
      if (!isDoubleTap) {
        // First attempt: silently snap back to expected
        lastTapAxisRef.current = axis;
        lastTapTimeRef.current = now;
        setFeltAxes(prev => ({ ...prev, [axis]: expected }));
        return;
      }
      // Double-tap: allow the change
    }
    
    setFeltAxes(prev => ({ ...prev, [axis]: value }));
  }

  // Button tap to decrease - requires double-tap OR 5 taps to go below expected (no visual feedback)
  function handleDecrease(axis: TraitAxisId) {
    const expected = expectedAxes[axis] ?? 5;
    const current = feltAxes[axis] ?? expected;
    const newValue = Math.max(0, current - 1);
    
    // If trying to go below expected (and not already below)
    if (newValue < expected && current >= expected) {
      const now = Date.now();
      const isSameAxis = lastTapAxisRef.current === axis;
      const isDoubleTap = isSameAxis && (now - lastTapTimeRef.current) < DOUBLE_TAP_MS;
      
      // Track tap count for this axis
      if (isSameAxis) {
        tapCountRef.current += 1;
      } else {
        tapCountRef.current = 1;
      }
      
      // Allow if double-tap OR reached force-through count
      if (!isDoubleTap && tapCountRef.current < FORCE_THROUGH_TAPS) {
        // Record tap, don't change value
        lastTapAxisRef.current = axis;
        lastTapTimeRef.current = now;
        return;
      }
      
      // Reset tap count when allowing through
      tapCountRef.current = 0;
    }
    
    setFeltAxes(prev => ({ ...prev, [axis]: newValue }));
  }

  // Button tap to increase - no friction ever
  // Button tap to increase - always single tap, no friction
  function handleIncrease(axis: TraitAxisId) {
    const current = feltAxes[axis] ?? 5;
    const newValue = Math.min(10, current + 1);
    setFeltAxes(prev => ({ ...prev, [axis]: newValue }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      // Determine product info for payload
      const productInfo = showOtherProduct && otherProductName.trim()
        ? { otherProductName: otherProductName.trim() }
        : selectedProductId
          ? { productId: selectedProductId }
          : undefined;

      const payload = {
        strainId: selectedStrainId || undefined,
        doseKey: selectedDoseKey || undefined,
        accessKeyId,
        ctaKey,
        overallExperience: overallExperience || undefined,
        intensityRating: intensityRating || undefined,
        testimonial: testimonial.trim() || undefined,
        bestFor: bestFor.length > 0 ? bestFor : undefined,
        setting: setting.length > 0 ? setting : undefined,
        contact: contact.trim() || undefined,
        feltAxes: Object.keys(feltAxes).length > 0 ? feltAxes : undefined,
        ...productInfo,
      };

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }

      setSubmitStatus("success");
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitStatus("error");
      setErrorMessage("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitStatus === "success") {
    return (
      <div className="rounded-2xl border border-[#d3c3a2] bg-white/80 p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">🙏</div>
        <h2 className="text-xl font-semibold text-[#3f301f]">Thank you!</h2>
        <p className="mt-2 text-sm text-[#6b5841]">
          Your feedback helps improve the experience for everyone.
        </p>
        <a
          href={accessKeyId ? `/?key=${accessKeyId}` : "/"}
          className="mt-6 inline-block rounded-full bg-[#3f301f] px-6 py-2 text-sm font-medium text-[#f6eddc] transition hover:bg-[#2a2015]"
        >
          Return to Explorer
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Session Details - Editable */}
      <fieldset className="rounded-xl border border-[#d3c3a2] bg-white/80 p-4 shadow-sm">
        <legend className="px-2 text-sm font-medium text-[#3f301f]">
          Session Details
        </legend>
        <div className="mt-2 space-y-4">
          <div>
            <label htmlFor="strain-select" className="block text-xs font-medium uppercase tracking-wide text-[#8b7a5c] mb-1">
              Strain
            </label>
            <select
              id="strain-select"
              value={selectedStrainId}
              onChange={(e) => setSelectedStrainId(e.target.value)}
              className="w-full rounded-lg border border-[#d3c3a2] bg-white px-3 py-2 text-sm text-[#3f301f] focus:border-[#8b7a5c] focus:outline-none focus:ring-1 focus:ring-[#8b7a5c]"
            >
              {strainOptions.map((strain) => (
                <option key={strain.id} value={strain.id}>
                  {strain.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dose-select" className="block text-xs font-medium uppercase tracking-wide text-[#8b7a5c] mb-1">
              Dose Level
            </label>
            <select
              id="dose-select"
              value={selectedDoseKey}
              onChange={(e) => setSelectedDoseKey(e.target.value as DoseKey)}
              className="w-full rounded-lg border border-[#d3c3a2] bg-white px-3 py-2 text-sm text-[#3f301f] focus:border-[#8b7a5c] focus:outline-none focus:ring-1 focus:ring-[#8b7a5c]"
            >
              {doseOptions.map((dose) => (
                <option key={dose.key} value={dose.key}>
                  {dose.label}
                </option>
              ))}
            </select>
          </div>

          {/* Product selection */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-[#8b7a5c] mb-2">
              Product Used <span className="normal-case font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {relevantProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setSelectedProductId(selectedProductId === product.id ? null : product.id);
                    setShowOtherProduct(false);
                    setOtherProductName("");
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selectedProductId === product.id
                      ? "border-[#3f301f] bg-[#3f301f] text-[#f6eddc]"
                      : "border-[#d3c3a2] bg-white text-[#6b5841] hover:border-[#8b7a5c]"
                  }`}
                >
                  {product.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setShowOtherProduct(!showOtherProduct);
                  setSelectedProductId(null);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  showOtherProduct
                    ? "border-[#3f301f] bg-[#3f301f] text-[#f6eddc]"
                    : "border-[#d3c3a2] bg-white text-[#6b5841] hover:border-[#8b7a5c]"
                }`}
              >
                Other
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedProductId(null);
                  setShowOtherProduct(false);
                  setOtherProductName("");
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  !selectedProductId && !showOtherProduct
                    ? "border-[#8b7a5c] bg-[#f6eddc] text-[#6b5841]"
                    : "border-[#d3c3a2] bg-white text-[#8b7a5c] hover:border-[#8b7a5c]"
                }`}
              >
                Not sure
              </button>
            </div>
            
            {/* Other product input */}
            {showOtherProduct && (
              <input
                type="text"
                value={otherProductName}
                onChange={(e) => setOtherProductName(e.target.value)}
                placeholder="Enter product or brand name"
                className="mt-2 w-full rounded-lg border border-[#d3c3a2] bg-white px-3 py-2 text-sm text-[#3f301f] placeholder:text-[#a89b84] focus:border-[#8b7a5c] focus:outline-none focus:ring-1 focus:ring-[#8b7a5c]"
              />
            )}
          </div>
        </div>
      </fieldset>

      {/* Match Your Experience */}
      <fieldset className="rounded-xl border border-[#d3c3a2] bg-[#faf6ef] p-4 shadow-sm">
        <legend className="px-2 text-sm font-medium text-[#3f301f]">
          Match Your Experience
        </legend>
        
        <div className="flex flex-col md:flex-row gap-4 mt-2 md:items-start">
          {/* Radar on left - 60% */}
          <div className="flex-shrink-0 md:w-[60%]">
            <FeedbackRadarPreview expectedAxes={expectedAxes} feltAxes={feltAxes} />
            {/* Legend under radar */}
            <div className="mt-2 space-y-1">
              {/* Expected vs Felt */}
              <div className="flex items-center justify-center gap-4 text-xs text-[#3f301f]">
                <span className="flex items-center gap-1.5">
                  <span 
                    className="w-3 h-3 rounded-sm"
                    style={{ 
                      backgroundColor: "rgba(212, 193, 162, 0.15)",
                      border: "1.5px dashed rgba(107, 88, 65, 0.6)",
                    }}
                  /> Expected
                </span>
                <span className="flex items-center gap-1.5">
                  <span 
                    className="w-3 h-3 rounded-sm"
                    style={{ 
                      backgroundColor: "rgba(180, 140, 80, 0.45)",
                      border: "1.5px solid rgba(90, 70, 45, 0.85)",
                    }}
                  /> Felt
                </span>
              </div>
              {/* Less vs More */}
              <div className="flex items-center justify-center gap-4 text-xs text-[#3f301f]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#0369a1] rounded-full" /> Less
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#b45309] rounded-full" /> More
                </span>
              </div>
            </div>
          </div>
          
          {/* Sliders on right - 40% */}
          <div className="flex-1 space-y-3">
            {axes.map((axis) => {
              const expected = expectedAxes[axis] ?? 5;
              const felt = feltAxes[axis] ?? 5;
              const diff = felt - expected;
              const diffColor = diff > 0 ? "#b45309" : diff < 0 ? "#0369a1" : "#6b5841";
              const diffLabel = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "";
              
              // Calculate the colored bar position (between expected and felt)
              const minPos = Math.min(expected, felt);
              const maxPos = Math.max(expected, felt);
              const barLeft = (minPos / 10) * 100;
              const barWidth = ((maxPos - minPos) / 10) * 100;
              
              return (
                <div key={axis} className="space-y-1">
                  {/* Label row with +/- buttons */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#3f301f]">
                      {AXIS_LABELS[axis]}
                    </span>
                    <div className="flex items-center gap-1">
                      {/* Minus button - requires double-tap to go below expected */}
                      <button
                        type="button"
                        onClick={() => handleDecrease(axis)}
                        disabled={felt <= 0}
                        className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-[#e5ddd0] text-[#6b5841] hover:bg-[#d5cdc0] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      {/* Value/Diff */}
                      <span 
                        className="w-6 text-[10px] font-bold tabular-nums text-center"
                        style={{ color: diffColor }}
                      >
                        {diffLabel || felt}
                      </span>
                      {/* Plus button - single tap */}
                      <button
                        type="button"
                        onClick={() => handleIncrease(axis)}
                        disabled={felt >= 10}
                        className="w-5 h-5 flex items-center justify-center rounded bg-[#e5ddd0] text-[#6b5841] text-xs font-bold hover:bg-[#d5cdc0] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Slider - full width */}
                  <div className="relative h-5">
                    {/* Track background */}
                    <div className="absolute inset-y-1.5 inset-x-0 rounded-full bg-[#e5ddd0]" />
                    
                    {/* Colored bar showing difference (between expected and felt) */}
                    {diff !== 0 && (
                      <div 
                        className="absolute inset-y-1.5 rounded-full"
                        style={{ 
                          left: `${barLeft}%`,
                          width: `${barWidth}%`,
                          backgroundColor: diffColor,
                          opacity: 0.6,
                        }}
                      />
                    )}
                    
                    {/* Ghost marker for expected */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-1 h-3 rounded-sm z-10 bg-[#a89b84] opacity-70"
                      style={{ left: `calc(${(expected / 10) * 100}% - 2px)` }}
                      title={`Expected: ${expected}`}
                    />
                    
                    {/* Range input */}
              <input
                type="range"
                id={`axis-${axis}`}
                min={0}
                max={10}
                step={1}
                      value={felt}
                      onChange={(e) => handleSliderChange(axis, Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {/* Custom thumb */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm pointer-events-none z-20"
                style={{
                        left: `calc(${(felt / 10) * 100}% - 8px)`,
                        backgroundColor: diff !== 0 ? diffColor : "#6b5841",
                }}
              />
            </div>
                </div>
              );
            })}
          </div>
        </div>
      </fieldset>

      {/* Overall Experience Rating */}
      <fieldset className="rounded-xl border border-[#d3c3a2] bg-white/80 p-4 shadow-sm">
        <legend className="px-2 text-sm font-medium text-[#3f301f]">
          Overall Experience
        </legend>
        <div className="mt-2 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setOverallExperience(n)}
              className={`h-10 w-10 rounded-full border-2 text-lg font-medium transition ${
                overallExperience === n
                  ? "border-[#3f301f] bg-[#3f301f] text-[#f6eddc]"
                  : "border-[#d3c3a2] bg-white text-[#6b5841] hover:border-[#8b7a5c]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-[#8b7a5c]">
          1 = Poor · 5 = Excellent
        </p>
      </fieldset>

      {/* Intensity Rating */}
      <fieldset className="rounded-xl border border-[#d3c3a2] bg-white/80 p-4 shadow-sm">
        <legend className="px-2 text-sm font-medium text-[#3f301f]">
          Intensity vs. Expectation
        </legend>
        <div className="mt-2 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setIntensityRating(n)}
              className={`h-10 w-10 rounded-full border-2 text-lg font-medium transition ${
                intensityRating === n
                  ? "border-[#3f301f] bg-[#3f301f] text-[#f6eddc]"
                  : "border-[#d3c3a2] bg-white text-[#6b5841] hover:border-[#8b7a5c]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-[#8b7a5c]">
          1 = Much lighter · 3 = As expected · 5 = Much stronger
        </p>
      </fieldset>

      {/* Best For */}
      <fieldset className="rounded-xl border border-[#d3c3a2] bg-white/80 p-4 shadow-sm">
        <legend className="px-2 text-sm font-medium text-[#3f301f]">
          Best for (select all that apply)
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {BEST_FOR_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option, bestFor, setBestFor)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                bestFor.includes(option)
                  ? "border-[#3f301f] bg-[#3f301f] text-[#f6eddc]"
                  : "border-[#d3c3a2] bg-white text-[#6b5841] hover:border-[#8b7a5c]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Setting */}
      <fieldset className="rounded-xl border border-[#d3c3a2] bg-white/80 p-4 shadow-sm">
        <legend className="px-2 text-sm font-medium text-[#3f301f]">
          Setting (select all that apply)
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SETTING_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option, setting, setSetting)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                setting.includes(option)
                  ? "border-[#3f301f] bg-[#3f301f] text-[#f6eddc]"
                  : "border-[#d3c3a2] bg-white text-[#6b5841] hover:border-[#8b7a5c]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Testimonial */}
      <fieldset className="rounded-xl border border-[#d3c3a2] bg-white/80 p-4 shadow-sm">
        <legend className="px-2 text-sm font-medium text-[#3f301f]">
          Share your experience (optional)
        </legend>
        <textarea
          value={testimonial}
          onChange={(e) => setTestimonial(e.target.value)}
          rows={3}
          placeholder="What stood out about this experience?"
          className="mt-2 w-full rounded-lg border border-[#d3c3a2] bg-white px-3 py-2 text-sm text-[#3f301f] placeholder:text-[#a89b84] focus:border-[#8b7a5c] focus:outline-none focus:ring-1 focus:ring-[#8b7a5c]"
        />
      </fieldset>

      {/* Contact */}
      <fieldset className="rounded-xl border border-[#d3c3a2] bg-white/80 p-4 shadow-sm">
        <legend className="px-2 text-sm font-medium text-[#3f301f]">
          Contact for follow-up (optional)
        </legend>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email or phone"
          className="mt-2 w-full rounded-lg border border-[#d3c3a2] bg-white px-3 py-2 text-sm text-[#3f301f] placeholder:text-[#a89b84] focus:border-[#8b7a5c] focus:outline-none focus:ring-1 focus:ring-[#8b7a5c]"
        />
        <p className="mt-1 text-xs text-[#8b7a5c]">
          Only used if we have questions about your feedback
        </p>
      </fieldset>

      {/* Error message */}
      {submitStatus === "error" && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[#3f301f] py-3 text-sm font-semibold text-[#f6eddc] transition hover:bg-[#2a2015] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting…" : "Submit Feedback"}
      </button>
    </form>
  );
}
