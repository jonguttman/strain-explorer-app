import { AdminHeader } from "../AdminHeader";
import { getEditableDataset } from "@/data/strainData";
import { getAllProducts } from "@/lib/productData";
import StrainAdminClient from "./StrainAdminClient";

export default function StrainsAdminPage() {
  const initialData = getEditableDataset();
  const allProducts = getAllProducts();

  return (
    <main className="min-h-screen bg-[var(--shell-bg)] text-[var(--ink-main)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4">
        <AdminHeader />
        <div className="min-h-0">
          <StrainAdminClient initialData={initialData} allProducts={allProducts} />
        </div>
      </div>
    </main>
  );
}
