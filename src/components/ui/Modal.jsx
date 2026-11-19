import { cn } from '../../lib/cn';

const Modal = ({ open = false, show = false, onClose, title, children, className, size = 'md' }) => {
  if (!open && !show) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label={title} onMouseDown={onClose}>
      <section className={cn('max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900', sizes[size] || sizes.md, className)} onMouseDown={(event) => event.stopPropagation()}>
        {(title || onClose) && (
          <header className="mb-4 flex items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
            {title ? <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2> : <span />}
            {onClose ? <button type="button" aria-label="Close dialog" onClick={onClose} className="rounded-lg p-2 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200">&times;</button> : null}
          </header>
        )}
        {children}
      </section>
    </div>
  );
};

export default Modal;
