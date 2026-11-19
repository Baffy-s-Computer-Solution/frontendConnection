import * as Icons from 'lucide-react';
import { cn } from '../../lib/cn';

const aliases = { Add: 'Plus', Close: 'X', Delete: 'Trash2', Edit: 'Pencil', Error: 'CircleAlert', CheckCircle: 'CircleCheck', Warning: 'TriangleAlert', Info: 'Info', Refresh: 'RefreshCw', Search: 'Search', MoreVert: 'MoreVertical', ArrowBack: 'ArrowLeft', ArrowForward: 'ArrowRight', GetApp: 'Download', Visibility: 'Eye', VisibilityOff: 'EyeOff', Home: 'House', Person: 'UserRound', Business: 'Building2', School: 'GraduationCap', Work: 'BriefcaseBusiness', Settings: 'Settings', Menu: 'Menu', ExpandMore: 'ChevronDown', NavigateNext: 'ChevronRight' };
const colors = { primary: 'text-brand-600', secondary: 'text-slate-500', success: 'text-success', error: 'text-danger', warning: 'text-warning', info: 'text-info' };
const sizes = { small: 'h-5 w-5', medium: 'h-6 w-6', large: 'h-8 w-8', xlarge: 'h-12 w-12' };

export default function Icon({ name, size = 'medium', color = 'inherit', background = false, rounded = false, spin = false, pulse = false, clickable = false, onClick, component: CustomComponent, className, ...props }) {
  const Component = CustomComponent || Icons[name] || Icons[aliases[name]];
  if (!Component) return null;
  return <span className={cn('inline-flex items-center justify-center', sizes[size] || sizes.medium, color !== 'inherit' && (colors[color] || color), background && 'bg-current/10 p-2', rounded === 'circle' ? 'rounded-full' : rounded && 'rounded-lg', clickable && 'cursor-pointer transition-transform hover:scale-105', spin && 'animate-spin', pulse && 'animate-pulse', className)} onClick={onClick} {...props}><Component aria-hidden /></span>;
}

export const LoadingIcon = (props) => <Icon name="Refresh" spin {...props} />;
export const SuccessIcon = (props) => <Icon name="CheckCircle" color="success" {...props} />;
export const ErrorIcon = (props) => <Icon name="Error" color="error" {...props} />;
export const WarningIcon = (props) => <Icon name="Warning" color="warning" {...props} />;
export const InfoIcon = (props) => <Icon name="Info" color="info" {...props} />;
export const getIcon = (name, props = {}) => { const Component = Icons[name] || Icons[aliases[name]]; return Component ? <Component {...props} /> : null; };
