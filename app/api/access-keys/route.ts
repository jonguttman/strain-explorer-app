import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import rawAccessKeys from "@/data/accessKeys.json";
import type { AccessKeyDataset, AccessKey } from "@/lib/types";

export async function GET() {
  const dataset = rawAccessKeys as AccessKeyDataset;
  
  return NextResponse.json({
    keys: dataset.keys,
  });
}

function isValidAccessKey(obj: unknown): obj is AccessKey {
  if (typeof obj !== "object" || obj === null) return false;
  const key = obj as Record<string, unknown>;
  return (
    typeof key.id === "string" &&
    typeof key.label === "string" &&
    typeof key.type === "string" &&
    ["master", "partner", "staff", "test"].includes(key.type) &&
    typeof key.isActive === "boolean" &&
    typeof key.createdAt === "string" &&
    typeof key.updatedAt === "string" &&
    (key.notes === undefined || typeof key.notes === "string")
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
    if (!body || typeof body !== "object" || !Array.isArray(body.keys)) {
      return NextResponse.json(
        { error: "Invalid request body: expected { keys: AccessKey[] }" },
        { status: 400 }
      );
    }

    // Validate each key in the array
    for (let i = 0; i < body.keys.length; i++) {
      if (!isValidAccessKey(body.keys[i])) {
        return NextResponse.json(
          { error: `Invalid access key at index ${i}` },
          { status: 400 }
        );
      }
    }

    const dataset: AccessKeyDataset = { keys: body.keys };

    // Write to data/accessKeys.json
    const filePath = path.join(process.cwd(), "data", "accessKeys.json");
    await fs.writeFile(filePath, JSON.stringify(dataset, null, 2), "utf8");

    return NextResponse.json(dataset);
  } catch (error) {
    console.error("Failed to save access keys:", error);
    return NextResponse.json(
      { error: "Failed to save access keys" },
      { status: 500 }
    );
  }
}
