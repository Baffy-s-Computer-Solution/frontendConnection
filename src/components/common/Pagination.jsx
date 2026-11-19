import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Pagination({ page = 1, count = 0, rowsPerPage = 10, onPageChange, onRowsPerPageChange, showFirstButton = true, showLastButton = true, showPageSize = true, showPageInfo = true, siblingCount = 1, rowsPerPageOptions = [5, 10, 25, 50, 100], disabled = false, hidePrevNext = false, className }) {
  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));
  const changePage = (nextPage) => nextPage >= 1 && nextPage <= totalPages && !disabled && onPageChange?.(nextPage);
  const pages = [];
  const start = Math.max(2, page - siblingCount);
  const end = Math.min(totalPages - 1, page + siblingCount);
  pages.push(1);
  if (start > 2) pages.push('start-ellipsis');
  for (let index = start; index <= end; index += 1) pages.push(index);
  if (end < totalPages - 1) pages.push('end-ellipsis');
  if (totalPages > 1) pages.push(totalPages);

  const pageButton = (label, nextPage, Icon) => <button type="button" disabled={disabled || nextPage < 1 || nextPage > totalPages} onClick={() => changePage(nextPage)} className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm text-slate-600 transition hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={label}>{Icon ? <Icon className="h-4 w-4" /> : label}</button>;

  return <div className={cn('flex flex-wrap items-center justify-between gap-4 border-t px-4 py-4', className)}><div className="flex flex-wrap items-center gap-3">{showPageInfo && <span className="text-sm text-slate-500">Showing {count === 0 ? 0 : (page - 1) * rowsPerPage + 1} - {Math.min(page * rowsPerPage, count)} of {count} results</span>}{showPageSize && <label className="flex items-center gap-2 text-sm text-slate-500">Rows<select value={rowsPerPage} onChange={(event) => { onRowsPerPageChange?.(Number(event.target.value)); onPageChange?.(1); }} className="h-9 rounded-lg border bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">{rowsPerPageOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>}</div><div className="flex items-center gap-1">{showFirstButton && !hidePrevNext && pageButton('First page', 1, ChevronsLeft)}{!hidePrevNext && pageButton('Previous page', page - 1, ChevronLeft)}{pages.map((item) => item === 'start-ellipsis' || item === 'end-ellipsis' ? <span key={item} className="inline-flex h-9 w-9 items-center justify-center text-slate-400"><MoreHorizontal className="h-4 w-4" /></span> : <button type="button" key={item} disabled={disabled} onClick={() => changePage(item)} className={cn('inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition', page === item ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800')}>{item}</button>)}{!hidePrevNext && pageButton('Next page', page + 1, ChevronRight)}{showLastButton && !hidePrevNext && pageButton('Last page', totalPages, ChevronsRight)}</div></div>;
}
