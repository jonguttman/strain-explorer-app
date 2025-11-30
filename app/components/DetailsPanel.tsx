import Link from "next/link";
import type { DoseContent, DoseSnapshot, StrainMeta } from "@/lib/types";

type DetailsPanelProps = {
  content: DoseContent;
  strainName: string;
  doseLabel: string;
  grams: number | null;
  meta?: StrainMeta | null;
  snapshot?: DoseSnapshot | null;
  accentHex: string;
  testimonials?: string[];
  accessKeyId?: string;
};

export function DetailsPanel({
  content,
  strainName,
  doseLabel,
  grams,
  meta,
  snapshot,
  accentHex,
  testimonials,
  accessKeyId,
}: DetailsPanelProps) {
  const gramDisplay =
    grams != null ? `${grams.toFixed(grams % 1 === 0 ? 0 : 1)} g` : null;
  const tags = meta?.tags ?? [];
  const tagSubtitle =
    tags.length > 0 ? tags.slice(0, 3).filter(Boolean).join(" · ") : "";
  const bestFor = snapshot?.bestFor?.filter((item) => item?.trim()) ?? [];
  const idealSettings = snapshot?.setting?.filter((item) => item?.trim()) ?? [];
  const detailsText = content.details?.trim();
  const blurb = content.blurb?.trim();
  const products = content.products ?? [];
  const testimonialList =
    testimonials?.map((quote: string) => quote?.trim()).filter(Boolean) ?? [];

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto pr-2">
      <div className="space-y-4 text-sm leading-relaxed text-[#4c3926] md:pr-1">
        <section className="mb-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold tracking-wide text-[#3f301f]">
              {strainName}
            </h2>
            <span className="inline-flex items-center rounded-full border border-[#d3c3a2] bg-[#fdfbf7] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#3f301f]">
              {doseLabel}
              {gramDisplay ? ` · ${gramDisplay}` : ""}
            </span>
          </div>
          {tagSubtitle ? (
            <p className="mt-1 text-xs text-[#6b5841]">{tagSubtitle}</p>
          ) : null}
          {blurb ? (
            <p className="mt-2 text-sm text-[#3c291b]">{blurb}</p>
          ) : null}
        </section>

        {snapshot ? (
          <section className="mb-4 rounded-2xl border border-[#e2d3b5] bg-[#fff9f0] p-3 shadow-sm md:p-4">
            {tags.length ? (
              <div className="mb-2 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide"
                    style={{
                      borderColor: accentHex,
                      color: accentHex,
                      backgroundColor: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-3 md:text-sm">
              <SnapshotFact label="Onset" value={snapshot.onset} />
              <SnapshotFact label="Duration" value={snapshot.duration} />
              <SnapshotFact label="Intensity" value={snapshot.intensity} />
            </div>
          </section>
        ) : null}

        {snapshot && (bestFor.length || idealSettings.length) ? (
          <section className="mb-4 grid gap-4 md:grid-cols-2">
            {bestFor.length ? (
              <div>
                <h3
                  className="mb-1 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: accentHex }}
                >
                  Best For
                </h3>
                <ul className="space-y-1 text-sm text-[#3c291b]">
                  {bestFor.map((item, idx) => (
                    <li key={`${item}-${idx}`} className="flex gap-2">
                      <span
                        className="mt-1 h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: accentHex }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {idealSettings.length ? (
              <div>
                <h3
                  className="mb-1 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: accentHex }}
                >
                  Ideal Setting
                </h3>
                <ul className="space-y-1 text-sm text-[#3c291b]">
                  {idealSettings.map((item, idx) => (
                    <li key={`${item}-${idx}`} className="flex gap-2">
                      <span
                        className="mt-1 h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: accentHex }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        {detailsText ? (
          <section className="mb-4">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-900">
              WHAT IT FEELS LIKE
            </h4>
            <p className="text-sm leading-relaxed text-[#2d1d12] md:max-w-prose">
              {detailsText}
            </p>
          </section>
        ) : null}

        {products.length ? (
          <section className="mb-4">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-900">
              SUGGESTED PRODUCTS
            </h4>
            <div className="flex flex-wrap gap-2">
              {products.map((product) => (
                <span
                  key={product}
                  className="rounded-full border px-3 py-1 text-xs font-medium text-[#2d1d12]"
                  style={{ borderColor: accentHex }}
                >
                  {product}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {testimonialList.length ? (
          <section className="mb-2">
            <h3
              className="mb-2 text-xs font-semibold uppercase tracking-wide"
              style={{ color: accentHex }}
            >
              What People Say
            </h3>
            <div className="space-y-3">
              {testimonialList.slice(0, 2).map((quote, idx) => (
                <figure
                  key={`${quote}-${idx}`}
                  className="rounded-2xl border border-[#e2d3b5] bg-white/80 p-3 text-sm text-[#3c291b] shadow-sm"
                >
                  <span className="block text-lg leading-none text-[#d3c3a2]">
                    &ldquo;
                  </span>
                  <blockquote className="-mt-3 text-sm leading-relaxed">
                    {quote}
                  </blockquote>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {/* Resource links */}
        <section className="mt-4 pt-4 border-t border-[#e2d3b5]/50">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <Link
              href={accessKeyId ? `/dose-levels?key=${accessKeyId}` : "/dose-levels"}
              className="text-[#6b5841] underline decoration-[#d3c3a2] underline-offset-2 hover:text-[#3f301f] hover:decoration-[#3f301f] transition"
            >
              Learn about dose levels
            </Link>
            <Link
              href={accessKeyId ? `/partner-training?key=${accessKeyId}` : "/partner-training"}
              className="text-[#6b5841] underline decoration-[#d3c3a2] underline-offset-2 hover:text-[#3f301f] hover:decoration-[#3f301f] transition"
            >
              Partner training
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function SnapshotFact({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[0.65rem] uppercase tracking-wide text-[#8b7a5c]">
        {label}
      </div>
      <div className="text-sm font-medium text-[#2d1d12]">
        {value?.trim() || "—"}
      </div>
    </div>
  );
}

