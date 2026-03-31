import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    backgroundColor: "#f0ece4",
    color: "var(--text-muted, #7a7060)",
  },
  success: {
    backgroundColor: "#e8f0e8",
    color: "var(--primary, #3d6b3d)",
  },
  warning: {
    backgroundColor: "#faf0d8",
    color: "var(--accent, #b8860b)",
  },
  info: {
    backgroundColor: "#e4ecf4",
    color: "#3d5a80",
  },
};

function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...variantStyles[variant],
        borderRadius: "9999px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
