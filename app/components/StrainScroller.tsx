import type { Strain } from "@/lib/types";

type StrainScrollerProps = {
  strains: Strain[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function StrainScroller({
  strains,
  selectedId,
  onSelect,
}: StrainScrollerProps) {
  return (
    <div className="hidden sm:block w-full border-b border-[var(--card-border)] bg-[var(--shell-bg)]">
      {/* Desktop: centered underline tabs */}
      <div className="mx-auto max-w-5xl flex flex-wrap justify-center items-center gap-1 px-4 sm:px-8 pt-1 pb-0">
        {strains.map((strain) => {
          const isActive = strain.id === selectedId;
          return (
            <button
              key={strain.id}
              onClick={() => onSelect(strain.id)}
              className={`whitespace-nowrap px-3 py-2 text-[14px] transition border-b-2 ${
                isActive
                  ? "font-semibold text-[var(--accent)] border-[var(--accent)]"
                  : "text-[var(--ink-soft)] border-transparent hover:text-[var(--ink-main)] hover:border-[var(--card-border)]"
              }`}
            >
              {strain.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
