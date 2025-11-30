import { promises as fs } from "fs";
import path from "path";
import { AdminNav } from "@/app/admin/AdminNav";
import { AdminGuideMessagesClient } from "./AdminGuideMessagesClient";
import type { GuideAccountDataset, GuideMessageDataset } from "@/lib/types";

async function loadGuides(): Promise<GuideAccountDataset> {
  try {
    const filePath = path.join(process.cwd(), "data", "guides.json");
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as GuideAccountDataset;
  } catch {
    return { guides: [] };
  }
}

async function loadMessages(): Promise<GuideMessageDataset> {
  try {
    const filePath = path.join(process.cwd(), "data", "guideMessages.json");
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as GuideMessageDataset;
  } catch {
    return { messages: [] };
  }
}

export default async function AdminGuideMessagesPage() {
  const [guidesData, messagesData] = await Promise.all([
    loadGuides(),
    loadMessages(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav active="guides" title="Guide Messages" />
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
        <p className="text-sm text-slate-600">
          Send messages to individual guides or broadcast to all. Messages appear in the guide portal inbox.
        </p>
        <AdminGuideMessagesClient
          initialGuides={guidesData.guides}
          initialMessages={messagesData.messages}
        />
      </div>
    </div>
  );
}

