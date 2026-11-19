import { CircleHelp } from 'lucide-react';
import { cn } from '../../lib/cn';

const placementClasses = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'left-1/2 top-full mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

export default function Tooltip({ title, children, variant = 'standard', placement = 'top', color, maxWidth = 300, content, image, actions, disabled = false, className, ...props }) {
  if (disabled || (!title && !content)) return children;
  return <span className="group relative inline-flex" {...props}>
    {children}
    <span role="tooltip" className={cn('pointer-events-none absolute z-50 hidden w-max max-w-xs rounded-lg px-3 py-2 text-left text-xs text-white opacity-0 shadow-pop transition-opacity group-hover:block group-hover:opacity-100 group-focus-within:block group-focus-within:opacity-100', placementClasses[placement] || placementClasses.top, variant === 'rich' ? 'bg-slate-800' : 'bg-slate-950', className)} style={{ maxWidth, backgroundColor: color }}>
      {variant === 'rich' && image && <img src={image} alt="" className="mb-2 w-full rounded object-cover" />}
      {title && <strong className="block font-semibold">{title}</strong>}
      {content && <span className="mt-1 block opacity-90">{content}</span>}
      {actions && <span className="mt-2 flex gap-2">{actions}</span>}
    </span>
  </span>;
}

export const InfoTooltip = ({ title, children, ...props }) => <Tooltip title={title} {...props}>{children || <CircleHelp aria-label={title} className="h-4 w-4 opacity-60" />}</Tooltip>;
export const TruncateTooltip = ({ text, maxLength = 50, ...props }) => { const truncated = text && text.length > maxLength; return <Tooltip title={truncated ? text : ''} {...props}><span>{truncated ? `${text.substring(0, maxLength)}...` : text}</span></Tooltip>; };
