import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, RotateCcw, TriangleAlert, X } from 'lucide-react';
import { cn } from '../../lib/cn';

const config = { success: { icon: CheckCircle2, style: 'border-success/20 bg-success-light text-success-dark' }, error: { icon: AlertCircle, style: 'border-danger/20 bg-danger-light text-danger-dark' }, warning: { icon: TriangleAlert, style: 'border-warning/20 bg-warning-light text-warning-dark' }, info: { icon: Info, style: 'border-info/20 bg-info-light text-info-dark' } };

export default function Toast({ open = false, message, severity = 'info', variant = 'standard', autoHideDuration = 5000, action, onClose, onUndo, undoable = false, showProgress = false, icon, title, anchorOrigin = { vertical: 'bottom', horizontal: 'left' }, className }) {
  const [progress, setProgress] = useState(100);
  const [paused, setPaused] = useState(false);
  const current = config[severity] || config.info;
  const Icon = current.icon;
  useEffect(() => { if (!open || !autoHideDuration || paused) return undefined; const interval = setInterval(() => setProgress((value) => Math.max(0, value - (100 / autoHideDuration) * 100)), 100); const timeout = setTimeout(() => onClose?.({}, 'timeout'), autoHideDuration); return () => { clearInterval(interval); clearTimeout(timeout); }; }, [open, autoHideDuration, paused, onClose]);
  if (!open) return null;
  const position = `${anchorOrigin.vertical === 'top' ? 'top-6' : 'bottom-6'} ${anchorOrigin.horizontal === 'right' ? 'right-6' : anchorOrigin.horizontal === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-6'}`;
  return <div className={cn('fixed z-[100] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border p-4 shadow-pop animate-fade-in', position, variant === 'filled' ? 'border-transparent bg-slate-900 text-white' : current.style, className)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} role="status"><div className="flex items-start gap-3">{icon || <Icon className="mt-0.5 h-5 w-5 shrink-0" />}<div className="min-w-0 flex-1">{title && <strong className="block text-sm">{title}</strong>}<p className="mt-1 text-sm">{message}</p></div><div className="flex items-center gap-1">{undoable && <button type="button" onClick={() => { onUndo?.(); onClose?.({}, 'undo'); }} className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium hover:bg-black/10"><RotateCcw className="h-3 w-3" />Undo</button>}{action}<button type="button" onClick={(event) => onClose?.(event, 'closeButton')} className="rounded p-1 hover:bg-black/10" aria-label="Close"><X className="h-4 w-4" /></button></div></div>{showProgress && <span className="absolute bottom-0 left-0 h-1 bg-current/30 transition-[width]" style={{ width: `${progress}%` }} />}</div>;
}

export function ToastContainer({ toasts = [], onClose }) { return <>{toasts.map((item) => <Toast key={item.id} {...item} open onClose={() => onClose?.(item.id)} />)}</>; }
export function useToast() { const [toasts, setToasts] = useState([]); const hide = useCallback((id) => setToasts((items) => items.filter((item) => item.id !== id)), []); const show = useCallback((toast) => { const id = toast.id || Date.now(); setToasts((items) => [...items, { ...toast, id, open: true }]); if (toast.autoHideDuration !== 0) setTimeout(() => hide(id), toast.autoHideDuration || 5000); return id; }, [hide]); return { toasts, show, hide, success: (message, options) => show({ message, severity: 'success', ...options }), error: (message, options) => show({ message, severity: 'error', ...options }), warning: (message, options) => show({ message, severity: 'warning', ...options }), info: (message, options) => show({ message, severity: 'info', ...options }) }; }
