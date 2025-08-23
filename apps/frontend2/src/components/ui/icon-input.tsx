import React, { forwardRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
  showPasswordToggle?: boolean;
}

const IconInput = forwardRef<HTMLInputElement, IconInputProps>(({
  icon: Icon,
  label,
  error,
  helperText,
  className = "",
  containerClassName = "",
  iconClassName = "",
  labelClassName = "",
  showPasswordToggle = false,
  type = "text",
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = showPasswordToggle && type === "password"
    ? (showPassword ? "text" : "password")
    : type;

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <Label
          htmlFor={props.id}
          className={`text-sm font-medium text-gray-700 ${labelClassName}`}
        >
          {label}
        </Label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 ${iconClassName}`} />
        )}
        <Input
          ref={ref}
          type={inputType}
          className={`
            ${Icon ? 'pl-10' : ''} 
            ${showPasswordToggle ? 'pr-10' : ''} 
            h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
});

IconInput.displayName = "IconInput";

export { IconInput };
export type { IconInputProps };