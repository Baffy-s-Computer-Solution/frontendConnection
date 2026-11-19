import { useMemo, useState } from 'react';
import { ArrowLeft, Download, Expand, Maximize2, Minimize2, Printer, RefreshCw, Share2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Skeleton from '../ui/Skeleton';

function Breadcrumbs({ items = [], homePath = '/' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const generated = useMemo(() => {
    if (items.length) return items;
    let path = '';
    return location.pathname.split('/').filter(Boolean).map((part) => {
      path += `/${part}`;
      return { label: part.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()), path };
    });
  }, [items, location.pathname]);

  return (
    <nav aria-label="Breadcrumb" className="mt-2 flex flex-wrap items-center gap-1 text-xs text-slate-500">
      <button type="button" onClick={() => navigate(homePath)} className="rounded px-1 py-0.5 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-200">Home</button>
      {generated.map((item, index) => <span key={item.path || index} className="flex items-center gap-1"><span aria-hidden>/</span>{index === generated.length - 1 ? <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span> : <button type="button" onClick={() => navigate(item.path)} className="rounded px-1 py-0.5 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-200">{item.label}</button>}</span>)}
    </nav>
  );
}

function PageContainer({
  children,
  title,
  subtitle,
  showHeader = true,
  showBreadcrumbs = true,
  showBackButton = false,
  showActions = true,
  breadcrumbs = [],
  homePath = '/',
  actions = [],
  onBack,
  onRefresh,
  onDownload,
  onPrint,
  onShare,
  loading = false,
  skeletonCount = 3,
  noPadding = false,
  centered = false,
  fullscreen = false,
  onFullscreen,
  meta = {},
  ...props
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
    onFullscreen?.(!isFullscreen);
  };
  const iconActions = [
    onRefresh && { label: 'Refresh', icon: RefreshCw, onClick: onRefresh },
    onDownload && { label: 'Download', icon: Download, onClick: onDownload },
    onPrint && { label: 'Print', icon: Printer, onClick: onPrint },
    onShare && { label: 'Share', icon: Share2, onClick: onShare },
    fullscreen && { label: isFullscreen ? 'Exit fullscreen' : 'Fullscreen', icon: isFullscreen ? Minimize2 : Maximize2, onClick: toggleFullscreen },
  ].filter(Boolean);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950" {...props}>
      {showHeader && <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur dark:bg-slate-900/90"><div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"><div className="flex min-w-0 items-start gap-3">{showBackButton && <button type="button" onClick={onBack} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100" aria-label="Go back"><ArrowLeft className="h-5 w-5" /></button>}<div className="min-w-0"><h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>{subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}{showBreadcrumbs && <Breadcrumbs items={breadcrumbs} homePath={homePath} />}</div></div>{showActions && <div className="flex flex-wrap items-center gap-1">{iconActions.map(({ label, icon: Icon, onClick }) => <button key={label} type="button" onClick={onClick} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100" aria-label={label} title={label}><Icon className="h-4 w-4" /></button>)}{actions.map(({label, onClick, icon: Icon, variant}, index) => <button key={label || index} type="button" onClick={onClick} className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-800 ${variant === 'contained' || variant === 'primary' ? 'bg-brand-600 text-white hover:bg-brand-700 dark:hover:bg-brand-500' : 'text-slate-600 dark:text-slate-300'}`} aria-label={label} title={label}>{Icon ? <Icon className="h-5 w-5" /> : <span className="sr-only">{label}</span>}</button>)}</div>}</div></header>}
      <main className={`mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8 ${centered ? 'items-center justify-center' : ''}`}>
        {loading ? <div className="space-y-4"><Skeleton className="h-10 w-52" />{Array.from({ length: skeletonCount }, (_, index) => <Skeleton key={index} variant="rectangular" className="h-24 w-full" />)}</div> : noPadding ? children : <div className="animate-fade-in rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900 sm:p-6">{children}</div>}
      </main>
      {Object.keys(meta).length > 0 && <div className="hidden">{Object.entries(meta).map(([key, value]) => <meta key={key} name={key} content={value} />)}</div>}
    </div>
  );
}

export const PageWrapper = ({ children, ...props }) => <div className="min-h-screen bg-slate-50 dark:bg-slate-950" {...props}>{children}</div>;
export const PageHeader = ({ children, ...props }) => <header className="border-b bg-white dark:bg-slate-900" {...props}>{children}</header>;
export const StyledPaper = ({ children, className = '', ...props }) => <section className={`rounded-xl border bg-white p-5 shadow-card dark:bg-slate-900 ${className}`} {...props}>{children}</section>;
export default PageContainer;
