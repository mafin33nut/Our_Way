import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-amber-200/80 text-sm mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-slate-950/50 border border-amber-600/30 rounded-lg px-4 py-2 text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${className} ${
            error ? 'border-red-500' : ''
          }`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';