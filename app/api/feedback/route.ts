import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { FeedbackEntry, FeedbackDataset, AxisExperienceScores, TraitAxisId, DoseKey } from "@/lib/types";
import { getStrainDoseData, getTraitAxes } from "@/data/strainData";

const DATA_FILE = path.join(process.cwd(), "data", "feedback.json");
const VALID_AXES = new Set<TraitAxisId>(["visuals", "euphoria", "introspection", "creativity", "spiritual_depth", "sociability"]);

async function loadFeedback(): Promise<FeedbackDataset> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const data = JSON.parse(raw) as FeedbackDataset;
    if (!data || !Array.isArray(data.entries)) {
      return { entries: [] };
    }
    return data;
  } catch {
    return { entries: [] };
  }
}

async function saveFeedback(dataset: FeedbackDataset): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(dataset, null, 2), "utf8");
}

function generateId(): string {
  return `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isValidFeedbackEntry(obj: unknown): obj is Partial<FeedbackEntry> {
  if (typeof obj !== "object" || obj === null) return false;
  const entry = obj as Record<string, unknown>;
  
  // strainId and doseKey are optional but if present must be strings
  if (entry.strainId !== undefined && typeof entry.strainId !== "string") return false;
  if (entry.doseKey !== undefined && typeof entry.doseKey !== "string") return false;
  if (entry.accessKeyId !== undefined && typeof entry.accessKeyId !== "string") return false;
  if (entry.ctaKey !== undefined && typeof entry.ctaKey !== "string") return false;
  if (entry.overallExperience !== undefined && typeof entry.overallExperience !== "number") return false;
  if (entry.intensityRating !== undefined && typeof entry.intensityRating !== "number") return false;
  if (entry.testimonial !== undefined && typeof entry.testimonial !== "string") return false;
  if (entry.contact !== undefined && typeof entry.contact !== "string") return false;
  if (entry.bestFor !== undefined && !Array.isArray(entry.bestFor)) return false;
  if (entry.setting !== undefined && !Array.isArray(entry.setting)) return false;
  // feltAxes is optional object
  if (entry.feltAxes !== undefined && typeof entry.feltAxes !== "object") return false;
  
  return true;
}

/**
 * Parse and validate feltAxes from request body.
 * Clamps values to 0-10 range.
 */
function parseFeltAxes(raw: unknown): AxisExperienceScores | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  
  const result: AxisExperienceScores = {};
  const input = raw as Record<string, unknown>;
  
  for (const [key, value] of Object.entries(input)) {
    if (!VALID_AXES.has(key as TraitAxisId)) continue;
    if (typeof value !== "number") continue;
    // Clamp to 0-10 range
    result[key as TraitAxisId] = Math.max(0, Math.min(10, Math.round(value)));
  }
  
  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Compute expected axis scores from strain/dose data.
 * Returns scores scaled to 0-10 from the radar's 0-100 scale.
 */
function computeExpectedAxes(strainId: string | undefined, doseKey: string | undefined): AxisExperienceScores | undefined {
  if (!strainId || !doseKey) return undefined;
  
  try {
    const data = getStrainDoseData(strainId, doseKey as DoseKey);
    if (!data) return undefined;
    
    const axes = getTraitAxes();
    const result: AxisExperienceScores = {};
    
    for (const axis of axes) {
      const rawValue = data.doseData.traits.values[axis];
      if (typeof rawValue === "number") {
        // Scale from 0-100 to 0-10
        result[axis] = Math.round(rawValue / 10);
      }
    }
    
    return Object.keys(result).length > 0 ? result : undefined;
  } catch {
    return undefined;
  }
}

export async function GET() {
  const dataset = await loadFeedback();
  return NextResponse.json(dataset);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!isValidFeedbackEntry(body)) {
      return NextResponse.json(
        { error: "Invalid feedback entry" },
        { status: 400 }
      );
    }

    const dataset = await loadFeedback();
    
    // Parse felt axes from request
    const feltAxes = parseFeltAxes(body.feltAxes);
    
    // Compute expected axes from strain/dose data
    const expectedAxes = computeExpectedAxes(body.strainId, body.doseKey);
    
    const newEntry: FeedbackEntry = {
      id: generateId(),
      strainId: body.strainId,
      doseKey: body.doseKey,
      accessKeyId: body.accessKeyId,
      ctaKey: body.ctaKey,
      overallExperience: body.overallExperience,
      intensityRating: body.intensityRating,
      testimonial: body.testimonial,
      bestFor: body.bestFor,
      setting: body.setting,
      contact: body.contact,
      createdAt: new Date().toISOString(),
      // Include axis data if available
      ...(feltAxes && { feltAxes }),
      ...(expectedAxes && { expectedAxes }),
    };

    dataset.entries.push(newEntry);
    await saveFeedback(dataset);

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("Failed to save feedback:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}
