"use client";

import { useState } from "react";
import type { Product, ProductStatus, DoseKey } from "@/lib/types";

type ProductsAdminClientProps = {
  initialProducts: Product[];
};

const DOSE_KEYS: DoseKey[] = ["micro", "mini", "macro", "museum", "mega", "hero"];
const STATUS_OPTIONS: ProductStatus[] = ["active", "inactive"];

export function ProductsAdminClient({ initialProducts }: ProductsAdminClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");

  const filteredProducts =
    statusFilter === "all"
      ? products
      : products.filter((p) => p.status === statusFilter);

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `psilly-product-${Date.now()}`,
      name: "",
      brand: "The Original Psilly",
      status: "active",
    };
    setProducts([...products, newProduct]);
    setSuccess(null);
    setError(null);
  };

  const handleUpdateProduct = (
    id: string,
    field: keyof Product,
    value: string | boolean | undefined
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, [field]: value === "" ? undefined : value }
          : p
      )
    );
    setSuccess(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSuccess(null);
    setError(null);
  };

  const handleSave = async () => {
    // Validate before saving
    for (const product of products) {
      if (!product.id || !product.name) {
        setError("All products must have an ID and Name before saving.");
        return;
      }
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Save failed: ${res.status}`);
      }

      setSuccess("Products saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save products");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | ProductStatus)
            }
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          onClick={handleAddProduct}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Add Product
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Products table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Brand
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Strain
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Dose
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                House Pick
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Image URL
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No products found. Click &quot;+ Add Product&quot; to create one.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <code className="text-xs text-slate-600">{product.id}</code>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) =>
                        handleUpdateProduct(product.id, "name", e.target.value)
                      }
                      placeholder="Product name"
                      className="w-full min-w-[180px] rounded border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={product.brand ?? ""}
                      onChange={(e) =>
                        handleUpdateProduct(product.id, "brand", e.target.value)
                      }
                      placeholder="Brand"
                      className="w-full min-w-[140px] rounded border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={product.strainId ?? ""}
                      onChange={(e) =>
                        handleUpdateProduct(
                          product.id,
                          "strainId",
                          e.target.value
                        )
                      }
                      placeholder="e.g. golden-teacher"
                      className="w-full min-w-[120px] rounded border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={product.doseKey ?? ""}
                      onChange={(e) =>
                        handleUpdateProduct(
                          product.id,
                          "doseKey",
                          e.target.value || undefined
                        )
                      }
                      className="w-full min-w-[90px] rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                    >
                      <option value="">—</option>
                      {DOSE_KEYS.map((dk) => (
                        <option key={dk} value={dk}>
                          {dk}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={product.status}
                      onChange={(e) =>
                        handleUpdateProduct(
                          product.id,
                          "status",
                          e.target.value as ProductStatus
                        )
                      }
                      className={`w-full min-w-[90px] rounded border px-2 py-1 text-sm focus:border-slate-500 focus:outline-none ${
                        product.status === "active"
                          ? "border-green-300 bg-green-50 text-green-700"
                          : "border-slate-300 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={product.isHousePick ?? false}
                      onChange={(e) =>
                        handleUpdateProduct(
                          product.id,
                          "isHousePick",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={product.imageUrl ?? ""}
                      onChange={(e) =>
                        handleUpdateProduct(
                          product.id,
                          "imageUrl",
                          e.target.value
                        )
                      }
                      placeholder="/products/..."
                      className="w-full min-w-[160px] rounded border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

