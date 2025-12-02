import { AdminHeader } from "../AdminHeader";
import { promises as fs } from "fs";
import path from "path";
import type { AccessKeyDataset, AccessKeySettings } from "@/lib/types";
import { AccessAdminClient } from "./AccessAdminClient";

const DEFAULT_SETTINGS: AccessKeySettings = {
  requireKeyForRoot: false,
};

async function loadAccessKeys(): Promise<AccessKeyDataset> {
  const filePath = path.join(process.cwd(), "data", "accessKeys.json");
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as AccessKeyDataset;
    if (!parsed || !Array.isArray(parsed.keys)) {
      return { keys: [], settings: DEFAULT_SETTINGS };
    }
    return {
      keys: parsed.keys,
      settings: parsed.settings ?? DEFAULT_SETTINGS,
    };
  } catch {
    // If the file is missing or invalid, fall back to empty
    return { keys: [], settings: DEFAULT_SETTINGS };
  }
}

export default async function AccessAdminPage() {
  const { keys, settings } = await loadAccessKeys();

  return (
    <main className="min-h-screen bg-[var(--shell-bg)] text-[var(--ink-main)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4">
        <AdminHeader />
        <p className="text-sm text-[var(--ink-soft)] mb-4">
          Manage partner access links, beta keys, and referral tracking for the Tripdar kiosk.
        </p>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm p-5 space-y-3 mb-4">
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center rounded-full border border-amber-600/30 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              Coming Soon
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--ink-main)] mb-2">
                Planned Features
              </h3>
              <ul className="space-y-1.5 text-sm text-[var(--ink-soft)]">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Create key IDs for partners (e.g., <code className="rounded bg-[var(--card-inner)] px-1.5 py-0.5 text-xs font-mono text-[var(--ink-main)]">dani-top</code>, <code className="rounded bg-[var(--card-inner)] px-1.5 py-0.5 text-xs font-mono text-[var(--ink-main)]">staff-training</code>)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Toggle keys active/inactive with expiration dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>View usage statistics and referral tracking per key</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-[var(--card-border)]">
              <p className="text-xs text-[var(--ink-soft)]">
                <span className="font-medium">Note:</span> For now, use{" "}
                <code className="rounded bg-[var(--card-inner)] px-1.5 py-0.5 font-mono text-[var(--ink-main)]">
                  /?key=master
                </code>{" "}
                as your testing link.
              </p>
            </div>
          </div>
        </div>

        <AccessAdminClient initialKeys={keys} initialSettings={settings ?? DEFAULT_SETTINGS} />
      </div>
    </main>
  );
}
