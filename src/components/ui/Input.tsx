import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 ${className}`}
        {...props}
      />
    </div>
  );
}
