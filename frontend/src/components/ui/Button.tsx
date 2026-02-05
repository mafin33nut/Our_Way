import { ButtonHTMLAttributes, ReactNode } from 'react';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'orange' | 'darkOrange' | 'softAmber';
  size?: 'sm' | 'md' | 'lg';
}
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium leading-snug font-sans';
  
  const variantStyles = {
    primary:
      'bg-teal-400/80 text-slate-900 hover:bg-teal-400 border border-teal-300/60 shadow-sm',
    secondary:
      'bg-slate-700/60 text-slate-100 hover:bg-slate-700 border border-slate-600/60 shadow-sm',
    ghost:
      'text-slate-100 hover:bg-slate-700/60 border border-slate-600/60',
    orange:
      'bg-amber-400/80 text-slate-900 hover:bg-amber-400 border border-amber-300/60 shadow-sm',
    darkOrange:
      'bg-amber-300/70 text-slate-900 hover:bg-amber-300 border border-amber-300/60 shadow-sm',
    softAmber:
      'bg-amber-300/60 text-slate-900 hover:bg-amber-300 border border-amber-300/50 shadow-sm',
  };
  const sizeStyles = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
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