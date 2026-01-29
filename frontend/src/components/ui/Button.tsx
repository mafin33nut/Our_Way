import { ButtonHTMLAttributes, ReactNode } from 'react';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'orange' | 'darkOrange';
  size?: 'sm' | 'md' | 'lg';
}
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium';
  
  const variantStyles = {
    primary: 'bg-amber-300 text-slate-900 hover:bg-amber-400 shadow-sm',
    secondary: 'bg-slate-300 text-slate-900 hover:bg-slate-400 border border-slate-400/60',
    ghost: 'text-slate-700 hover:bg-slate-200/60',
    orange: 'bg-orange-500/70 text-slate-900 hover:bg-orange-500/80 shadow-sm',
    darkOrange: 'bg-orange-300/80 text-slate-900 hover:bg-orange-400/80 shadow-sm',
  };
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}