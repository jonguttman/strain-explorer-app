"use client";

import { useState, useMemo } from "react";
import type { Product, ProductDataset, DoseKey, ProductForm, ProductStatus } from "@/lib/types";

type Props = {
  initialProducts: Product[];
};

const DOSE_LEVELS: DoseKey[] = ["micro", "mini", "macro", "museum", "mega", "hero"];
const PRODUCT_FORMS: ProductForm[] = ["capsules", "gummies", "tea", "tincture", "chocolate", "honey", "other"];
const PRODUCT_STATUSES: ProductStatus[] = ["draft", "live", "archived"];

// Known strains from the system
const KNOWN_STRAINS = [
  { id: "golden-teacher", name: "Golden Teacher" },
  { id: "penis-envy", name: "Penis Envy" },
  { id: "amazonian", name: "Amazonian" },
  { id: "enigma", name: "Enigma" },
  { id: "cambodian", name: "Cambodian" },
  { id: "full-moon-party", name: "Full Moon Party" },
];

export default function ProductsAdminClient({ initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProductStatus | "all">("all");
  const [filterForm, setFilterForm] = useState<ProductForm | "all">("all");
  const [filterStrain, setFilterStrain] = useState<string>("all");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !p.name.toLowerCase().includes(term) &&
          !p.brand.toLowerCase().includes(term) &&
          !(p.strainName || "").toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (filterForm !== "all" && p.form !== filterForm) return false;
      if (filterStrain !== "all" && p.strainId !== filterStrain) return false;
      return true;
    });
  }, [products, searchTerm, filterStatus, filterForm, filterStrain]);

  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id);
  };

  const handleAddProduct = () => {
    const now = new Date().toISOString();
    const newId = `product-${Date.now()}`;
    const newProduct: Product = {
      id: newId,
      name: "New Product",
      brand: "The Original Psilly",
      form: "capsules",
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    setProducts([...products, newProduct]);
    setSelectedProductId(newId);
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (selectedProductId === id) {
      setSelectedProductId(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaveStatus("saving");
      setSaveMessage("");
      const dataset: ProductDataset = { products };
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataset),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Save failed (${response.status})`);
      }
      setSaveStatus("success");
      setSaveMessage("Products saved successfully!");
      setTimeout(() => {
        setSaveStatus("idle");
        setSaveMessage("");
      }, 2000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
      setSaveMessage(error instanceof Error ? error.message : "Save failed");
    }
  };

  return (
    <div className="flex h-[calc(100vh-72px)] bg-[#f6eddc]">
      {/* Left sidebar: product list */}
      <aside className="w-80 border-r border-[#e2d3b5] bg-[#fdfbf7] p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2d1d12]">Products</h2>
          <button
            onClick={handleAddProduct}
            className="rounded-lg bg-[#4c3926] px-3 py-1.5 text-sm text-[#fdf6ec] hover:bg-[#3c291b]"
          >
            + Add
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#d3c3a2] bg-white px-3 py-2 text-sm text-[#2d1d12] placeholder-[#8b7a5c]"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ProductStatus | "all")}
            className="w-full rounded-lg border border-[#d3c3a2] bg-white px-3 py-2 text-sm text-[#2d1d12]"
          >
            <option value="all">All Statuses</option>
            {PRODUCT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={filterForm}
            onChange={(e) => setFilterForm(e.target.value as ProductForm | "all")}
            className="w-full rounded-lg border border-[#d3c3a2] bg-white px-3 py-2 text-sm text-[#2d1d12]"
          >
            <option value="all">All Forms</option>
            {PRODUCT_FORMS.map((f) => (
              <option key={f} value={f}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={filterStrain}
            onChange={(e) => setFilterStrain(e.target.value)}
            className="w-full rounded-lg border border-[#d3c3a2] bg-white px-3 py-2 text-sm text-[#2d1d12]"
          >
            <option value="all">All Strains</option>
            {KNOWN_STRAINS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product list */}
        <div className="flex-1 space-y-2 overflow-y-auto">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelectProduct(product.id)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                selectedProductId === product.id
                  ? "border-[#4c3926] bg-[#4c3926] text-[#fdf6ec]"
                  : "border-[#e2d3b5] bg-white text-[#2d1d12] hover:bg-[#fff9f0]"
              }`}
            >
              <div className="text-sm font-semibold">{product.name}</div>
              <div className="mt-1 text-xs opacity-80">
                {product.brand} · {product.form}
              </div>
              <div className="mt-1 flex gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    product.status === "live"
                      ? "bg-emerald-100 text-emerald-700"
                      : product.status === "draft"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {product.status}
                </span>
                {product.featured && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                    Featured
                  </span>
                )}
                {product.housePick && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    House Pick
                  </span>
                )}
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center text-sm text-[#6b5841]">No products found</div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="w-full rounded-lg bg-[#4c3926] px-4 py-3 text-sm font-medium text-[#fdf6ec] hover:bg-[#3c291b] disabled:opacity-50"
        >
          {saveStatus === "saving" ? "Saving..." : "Save All Changes"}
        </button>
        {saveMessage && (
          <div
            className={`text-center text-xs ${
              saveStatus === "success" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {saveMessage}
          </div>
        )}
      </aside>

      {/* Main content: product editor */}
      <main className="flex-1 overflow-y-auto p-6">
        {!selectedProduct ? (
          <div className="flex h-full items-center justify-center text-[#6b5841]">
            Select a product to edit or add a new one
          </div>
        ) : (
          <ProductEditor
            product={selectedProduct}
            onUpdate={(updates) => handleUpdateProduct(selectedProduct.id, updates)}
            onDelete={() => handleDeleteProduct(selectedProduct.id)}
          />
        )}
      </main>
    </div>
  );
}

// Product editor component
function ProductEditor({
  product,
  onUpdate,
  onDelete,
}: {
  product: Product;
  onUpdate: (updates: Partial<Product>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#2d1d12]">Edit Product</h1>
        <button
          onClick={onDelete}
          className="rounded-lg border border-rose-300 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
        >
          Delete Product
        </button>
      </div>

      <section className="rounded-2xl border border-[#e2d3b5] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#4c3926]">
          Basic Info
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b5841]">
              Product ID (slug)
            </label>
            <input
              type="text"
              value={product.id}
              onChange={(e) => onUpdate({ id: e.target.value })}
              className="w-full rounded-lg border border-[#d3c3a2] bg-[#fdfbf7] px-3 py-2 text-sm text-[#2d1d12]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b5841]">Name</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full rounded-lg border border-[#d3c3a2] px-3 py-2 text-sm text-[#2d1d12]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b5841]">Brand</label>
            <input
              type="text"
              value={product.brand}
              onChange={(e) => onUpdate({ brand: e.target.value })}
              className="w-full rounded-lg border border-[#d3c3a2] px-3 py-2 text-sm text-[#2d1d12]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b5841]">Form</label>
            <select
              value={product.form}
              onChange={(e) => onUpdate({ form: e.target.value as ProductForm })}
              className="w-full rounded-lg border border-[#d3c3a2] px-3 py-2 text-sm text-[#2d1d12]"
            >
              {PRODUCT_FORMS.map((f) => (
                <option key={f} value={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b5841]">Status</label>
            <select
              value={product.status}
              onChange={(e) => onUpdate({ status: e.target.value as ProductStatus })}
              className="w-full rounded-lg border border-[#d3c3a2] px-3 py-2 text-sm text-[#2d1d12]"
            >
              {PRODUCT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b5841]">
              Strain
            </label>
            <select
              value={product.strainId || ""}
              onChange={(e) => {
                const strainId = e.target.value || undefined;
                const strain = KNOWN_STRAINS.find((s) => s.id === strainId);
                onUpdate({
                  strainId,
                  strainName: strain?.name,
                });
              }}
              className="w-full rounded-lg border border-[#d3c3a2] px-3 py-2 text-sm text-[#2d1d12]"
            >
              <option value="">None</option>
              {KNOWN_STRAINS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e2d3b5] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#4c3926]">
          Descriptions & Media
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b5841]">
              Image URL
            </label>
            <input
              type="text"
              value={product.imageUrl || ""}
              onChange={(e) => onUpdate({ imageUrl: e.target.value })}
              placeholder="/products/image.jpg"
              className="w-full rounded-lg border border-[#d3c3a2] px-3 py-2 text-sm text-[#2d1d12]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b5841]">
              Short Description
            </label>
            <input
              type="text"
              value={product.shortDescription || ""}
              onChange={(e) => onUpdate({ shortDescription: e.target.value })}
              placeholder="One-line description"
              className="w-full rounded-lg border border-[#d3c3a2] px-3 py-2 text-sm text-[#2d1d12]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b5841]">
              Long Description
            </label>
            <textarea
              value={product.longDescription || ""}
              onChange={(e) => onUpdate({ longDescription: e.target.value })}
              rows={4}
              placeholder="Detailed description"
              className="w-full rounded-lg border border-[#d3c3a2] px-3 py-2 text-sm text-[#2d1d12]"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e2d3b5] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#4c3926]">
          Dose Levels & Tags
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-[#6b5841]">
              Best Dose Levels
            </label>
            <div className="flex flex-wrap gap-2">
              {DOSE_LEVELS.map((dose) => {
                const selected = product.bestDoseLevels?.includes(dose) || false;
                return (
                  <button
                    key={dose}
                    type="button"
                    onClick={() => {
                      const current = product.bestDoseLevels || [];
                      const updated = selected
                        ? current.filter((d) => d !== dose)
                        : [...current, dose];
                      onUpdate({ bestDoseLevels: updated });
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      selected
                        ? "border-[#4c3926] bg-[#4c3926] text-[#fdf6ec]"
                        : "border-[#d3c3a2] text-[#4c3926] hover:bg-[#fff9f0]"
                    }`}
                  >
                    {dose}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b5841]">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={product.tags?.join(", ") || ""}
              onChange={(e) =>
                onUpdate({
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Focus, Beginner-friendly, Daily Use"
              className="w-full rounded-lg border border-[#d3c3a2] px-3 py-2 text-sm text-[#2d1d12]"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e2d3b5] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#4c3926]">
          Flags & Targeting
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={product.featured || false}
              onChange={(e) => onUpdate({ featured: e.target.checked })}
              className="h-4 w-4 rounded border-[#d3c3a2]"
            />
            <span className="text-sm text-[#2d1d12]">Featured Product</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={product.housePick || false}
              onChange={(e) => onUpdate({ housePick: e.target.checked })}
              className="h-4 w-4 rounded border-[#d3c3a2]"
            />
            <span className="text-sm text-[#2d1d12]">House Pick</span>
          </label>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b5841]">
              Partner IDs (comma-separated, optional)
            </label>
            <input
              type="text"
              value={product.partnerIds?.join(", ") || ""}
              onChange={(e) =>
                onUpdate({
                  partnerIds: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              placeholder="the-other-path, leaf-shop"
              className="w-full rounded-lg border border-[#d3c3a2] px-3 py-2 text-sm text-[#2d1d12]"
            />
            <p className="mt-1 text-xs text-[#6b5841]">
              Leave empty to show to all partners. Add IDs to restrict visibility.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e2d3b5] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#4c3926]">
          Where to Buy
        </h3>
        <WhereToBuyEditor product={product} onUpdate={onUpdate} />
      </section>
    </div>
  );
}

// Where to buy editor
function WhereToBuyEditor({
  product,
  onUpdate,
}: {
  product: Product;
  onUpdate: (updates: Partial<Product>) => void;
}) {
  const venues = product.whereToBuy || [];

  const handleAddVenue = () => {
    onUpdate({
      whereToBuy: [
        ...venues,
        { venueId: "", venueName: "", city: "", url: "" },
      ],
    });
  };

  const handleUpdateVenue = (index: number, updates: Partial<Product["whereToBuy"]>[0]) => {
    const updated = venues.map((v, i) => (i === index ? { ...v, ...updates } : v));
    onUpdate({ whereToBuy: updated });
  };

  const handleRemoveVenue = (index: number) => {
    onUpdate({ whereToBuy: venues.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {venues.map((venue, idx) => (
        <div key={idx} className="rounded-lg border border-[#e2d3b5] bg-[#fff9f0] p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b5841]">
                Venue ID (slug)
              </label>
              <input
                type="text"
                value={venue.venueId}
                onChange={(e) => handleUpdateVenue(idx, { venueId: e.target.value })}
                placeholder="the-other-path"
                className="w-full rounded border border-[#d3c3a2] px-2 py-1 text-sm text-[#2d1d12]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b5841]">
                Venue Name
              </label>
              <input
                type="text"
                value={venue.venueName}
                onChange={(e) => handleUpdateVenue(idx, { venueName: e.target.value })}
                placeholder="The Other Path"
                className="w-full rounded border border-[#d3c3a2] px-2 py-1 text-sm text-[#2d1d12]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b5841]">City</label>
              <input
                type="text"
                value={venue.city || ""}
                onChange={(e) => handleUpdateVenue(idx, { city: e.target.value })}
                placeholder="Sherman Oaks"
                className="w-full rounded border border-[#d3c3a2] px-2 py-1 text-sm text-[#2d1d12]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b5841]">
                URL (store/map)
              </label>
              <input
                type="text"
                value={venue.url || ""}
                onChange={(e) => handleUpdateVenue(idx, { url: e.target.value })}
                placeholder="https://..."
                className="w-full rounded border border-[#d3c3a2] px-2 py-1 text-sm text-[#2d1d12]"
              />
            </div>
          </div>
          <button
            onClick={() => handleRemoveVenue(idx)}
            className="mt-2 text-xs text-rose-600 hover:underline"
          >
            Remove venue
          </button>
        </div>
      ))}
      <button
        onClick={handleAddVenue}
        className="rounded-lg border border-[#d3c3a2] px-4 py-2 text-sm text-[#4c3926] hover:bg-[#fff9f0]"
      >
        + Add Venue
      </button>
    </div>
  );
}

