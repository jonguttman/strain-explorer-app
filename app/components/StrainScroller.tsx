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
    <div className="hidden sm:block w-full bg-transparent pt-3 pb-2">
      {/* Desktop: dark capsule pill buttons - visually aligned with radar panel */}
      <div className="mx-auto max-w-xl flex justify-center items-center gap-2 px-4">
        {strains.map((strain) => {
          const isActive = strain.id === selectedId;
          return (
            <button
              key={strain.id}
              onClick={() => onSelect(strain.id)}
              className={`whitespace-nowrap px-3 py-1.5 text-[12px] sm:text-[13px] rounded-full transition-all duration-200 font-medium ${
                isActive
                  ? "text-[#1a1612] shadow-lg"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
              style={isActive ? {
                background: "linear-gradient(180deg, #f3b34c 0%, #d4913f 100%)",
                boxShadow: "0 4px 12px rgba(243, 179, 76, 0.35)",
              } : {
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              {strain.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
