import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '../../lib/cn';

const styles = {
  success: { shell: 'border-success/20 bg-success-light text-success-dark', icon: CheckCircle2 },
  error: { shell: 'border-danger/20 bg-danger-light text-danger-dark', icon: AlertCircle },
  warning: { shell: 'border-warning/20 bg-warning-light text-warning-dark', icon: TriangleAlert },
  info: { shell: 'border-info/20 bg-info-light text-info-dark', icon: Info },
};

export default function Alert({
  children,
  title,
  severity = 'info',
  variant = 'standard',
  closable = false,
  collapsible = false,
  actions = [],
  icon,
  open = true,
  onClose,
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(open);
  const [collapsed, setCollapsed] = useState(false);
  const config = styles[severity] || styles.info;
  const Icon = config.icon;

  useEffect(() => setIsOpen(open), [open]);

  if (!isOpen) return null;

  const close = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div role="alert" className={cn('flex gap-3 rounded-lg border p-4 text-sm animate-fade-in', variant === 'filled' ? 'border-transparent text-white' : config.shell, variant === 'filled' && severity === 'success' && 'bg-success', variant === 'filled' && severity === 'error' && 'bg-danger', variant === 'filled' && severity === 'warning' && 'bg-warning', variant === 'filled' && severity === 'info' && 'bg-info', className)} {...props}>
      {icon || <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />}
      <div className="min-w-0 flex-1">
        <div className={cn('flex items-start justify-between gap-3', collapsible && 'cursor-pointer')} onClick={() => collapsible && setCollapsed((value) => !value)}>
          <div>{title && <p className="font-semibold">{title}</p>}{!collapsible && children}</div>
          <div className="flex shrink-0 items-center gap-1">
            {actions.map((action, index) => <button key={action.label || index} type="button" onClick={() => action.onClick?.()} className="rounded p-1 hover:bg-black/10" aria-label={action.label}>{action.icon}</button>)}
            {collapsible && <ChevronDown aria-hidden className={cn('h-4 w-4 transition-transform', collapsed && '-rotate-90')} />}
            {closable && <button type="button" onClick={close} className="rounded p-1 hover:bg-black/10" aria-label="Close"><X aria-hidden className="h-4 w-4" /></button>}
          </div>
        </div>
        {collapsible ? !collapsed && <div className="mt-1">{children}</div> : null}
      </div>
    </div>
  );
}

export const SuccessAlert = (props) => <Alert severity="success" variant="filled" {...props} />;
export const ErrorAlert = (props) => <Alert severity="error" variant="filled" {...props} />;
export const WarningAlert = (props) => <Alert severity="warning" variant="filled" {...props} />;
export const InfoAlert = (props) => <Alert severity="info" variant="filled" {...props} />;
