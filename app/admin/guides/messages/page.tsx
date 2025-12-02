import { promises as fs } from "fs";
import path from "path";
import { AdminHeader } from "@/app/admin/AdminHeader";
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
    <main className="min-h-screen bg-[var(--shell-bg)] text-[var(--ink-main)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4">
        <AdminHeader />
        <p className="text-sm text-[var(--ink-soft)] mb-4">
          Send messages to individual guides or broadcast to all. Messages appear in the guide portal inbox.
        </p>
        <AdminGuideMessagesClient
          initialGuides={guidesData.guides}
          initialMessages={messagesData.messages}
        />
      </div>
    </main>
  );
}

