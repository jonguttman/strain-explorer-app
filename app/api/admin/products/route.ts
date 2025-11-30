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
    ["active", "inactive"].includes(product.status) &&
    Array.isArray(product.strainIds)
  );
}

// Normalize product to ensure strainIds exists (migrate old strainId if present)
function normalizeProduct(product: Record<string, unknown>): Record<string, unknown> {
  // If strainIds doesn't exist but strainId does, migrate it
  if (!Array.isArray(product.strainIds)) {
    if (typeof product.strainId === "string" && product.strainId) {
      product.strainIds = [product.strainId];
    } else {
      product.strainIds = [];
    }
  }
  // Remove old strainId field
  delete product.strainId;
  return product;
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

    // Normalize and validate each product in the array
    const normalizedProducts: Product[] = [];
    for (let i = 0; i < body.products.length; i++) {
      const normalized = normalizeProduct(body.products[i] as Record<string, unknown>);
      if (!isValidProduct(normalized)) {
        return NextResponse.json(
          { error: `Invalid product at index ${i}: requires id, name, status, and strainIds` },
          { status: 400 }
        );
      }
      normalizedProducts.push(normalized as Product);
    }

    const dataset: ProductDataset = { products: normalizedProducts };

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

