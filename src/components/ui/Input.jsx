import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const Input = forwardRef(function Input(
  { label, hint, error, leadingIcon: LeadingIcon, trailingIcon: TrailingIcon, id, className, showPasswordToggle: _showPasswordToggle, ...props },
  ref,
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {LeadingIcon && <LeadingIcon aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
        <input
          ref={ref}
          id={id}
          className={cn(
            'block h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800',
            LeadingIcon && 'pl-9',
            TrailingIcon && 'pr-9',
            error && 'border-danger focus:border-danger focus:ring-danger/30',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {TrailingIcon && <TrailingIcon aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
      </div>
      {error ? <p className="text-xs text-danger-dark">{error}</p> : hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
});

export default Input;
