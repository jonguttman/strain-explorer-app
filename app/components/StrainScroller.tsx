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
    <div className="w-full border-y border-[#d3c3a2] bg-[#fdfbf7] py-3">
      {/* Desktop: horizontal buttons */}
      <div className="hidden sm:flex mx-auto max-w-4xl flex-wrap items-center justify-center gap-2 px-4">
        {strains.map((strain) => {
          const isActive = strain.id === selectedId;
          return (
            <button
              key={strain.id}
              onClick={() => onSelect(strain.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm border transition md:text-base ${
                isActive
                  ? "bg-[#3f301f] text-white border-[#3f301f] shadow-sm"
                  : "bg-white text-[#3f301f] border-[#d3c3a2] hover:bg-[#f5ebe0]"
              }`}
            >
              {strain.name}
            </button>
          );
        })}
      </div>

      {/* Mobile: elegant dropdown */}
      <div className="sm:hidden mx-auto max-w-md px-4">
        <select
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full rounded-full border border-[#d3c3a2] bg-white px-4 py-2 text-sm font-medium text-[#3f301f] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3f301f] focus:ring-offset-2 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%233f301f%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
        >
          {strains.map((strain) => (
            <option key={strain.id} value={strain.id}>
              {strain.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
