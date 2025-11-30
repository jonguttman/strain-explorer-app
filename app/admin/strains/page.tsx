import { AdminNav } from "../AdminNav";
import { getEditableDataset } from "@/data/strainData";
import { getAllProducts } from "@/lib/productData";
import StrainAdminClient from "./StrainAdminClient";

export default function StrainsAdminPage() {
  const initialData = getEditableDataset();
  const allProducts = getAllProducts();

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <AdminNav active="strains" title="Strain Admin" />
      <div className="flex-1 min-h-0">
        <StrainAdminClient initialData={initialData} allProducts={allProducts} />
      </div>
    </div>
  );
}
