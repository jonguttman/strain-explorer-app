import { promises as fs } from "fs";
import path from "path";
import { AdminNav } from "@/app/admin/AdminNav";
import { ProductsAdminClient } from "./ProductsAdminClient";
import type { ProductDataset, Product } from "@/lib/types";

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

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <AdminNav active="products" title="Products Admin" />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <main className="mx-auto max-w-7xl px-6 py-6">
          <ProductsAdminClient initialProducts={products} />
        </main>
      </div>
    </div>
  );
}

