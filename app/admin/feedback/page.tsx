import { AdminNav } from "../AdminNav";
import { FeedbackAdminClient } from "./FeedbackAdminClient";
import { promises as fs } from "fs";
import path from "path";
import type { FeedbackDataset, AccessKeyDataset } from "@/lib/types";

async function loadFeedback(): Promise<FeedbackDataset> {
  const filePath = path.join(process.cwd(), "data", "feedback.json");
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw) as FeedbackDataset;
    if (!data || !Array.isArray(data.entries)) {
      return { entries: [] };
    }
    return data;
  } catch {
    return { entries: [] };
  }
}

async function loadAccessKeys(): Promise<AccessKeyDataset> {
  const filePath = path.join(process.cwd(), "data", "accessKeys.json");
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw) as AccessKeyDataset;
    if (!data || !Array.isArray(data.keys)) {
      return { keys: [] };
    }
    return data;
  } catch {
    return { keys: [] };
  }
}

async function loadStrainNames(): Promise<Record<string, string>> {
  const filePath = path.join(process.cwd(), "data", "strains.json");
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    const names: Record<string, string> = {};
    if (data && data.strains && typeof data.strains === "object") {
      for (const [id] of Object.entries(data.strains)) {
        // The strain name might be in the key or a name field
        names[id] = formatStrainId(id);
      }
    }
    return names;
  } catch {
    return {};
  }
}

function formatStrainId(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function FeedbackAdminPage() {
  const [feedbackData, accessKeysData, strainNames] = await Promise.all([
    loadFeedback(),
    loadAccessKeys(),
    loadStrainNames(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav active="feedback" />
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Feedback Explorer</h1>
          <p className="mt-2 text-sm text-slate-600">
            View and analyze feedback submissions from the kiosk.
          </p>
        </div>

        <FeedbackAdminClient
          initialEntries={feedbackData.entries}
          accessKeys={accessKeysData.keys}
          strainNames={strainNames}
        />
      </div>
    </div>
  );
}
