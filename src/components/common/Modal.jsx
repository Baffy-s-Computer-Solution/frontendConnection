import { useEffect, useState } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import Button from '../ui/Button';

const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };

export default function Modal({ open, onClose, title, children, actions, fullScreen = false, showCloseIcon = true, closeOnBackdropClick = true, closeOnEscape = true, dividers = false, size = 'md', fullWidth = true, ...props }) {
  const [isFullScreen, setIsFullScreen] = useState(fullScreen);

  useEffect(() => {
    setIsFullScreen(fullScreen);
  }, [fullScreen]);

  useEffect(() => {
    if (!open || !closeOnEscape) return undefined;
    const handleKeyDown = (event) => event.key === 'Escape' && onClose?.(event, 'escapeKeyDown');
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, onClose, open]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title" {...props}>
      <button type="button" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" aria-label="Close modal" onClick={(event) => closeOnBackdropClick && onClose?.(event, 'backdropClick')} />
      <div className={`relative z-10 flex w-full flex-col overflow-hidden bg-white shadow-pop dark:bg-slate-900 ${isFullScreen ? 'h-full max-w-none rounded-none' : `max-h-[90vh] rounded-2xl ${fullWidth ? widths[size] || widths.md : 'max-w-fit'}`}`}>
        <header className="flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-6">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <div className="flex items-center gap-1">
            {!fullScreen && <button type="button" onClick={() => setIsFullScreen((value) => !value)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100" aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}>{isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>}
            {showCloseIcon && <button type="button" onClick={(event) => onClose?.(event, 'closeButtonClick')} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100" aria-label="Close modal"><X className="h-4 w-4" /></button>}
          </div>
        </header>
        <div className={`min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 ${dividers ? 'border-b' : ''}`}>{children}</div>
        {actions && <footer className="flex flex-wrap justify-end gap-2 border-t px-5 py-4 sm:px-6">{actions.map((action, index) => <Button key={action.label || index} variant={action.variant === 'outlined' || action.variant === 'text' ? 'outline' : action.variant || 'primary'} onClick={action.onClick} loading={action.loading} disabled={action.disabled} startIcon={action.startIcon} endIcon={action.endIcon} size={action.size === 'small' ? 'sm' : action.size === 'large' ? 'lg' : 'md'} fullWidth={action.fullWidth}>{action.label}</Button>)}</footer>}
      </div>
    </div>
  );
}

export function ConfirmModal({ message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onClose, loading = false, ...props }) {
  return <Modal {...props} onClose={onClose} title={props.title || 'Confirm Action'} actions={[{ label: cancelText, variant: 'outlined', onClick: onClose, disabled: loading }, { label: confirmText, variant: 'primary', onClick: onConfirm, loading }]}><p className="text-sm text-slate-600 dark:text-slate-300">{message}</p></Modal>;
}
