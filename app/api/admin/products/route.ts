import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { ProductDataset, Product } from "@/lib/types";

const DATA_FILE = path.join(process.cwd(), "data", "products.json");

async function loadProducts(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed: ProductDataset = JSON.parse(raw);
    return parsed.products ?? [];
  } catch {
    return [];
  }
}

export async function GET() {
  const products = await loadProducts();
  return NextResponse.json({ products });
}

function isValidProduct(obj: unknown): obj is Product {
  if (typeof obj !== "object" || obj === null) return false;
  const product = obj as Record<string, unknown>;
  return (
    typeof product.id === "string" &&
    product.id.length > 0 &&
    typeof product.name === "string" &&
    product.name.length > 0 &&
    typeof product.status === "string" &&
    ["active", "inactive"].includes(product.status)
  );
}

export async function POST(request: Request) {
  // Only allow writes in development
  if (process.env.NODE_ENV !== "development") {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const body = await request.json();

    // Validate the dataset structure
    if (!body || typeof body !== "object" || !Array.isArray(body.products)) {
      return NextResponse.json(
        { error: "Invalid request body: expected { products: Product[] }" },
        { status: 400 }
      );
    }

    // Validate each product in the array
    for (let i = 0; i < body.products.length; i++) {
      if (!isValidProduct(body.products[i])) {
        return NextResponse.json(
          { error: `Invalid product at index ${i}: requires id, name, and status` },
          { status: 400 }
        );
      }
    }

    const dataset: ProductDataset = { products: body.products };

    // Write to data/products.json
    await fs.writeFile(DATA_FILE, JSON.stringify(dataset, null, 2), "utf8");

    return NextResponse.json(dataset);
  } catch (error) {
    console.error("Failed to save products:", error);
    return NextResponse.json(
      { error: "Failed to save products" },
      { status: 500 }
    );
  }
}

