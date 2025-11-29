// app/api/admin/products/route.ts
// Admin API for managing products - DEV ONLY

import { NextResponse } from "next/server";
import type { ProductDataset } from "@/lib/types";
import {
  getAllProducts,
  writeProductsFile,
} from "@/lib/data/productData";

/**
 * GET /api/admin/products
 * Returns the full products dataset
 */
export async function GET() {
  // Dev-only guard
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 404 }
    );
  }

  try {
    const products = await getAllProducts();
    const dataset: ProductDataset = { products };
    return NextResponse.json(dataset);
  } catch (error) {
    console.error("Error reading products:", error);
    return NextResponse.json(
      { error: "Failed to read products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Saves the full products dataset
 */
export async function POST(request: Request) {
  // Dev-only guard
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const dataset = body as ProductDataset;

    // Basic validation
    if (!dataset.products || !Array.isArray(dataset.products)) {
      return NextResponse.json(
        { error: "Invalid dataset: products must be an array" },
        { status: 400 }
      );
    }

    // Validate each product has required fields
    for (const product of dataset.products) {
      if (!product.id || !product.name || !product.brand || !product.form || !product.status) {
        return NextResponse.json(
          { error: `Invalid product: missing required fields (id, name, brand, form, status)` },
          { status: 400 }
        );
      }
    }

    // Update timestamps
    const now = new Date().toISOString();
    dataset.products = dataset.products.map((product) => ({
      ...product,
      updatedAt: now,
      createdAt: product.createdAt || now,
    }));

    // Write to file
    await writeProductsFile(dataset);

    return NextResponse.json({ success: true, message: "Products saved successfully" });
  } catch (error) {
    console.error("Error saving products:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save products" },
      { status: 500 }
    );
  }
}

