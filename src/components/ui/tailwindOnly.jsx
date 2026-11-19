import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const Container = ({ fluid = false, className = '', ...props }) => (
  <div
    className={cn(fluid ? 'w-full' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}
    {...props}
  />
);

export const Row = ({ className = '', ...props }) => (
  <div className={cn('flex flex-wrap -mx-3', className)} {...props} />
);

export const Col = ({ className = '', md, lg, xl, xs, sm, ...props }) => {
  const widthMap = {
    xs: 'w-full',
    sm: 'sm:w-1/2',
    md: 'md:w-1/2',
    lg: 'lg:w-1/3',
    xl: 'xl:w-1/4',
  };

  const width = widthMap[sm] || widthMap[md] || widthMap[lg] || widthMap[xl] || widthMap.xs || 'w-full';

  return <div className={cn('px-3', width, className)} {...props} />;
};

export const Card = Object.assign(
  ({ className = '', ...props }) => (
    <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900', className)} {...props} />
  ),
  {
    Body: ({ className = '', ...props }) => <div className={cn('p-4', className)} {...props} />,
    Header: ({ className = '', ...props }) => <div className={cn('border-b border-slate-200 px-4 py-3 dark:border-slate-700', className)} {...props} />,
    Footer: ({ className = '', ...props }) => <div className={cn('border-t border-slate-200 px-4 py-3 dark:border-slate-700', className)} {...props} />,
  },
);

export const Button = ({ className = '', variant = 'primary', size = 'md', ...props }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    warning: 'bg-amber-500 text-white hover:bg-amber-600',
    info: 'bg-cyan-600 text-white hover:bg-cyan-700',
    light: 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    outline: 'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <button
      type={props.type || 'button'}
      className={cn('inline-flex items-center justify-center rounded-xl font-medium shadow-sm transition', variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
      {...props}
    />
  );
};

export const Badge = ({ className = '', bg = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200',
    secondary: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
  };

  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', variants[bg] || variants.primary, className)} {...props} />;
};

export const Alert = ({ className = '', variant = 'info', ...props }) => {
  const variants = {
    info: 'border border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200',
    success: 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200',
    warning: 'border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200',
    danger: 'border border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200',
  };

  return <div className={cn('rounded-xl p-4', variants[variant] || variants.info, className)} {...props} />;
};

export const Spinner = ({ className = '', ...props }) => (
  <div className={cn('inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent', className)} {...props} />
);

export const ProgressBar = ({ className = '', now = 0, variant = 'primary', ...props }) => {
  const value = Math.min(100, Math.max(0, Number(now) || 0));
  return (
    <div className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700', className)} {...props}>
      <progress
        aria-label="Progress"
        className={cn(
          'absolute inset-0 h-full w-full appearance-none rounded-full [&::-moz-progress-bar]:rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:rounded-full',
          variant === 'success' && '[&::-moz-progress-bar]:bg-emerald-500 [&::-webkit-progress-value]:bg-emerald-500',
          variant === 'warning' && '[&::-moz-progress-bar]:bg-amber-500 [&::-webkit-progress-value]:bg-amber-500',
          variant === 'danger' && '[&::-moz-progress-bar]:bg-red-500 [&::-webkit-progress-value]:bg-red-500',
          variant === 'info' && '[&::-moz-progress-bar]:bg-sky-500 [&::-webkit-progress-value]:bg-sky-500',
          !['success', 'warning', 'danger', 'info'].includes(variant) && '[&::-moz-progress-bar]:bg-blue-600 [&::-webkit-progress-value]:bg-blue-600',
        )}
        max="100"
        value={value}
      />
    </div>
  );
};

export const Form = Object.assign(
  ({ className = '', ...props }) => <form className={cn(className)} {...props} />,
  {
    Group: ({ className = '', ...props }) => <div className={cn('space-y-1.5', className)} {...props} />,
    Label: ({ className = '', ...props }) => <label className={cn('mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300', className)} {...props} />,
    Control: ({ className = '', ...props }) => (
      <input className={cn('block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100', className)} {...props} />
    ),
    Select: ({ className = '', ...props }) => (
      <select className={cn('block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100', className)} {...props} />
    ),
    Text: ({ className = '', ...props }) => (
      <small className={cn('mt-1 block text-xs text-slate-500 dark:text-slate-400', className)} {...props} />
    ),
    Check: ({ className = '', children, label, ...props }) => (
      <label className={cn('flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300', className)}>
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600" {...props} />
        {label || children}
      </label>
    ),
  },
);

export const InputGroup = Object.assign(
  ({ className = '', ...props }) => <div className={cn('flex overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900', className)} {...props} />,
  {
    Text: ({ className = '', ...props }) => <span className={cn('flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300', className)} {...props} />,
  },
);

export const Table = Object.assign(
  ({ className = '', ...props }) => <table className={cn('w-full border-collapse text-left', className)} {...props} />,
  {
    Header: ({ className = '', ...props }) => <thead className={cn('bg-slate-50 dark:bg-slate-800/60', className)} {...props} />,
    Body: ({ className = '', ...props }) => <tbody className={cn(className)} {...props} />,
    Row: ({ className = '', ...props }) => <tr className={cn('border-b border-slate-200 dark:border-slate-700', className)} {...props} />,
    Head: ({ className = '', ...props }) => <th className={cn('px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300', className)} {...props} />,
    Cell: ({ className = '', ...props }) => <td className={cn('px-3 py-2 text-sm text-slate-700 dark:text-slate-200', className)} {...props} />,
  },
);

export const ListGroupItem = ({ className = '', ...props }) => <div className={cn('border-b border-slate-200 px-4 py-3 last:border-b-0 dark:border-slate-700', className)} {...props} />;
export const ListGroup = Object.assign(
  ({ className = '', ...props }) => (
    <div
      className={cn('overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900', className)}
      {...props}
    />
  ),
  { Item: ListGroupItem },
);

export const Modal = ({ className = '', show = false, ...props }) => {
  if (!show) return null;
  return <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4', className)} {...props} />;
};
Modal.Header = ({ className = '', ...props }) => <div className={cn('flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700', className)} {...props} />;
Modal.Title = ({ className = '', ...props }) => <h3 className={cn('text-lg font-semibold text-slate-900 dark:text-slate-100', className)} {...props} />;
Modal.Body = ({ className = '', ...props }) => <div className={cn('px-5 py-4', className)} {...props} />;
Modal.Footer = ({ className = '', ...props }) => <div className={cn('flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700', className)} {...props} />;

export const Dropdown = Object.assign(
  ({ className = '', ...props }) => <div className={cn('relative inline-block', className)} {...props} />,
  {
    Toggle: ({ className = '', ...props }) => <button type="button" className={cn('inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800', className)} {...props} />,
    Menu: ({ className = '', ...props }) => <div className={cn('absolute right-0 z-20 mt-2 min-w-[180px] rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900', className)} {...props} />,
    Item: ({ className = '', ...props }) => <button type="button" className={cn('block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800', className)} {...props} />,
  },
);

export const Offcanvas = Object.assign(
  ({ show = false, onHide, placement = 'end', className = '', children, ...props }) => {
    if (!show) return null;

    const placementClasses = {
      start: 'left-0 top-0 h-full rounded-r-2xl',
      end: 'right-0 top-0 h-full rounded-l-2xl',
      top: 'left-0 top-0 w-full rounded-b-2xl',
      bottom: 'bottom-0 left-0 w-full rounded-t-2xl',
    };

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/50" onMouseDown={onHide}>
        <div
          className={cn('absolute flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900', placementClasses[placement] || placementClasses.end, className)}
          onMouseDown={(event) => event.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
  {
    Header: ({ className = '', ...props }) => <div className={cn('flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700', className)} {...props} />,
    Title: ({ className = '', ...props }) => <h3 className={cn('text-lg font-semibold text-slate-900 dark:text-slate-100', className)} {...props} />,
    Body: ({ className = '', ...props }) => <div className={cn('flex-1 overflow-y-auto p-4', className)} {...props} />,
  },
);

export const Pagination = Object.assign(
  ({ className = '', ...props }) => <nav className={cn('flex items-center gap-1.5', className)} {...props} />,
  {
    Item: ({ className = '', active = false, disabled = false, ...props }) => (
      <button
        type="button"
        className={cn(
          'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition',
          active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        disabled={disabled}
        {...props}
      />
    ),
  },
);

export const Tabs = ({ className = '', ...props }) => <div className={cn('flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700', className)} {...props} />;
export const Tab = Object.assign(({ className = '', children, ...props }) => <div className={cn(className)} {...props}>{children}</div>, {
  Container: ({ className = '', ...props }) => <div className={cn('w-full', className)} {...props} />,
  Content: ({ className = '', ...props }) => <div className={cn('w-full', className)} {...props} />,
  Pane: ({ className = '', ...props }) => <div className={cn('w-full', className)} {...props} />,
});

export const Nav = Object.assign(
  ({ className = '', ...props }) => <div className={cn('flex flex-wrap gap-2', className)} {...props} />,
  {
    Item: ({ className = '', ...props }) => <div className={cn('inline-flex', className)} {...props} />,
    Link: ({ className = '', active = false, ...props }) => (
      <button type="button" className={cn('rounded-lg px-3 py-2 text-sm font-medium transition', active ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800', className)} {...props} />
    ),
  },
);

export const OverlayTrigger = ({ children, ...props }) => <div {...props}>{children}</div>;
export const Tooltip = ({ children, ...props }) => <span className="text-xs text-slate-700 dark:text-slate-200" {...props}>{children}</span>;

export const Image = ({ className = '', ...props }) => <img className={cn('max-w-full object-cover', className)} {...props} />;

export const Toast = ({ className = '', children, ...props }) => (
  <div className={cn('rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900', className)} {...props}>{children}</div>
);
Toast.Header = ({ className = '', ...props }) => <div className={cn('mb-2 flex items-center justify-between text-sm font-semibold', className)} {...props} />;
Toast.Body = ({ className = '', ...props }) => <div className={cn('text-sm text-slate-600 dark:text-slate-300', className)} {...props} />;

export default {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  ProgressBar,
  Form,
  InputGroup,
  Table,
  ListGroup,
  ListGroupItem,
  Modal,
  Dropdown,
  Offcanvas,
  Pagination,
  Tabs,
  Tab,
  Nav,
  OverlayTrigger,
  Tooltip,
  Image,
  Toast,
};
