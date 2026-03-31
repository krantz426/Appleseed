import React from "react";

interface ProgressBarProps {
  value: number;
  thick?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function ProgressBar({ value, thick = false, className = "", style }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const height = thick ? "12px" : "4px";

  return (
    <div
      className={["w-full overflow-hidden", className].filter(Boolean).join(" ")}
      style={{
        height,
        backgroundColor: "var(--border, #d4c5a9)",
        borderRadius: "9999px",
        ...style,
      }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: "100%",
          backgroundColor: "var(--primary, #3d6b3d)",
          borderRadius: "9999px",
          transition: "width 0.5s ease-in-out",
        }}
      />
    </div>
  );
}

export { ProgressBar };
export type { ProgressBarProps };
