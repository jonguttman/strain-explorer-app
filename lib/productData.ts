import type { Product, ProductDataset, DoseKey } from "./types";
import rawProducts from "@/data/products.json";

const dataset = rawProducts as ProductDataset;

/**
 * Returns active products matching a given strain, optionally filtered by dose.
 * - Filters by status === "active"
 * - Matches strainId (case-sensitive)
 * - If doseKey is provided, prefers products with matching doseKey
 * - Sorts: isHousePick first, then by match weights, then by name
 * - Returns at most 4 products
 */
export function getProductsForStrainAndDose(
  strainId: string,
  doseKey?: DoseKey | null
): Product[] {
  // Start with active products that match the strainId
  const activeProducts = dataset.products.filter(
    (p) => p.status === "active" && p.strainId === strainId
  );

  if (activeProducts.length === 0) {
    return [];
  }

  // If doseKey is provided, check if we have any products that match both strain and dose
  let filtered = activeProducts;
  if (doseKey) {
    const doseMatches = activeProducts.filter((p) => p.doseKey === doseKey);
    // If we have dose matches, use those; otherwise fall back to all strain matches
    if (doseMatches.length > 0) {
      filtered = doseMatches;
    }
  }

  // Sort: isHousePick first, then by weights (higher is better), then by name
  const sorted = filtered.sort((a, b) => {
    // House picks first
    if (a.isHousePick && !b.isHousePick) return -1;
    if (!a.isHousePick && b.isHousePick) return 1;

    // Higher strainMatchWeight first
    const aStrainWeight = a.strainMatchWeight ?? 0;
    const bStrainWeight = b.strainMatchWeight ?? 0;
    if (aStrainWeight !== bStrainWeight) return bStrainWeight - aStrainWeight;

    // Higher doseMatchWeight first
    const aDoseWeight = a.doseMatchWeight ?? 0;
    const bDoseWeight = b.doseMatchWeight ?? 0;
    if (aDoseWeight !== bDoseWeight) return bDoseWeight - aDoseWeight;

    // Alphabetical by name
    return a.name.localeCompare(b.name);
  });

  // Return at most 4 products
  return sorted.slice(0, 4);
}

/**
 * Returns all products from the dataset (read-only).
 */
export function getAllProducts(): Product[] {
  return dataset.products;
}

/**
 * Returns a single product by ID, or undefined if not found.
 * Does NOT filter by status - callers can check status themselves.
 */
export function getProductById(id: string): Product | undefined {
  return dataset.products.find((p) => p.id === id);
}

