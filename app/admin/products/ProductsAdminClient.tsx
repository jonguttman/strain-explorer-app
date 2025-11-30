"use client";

import { useState, Fragment, useRef, useEffect } from "react";
import type { Product, ProductStatus, DoseKey } from "@/lib/types";
import type { StrainOption } from "./page";

type ProductsAdminClientProps = {
  initialProducts: Product[];
  strainOptions: StrainOption[];
};

const DOSE_KEYS: DoseKey[] = ["micro", "mini", "macro", "museum", "mega", "hero"];
const STATUS_OPTIONS: ProductStatus[] = ["active", "inactive"];

export function ProductsAdminClient({ initialProducts, strainOptions }: ProductsAdminClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [strainDropdownOpen, setStrainDropdownOpen] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const strainDropdownRef = useRef<HTMLDivElement | null>(null);
  
  // Helper to get strain name by id
  const getStrainName = (id: string) => strainOptions.find((s) => s.id === id)?.name ?? id;
  
  // Close strain dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (strainDropdownOpen && strainDropdownRef.current && !strainDropdownRef.current.contains(event.target as Node)) {
        setStrainDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [strainDropdownOpen]);

  const filteredProducts =
    statusFilter === "all"
      ? products
      : products.filter((p) => p.status === statusFilter);

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `psilly-product-${Date.now()}`,
      name: "",
      brand: "The Original Psilly",
      strainIds: [],
      status: "active",
    };
    setProducts([...products, newProduct]);
    setExpandedId(newProduct.id); // Auto-expand new product
    setSuccess(null);
    setError(null);
  };
  
  const handleToggleStrain = (productId: string, strainId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const currentStrainIds = p.strainIds ?? [];
        const newStrainIds = currentStrainIds.includes(strainId)
          ? currentStrainIds.filter((id) => id !== strainId)
          : [...currentStrainIds, strainId];
        return { ...p, strainIds: newStrainIds };
      })
    );
    setSuccess(null);
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
    if (expandedId === id) setExpandedId(null);
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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleImageUpload = async (productId: string, file: File) => {
    setUploadingId(productId);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId);

      const res = await fetch("/api/admin/product-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      
      // Update the product's imageUrl in local state
      handleUpdateProduct(productId, "imageUrl", data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingId(null);
      // Clear the file input so the same file can be selected again if needed
      if (fileInputRefs.current[productId]) {
        fileInputRefs.current[productId]!.value = "";
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">
            Manage product catalog entries that appear on the Strain Explorer details screen.
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Add Product
        </button>
      </div>

      {/* Filter row */}
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
      <div className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full table-fixed divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-[140px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                ID
              </th>
              <th className="w-[180px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Name
              </th>
              <th className="w-[130px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Brand
              </th>
              <th className="w-[140px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Strains
              </th>
              <th className="w-[90px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Status
              </th>
              <th className="w-[70px] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                Pick
              </th>
              <th className="w-[50px] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                More
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No products found. Click &quot;+ Add Product&quot; to create one.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isExpanded = expandedId === product.id;
                return (
                  <Fragment key={product.id}>
                    {/* Summary row */}
                    <tr className={`hover:bg-slate-50 ${isExpanded ? "bg-slate-50" : ""}`}>
                      <td className="px-3 py-2">
                        <code className="block truncate text-xs text-slate-600" title={product.id}>
                          {product.id}
                        </code>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) =>
                            handleUpdateProduct(product.id, "name", e.target.value)
                          }
                          placeholder="Product name"
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={product.brand ?? ""}
                          onChange={(e) =>
                            handleUpdateProduct(product.id, "brand", e.target.value)
                          }
                          placeholder="Brand"
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="relative" ref={strainDropdownOpen === product.id ? strainDropdownRef : null}>
                          <button
                            type="button"
                            onClick={() => setStrainDropdownOpen(strainDropdownOpen === product.id ? null : product.id)}
                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-left text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                          >
                            {(product.strainIds?.length ?? 0) === 0 ? (
                              <span className="text-slate-500 italic">All strains</span>
                            ) : (
                              <span className="truncate block">
                                {product.strainIds.map(getStrainName).join(", ")}
                              </span>
                            )}
                          </button>
                          {strainDropdownOpen === product.id && (
                            <div className="absolute left-0 top-full z-20 mt-1 w-52 rounded-md border border-slate-200 bg-white shadow-lg">
                              <div className="max-h-72 overflow-y-auto p-1">
                                {strainOptions.map((opt) => (
                                  <label
                                    key={opt.id}
                                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-900 hover:bg-slate-50"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={product.strainIds?.includes(opt.id) ?? false}
                                      onChange={() => handleToggleStrain(product.id, opt.id)}
                                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                                    />
                                    <span className="font-medium">{opt.name}</span>
                                  </label>
                                ))}
                              </div>
                              <div className="border-t border-slate-100 p-1">
                                <button
                                  type="button"
                                  onClick={() => setStrainDropdownOpen(null)}
                                  className="w-full rounded px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={product.status}
                          onChange={(e) =>
                            handleUpdateProduct(
                              product.id,
                              "status",
                              e.target.value as ProductStatus
                            )
                          }
                          className={`w-full rounded border px-2 py-1 text-xs focus:border-slate-500 focus:outline-none ${
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
                      <td className="px-3 py-2 text-center">
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
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggleExpand(product.id)}
                          aria-expanded={isExpanded}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <svg
                            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>

                    {/* Details row (expandable) */}
                    {isExpanded && (
                      <tr className="bg-slate-50">
                        <td colSpan={7} className="px-3 pb-4 pt-0">
                          <div className="mt-2 rounded-lg border border-slate-200 bg-white p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              {/* Left column */}
                              <div className="space-y-3">
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Dose Level
                                  </label>
                                  <select
                                    value={product.doseKey ?? ""}
                                    onChange={(e) =>
                                      handleUpdateProduct(
                                        product.id,
                                        "doseKey",
                                        e.target.value || undefined
                                      )
                                    }
                                    className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
                                  >
                                    <option value="">— Any dose —</option>
                                    {DOSE_KEYS.map((dk) => (
                                      <option key={dk} value={dk}>
                                        {dk}
                                      </option>
                                    ))}
                                  </select>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Only show this product for the selected dose level.
                                  </p>
                                </div>

                                <div>
                                  <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Dosing Direction
                                  </label>
                                  <input
                                    type="text"
                                    value={product.dosingDirection ?? ""}
                                    onChange={(e) =>
                                      handleUpdateProduct(
                                        product.id,
                                        "dosingDirection",
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g. Take two Mighty Caps"
                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
                                  />
                                  <p className="mt-1 text-xs text-slate-500">
                                    Shown in kiosk when product appears. Leave empty for default.
                                  </p>
                                </div>

                                <div>
                                  <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Mushroom per Unit
                                  </label>
                                  <input
                                    type="text"
                                    value={product.mushroomAmountPerUnit ?? ""}
                                    onChange={(e) =>
                                      handleUpdateProduct(
                                        product.id,
                                        "mushroomAmountPerUnit",
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g. 200 mg per cap"
                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Product Image
                                  </label>
                                  <div className="flex items-start gap-3">
                                    {/* Thumbnail preview */}
                                    <div className="flex-shrink-0">
                                      {product.imageUrl ? (
                                        <div className="relative">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={product.imageUrl}
                                            alt={product.name || "Product"}
                                            className="h-16 w-16 rounded border border-slate-200 object-cover"
                                            onError={(e) => {
                                              e.currentTarget.style.display = "none";
                                              e.currentTarget.nextElementSibling?.classList.remove("hidden");
                                            }}
                                          />
                                          <div className="hidden h-16 w-16 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                                            Error
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50">
                                          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>

                                    {/* Upload controls */}
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <input
                                          ref={(el) => { fileInputRefs.current[product.id] = el; }}
                                          type="file"
                                          accept="image/png,image/jpeg"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleImageUpload(product.id, file);
                                          }}
                                          className="hidden"
                                          id={`image-upload-${product.id}`}
                                        />
                                        <label
                                          htmlFor={`image-upload-${product.id}`}
                                          className={`cursor-pointer rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 ${
                                            uploadingId === product.id ? "pointer-events-none opacity-50" : ""
                                          }`}
                                        >
                                          {uploadingId === product.id ? "Uploading…" : "Upload Image"}
                                        </label>
                                        {uploadError && uploadingId === null && expandedId === product.id && (
                                          <span className="text-xs text-red-600">{uploadError}</span>
                                        )}
                                      </div>
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
                                        placeholder="/products/my-product.png"
                                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Short Description
                                  </label>
                                  <textarea
                                    value={product.shortDescription ?? ""}
                                    onChange={(e) =>
                                      handleUpdateProduct(
                                        product.id,
                                        "shortDescription",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Brief product description..."
                                    rows={2}
                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
                                  />
                                </div>
                              </div>

                              {/* Right column */}
                              <div className="space-y-3">
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-slate-600">
                                    External URL
                                  </label>
                                  <input
                                    type="text"
                                    value={product.externalUrl ?? ""}
                                    onChange={(e) =>
                                      handleUpdateProduct(
                                        product.id,
                                        "externalUrl",
                                        e.target.value
                                      )
                                    }
                                    placeholder="https://..."
                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Notes
                                  </label>
                                  <textarea
                                    value={product.notes ?? ""}
                                    onChange={(e) =>
                                      handleUpdateProduct(
                                        product.id,
                                        "notes",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Internal notes..."
                                    rows={2}
                                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
                                  />
                                </div>

                                {/* Delete button */}
                                <div className="pt-2">
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                                  >
                                    Delete Product
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
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
