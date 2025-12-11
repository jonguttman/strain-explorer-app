"use client";

// =============================================================================
// HOW IT WORKS MODAL - Tripdar Intro Experience
// =============================================================================
// A full-screen modal with a 4-slide carousel explaining how Tripdar works.
// Features: Psilly/Tripdar styling, smooth transitions, escape to close.
// =============================================================================

import { useState, useEffect, useCallback } from "react";

type HowItWorksModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Slide content
const SLIDES = [
  {
    id: "intro",
    title: "Welcome to Tripdar™",
    subtitle: "Your personal strain compass",
    description:
      "Tripdar is a visual tool that helps you understand the unique personality of each psilocybin strain at a glance. Think of it as a flavor wheel for consciousness exploration.",
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="2" opacity="0.7" />
        <circle cx="32" cy="32" r="4" fill="currentColor" />
        <line x1="32" y1="4" x2="32" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="48" x2="32" y2="60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="4" y1="32" x2="16" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="32" x2="60" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "dimensions",
    title: "Six Dimensions",
    subtitle: "The language of experience",
    description:
      "Each strain is mapped across six key dimensions: Visuals, Euphoria, Introspection, Creativity, Spiritual Depth, and Sociability. The radar shows how strongly each dimension expresses.",
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
        <polygon 
          points="32,8 52,20 52,44 32,56 12,44 12,20" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none"
          opacity="0.4"
        />
        <polygon 
          points="32,16 44,24 44,40 32,48 20,40 20,24" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="currentColor"
          fillOpacity="0.15"
        />
        <circle cx="32" cy="8" r="3" fill="currentColor" />
        <circle cx="52" cy="20" r="3" fill="currentColor" />
        <circle cx="52" cy="44" r="3" fill="currentColor" />
        <circle cx="32" cy="56" r="3" fill="currentColor" />
        <circle cx="12" cy="44" r="3" fill="currentColor" />
        <circle cx="12" cy="20" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "doses",
    title: "Dose Levels",
    subtitle: "Intensity at every level",
    description:
      "Use the dose selector to see how each strain's profile shifts from micro to mega doses. Lower doses emphasize subtlety; higher doses reveal the strain's full character.",
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="44" width="10" height="12" rx="2" fill="currentColor" opacity="0.3" />
        <rect x="22" y="36" width="10" height="20" rx="2" fill="currentColor" opacity="0.5" />
        <rect x="36" y="24" width="10" height="32" rx="2" fill="currentColor" opacity="0.7" />
        <rect x="50" y="12" width="10" height="44" rx="2" fill="currentColor" opacity="0.9" />
        <path d="M8 8 L56 8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
      </svg>
    ),
  },
  {
    id: "explore",
    title: "Explore Strains",
    subtitle: "Find your frequency",
    description:
      "Swipe through different strains to compare their profiles. Each strain has a unique fingerprint — some are creative catalysts, others are introspective guides. Let Tripdar be your compass.",
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
        <path 
          d="M12 32 C12 20, 20 12, 32 12 C44 12, 52 20, 52 32 C52 44, 44 52, 32 52" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        <polygon points="28,48 32,56 36,48" fill="currentColor" />
        <circle cx="32" cy="32" r="6" fill="currentColor" opacity="0.5" />
        <circle cx="32" cy="32" r="3" fill="currentColor" />
        <path d="M32 32 L44 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset to first slide when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        goToNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, currentSlide]);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    if (currentSlide === SLIDES.length - 1) {
      onClose();
    } else {
      setIsAnimating(true);
      setCurrentSlide((prev) => prev + 1);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [currentSlide, isAnimating, onClose]);

  const goToPrev = useCallback(() => {
    if (isAnimating || currentSlide === 0) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => prev - 1);
    setTimeout(() => setIsAnimating(false), 300);
  }, [currentSlide, isAnimating]);

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 300);
  };

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];
  const isLastSlide = currentSlide === SLIDES.length - 1;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div 
        className="relative w-full max-w-md mx-4 rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #1a1612 0%, #0a0806 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            color: "rgba(255, 255, 255, 0.6)",
          }}
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Slide content */}
        <div className="px-8 py-10">
          {/* Icon */}
          <div 
            className="flex justify-center mb-6 transition-all duration-300"
            style={{ 
              color: "#f3b34c",
              transform: isAnimating ? "scale(0.9)" : "scale(1)",
              opacity: isAnimating ? 0.5 : 1,
            }}
          >
            {slide.icon}
          </div>

          {/* Title */}
          <h2 
            id="modal-title"
            className="text-center text-[22px] sm:text-[26px] font-semibold mb-2 transition-opacity duration-300"
            style={{
              background: "linear-gradient(180deg, #f3b34c 0%, #d4913f 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              opacity: isAnimating ? 0.5 : 1,
            }}
          >
            {slide.title}
          </h2>

          {/* Subtitle */}
          <p 
            className="text-center text-[13px] sm:text-[14px] uppercase tracking-[0.15em] mb-6 transition-opacity duration-300"
            style={{ 
              color: "rgba(255, 255, 255, 0.5)",
              opacity: isAnimating ? 0.5 : 1,
            }}
          >
            {slide.subtitle}
          </p>

          {/* Description */}
          <p 
            className="text-center text-[14px] sm:text-[15px] leading-relaxed mb-8 transition-opacity duration-300"
            style={{ 
              color: "rgba(255, 255, 255, 0.75)",
              opacity: isAnimating ? 0.5 : 1,
            }}
          >
            {slide.description}
          </p>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mb-6">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: index === currentSlide 
                    ? "#f3b34c" 
                    : "rgba(255, 255, 255, 0.2)",
                  transform: index === currentSlide ? "scale(1.2)" : "scale(1)",
                }}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide ? "step" : undefined}
              />
            ))}
          </div>

          {/* Action button */}
          <div className="flex justify-center gap-3">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={goToPrev}
                className="px-5 py-2.5 rounded-full text-[14px] font-medium transition-all"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={goToNext}
              className="px-6 py-2.5 rounded-full text-[14px] font-medium transition-all"
              style={{
                background: "linear-gradient(180deg, #f3b34c 0%, #d4913f 100%)",
                color: "#1a1612",
                boxShadow: "0 4px 14px rgba(243, 179, 76, 0.35)",
              }}
            >
              {isLastSlide ? "Got it!" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorksModal;

