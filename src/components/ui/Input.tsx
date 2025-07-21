import React from "react";
import { cn } from "@/lib/utils";
import { InputProps } from "@/types";

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  required = false,
  disabled = false,
  className,
}) => {
  const inputClasses = cn(
    "input",
    error && "input-error",
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e?.target?.value || '')}
        required={required}
        disabled={disabled}
        className={inputClasses}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
}; 