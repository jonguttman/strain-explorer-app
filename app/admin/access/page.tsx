import { AdminNav } from "../AdminNav";
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
    <div className="min-h-screen bg-slate-50">
      <AdminNav active="access" title="Access Keys & Invite Links" />
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
        <p className="text-sm text-slate-600">
          Manage partner access links, beta keys, and referral tracking for the Tripdar kiosk.
        </p>

        <div className="rounded-xl border border-slate-200 bg-white/90 shadow-sm p-5 space-y-3">
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center rounded-full border border-amber-600/30 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              Coming Soon
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Planned Features
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Create key IDs for partners (e.g., <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-800">dani-top</code>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-800">staff-training</code>)</span>
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

            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                <span className="font-medium">Note:</span> For now, use{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-700">
                  /?key=master
                </code>{" "}
                as your testing link.
              </p>
            </div>
          </div>
        </div>

        <AccessAdminClient initialKeys={keys} initialSettings={settings ?? DEFAULT_SETTINGS} />
      </div>
    </div>
  );
}
