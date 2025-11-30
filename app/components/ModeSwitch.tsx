type ModeSwitchProps = {
  mode: "visual" | "details";
  onChange: (mode: "visual" | "details") => void;
};

export function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  const isVisual = mode === "visual";

  return (
    <div 
      className="inline-flex rounded-full p-1 shadow-inner"
      style={{ background: "var(--card-inner)" }}
    >
      <button
        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
          isVisual ? "shadow-sm" : ""
        }`}
        style={{ 
          background: isVisual ? "white" : "transparent",
          color: isVisual ? "var(--accent)" : "var(--ink-soft)",
        }}
        onClick={() => onChange("visual")}
      >
        Visual
      </button>
      <button
        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
          !isVisual ? "shadow-sm" : ""
        }`}
        style={{ 
          background: !isVisual ? "white" : "transparent",
          color: !isVisual ? "var(--accent)" : "var(--ink-soft)",
        }}
        onClick={() => onChange("details")}
      >
        Details
      </button>
    </div>
  );
}

