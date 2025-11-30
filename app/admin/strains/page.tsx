import { AdminNav } from "../AdminNav";
import { getEditableDataset } from "@/data/strainData";
import StrainAdminClient from "./StrainAdminClient";

export default function StrainsAdminPage() {
  const initialData = getEditableDataset();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav active="strains" />
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Strain Admin</h1>
        <StrainAdminClient initialData={initialData} />
      </div>
    </div>
  );
}

