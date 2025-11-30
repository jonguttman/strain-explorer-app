import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductById } from "@/lib/productData";
import { STRAINS, DEFAULT_DOSE_CONFIG } from "@/app/components/strainConstants";

type ProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  return {
    title: product
      ? `${product.name} – The Original Psilly`
      : "Product – The Original Psilly",
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { id } = await params;
  const { key } = await searchParams;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const backHref = key ? `/?key=${key}` : "/";
  const strain = product.strainId
    ? STRAINS.find((s) => s.id === product.strainId)
    : null;
  const doseConfig = product.doseKey
    ? DEFAULT_DOSE_CONFIG[product.doseKey]
    : null;

  const initials = product.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const strainDoseLabel = [
    strain?.name,
    doseConfig ? `${doseConfig.label} dose` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="min-h-screen bg-[#f6eddc]">
      {/* Header */}
      <header className="border-b border-[#e2d3b5] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link
            href={backHref}
            className="flex items-center gap-2 text-sm text-[#6b5841] transition hover:text-[#3f301f]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Strain Explorer
          </Link>
          {product.status && (
            <span
              className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
                product.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {product.status}
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="overflow-hidden rounded-2xl border border-[#e2d3b5] bg-white shadow-sm">
          {/* Product image */}
          <div className="relative aspect-[4/3] bg-[#f6eddc]">
            {product.imageUrl ? (
              <>
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                {/* Fallback initials behind image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-bold text-[#d3c3a2]">
                    {initials}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-6xl font-bold text-[#d3c3a2]">
                  {initials}
                </span>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="p-6">
            {/* Name and badges */}
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold tracking-tight text-[#2d1d12]">
                  {product.name}
                </h1>
                <p className="mt-1 text-sm text-[#6b5841]">{product.brand}</p>
              </div>
              {product.isHousePick && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  House pick
                </span>
              )}
            </div>

            {/* Strain + dose level info */}
            {strainDoseLabel && (
              <div className="mt-4 flex items-center gap-2">
                {strain && (
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: strain.colorHex }}
                  />
                )}
                <span className="text-sm font-medium text-[#4c3926]">
                  {strainDoseLabel}
                </span>
              </div>
            )}

            {/* Mushroom amount per unit */}
            {product.mushroomAmountPerUnit && (
              <div className="mt-3 rounded-lg bg-[#fdfbf7] px-3 py-2 border border-[#e2d3b5]">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#8b7a5c]">
                  Dose per unit
                </span>
                <p className="text-sm font-medium text-[#3c291b]">
                  {product.mushroomAmountPerUnit}
                </p>
              </div>
            )}

            {/* Description */}
            {product.shortDescription && (
              <p className="mt-4 text-sm leading-relaxed text-[#3c291b]">
                {product.shortDescription}
              </p>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#d3c3a2] bg-[#fdfbf7] px-2.5 py-1 text-xs font-medium text-[#6b5841]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Where to buy section */}
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#3f301f]">
            Where to Buy
          </h2>
          {product.whereToBuy && product.whereToBuy.length > 0 ? (
            <div className="space-y-3">
              {product.whereToBuy.map((location, idx) => (
                <div
                  key={`${location.label}-${idx}`}
                  className="rounded-xl border border-[#e2d3b5] bg-white p-4 shadow-sm"
                >
                  <h3 className="font-medium text-[#2d1d12]">
                    {location.label}
                  </h3>
                  {location.address && (
                    <p className="mt-1 text-sm text-[#6b5841]">
                      {location.address}
                    </p>
                  )}
                  {location.notes && (
                    <p className="mt-2 text-sm italic text-[#8b7a5c]">
                      {location.notes}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3">
                    {location.url && (
                      <a
                        href={location.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#3f301f] px-4 py-2 text-xs font-medium text-[#f6eddc] transition hover:bg-[#2d1d12]"
                      >
                        View store
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                    {location.address && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#d3c3a2] bg-white px-4 py-2 text-xs font-medium text-[#3f301f] transition hover:bg-[#fdfbf7]"
                      >
                        Get directions
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#e2d3b5] bg-white p-4 text-center">
              <p className="text-sm text-[#6b5841]">
                Ask your guide or retailer where to find this product.
              </p>
            </div>
          )}
        </section>

        {/* External link */}
        {product.externalUrl && (
          <div className="mt-6 text-center">
            <a
              href={product.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#6b5841] underline decoration-[#d3c3a2] underline-offset-2 transition hover:text-[#3f301f] hover:decoration-[#3f301f]"
            >
              View product details
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

