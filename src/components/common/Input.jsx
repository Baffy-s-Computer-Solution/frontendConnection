import React, { forwardRef, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Search, X, CircleAlert } from 'lucide-react';
import { cn } from '../../lib/cn';

const Input = forwardRef(function Input({ label, type = 'text', value = '', onChange, onBlur, onFocus, onKeyDown, placeholder, disabled = false, readOnly = false, required = false, error, success, helperText, size = 'medium', fullWidth = true, multiline = false, rows = 4, maxRows, startIcon, endIcon, startAdornment, endAdornment, min, max, minLength, maxLength, pattern, search = false, onSearch, onClear, showPasswordToggle = false, format, onFormat, autoComplete, autoFocus = false, showCharCount = false, charCountMax, className, id, ...props }, ref) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputValue = value ?? '';
  const inputType = type === 'password' && showPassword ? 'text' : type;
  const sizeClass = size === 'small' ? 'min-h-8 text-xs' : size === 'large' ? 'min-h-12 text-base' : 'min-h-10 text-sm';

  const handleChange = (event) => {
    if (format && onFormat) {
      const formatted = onFormat(event.target.value);
      event.target.value = formatted;
    }
    onChange?.(event);
    if (search) onSearch?.(event.target.value);
  };
  const handleKeyDown = (event) => {
    if (search && event.key === 'Enter') onSearch?.(inputValue);
    onKeyDown?.(event);
  };
  const clear = () => {
    onClear?.();
    if (!onClear) onChange?.({ target: { value: '' } });
  };
  const charCount = String(inputValue).length;

  return <div className={cn('space-y-1.5', fullWidth ? 'w-full' : 'w-auto')}>
    {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}{required && <span className="ml-1 text-danger">*</span>}</label>}
    <div className="relative">
      {(search || startIcon || startAdornment) && <span className="pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center text-slate-400">{search ? <Search className="h-4 w-4" /> : startIcon || startAdornment}</span>}
      {multiline ? <textarea ref={ref} id={id} value={inputValue} onChange={handleChange} onBlur={(event) => { setFocused(false); onBlur?.(event); }} onFocus={(event) => { setFocused(true); onFocus?.(event); }} placeholder={placeholder} disabled={disabled} readOnly={readOnly} required={required} rows={rows} maxLength={showCharCount ? charCountMax : maxLength} minLength={minLength} autoComplete={autoComplete} autoFocus={autoFocus} className={cn('block w-full rounded-lg border bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100', (search || startIcon || startAdornment) && 'pl-9', (error || success || endIcon || endAdornment) && 'pr-9', focused && 'ring-2 ring-brand-500/30', error && 'border-danger focus:border-danger focus:ring-danger/30', success && !error && 'border-success focus:border-success focus:ring-success/30', className)} style={maxRows ? { maxHeight: `${maxRows * 1.5}rem` } : undefined} {...props} /> : <input ref={ref} id={id} type={inputType} value={inputValue} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={(event) => { setFocused(false); onBlur?.(event); }} onFocus={(event) => { setFocused(true); onFocus?.(event); }} placeholder={placeholder} disabled={disabled} readOnly={readOnly} required={required} min={min} max={max} minLength={minLength} maxLength={showCharCount ? charCountMax : maxLength} pattern={pattern} autoComplete={autoComplete} autoFocus={autoFocus} className={cn('block w-full rounded-lg border bg-white px-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100', sizeClass, (search || startIcon || startAdornment) && 'pl-9', (error || success || endIcon || endAdornment || (type === 'password' && showPasswordToggle) || (search && inputValue)) && 'pr-9', error && 'border-danger focus:border-danger focus:ring-danger/30', success && !error && 'border-success focus:border-success focus:ring-success/30', className)} {...props} />}
      <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 text-slate-400">
        {search && inputValue && <button type="button" onClick={clear} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Clear search"><X className="h-4 w-4" /></button>}
        {type === 'password' && showPasswordToggle && <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
        {error && <CircleAlert className="h-4 w-4 text-danger" />}
        {success && !error && inputValue && <CheckCircle2 className="h-4 w-4 text-success" />}
        {!error && !success && !(type === 'password' && showPasswordToggle) && endIcon}
        {!error && !success && endAdornment}
      </span>
    </div>
    {(helperText || (showCharCount && charCountMax)) && <div className="flex justify-between gap-3 text-xs"><span className={error ? 'text-danger' : 'text-slate-500 dark:text-slate-400'}>{helperText}</span>{showCharCount && charCountMax && <span className="text-slate-500">{charCount} / {charCountMax}</span>}</div>}
  </div>;
});

export const SearchInput = (props) => <Input search {...props} />;
export const PasswordInput = (props) => <Input type="password" showPasswordToggle {...props} />;
export const TextArea = (props) => <Input multiline rows={4} {...props} />;
export default Input;
