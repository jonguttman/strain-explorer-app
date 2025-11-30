"use client";

import { useState } from "react";
import type { AccessKey, AccessKeyType, AccessKeySettings } from "@/lib/types";
import { AccessKeyLinkCell } from "./AccessKeyLinkCell";

type AccessAdminClientProps = {
  initialKeys: AccessKey[];
  initialSettings: AccessKeySettings;
};

const ACCESS_KEY_TYPES: AccessKeyType[] = ["master", "partner", "staff", "test"];

export function AccessAdminClient({ initialKeys, initialSettings }: AccessAdminClientProps) {
  const [rows, setRows] = useState<AccessKey[]>(initialKeys);
  const [settings, setSettings] = useState<AccessKeySettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  function handleAddKey() {
    const now = new Date().toISOString();
    const newKey: AccessKey = {
      id: `key-${Date.now()}`,
      label: "",
      type: "partner",
      isActive: true,
      notes: "",
      createdAt: now,
      updatedAt: now,
    };
    setRows([...rows, newKey]);
    setSaveStatus("idle");
  }

  function updateRow(index: number, updates: Partial<AccessKey>) {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, ...updates, updatedAt: new Date().toISOString() }
          : row
      )
    );
    setSaveStatus("idle");
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/access-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: rows, settings }),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      const data = await res.json();
      setRows(data.keys);
      setSettings(data.settings);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Root Access Mode Toggle */}
      <section className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Root Access Mode
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              When enabled, visitors must use an invite URL with a valid{" "}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono">
                ?key=…
              </code>{" "}
              or they&apos;ll see a private beta invite screen instead of Tripdar.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={settings.requireKeyForRoot}
              onChange={(e) => {
                setSettings((prev) => ({
                  ...prev,
                  requireKeyForRoot: e.target.checked,
                }));
                setSaveStatus("idle");
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-400 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            <span className="ms-3 text-sm font-medium text-slate-700">
              {settings.requireKeyForRoot ? "Invite required" : "Public access"}
            </span>
          </label>
        </div>
      </section>

      {/* Access Keys Table */}
    <section className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Current Access Keys
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            These keys can be used as{" "}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono">
              ?key=…
            </code>{" "}
            in your kiosk URLs.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddKey}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Key
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2 pr-4 text-left">Key ID</th>
              <th className="py-2 pr-4 text-left">Label</th>
              <th className="py-2 pr-4 text-left">Type</th>
              <th className="py-2 pr-4 text-left">Active</th>
              <th className="py-2 pr-4 text-left">Notes</th>
              <th className="py-2 pr-4 text-left">Kiosk Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={row.id} className="align-top">
                <td className="py-2 pr-4 font-mono text-xs text-slate-800">
                  {row.id}
                </td>
                <td className="py-2 pr-4">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) =>
                      updateRow(index, { label: e.target.value })
                    }
                    placeholder="Label…"
                    className="w-full min-w-[140px] rounded border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </td>
                <td className="py-2 pr-4">
                  <select
                    value={row.type}
                    onChange={(e) =>
                      updateRow(index, { type: e.target.value as AccessKeyType })
                    }
                    className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    {ACCESS_KEY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 pr-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={row.isActive}
                      onChange={(e) =>
                        updateRow(index, { isActive: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span
                      className={`text-xs font-medium ${
                        row.isActive ? "text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                </td>
                <td className="py-2 pr-4">
                  <input
                    type="text"
                    value={row.notes ?? ""}
                    onChange={(e) =>
                      updateRow(index, { notes: e.target.value })
                    }
                    placeholder="Notes…"
                    className="w-full min-w-[120px] rounded border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </td>
                <td className="py-2 pr-4">
                  <AccessKeyLinkCell keyId={row.id} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-sm text-slate-500"
                >
                  No access keys yet. Click &quot;Add Key&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {saveStatus === "success" && (
          <span className="text-sm font-medium text-emerald-600">
            ✓ Saved
          </span>
        )}
        {saveStatus === "error" && (
          <span className="text-sm font-medium text-red-600">
            Failed to save
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </section>
    </div>
  );
}

