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
      'bg-orange-400/60 text-slate-900 hover:bg-orange-400/70 border border-orange-300/50 shadow-sm',
    secondary:
      'bg-orange-300/45 text-slate-900 hover:bg-orange-300/55 border border-orange-300/40 shadow-sm',
    ghost:
      'text-orange-200 hover:bg-orange-300/20 border border-orange-300/30',
    orange:
      'bg-orange-400/60 text-slate-900 hover:bg-orange-400/70 border border-orange-300/50 shadow-sm',
    darkOrange:
      'bg-orange-300/55 text-slate-900 hover:bg-orange-300/65 border border-orange-300/50 shadow-sm',
    softAmber:
      'bg-orange-300/50 text-slate-900 hover:bg-orange-300/60 border border-orange-300/45 shadow-sm',
  };
  const sizeStyles = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5',
    lg: 'px-6 py-3.5 text-lg',
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