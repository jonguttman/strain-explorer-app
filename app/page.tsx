import { Suspense } from "react";
import { promises as fs } from "fs";
import path from "path";
import { StrainExplorerClient } from "./StrainExplorerClient";
import { BetaGate } from "./components/BetaGate";
import { Gateway } from "./components/Gateway";
import type { AccessKeyDataset, AccessKeySettings } from "@/lib/types";

// Force dynamic rendering so access key changes take effect immediately
export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS: AccessKeySettings = {
  requireKeyForRoot: false,
};

async function loadAccessKeys(): Promise<AccessKeyDataset> {
  try {
    const filePath = path.join(process.cwd(), "data", "accessKeys.json");
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as AccessKeyDataset;
  } catch {
    return { keys: [], settings: DEFAULT_SETTINGS };
  }
}

type PageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function StrainExplorerPage({ searchParams }: PageProps) {
  const { key } = await searchParams;

  // Load access keys data dynamically at request time
  const dataset = await loadAccessKeys();
  const settings = dataset.settings ?? DEFAULT_SETTINGS;
  const keys = dataset.keys ?? [];
  const requireKeyForRoot = settings.requireKeyForRoot;

  // If public access is enabled (no key required), go straight to strain explorer
  if (!requireKeyForRoot) {
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

  // Key gating is enabled - if no key param, show the Gateway screen
  if (!key) {
    return <Gateway />;
  }

  // Check if the provided key is valid and active
  const hasValidKey = keys.some((k) => k.id === key && k.isActive);

  // If key is invalid, show the beta gate
  if (!hasValidKey) {
    return <BetaGate />;
  }

  // Valid key provided, render the strain explorer
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
