import { Suspense } from "react";
import { StrainExplorerClient } from "./StrainExplorerClient";
import { BetaGate } from "./components/BetaGate";
import type { AccessKeyDataset, AccessKeySettings } from "@/lib/types";
import rawAccessKeys from "@/data/accessKeys.json";

const DEFAULT_SETTINGS: AccessKeySettings = {
  requireKeyForRoot: false,
};

type PageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function StrainExplorerPage({ searchParams }: PageProps) {
  const { key } = await searchParams;

  // Load access keys data server-side
  const dataset = rawAccessKeys as AccessKeyDataset;
  const settings = dataset.settings ?? DEFAULT_SETTINGS;
  const keys = dataset.keys ?? [];

  // Check if gating is required
  const requireKeyForRoot = settings.requireKeyForRoot;

  // Check if the provided key is valid and active
  const hasValidKey = key
    ? keys.some((k) => k.id === key && k.isActive)
    : false;

  // If gating is enabled and no valid key, show the beta gate
  if (requireKeyForRoot && !hasValidKey) {
    return <BetaGate />;
  }

  // Otherwise, render the strain explorer
  return (
    <Suspense
      fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f6eddc] text-[#3f301f]">
        Loading…
      </div>
      }
    >
      <StrainExplorerClient />
    </Suspense>
  );
}
