import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { EditorDataset } from "@/lib/types";

const DATA_FILE = path.join(process.cwd(), "data", "strains.json");

async function loadStrains(): Promise<EditorDataset | null> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as EditorDataset;
  } catch {
    return null;
  }
}

export async function GET() {
  const data = await loadStrains();
  if (!data) {
    return NextResponse.json({ error: "Failed to load strains" }, { status: 500 });
  }
  return NextResponse.json(data);
}

function isValidDataset(obj: unknown): obj is EditorDataset {
  if (typeof obj !== "object" || obj === null) return false;
  const dataset = obj as Record<string, unknown>;
  return (
    Array.isArray(dataset.doses) &&
    Array.isArray(dataset.axes) &&
    typeof dataset.doseConfig === "object" &&
    dataset.doseConfig !== null &&
    typeof dataset.strains === "object" &&
    dataset.strains !== null
  );
}

export async function POST(request: Request) {
  // Only allow writes in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Writes disabled in production" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    // Validate the dataset structure
    if (!isValidDataset(body)) {
      return NextResponse.json(
        { error: "Invalid request body: expected EditorDataset with doses, axes, doseConfig, and strains" },
        { status: 400 }
      );
    }

    // Write to data/strains.json
    await fs.writeFile(DATA_FILE, JSON.stringify(body, null, 2), "utf8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save strains:", error);
    return NextResponse.json(
      { error: "Failed to save strains" },
      { status: 500 }
    );
  }
}

