import { cn } from '../../lib/cn';

export function Table({ className, ...props }) {
  return <div className="overflow-hidden rounded-xl border"><table className={cn('min-w-full divide-y divide-slate-200 dark:divide-slate-800', className)} {...props} /></div>;
}

export function THead({ className, ...props }) {
  return <thead className={cn('bg-slate-50 dark:bg-slate-900/50', className)} {...props} />;
}

export function TBody({ className, ...props }) {
  return <tbody className={cn('divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900', className)} {...props} />;
}

export function TR({ className, ...props }) {
  return <tr className={cn('transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50', className)} {...props} />;
}

export function TH({ className, ...props }) {
  return <th className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500', className)} {...props} />;
}

export function TD({ className, ...props }) {
  return <td className={cn('px-4 py-3 text-sm text-slate-700 dark:text-slate-300', className)} {...props} />;
}

export default Table;
