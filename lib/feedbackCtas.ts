// lib/feedbackCtas.ts

export type CtaKey =
  | "share-feedback"
  | "log-your-experience"
  | "help-us-improve"
  | "tell-us-about-your-trip"
  | "rate-this-dose";

export type CtaVariant = {
  key: CtaKey;
  label: string;
  description?: string;
};

export const CTA_VARIANTS: CtaVariant[] = [
  {
    key: "share-feedback",
    label: "Share feedback",
    description: "Help refine our dosing guidance.",
  },
  {
    key: "log-your-experience",
    label: "Log your experience",
    description: "Capture how this journey felt for you.",
  },
  {
    key: "help-us-improve",
    label: "Help us improve",
    description: "Your input makes this tool smarter.",
  },
  {
    key: "tell-us-about-your-trip",
    label: "Tell us about your trip",
    description: "Share what this dose was like.",
  },
  {
    key: "rate-this-dose",
    label: "Rate this dose",
    description: "Was this dose lighter or stronger than expected?",
  },
];

