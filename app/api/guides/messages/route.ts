/**
 * Guide Messages API
 * 
 * GET: Returns messages for the current logged-in guide
 * POST: Marks a message as read
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getGuideFromRequest } from "@/lib/guideSession";
import type { GuideMessageDataset } from "@/lib/types";

const DATA_PATH = path.join(process.cwd(), "data", "guideMessages.json");

async function loadMessages(): Promise<GuideMessageDataset> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw) as GuideMessageDataset;
  } catch {
    return { messages: [] };
  }
}

async function saveMessages(data: GuideMessageDataset): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function GET(request: NextRequest) {
  const guide = await getGuideFromRequest(request);

  if (!guide) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const data = await loadMessages();

  // Filter messages for this guide (personal or broadcast)
  const myMessages = data.messages
    .filter((m) => m.guideId === guide.id || m.guideId === "all")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Add isRead flag for convenience
  const messagesWithReadStatus = myMessages.map((m) => ({
    ...m,
    isRead: m.readBy.includes(guide.id),
  }));

  return NextResponse.json({ messages: messagesWithReadStatus });
}

export async function POST(request: NextRequest) {
  const guide = await getGuideFromRequest(request);

  if (!guide) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 }
      );
    }

    const data = await loadMessages();
    const message = data.messages.find((m) => m.id === messageId);

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Mark as read if not already
    if (!message.readBy.includes(guide.id)) {
      message.readBy.push(guide.id);
      await saveMessages(data);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to mark message as read:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

