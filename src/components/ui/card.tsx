import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

function Card({ children, className = "", style, onClick }: CardProps) {
  return (
    <div
      className={["overflow-hidden", className].filter(Boolean).join(" ")}
      style={{
        backgroundColor: "var(--surface, #ffffff)",
        border: "1px solid var(--border, #d4c5a9)",
        borderRadius: "12px",
        padding: "24px",
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={["mb-4", className].filter(Boolean).join(" ")}
      style={{ fontFamily: "'Playfair Display', serif" }}
    >
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

function CardContent({ children, className = "" }: CardContentProps) {
  return (
    <div
      className={className}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent };
export type { CardProps, CardHeaderProps, CardContentProps };
