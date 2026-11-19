import { cn } from '../../lib/cn';

export function Card({ className, ...props }) {
  return <section className={cn('rounded-xl border bg-white shadow-card dark:bg-slate-900', className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex items-start justify-between gap-4 p-5 sm:p-6', className)} {...props} />;
}

export function CardBody({ className, ...props }) {
  return <div className={cn('p-5 pt-0 sm:p-6 sm:pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center gap-3 border-t px-5 py-4 sm:px-6', className)} {...props} />;
}

export default Card;
