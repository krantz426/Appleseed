import React, { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

const variantStyles: Record<
  ButtonVariant,
  { className: string; style: React.CSSProperties }
> = {
  primary: {
    className:
      "text-white font-semibold shadow-sm hover:shadow-md active:translate-y-0",
    style: { backgroundColor: "var(--primary, #3d6b3d)" },
  },
  secondary: {
    className:
      "bg-transparent font-semibold hover:bg-opacity-10",
    style: {
      color: "var(--primary, #3d6b3d)",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "var(--primary, #3d6b3d)",
    },
  },
  ghost: {
    className: "bg-transparent font-medium",
    style: {
      color: "var(--text, #2d2a26)",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "var(--border, #d4c5a9)",
    },
  },
  accent: {
    className: "text-white font-semibold shadow-sm hover:shadow-md",
    style: { backgroundColor: "var(--accent, #b8860b)" },
  },
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", children, className = "", disabled, ...props },
    ref
  ) => {
    const v = variantStyles[variant];
    const s = sizeClasses[size];

    const isPrimary = variant === "primary";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          "inline-flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer select-none",
          isPrimary ? "hover:-translate-y-0.5" : "",
          s,
          v.className,
          disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          ...v.style,
          fontFamily: "'DM Sans', sans-serif",
          borderRadius: "8px",
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
