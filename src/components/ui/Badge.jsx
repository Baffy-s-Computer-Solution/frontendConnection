import { cn } from '../../lib/cn';

const colors = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  primary: 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200',
  secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  success: 'bg-success-light text-success-dark',
  warning: 'bg-warning-light text-warning-dark',
  danger: 'bg-danger-light text-danger-dark',
  error: 'bg-danger-light text-danger-dark',
  info: 'bg-info-light text-info-dark',
  light: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
};

const statusColors = {
  online: 'bg-success',
  offline: 'bg-slate-400',
  away: 'bg-warning',
  busy: 'bg-danger',
};

function Badge({
  children,
  content,
  bg,
  color,
  status,
  variant = 'standard',
  size = 'medium',
  pill = false,
  className,
  ...props
}) {
  if (variant === 'dot') {
    return (
      <span className="relative inline-flex" {...props}>
        {children}
        <span className={cn('absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900', statusColors[status] || 'bg-brand-600')} />
      </span>
    );
  }

  const label = content ?? children;
  const theme = colors[bg || color || status || 'default'] || colors.default;
  const sizing = size === 'small' || size === 'sm' ? 'px-2 py-0.5 text-2xs' : size === 'large' || size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span className={cn('inline-flex items-center font-medium', pill ? 'rounded-full' : 'rounded-md', sizing, theme, className)} {...props}>
      {label}
    </span>
  );
}

export const OnlineBadge = ({ children, ...props }) => <Badge variant="dot" status="online" {...props}>{children}</Badge>;
export const OfflineBadge = ({ children, ...props }) => <Badge variant="dot" status="offline" {...props}>{children}</Badge>;
export const NotificationBadge = ({ count, children, ...props }) => <Badge content={count} bg="danger" {...props}>{children}</Badge>;

export default Badge;
