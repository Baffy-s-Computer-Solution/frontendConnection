import { Bookmark, BookmarkCheck, Edit3, Heart, MoreVertical, Share2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import Skeleton, { TextSkeleton } from '../ui/Skeleton';

export default function Card({ children, title, subtitle, avatar, image, imageProps, mediaHeight = 200, actions = [], headerActions, onAction, loading = false, clickable = false, selected = false, onClick, variant = 'elevation', square = false, favorited = false, bookmarked = false, onFavorite, onBookmark, onShare, onEdit, onDelete, chips = [], footer, headerDivider = false, contentPadding = true, className, ...props }) {
  const actionItems = [
    onFavorite && { label: favorited ? 'Unlike' : 'Like', icon: Heart, onClick: onFavorite, active: favorited },
    onBookmark && { label: bookmarked ? 'Remove bookmark' : 'Bookmark', icon: bookmarked ? BookmarkCheck : Bookmark, onClick: onBookmark, active: bookmarked },
    onShare && { label: 'Share', icon: Share2, onClick: onShare },
    onEdit && { label: 'Edit', icon: Edit3, onClick: onEdit },
    onDelete && { label: 'Delete', icon: Trash2, onClick: onDelete },
    ...actions,
  ].filter(Boolean);

  if (loading) return <article className={cn('h-full rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900', className)}><div className="flex items-center gap-3"><Skeleton variant="circular" width={40} height={40} /><TextSkeleton lines={2} /></div><Skeleton variant="rectangular" className="mt-4" height={mediaHeight} /><TextSkeleton lines={3} /></article>;

  return <article className={cn('flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-card transition dark:bg-slate-900', clickable && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-pop', selected && 'border-brand-500 ring-2 ring-brand-500/20', variant === 'outlined' && 'shadow-none', square ? 'rounded-none' : 'rounded-xl', className)} onClick={onClick} {...props}>
    {image && <div className="relative overflow-hidden" style={{ height: mediaHeight }}><img src={image} alt={imageProps?.alt || ''} className="h-full w-full object-cover" {...imageProps} /></div>}
    {(title || subtitle || avatar || headerActions || actionItems.length > 0) && <header className={cn('flex items-start gap-3 p-5', headerDivider && 'border-b')}>
      {avatar}
      <div className="min-w-0 flex-1"><h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">{title}</h3>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}{chips.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{chips.map((chip, index) => <span key={chip.label || index} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-200">{chip.label || chip}</span>)}</div>}</div>
      {headerActions || (actionItems.length > 0 && <div className="flex items-center gap-1">{actionItems.slice(0, 3).map((action, index) => { const Icon = action.icon || MoreVertical; return <button key={action.label || index} type="button" onClick={(event) => { event.stopPropagation(); action.onClick?.(event); onAction?.(action); }} className={cn('rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800', action.active && 'text-brand-600')} aria-label={action.label}><Icon className="h-4 w-4" /></button>; })}</div>)}
    </header>}
    <div className={cn('flex-1', contentPadding && 'px-5 pb-5')}>{children}</div>
    {footer && <footer className="border-t px-5 py-4">{footer}</footer>}
  </article>;
}

export function StatsCard({ title, value, icon: Icon, trend, className, ...props }) {
  const isPositive = Number(trend) >= 0;

  return (
    <article className={cn('rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900', className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-200">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {typeof trend !== 'undefined' && (
        <div className={cn('mt-4 inline-flex items-center gap-1 text-xs font-medium', isPositive ? 'text-emerald-600' : 'text-rose-600')}>
          <span>{isPositive ? '+' : ''}{trend}%</span>
        </div>
      )}
    </article>
  );
}
