import { forwardRef } from "react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

interface SelectInputProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  name: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

/**
 * SelectInput estilizado com as cores do sistema (Tailwind v4 tokens):
 * - borda: border-input-border
 * - fundo: bg-input
 * - texto: text-font
 * - realce: focus:ring-primary
 */
export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    {
      label,
      name,
      options,
      placeholder,
      helperText,
      error,
      disabled,
      className,
      fullWidth,
      ...rest
    },
    ref
  ) => {
    const base = "border rounded-lg p-2 bg-input border-input-border text-font outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60";
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

        <select
          id={name}
          name={name}
          ref={ref}
          disabled={disabled}
          className={merged}
          aria-invalid={!!error}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {error ? (
          <span className="text-red-400 text-xs">{error}</span>
        ) : helperText ? (
          <span className="text-font/70 text-xs">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

SelectInput.displayName = "SelectInput";

