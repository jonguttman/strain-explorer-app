// lib/data/productData.ts
// Product data repository - reads and filters products from products.json

import { promises as fs } from "fs";
import path from "path";
import type { Product, ProductDataset, DoseKey } from "@/lib/types";

const PRODUCTS_FILE_PATH = path.join(process.cwd(), "data", "products.json");

/**
 * Read and parse the products.json file
 */
async function readProductsFile(): Promise<ProductDataset> {
  try {
    const fileContents = await fs.readFile(PRODUCTS_FILE_PATH, "utf8");
    const data = JSON.parse(fileContents) as ProductDataset;
    
    // Basic validation
    if (!data.products || !Array.isArray(data.products)) {
      console.warn("Invalid products.json structure, returning empty array");
      return { products: [] };
    }
    
    return data;
  } catch (error) {
    console.error("Error reading products.json:", error);
    return { products: [] };
  }
}

/**
 * Get all products (no filtering)
 */
export async function getAllProducts(): Promise<Product[]> {
  const dataset = await readProductsFile();
  return dataset.products;
}

/**
 * Get only live products
 */
export async function getLiveProducts(): Promise<Product[]> {
  const dataset = await readProductsFile();
  return dataset.products.filter((p) => p.status === "live");
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const dataset = await readProductsFile();
  return dataset.products.find((p) => p.id === id) ?? null;
}

/**
 * Get products filtered by strain and dose level
 * With optional access key filtering for partner-specific products
 */
export async function getProductsForStrainAndDose(
  strainId: string,
  doseKey: DoseKey,
  options?: {
    accessKeyId?: string | null;
  }
): Promise<Product[]> {
  const dataset = await readProductsFile();
  const accessKeyId = options?.accessKeyId;

  let filtered = dataset.products.filter((product) => {
    // Only include live products
    if (product.status !== "live") {
      return false;
    }

    // Filter by strain if strainId is set on the product
    if (product.strainId && product.strainId !== strainId) {
      return false;
    }

    // Filter by dose level if bestDoseLevels is set
    if (
      product.bestDoseLevels &&
      product.bestDoseLevels.length > 0 &&
      !product.bestDoseLevels.includes(doseKey)
    ) {
      return false;
    }

    // Partner filtering: if product has partnerIds, only show to those partners
    if (product.partnerIds && product.partnerIds.length > 0) {
      if (!accessKeyId) {
        // No access key provided, hide partner-specific products
        return false;
      }
      // Only include if the accessKeyId matches one of the partnerIds
      if (!product.partnerIds.includes(accessKeyId)) {
        return false;
      }
    }

    return true;
  });

  // Sort: featured first, then housePick, then by name
  filtered.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    if (a.housePick && !b.housePick) return -1;
    if (!a.housePick && b.housePick) return 1;
    return (a.name || "").localeCompare(b.name || "");
  });

  return filtered;
}

/**
 * Write products dataset back to file (for admin use)
 */
export async function writeProductsFile(dataset: ProductDataset): Promise<void> {
  const json = JSON.stringify(dataset, null, 2);
  await fs.writeFile(PRODUCTS_FILE_PATH, json, "utf8");
}

