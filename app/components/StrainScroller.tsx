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
    <div className="w-full border-y border-[#d3c3a2] bg-[#f2e4cc] py-3">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2 px-4">
        {strains.map((strain) => {
          const isActive = strain.id === selectedId;
          return (
            <button
              key={strain.id}
              onClick={() => onSelect(strain.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm border transition md:text-base ${
                isActive
                  ? "bg-[#3f301f] text-[#f6eddc] border-[#3f301f] shadow-sm"
                  : "bg-[#fbf4e3] text-[#3f301f] border-[#d3c3a2] hover:bg-[#f5ebd6]"
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

