type ModeSwitchProps = {
  mode: "visual" | "details";
  onChange: (mode: "visual" | "details") => void;
};

export function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  const isVisual = mode === "visual";

  return (
    <div className="inline-flex rounded-full border border-[#d7c6a8] bg-[#fbf4e3] p-1 shadow-inner">
      <button
        className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
          isVisual ? "bg-[#3f301f] text-[#f6eddc] shadow" : "text-[#6c5a3f]"
        }`}
        onClick={() => onChange("visual")}
      >
        Visual
      </button>
      <button
        className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
          !isVisual ? "bg-[#3f301f] text-[#f6eddc] shadow" : "text-[#6c5a3f]"
        }`}
        onClick={() => onChange("details")}
      >
        Details
      </button>
    </div>
  );
}

