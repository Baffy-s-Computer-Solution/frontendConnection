import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import ButtonBase from './Button';
import BadgeBase from './Badge';
import AlertBase from './Alert';
import CardBase, { CardBody, CardHeader, CardFooter } from './Card';
import InputBase from './Input';
import TableBase, { TBody, TD, TH, THead, TR } from './Table';

const toButtonVariant = (variant = 'primary') => {
  const value = String(variant).toLowerCase();
  if (value.includes('outline')) return 'outline';
  if (value.includes('danger')) return 'danger';
  if (value.includes('success')) return 'success';
  if (value.includes('warning')) return 'warning';
  if (value.includes('info')) return 'info';
  if (value.includes('secondary') || value.includes('light')) return 'secondary';
  return 'primary';
};

const normalizeSize = (size = 'md') => {
  const value = String(size).toLowerCase();
  if (value === 'sm' || value === 'small') return 'sm';
  if (value === 'lg' || value === 'large') return 'lg';
  return 'md';
};

export const Container = ({ fluid = false, className, ...props }) => (
  <div
    className={cn(fluid ? 'w-full' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}
    {...props}
  />
);

export const Row = ({ className, ...props }) => <div className={cn('flex flex-wrap -mx-3', className)} {...props} />;

export const Image = ({ className, ...props }) => (
  <img className={cn('max-w-full object-cover', className)} {...props} />
);

export const Col = ({ xs, sm, md, lg, xl, xxl, className, ...props }) => {
  const widths = {
    xs: 'w-full',
    sm: 'sm:w-1/2',
    md: 'md:w-1/2',
    lg: 'lg:w-1/3',
    xl: 'xl:w-1/4',
    xxl: '2xl:w-1/5',
  };

  const widthClass = widths[sm ? 'sm' : md ? 'md' : lg ? 'lg' : xl ? 'xl' : xs ? 'xs' : 'xs'];

  return <div className={cn('px-3', widthClass, className)} {...props} />;
};

export const Button = ({ variant, size, className, ...props }) => (
  <ButtonBase
    variant={toButtonVariant(variant)}
    size={normalizeSize(size)}
    className={className}
    {...props}
  />
);

export const Badge = ({ bg, color, children, className, ...props }) => (
  <BadgeBase bg={bg || color} className={className} {...props}>
    {children}
  </BadgeBase>
);

export const Card = Object.assign(
  ({ className, ...props }) => <CardBase className={className} {...props} />,
  {
    Body: ({ className, ...props }) => <CardBody className={className} {...props} />,
    Header: ({ className, ...props }) => <CardHeader className={className} {...props} />,
    Footer: ({ className, ...props }) => <CardFooter className={className} {...props} />,
    Title: ({ className, ...props }) => <h3 className={cn('text-lg font-semibold text-slate-900 dark:text-slate-100', className)} {...props} />,
    Text: ({ className, ...props }) => <p className={cn('text-sm text-slate-600 dark:text-slate-300', className)} {...props} />,
  },
);

export const Spinner = ({ className, ...props }) => (
  <div
    className={cn('inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
    {...props}
  />
);

export const Alert = (props) => <AlertBase {...props} />;

export const ProgressBar = ({ now = 0, variant = 'primary', className, label, ...props }) => {
  const value = Math.min(100, Math.max(0, Number(now) || 0));
  return (
    <div className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700', className)} {...props}>
      <progress
        aria-label={label || 'Progress'}
        className={cn(
          'absolute inset-0 h-full w-full appearance-none rounded-full [&::-moz-progress-bar]:rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:rounded-full',
          variant === 'success' && '[&::-moz-progress-bar]:bg-emerald-500 [&::-webkit-progress-value]:bg-emerald-500',
          variant === 'info' && '[&::-moz-progress-bar]:bg-sky-500 [&::-webkit-progress-value]:bg-sky-500',
          variant === 'warning' && '[&::-moz-progress-bar]:bg-amber-500 [&::-webkit-progress-value]:bg-amber-500',
          variant === 'danger' && '[&::-moz-progress-bar]:bg-red-500 [&::-webkit-progress-value]:bg-red-500',
          !['success', 'info', 'warning', 'danger'].includes(variant) && '[&::-moz-progress-bar]:bg-brand-600 [&::-webkit-progress-value]:bg-brand-600',
        )}
        max="100"
        value={value}
      />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
};

export const FormGroup = ({ className, ...props }) => <div className={cn('space-y-1.5', className)} {...props} />;
export const FormLabel = ({ className, ...props }) => <label className={cn('block text-sm font-medium text-slate-700 dark:text-slate-300', className)} {...props} />;
export const FormControl = ({ className, ...props }) => <InputBase className={className} {...props} />;
export const FormSelect = ({ className, ...props }) => (
  <select
    className={cn(
      'block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
      className,
    )}
    {...props}
  />
);
export const FormCheck = ({ className, label, children, ...props }) => (
  <label className={cn('flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300', className)}>
    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600" {...props} />
    {label || children}
  </label>
);
export const Form = Object.assign(
  ({ className, ...props }) => <form className={className} {...props} />,
  {
    Group: FormGroup,
    Label: FormLabel,
    Control: FormControl,
    Select: FormSelect,
    Text: ({ className, ...props }) => (
      <small className={cn('mt-1 block text-xs text-slate-500 dark:text-slate-400', className)} {...props} />
    ),
    Check: FormCheck,
  },
);

export const InputGroup = Object.assign(
  ({ className, ...props }) => <div className={cn('flex items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900', className)} {...props} />,
  {
    Text: ({ className, ...props }) => <span className={cn('flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300', className)} {...props} />,
  }
);

export const Table = Object.assign(
  ({ className, ...props }) => <TableBase className={className} {...props} />,
  {
    Header: THead,
    Body: TBody,
    Row: TR,
    Head: TH,
    Cell: TD,
  },
);

export const ListGroupItem = ({ className, ...props }) => <div className={cn('px-4 py-3', className)} {...props} />;
export const ListGroup = Object.assign(
  ({ className, ...props }) => (
    <div
      className={cn('divide-y divide-slate-200 rounded-xl border bg-white dark:divide-slate-700 dark:bg-slate-900', className)}
      {...props}
    />
  ),
  { Item: ListGroupItem },
);

export const TabContainer = ({ className, ...props }) => <div className={cn('w-full', className)} {...props} />;
export const Tabs = ({ className, children, ...props }) => <div className={cn('flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700', className)} {...props}>{children}</div>;
export const Tab = Object.assign(({ children, eventKey, ...props }) => <div data-event-key={eventKey} {...props}>{children}</div>, {
  Container: ({ children, activeKey, className, ...props }) => <div className={cn('w-full', className)} data-active-key={activeKey} {...props}>{children}</div>,
  Content: ({ children, className, ...props }) => <div className={cn('w-full', className)} {...props}>{children}</div>,
  Pane: ({ children, eventKey, className, ...props }) => <div className={cn('w-full', className)} data-event-key={eventKey} {...props}>{children}</div>,
});
export const Nav = ({ className, children, ...props }) => <div className={cn('flex flex-wrap gap-2', className)} {...props}>{children}</div>;
export const NavItem = ({ className, ...props }) => <div className={cn('inline-flex', className)} {...props} />;
export const NavLink = ({ className, active, eventKey, ...props }) => (
  <button type="button" className={cn('rounded-lg px-3 py-2 text-sm font-medium transition', active ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800', className)} {...props} />
);
Nav.Item = NavItem;
Nav.Link = NavLink;

export const OverlayTrigger = ({ children, overlay, ...props }) => <div {...props}>{children}{overlay}</div>;
export const Tooltip = ({ children, ...props }) => <span className="text-xs text-slate-700 dark:text-slate-200" {...props}>{children}</span>;

export const Pagination = Object.assign(
  ({ children, className, ...props }) => (
    <nav aria-label="Pagination" className={cn('flex items-center gap-1.5', className)} {...props}>
      {children}
    </nav>
  ),
  {
    Item: ({ active = false, disabled = false, children, className, ...props }) => (
      <button
        type="button"
        className={cn(
          'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition',
          active
            ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
          disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent dark:hover:bg-transparent',
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    ),
    First: ({ children = 'First', ...props }) => <Pagination.Item {...props}>{children}</Pagination.Item>,
    Prev: ({ children = 'Prev', ...props }) => <Pagination.Item {...props}>{children}</Pagination.Item>,
    Next: ({ children = 'Next', ...props }) => <Pagination.Item {...props}>{children}</Pagination.Item>,
    Last: ({ children = 'Last', ...props }) => <Pagination.Item {...props}>{children}</Pagination.Item>,
    Ellipsis: ({ children = '…', ...props }) => (
      <span className="inline-flex h-9 min-w-9 items-center justify-center text-sm text-slate-500 dark:text-slate-400" {...props}>
        {children}
      </span>
    ),
  }
);

const DropdownContext = createContext(null);

export const Dropdown = Object.assign(
  function Dropdown({ children, className, show, onToggle, ...props }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const rootRef = useRef(null);
    const controlled = typeof show === 'boolean';
    const open = controlled ? show : internalOpen;

    const toggle = () => {
      const nextOpen = !open;
      if (!controlled) setInternalOpen(nextOpen);
      onToggle?.(nextOpen);
    };

    useEffect(() => {
      if (!open || controlled) return undefined;
      const closeOnOutsideClick = (event) => {
        if (!rootRef.current?.contains(event.target)) setInternalOpen(false);
      };
      const closeOnEscape = (event) => {
        if (event.key === 'Escape') setInternalOpen(false);
      };
      document.addEventListener('pointerdown', closeOnOutsideClick);
      document.addEventListener('keydown', closeOnEscape);
      return () => {
        document.removeEventListener('pointerdown', closeOnOutsideClick);
        document.removeEventListener('keydown', closeOnEscape);
      };
    }, [open, controlled]);

    return (
        <DropdownContext.Provider value={{ open, toggle, close: () => { if (!controlled) setInternalOpen(false); onToggle?.(false); } }}>
        <div ref={rootRef} className={cn('relative inline-block', className)} {...props}>
          {children}
        </div>
      </DropdownContext.Provider>
    );
  },
  {
    Toggle: function DropdownToggle({ children, className, onClick, ...props }) {
      const dropdown = useContext(DropdownContext);
      return (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={Boolean(dropdown?.open)}
          onClick={(event) => {
            dropdown?.toggle();
            onClick?.(event);
          }}
          className={cn('inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800', className)}
          {...props}
        >
          {children}
        </button>
      );
    },
    Menu: function DropdownMenu({ children, className, ...props }) {
      const dropdown = useContext(DropdownContext);
      if (!dropdown?.open) return null;
      return (
        <div role="menu" className={cn('absolute right-0 z-20 mt-2 min-w-[180px] rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900', className)} {...props}>
          {children}
        </div>
      );
    },
    Item: function DropdownItem({ children, className, onClick, ...props }) {
      const dropdown = useContext(DropdownContext);
      return (
        <button
          type="button"
          role="menuitem"
          onClick={(event) => {
            dropdown?.close();
            onClick?.(event);
          }}
          className={cn('block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800', className)}
          {...props}
        >
          {children}
        </button>
      );
    },
    Divider: ({ className, ...props }) => (
      <div role="separator" className={cn('my-1 border-t border-slate-200 dark:border-slate-700', className)} {...props} />
    ),
  }
);

export const DropdownButton = ({ title, children, className, ...props }) => (
  <Dropdown className={className}>
    <Dropdown.Toggle {...props}>{title}</Dropdown.Toggle>
    <Dropdown.Menu>{children}</Dropdown.Menu>
  </Dropdown>
);

export const ButtonGroup = ({ className, ...props }) => (
  <div className={cn('inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900', className)} {...props} />
);

export const FloatingLabel = ({ label, children, className, ...props }) => (
  <div className={cn('relative', className)} {...props}>
    {children}
    {label ? <span className="pointer-events-none absolute left-3 top-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span> : null}
  </div>
);

export const Toast = ({ show = true, children, className, ...props }) => {
  if (!show) return null;
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900', className)} {...props}>
      {children}
    </div>
  );
};

Toast.Header = ({ children, className, ...props }) => (
  <div className={cn('mb-2 flex items-center justify-between text-sm font-semibold', className)} {...props}>
    {children}
  </div>
);
Toast.Body = ({ children, className, ...props }) => (
  <div className={cn('text-sm text-slate-600 dark:text-slate-300', className)} {...props}>
    {children}
  </div>
);

export const ToastContainer = ({ className, ...props }) => (
  <div className={cn('pointer-events-none fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-3', className)} {...props} />
);

export const Accordion = Object.assign(
  ({ children, className, ...props }) => <div className={cn('space-y-2', className)} {...props}>{children}</div>,
  {
    Item: ({ children, className, ...props }) => <div className={cn('overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900', className)} {...props}>{children}</div>,
    Header: ({ children, className, ...props }) => <button type="button" className={cn('flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800', className)} {...props}>{children}</button>,
    Body: ({ children, className, ...props }) => <div className={cn('border-t border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300', className)} {...props}>{children}</div>,
  }
);

export const Navbar = Object.assign(
  ({ children, className, ...props }) => <nav className={cn('flex items-center justify-between', className)} {...props}>{children}</nav>,
  {
    Brand: ({ children, className, ...props }) => <div className={cn('text-lg font-semibold text-slate-900 dark:text-slate-100', className)} {...props}>{children}</div>,
    Toggle: ({ children, className, ...props }) => <button type="button" className={cn('rounded-lg border border-slate-200 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200', className)} {...props}>{children}</button>,
    Collapse: ({ children, className, ...props }) => <div className={cn('flex items-center gap-3', className)} {...props}>{children}</div>,
  }
);

const ModalRoot = ({ show = false, children, className, onHide, ...props }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={onHide}>
      <div className={cn('w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900', className)} onMouseDown={(event) => event.stopPropagation()} {...props}>
        {children}
      </div>
    </div>
  );
};

export const Offcanvas = Object.assign(
  ({ show = false, onHide, placement = 'end', className, children, ...props }) => {
    if (!show) return null;

    const placementClasses = {
      start: 'left-0 top-0 h-full rounded-r-2xl',
      end: 'right-0 top-0 h-full rounded-l-2xl',
      top: 'left-0 top-0 w-full rounded-b-2xl',
      bottom: 'left-0 bottom-0 w-full rounded-t-2xl',
    };

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/50" onClick={onHide}>
        <div
          className={cn(
            'absolute flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform dark:bg-slate-900',
            placementClasses[placement] || placementClasses.end,
            className,
          )}
          onClick={(event) => event.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
  {
    Header: ({ className, children, ...props }) => <div className={cn('flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700', className)} {...props}>{children}</div>,
    Title: ({ className, children, ...props }) => <h3 className={cn('text-lg font-semibold text-slate-900 dark:text-slate-100', className)} {...props}>{children}</h3>,
    Body: ({ className, children, ...props }) => <div className={cn('flex-1 overflow-y-auto p-4', className)} {...props}>{children}</div>,
  },
);

export const ModalHeader = ({ className, ...props }) => <div className={cn('mb-4 flex items-center justify-between', className)} {...props} />;
export const ModalTitle = ({ className, ...props }) => <h3 className={cn('text-lg font-semibold text-slate-900 dark:text-slate-100', className)} {...props} />;
export const ModalBody = ({ className, ...props }) => <div className={cn('space-y-3', className)} {...props} />;
export const ModalFooter = ({ className, ...props }) => <div className={cn('mt-5 flex justify-end gap-3', className)} {...props} />;
export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Title: ModalTitle,
  Body: ModalBody,
  Footer: ModalFooter,
});

export default {
  Container,
  Row,
  Col,
  Image,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  ProgressBar,
  Form,
  FormGroup,
  FormLabel,
  FormControl,
  FormSelect,
  InputGroup,
  Table,
  ListGroup,
  ListGroupItem,
  TabContainer,
  Tabs,
  Tab,
  Nav,
  NavItem,
  NavLink,
  Dropdown,
  Modal,
  Offcanvas,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  OverlayTrigger,
  Tooltip,
  Pagination,
  ButtonGroup,
  FloatingLabel,
  Toast,
  ToastContainer,
  Accordion,
  Navbar,
};
