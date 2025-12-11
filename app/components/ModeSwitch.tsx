type ModeSwitchProps = {
  mode: "visual" | "details";
  onChange: (mode: "visual" | "details") => void;
};

export function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  const isVisual = mode === "visual";

  return (
    <div 
      className="inline-flex rounded-full p-1"
      style={{ 
        background: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <button
        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
          isVisual ? "shadow-sm" : ""
        }`}
        style={{ 
          background: isVisual ? "linear-gradient(180deg, #f3b34c 0%, #d4913f 100%)" : "transparent",
          color: isVisual ? "#1a1612" : "rgba(255, 255, 255, 0.5)",
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
          background: !isVisual ? "linear-gradient(180deg, #f3b34c 0%, #d4913f 100%)" : "transparent",
          color: !isVisual ? "#1a1612" : "rgba(255, 255, 255, 0.5)",
        }}
        onClick={() => onChange("details")}
      >
        Details
      </button>
    </div>
  );
}

