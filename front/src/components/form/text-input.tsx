import { forwardRef } from "react";

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "children"> {
  label?: string;
  name: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

/**
 * TextInput estilizado com as cores do sistema (Tailwind v4 tokens):
 * - borda: border-input-border
 * - fundo: bg-input
 * - texto: text-font
 * - realce: focus:ring-primary
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    { label, name, helperText, error, disabled, className, fullWidth, type = "text", ...rest },
    ref
  ) => {
    const base =
      "border rounded-lg p-2 bg-input border-input-border text-font outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60";
    const width = fullWidth ? "w-full" : "";
    const errorCls = error ? "border-red-400 focus:ring-red-400/50" : "";
    const merged = [base, width, className, errorCls].filter(Boolean).join(" ");

    return (
      <div className={fullWidth ? "w-full flex flex-col gap-1" : "flex flex-col gap-1"}>
        {label ? (
          <label htmlFor={name} className="text-font text-sm font-medium">
            {label}
          </label>
        ) : null}

        <input
          id={name}
          name={name}
          ref={ref}
          disabled={disabled}
          className={merged}
          aria-invalid={!!error}
          type={type}
          {...rest}
        />

        {error ? (
          <span className="text-red-400 text-xs">{error}</span>
        ) : helperText ? (
          <span className="text-font/70 text-xs">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
