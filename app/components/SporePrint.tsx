// app/components/SporePrint.tsx
import * as React from "react";

type SporePrintProps = {
  size?: number;
  className?: string;
  strokeColor?: string;
  centerFill?: string;
};

export const SporePrint: React.FC<SporePrintProps> = ({
  size = 260,
  className,
  strokeColor = "#b89a76",
  centerFill = "#fdf7ec",
}) => {
  const radius = size / 2;
  const innerRadius = radius * 0.18;
  const outerRadius = radius * 0.9;
  const rays = 120;

  const paths: string[] = [];
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2;
    const wobble = Math.sin(i * 0.35) * (radius * 0.04);

    // start slightly inside the inner radius for a soft center
    const r1 = innerRadius + wobble * 0.2;
    const r2 = outerRadius + wobble;

    const x1 = radius + r1 * Math.cos(angle);
    const y1 = radius + r1 * Math.sin(angle);
    const x2 = radius + r2 * Math.cos(angle);
    const y2 = radius + r2 * Math.sin(angle);

    paths.push(`M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`);
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sporeFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fdf7ec" stopOpacity="1" />
          <stop offset="65%" stopColor="#fdf7ec" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d7c0a0" stopOpacity="0.25" />
        </radialGradient>

        <style>{`
          @keyframes sporeDrift {
            0%   { transform: scale(1) rotate(0deg); opacity: 0.96; }
            50%  { transform: scale(1.02) rotate(0.6deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 0.96; }
          }
          .spore-gills {
            transform-origin: 50% 50%;
            animation: sporeDrift 7.5s ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* soft background disc */}
      <circle
        cx={radius}
        cy={radius}
        r={outerRadius}
        fill="url(#sporeFill)"
      />

      {/* gills */}
      <g className="spore-gills" stroke={strokeColor} strokeWidth={0.7} strokeLinecap="round">
        {paths.map((d, idx) => (
          <path
            key={idx}
            d={d}
            opacity={0.35 + 0.25 * Math.random()}
          />
        ))}
      </g>

      {/* clean center */}
      <circle
        cx={radius}
        cy={radius}
        r={innerRadius * 0.9}
        fill={centerFill}
      />
    </svg>
  );
};