import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium"
            style={{
              color: "var(--text, #2d2a26)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full px-4 py-2.5 text-base outline-none transition-colors duration-200",
            error ? "" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: "var(--text, #2d2a26)",
            backgroundColor: "var(--surface, #ffffff)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: error
              ? "#c44040"
              : "var(--border, #d4c5a9)",
            borderRadius: "8px",
            // @ts-expect-error CSS custom property placeholder workaround
            "--placeholder-color": "#a09880",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error
              ? "#c44040"
              : "var(--primary, #3d6b3d)";
            e.currentTarget.style.boxShadow = error
              ? "0 0 0 2px rgba(196,64,64,0.15)"
              : "0 0 0 2px rgba(61,107,61,0.15)";
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error
              ? "#c44040"
              : "var(--border, #d4c5a9)";
            e.currentTarget.style.boxShadow = "none";
            props.onBlur?.(e);
          }}
          {...props}
        />
        {error && (
          <span
            className="text-sm"
            style={{ color: "#c44040", fontFamily: "'DM Sans', sans-serif" }}
          >
            {error}
          </span>
        )}

        <style>{`
          input::placeholder {
            color: #a09880;
          }
        `}</style>
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
