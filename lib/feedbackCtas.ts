// lib/feedbackCtas.ts

export type CtaKey =
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
    key: "log-your-experience",
    label: "Log your experience",
  },
  {
    key: "help-us-improve",
    label: "Help us improve",
  },
  {
    key: "tell-us-about-your-trip",
    label: "Tell us about your trip",
  },
  {
    key: "rate-this-dose",
    label: "Rate this dose",
  },
];

