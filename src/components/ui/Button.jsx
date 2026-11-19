import { createElement, isValidElement } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100',
  outline: 'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
  ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
  danger: 'bg-danger text-white hover:bg-danger-dark focus-visible:ring-danger',
  success: 'bg-success text-white hover:bg-success-dark focus-visible:ring-success',
  info: 'bg-info text-white hover:bg-info-dark focus-visible:ring-info',
  warning: 'bg-warning text-white hover:bg-warning-dark focus-visible:ring-warning',
};
const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leadingIcon: Leading,
  trailingIcon: Trailing,
  startIcon,
  endIcon,
  fullWidth = false,
  className, children, ...props
}) {
  const normalizedVariant = variants[variant]
    ? variant
    : variant === 'contained' || variant === 'filled'
      ? 'primary'
      : variant === 'outlined' || variant.startsWith('outline-')
        ? 'outline'
        : 'primary';
  const normalizedSize = size === 'small' ? 'sm' : size === 'large' ? 'lg' : size;
  const leading = Leading
    ? isValidElement(Leading)
      ? Leading
      : createElement(Leading, { 'aria-hidden': true, className: 'h-4 w-4' })
    : startIcon;
  const trailing = Trailing
    ? isValidElement(Trailing)
      ? Trailing
      : createElement(Trailing, { 'aria-hidden': true, className: 'h-4 w-4' })
    : endIcon;

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variants[normalizedVariant],
        sizes[normalizedSize] || sizes.md,
        fullWidth && 'w-full',
        className,
      )}
    >
      {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : leading}
      {children}
      {trailing}
    </button>
  );
}