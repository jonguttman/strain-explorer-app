import { promises as fs } from "fs";
import path from "path";
import { AdminHeader } from "@/app/admin/AdminHeader";
import { ProductsAdminClient } from "./ProductsAdminClient";
import type { ProductDataset, Product } from "@/lib/types";
import { getStrains } from "@/data/strainData";

export type StrainOption = { id: string; name: string };

async function loadProducts(): Promise<Product[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "products.json");
    const raw = await fs.readFile(filePath, "utf8");
    const parsed: ProductDataset = JSON.parse(raw);
    return parsed.products ?? [];
  } catch {
    return [];
  }
}

export default async function ProductsAdminPage() {
  const products = await loadProducts();
  
  // Get strain options from the canonical strain dataset
  const strains = getStrains();
  const strainOptions: StrainOption[] = strains.map((s) => ({
    id: s.id,
    name: s.name,
  }));

  return (
    <main className="min-h-screen bg-[var(--shell-bg)] text-[var(--ink-main)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4">
        <AdminHeader />
        <ProductsAdminClient 
          initialProducts={products} 
          strainOptions={strainOptions}
        />
      </div>
    </main>
  );
}

