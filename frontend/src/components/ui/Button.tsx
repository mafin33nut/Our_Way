import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useCustomization } from '../../hooks/useCustomization';
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
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';

  const baseStyles =
    'rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium leading-snug font-sans transform-gpu';

  const variantStyles = {
    primary: isLight
      ? 'bg-teal-400/90 text-slate-900 hover:bg-teal-400 shadow-md border border-teal-300/50'
      : 'bg-teal-400/90 text-slate-900 hover:bg-teal-300 shadow-md border border-teal-300/60',
    secondary: isLight
      ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300 shadow-sm'
      : 'bg-slate-700/60 text-slate-100 hover:bg-slate-700 border border-slate-600/60 shadow-sm',
    ghost: isLight
      ? 'text-slate-900 hover:bg-slate-100 border border-transparent'
      : 'text-slate-100 hover:bg-slate-700/60 border border-slate-600/60',
    orange: isLight
      ? 'bg-amber-400/90 text-slate-900 hover:bg-amber-400 border border-amber-300/60 shadow-md'
      : 'bg-amber-400/80 text-slate-900 hover:bg-amber-400 border border-amber-300/60 shadow-sm',
    darkOrange: isLight
      ? 'bg-amber-300/80 text-slate-900 hover:bg-amber-300 border border-amber-300/60 shadow-md'
      : 'bg-amber-300/70 text-slate-900 hover:bg-amber-300 border border-amber-300/60 shadow-sm',
    softAmber: isLight
      ? 'bg-amber-200/80 text-slate-900 hover:bg-amber-200 border border-amber-200/60 shadow-md'
      : 'bg-amber-300/60 text-slate-900 hover:bg-amber-300 border border-amber-300/50 shadow-sm',
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