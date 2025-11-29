// Shared types for the strain explorer application
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
  id: string;           // e.g. "master", "dani-top"
  label: string;        // human-friendly name, e.g. "Master test link" or "Dani @ The Other Path"
  type: AccessKeyType;
  isActive: boolean;
  notes?: string;
  createdAt: string;    // ISO string
  expiresAt?: string;   // optional
  maxUses?: number;     // optional, not enforced yet
  useCount: number;     // can be derived but keep for convenience
};

export type AccessKeyDataset = {
  keys: AccessKey[];
};

// Product types for the product catalog module
export type ProductForm =
  | "capsules"
  | "gummies"
  | "tea"
  | "tincture"
  | "chocolate"
  | "honey"
  | "other";

export type ProductStatus = "draft" | "live" | "archived";

export type ProductWhereToBuy = {
  venueId: string;        // e.g. "the-other-path"
  venueName: string;      // e.g. "The Other Path"
  city?: string;          // e.g. "Sherman Oaks"
  url?: string;           // Store page or Google Maps link
};

export type Product = {
  id: string;             // "psilly-mighty-caps-gt"
  name: string;           // "Mighty Caps"
  brand: string;          // "The Original Psilly"
  strainId?: string;      // "golden-teacher"
  strainName?: string;    // "Golden Teacher" (optional convenience; can be derived)
  displayName?: string;   // e.g. "Psilly Mighty Caps – Golden Teacher"
  form: ProductForm;
  imageUrl?: string;
  shortDescription?: string;
  longDescription?: string;
  bestDoseLevels?: DoseKey[];   // ["micro", "mini"]
  tags?: string[];              // ["Focus", "Beginner-friendly"]
  whereToBuy?: ProductWhereToBuy[];
  // Soft partner targeting: if set, only show for those partner keys
  partnerIds?: string[];        // e.g. ["the-other-path", "leaf-shop"]
  featured?: boolean;           // gets surfaced/promoted first
  housePick?: boolean;          // special badge / emphasis
  status: ProductStatus;        // "draft", "live", "archived"
  createdAt?: string;
  updatedAt?: string;
};

export type ProductDataset = {
  products: Product[];
};

// Feedback types (extend existing or add if not present)
export type FeedbackEntry = {
  id: string;
  strainId: string;
  doseKey: DoseKey;
  rating?: number;
  comments?: string;
  productIds?: string[];      // ids of products used during this experience
  accessKeyId?: string;
  timestamp: string;
};

