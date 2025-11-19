import React, { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  placeholder?: string;
  children?: ReactNode;
  value?: string | number;
  onChange?: ((value: string) => void) | ((event: React.ChangeEvent<HTMLSelectElement>) => void);
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, options, placeholder, className = '', children, value, onChange, ...props },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        // Support both React Hook Form and direct value onChange
        const onChangeAny = onChange as any;
        // Try to call with both signatures to support both patterns
        if (typeof onChangeAny === 'function') {
          try {
            // First try React Hook Form pattern (expects event)
            onChangeAny(e);
          } catch {
            // If that fails, try direct value pattern
            onChangeAny(e.target.value);
          }
        }
      }
    };

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          value={value || ''}
          onChange={handleChange}
          className={`w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500 ${
            error ? 'border-red-500 focus-visible:ring-red-500' : ''
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {hint && <p className="text-sm text-neutral-500">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
