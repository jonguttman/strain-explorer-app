"use client";

import { useState, useEffect } from "react";
import type { TraitAxisId, DoseKey, AxisExperienceScores } from "@/lib/types";

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

const AXIS_LABELS: Record<TraitAxisId, string> = {
  visuals: "Visuals",
  euphoria: "Euphoria",
  introspection: "Introspection",
  creativity: "Creativity",
  spiritual_depth: "Spiritual Depth",
  sociability: "Sociability",
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

  // Axis sliders (feltAxes)
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

  function toggleOption(value: string, list: string[], setList: (v: string[]) => void) {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  }

  function handleAxisChange(axis: TraitAxisId, value: number) {
    setFeltAxes(prev => ({ ...prev, [axis]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
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

  const selectedStrain = strainOptions.find(s => s.id === selectedStrainId);

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
        </div>
      </fieldset>

      {/* Radar Experience Sliders */}
      <fieldset className="rounded-xl border border-[#d3c3a2] bg-[#faf6ef] p-4 shadow-sm">
        <legend className="px-2 text-sm font-medium text-[#3f301f]">
          Match the Radar to Your Experience
        </legend>
        <p className="mt-1 mb-4 text-xs text-[#8b7a5c]">
          We pre-filled these based on the typical experience for {selectedStrain?.name ?? "this strain"} at {selectedDoseKey} dose. 
          Adjust the sliders to match how you actually felt.
        </p>
        <div className="space-y-4">
          {axes.map((axis) => (
            <div key={axis} className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor={`axis-${axis}`} className="text-sm font-medium text-[#3f301f]">
                  {AXIS_LABELS[axis]}
                </label>
                <span className="text-xs font-semibold text-[#6b5841] tabular-nums">
                  {feltAxes[axis] ?? 5} / 10
                </span>
              </div>
              <input
                type="range"
                id={`axis-${axis}`}
                min={0}
                max={10}
                step={1}
                value={feltAxes[axis] ?? 5}
                onChange={(e) => handleAxisChange(axis, Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#3f301f]"
                style={{
                  background: `linear-gradient(to right, #3f301f 0%, #3f301f ${((feltAxes[axis] ?? 5) / 10) * 100}%, #d3c3a2 ${((feltAxes[axis] ?? 5) / 10) * 100}%, #d3c3a2 100%)`,
                }}
              />
            </div>
          ))}
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
