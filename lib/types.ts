// Shared types for the Tripdar application (trip radar powered by Fungapedia)
// This is the single source of truth for all type definitions

export type DoseKey = "micro" | "mini" | "macro" | "museum" | "mega" | "hero";

export type TraitAxisId =
  | "visuals"
  | "euphoria"
  | "introspection"
  | "creativity"
  | "spiritual_depth"
  | "sociability";

export type DoseSnapshot = {
  onset: string;
  duration: string;
  intensity: string;
  bestFor: string[];
  setting: string[];
};

// Experience metadata types for enhanced radar view
export type ExperienceLevel =
  | "gentle"        // New explorers
  | "balanced"      // Comfortable users
  | "intense";      // Experienced only

export type StrainTimeline = {
  onsetMinMinutes: number;
  onsetMaxMinutes: number;
  peakMinHours: number;
  peakMaxHours: number;
  tailMinHours: number;
  tailMaxHours: number;
};

export type StrainExperienceMeta = {
  effectWord: string;               // e.g. "Create", "Connect", "Transform"
  effectTagline: string;            // short sentence: "Deep perspective shifts", etc.
  tripProfileBullets: string[];     // max 3 bullets, short phrases
  bestForTags: string[];            // short tags: "Solo reflection", "Creative work", etc.
  experienceLevel: ExperienceLevel; // gentle/balanced/intense for this strain+dose
  timeline: StrainTimeline;
  safetyTips?: string[];            // OPTIONAL, short reminders
};

export type StrainMeta = {
  origin: string;
  history: string;
  tags: string[];
};

export type StrainTestimonials = Record<DoseKey, string[]>;

export type VisualConfig = {
  [K in DoseKey]?: {
    colorHex: string;
  };
};

export type DoseConfig = {
  label: string;
  grams: number;
};

export type DoseConfigMap = Record<DoseKey, DoseConfig>;

export type StrainJsonEntry = {
  radar: Record<TraitAxisId, number[]>;
  blurb: Record<DoseKey, string>;
  details: Record<DoseKey, string>;
  products: Record<DoseKey, string[]>;
  visual?: VisualConfig;
  meta: StrainMeta;
  snapshots: Record<DoseKey, DoseSnapshot>;
  testimonials: StrainTestimonials;
  experienceMeta?: Record<DoseKey, StrainExperienceMeta>;
};

export type EditorDataset = {
  doses: DoseKey[];
  axes: TraitAxisId[];
  doseConfig: DoseConfigMap;
  strains: Record<string, StrainJsonEntry>;
};

// Additional types used by the data layer
export type DoseTraits = {
  values: Record<TraitAxisId, number>;
};

export type DoseContent = {
  blurb: string;
  details: string;
  products: string[];
};

export type Strain = {
  id: string;
  name: string;
  colorHex: string;
};

export type StrainDoseData = {
  traits: DoseTraits;
  content: DoseContent;
};

export type StrainDoseResult = {
  strain: Strain;
  doseKey: DoseKey;
  doseData: StrainDoseData;
  axes: TraitAxisId[];
  accentHex: string;
  doseInfo: DoseConfig;
  meta: StrainMeta | null;
  snapshot: DoseSnapshot | null;
  testimonialsForDose: string[];
  experienceMeta: StrainExperienceMeta | null;
};

export type StrainDataset = {
  doses: DoseKey[];
  axes: TraitAxisId[];
  doseConfig: DoseConfigMap;
  strains: Record<string, StrainJsonEntry>;
};

// Access key types for invite links and referral tracking
export type AccessKeyType = "master" | "partner" | "staff" | "test";

export type AccessKey = {
  id: string;           // URL-safe key, e.g. "dani-top"
  label: string;        // Human-readable label, e.g. "Dani @ The Other Path"
  type: AccessKeyType;
  isActive: boolean;
  notes?: string;
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
};

export type AccessKeySettings = {
  requireKeyForRoot: boolean;
};

export type AccessKeyDataset = {
  keys: AccessKey[];
  settings?: AccessKeySettings;
};

// Feedback entry types

// One numeric score per radar axis (0–10)
export type AxisExperienceScores = Partial<Record<TraitAxisId, number>>;

export type FeedbackEntry = {
  id: string;
  strainId?: string;
  doseKey?: string;
  accessKeyId?: string;
  ctaKey?: string;
  overallExperience?: number;       // 1-5 rating
  intensityRating?: number;         // 1-5 rating
  testimonial?: string;
  bestFor?: string[];
  setting?: string[];
  contact?: string;
  createdAt: string;                // ISO timestamp
  // User's felt experience by axis
  feltAxes?: AxisExperienceScores;
  // Snapshot of expected axes at time of submission (computed server-side)
  expectedAxes?: AxisExperienceScores;
};

export type FeedbackDataset = {
  entries: FeedbackEntry[];
};

// Product catalog types (read-only for now)
export type ProductStatus = "active" | "inactive";

export type ProductWhereToBuy = {
  label: string;
  url?: string;
  address?: string;
  notes?: string;
};

export type Product = {
  id: string;                      // e.g. "psilly-mighty-caps-gt"
  name: string;                    // e.g. "Psilly Mighty Caps – Golden Teacher"
  brand: string;                   // e.g. "The Original Psilly"
  strainIds: string[];             // strain slugs, e.g. ["golden-teacher", "enigma"]; empty = all strains
  doseKey?: DoseKey;               // optional: micro/mini/macro/museum/mega/hero (dose level for kiosk mapping)
  /**
   * How much mushroom is in ONE unit of this product.
   * Free-form text so we can store things like:
   * - "200 mg per capsule"
   * - "0.75 g per tea bag"
   * - "1 g per packet"
   */
  mushroomAmountPerUnit?: string;
  /**
   * Dosing direction shown in the kiosk, e.g.:
   * - "Take two Mighty Caps"
   * - "Enjoy one chocolate square"
   * - "Brew one tea bag in hot water"
   */
  dosingDirection?: string;
  shortDescription?: string;
  imageUrl?: string;               // path under /public, e.g. "/products/mighty-caps-gt.png"
  tags?: string[];
  status: ProductStatus;
  isHousePick?: boolean;
  whereToBuy?: ProductWhereToBuy[];
  externalUrl?: string;            // optional link to external PDP
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  strainMatchWeight?: number;      // optional, for future ranking
  doseMatchWeight?: number;        // optional, for future ranking
  partnerId?: string;              // optional: which partner this product is for
};

export type ProductDataset = {
  products: Product[];
};

// ============================================
// Psilly Guides Portal Types
// ============================================

export type GuideRole = "guide" | "manager" | "admin";

export interface GuideAccount {
  id: string;              // e.g. "guide-dani-top"
  username: string;        // e.g. "dani"
  passwordHash: string;    // bcrypt hash
  name: string;            // full name
  email?: string;
  partnerKeyId?: string;   // link to access key like "dani-top"
  role: GuideRole;
  createdAt: string;
  updatedAt: string;
}

export interface GuideAccountDataset {
  guides: GuideAccount[];
}

export interface GuideMessage {
  id: string;
  guideId: string | "all";  // "all" = broadcast to all guides
  subject: string;
  body: string;
  createdAt: string;
  readBy: string[];         // array of guideIds who have read it
}

export interface GuideMessageDataset {
  messages: GuideMessage[];
}

