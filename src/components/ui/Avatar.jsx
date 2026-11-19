import { useState } from 'react';
import { BriefcaseBusiness, Building2, GraduationCap, UserRound, Workflow } from 'lucide-react';
import { cn } from '../../lib/cn';

const sizes = { small: 'h-8 w-8 text-xs', medium: 'h-10 w-10 text-sm', large: 'h-14 w-14 text-lg', xlarge: 'h-20 w-20 text-2xl' };
const statusColors = { online: 'bg-success', offline: 'bg-slate-400', busy: 'bg-danger', away: 'bg-warning' };
const icons = { company: Building2, student: GraduationCap, employee: BriefcaseBusiness, user: UserRound };

function Avatar({ src, alt, name, size = 'medium', variant = 'circular', status, type = 'user', bordered = false, clickable = false, onClick, badge, bgColor, textColor, fallback, className, ...props }) {
  const [hasError, setHasError] = useState(false);
  const Icon = icons[type] || Workflow;
  const initials = name?.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();
  const shape = variant === 'rounded' ? 'rounded-lg' : variant === 'square' ? 'rounded-none' : 'rounded-full';

  const avatar = (
    <span className={cn('relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-brand-100 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-200', sizes[size] || sizes.medium, shape, bordered && 'ring-2 ring-white dark:ring-slate-900', clickable && 'cursor-pointer transition-transform hover:scale-105', className)} style={{ backgroundColor: bgColor, color: textColor }} onClick={onClick} {...props}>
      {src && !hasError ? <img src={src} alt={alt || name || ''} className="h-full w-full object-cover" onError={() => setHasError(true)} /> : initials || fallback || <Icon aria-hidden className="h-1/2 w-1/2" />}
      {status && <span className={cn('absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900', statusColors[status] || statusColors.offline)} aria-label={status} />}
    </span>
  );

  return badge == null ? avatar : <span className="relative inline-flex">{avatar}<span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">{badge}</span></span>;
}

export function AvatarGroup({ avatars = [], max = 4, size = 'medium' }) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;
  return <div className="flex items-center">{visible.map((avatar, index) => <Avatar key={avatar.id || index} {...avatar} size={size} className="-ml-2 first:ml-0 ring-2 ring-white dark:ring-slate-950" />)}{remaining > 0 && <Avatar name={`+${remaining}`} size={size} className="-ml-2 bg-slate-200 text-slate-700 ring-2 ring-white dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-950" />}</div>;
}

export const StatusAvatar = ({ status, ...props }) => <Avatar status={status} {...props} />;
export default Avatar;
