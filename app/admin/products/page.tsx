// app/admin/products/page.tsx
// Server page for products admin - DEV ONLY

import { notFound } from "next/navigation";
import { getAllProducts } from "@/lib/data/productData";
import { AdminNav } from "../AdminNav";
import ProductsAdminClient from "./ProductsAdminClient";

export default async function ProductsAdminPage() {
  // Dev-only guard
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const products = await getAllProducts();

  return (
    <div className="min-h-screen bg-[#f6eddc]">
      <AdminNav />
      <ProductsAdminClient initialProducts={products} />
    </div>
  );
}

