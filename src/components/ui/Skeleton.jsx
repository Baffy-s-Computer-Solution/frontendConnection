import { cn } from '../../lib/cn';

export default function Skeleton({ variant = 'text', width, height, className, ...props }) {
  const shape = variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-lg';
  return <span className={cn('block animate-pulse bg-slate-200 dark:bg-slate-800', shape, variant === 'text' && 'h-4', className)} style={{ width, height }} {...props} />;
}

export function TextSkeleton({ lines = 3, ...props }) {
  return <div className="space-y-2">{Array.from({ length: lines }, (_, index) => <Skeleton key={index} variant="text" className={index === lines - 1 ? 'w-3/5' : 'w-full'} {...props} />)}</div>;
}

export const AvatarSkeleton = ({ size = 40, ...props }) => <Skeleton variant="circular" width={size} height={size} {...props} />;

export function CardSkeleton() {
  return <div className="space-y-4 rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900"><div className="flex items-center gap-3"><AvatarSkeleton size={48} /><div className="flex-1 space-y-2"><Skeleton className="w-3/5" /><Skeleton className="w-2/5" /></div></div><Skeleton variant="rectangular" height={120} /><div className="flex gap-2"><Skeleton variant="rectangular" width={80} height={32} /><Skeleton variant="rectangular" width={80} height={32} /></div></div>;
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return <div className="space-y-3">{Array.from({ length: rows + 1 }, (_, row) => <div key={row} className="flex gap-4">{Array.from({ length: columns }, (_, column) => <Skeleton key={column} className="flex-1" />)}</div>)}</div>;
}

export function ListSkeleton({ items = 5 }) {
  return <div className="space-y-3">{Array.from({ length: items }, (_, index) => <div key={index} className="flex items-center gap-3"><AvatarSkeleton size={32} /><div className="flex-1 space-y-2"><Skeleton className="w-4/5" /><Skeleton className="w-2/5" /></div></div>)}</div>;
}
