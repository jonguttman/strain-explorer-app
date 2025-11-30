/**
 * Admin Guide Messages API
 * 
 * GET: Returns all messages
 * POST: Creates a new message (dev-only)
 */

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { GuideMessageDataset, GuideMessage } from "@/lib/types";

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

export async function GET() {
  const data = await loadMessages();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  // Dev-only write protection
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Forbidden in production" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { guideId, subject, body: messageBody } = body;

    if (!guideId || !subject || !messageBody) {
      return NextResponse.json(
        { error: "guideId, subject, and body are required" },
        { status: 400 }
      );
    }

    const data = await loadMessages();

    const newMessage: GuideMessage = {
      id: `msg-${Date.now()}`,
      guideId,
      subject,
      body: messageBody,
      createdAt: new Date().toISOString(),
      readBy: [],
    };

    data.messages.unshift(newMessage);
    await saveMessages(data);

    return NextResponse.json({ ok: true, message: newMessage });
  } catch (error) {
    console.error("Failed to create message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}

