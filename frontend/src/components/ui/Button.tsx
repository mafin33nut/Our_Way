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
    // Все основные варианты кнопок — чёрные с белым текстом
    primary:
      'bg-black text-white hover:bg-neutral-900 border border-black shadow-md',
    secondary:
      'bg-black text-white hover:bg-neutral-900 border border-black shadow-md',
    ghost: isLight
      ? 'text-slate-900 hover:bg-slate-100 border border-transparent'
      : 'text-slate-100 hover:bg-slate-700/60 border border-slate-600/60',
    orange:
      'bg-black text-white hover:bg-neutral-900 border border-black shadow-md',
    darkOrange:
      'bg-black text-white hover:bg-neutral-900 border border-black shadow-md',
    softAmber:
      'bg-black text-white hover:bg-neutral-900 border border-black shadow-md',
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