import { useState } from 'react';
import Input from '../ui/Input';
import { useFormContext } from './FormValidation';

export default function FormInput({ name, label, type = 'text', placeholder, value, onChange, onBlur, error, touched, required = false, disabled = false, readOnly = false, validate, validators = [], size = 'medium', fullWidth = true, multiline = false, rows = 4, maxRows, startIcon, endIcon, startAdornment, endAdornment, autoComplete, autoFocus = false, showCharCount = false, maxLength, helperText, description, customErrorMessages = {}, mask, maskChar = '_', parse, onValueChange, onValidation, showPasswordToggle = true, ...props }) {
  const [localError, setLocalError] = useState('');
  const [isTouched, setIsTouched] = useState(Boolean(touched));
  const formContext = useFormContext();
  const fieldValue = formContext?.values?.[name] ?? value ?? '';
  const fieldError = formContext?.errors?.[name] ?? error ?? localError;
  const fieldTouched = formContext?.touched?.[name] ?? touched ?? isTouched;

  const applyMask = (input) => {
    if (!mask) return input;
    let result = ''; let index = 0;
    for (const token of mask) {
      if (token === '9' || token === 'A' || token === '*') {
        const character = input[index++];
        if (character == null) break;
        if (token === '9' && !/[0-9]/.test(character)) continue;
        if (token === 'A' && !/[a-zA-Z]/.test(character)) continue;
        result += character;
      } else result += token;
    }
    return result;
  };
  const validateField = (nextValue) => {
    if (required && !String(nextValue).trim()) return customErrorMessages.required || `${label} is required`;
    for (const validator of validators) { const validationError = validator(nextValue); if (validationError) return validationError; }
    return validate?.(nextValue) || '';
  };
  const handleChange = (event) => {
    let nextValue = event.target.value;
    if (parse) nextValue = parse(nextValue);
    if (mask) nextValue = applyMask(nextValue);
    const validationError = validateField(nextValue);
    setLocalError(validationError);
    if (formContext) { formContext.setFieldValue(name, nextValue); formContext.setFieldError(name, validationError); }
    onChange?.({ ...event, target: { ...event.target, value: nextValue } });
    onValueChange?.(nextValue); onValidation?.(validationError);
  };
  const handleBlur = (event) => { setIsTouched(true); formContext?.setFieldTouched(name, true); onBlur?.(event); };

  return <Input {...props} id={name} name={name} label={label} type={type} value={fieldValue} onChange={handleChange} onBlur={handleBlur} error={fieldTouched ? fieldError : ''} hint={description || helperText} disabled={disabled} readOnly={readOnly} required={required} size={size} fullWidth={fullWidth} multiline={multiline} rows={rows} maxRows={maxRows} startIcon={startIcon} endIcon={endIcon} startAdornment={startAdornment} endAdornment={endAdornment} autoComplete={autoComplete} autoFocus={autoFocus} showCharCount={showCharCount} charCountMax={maxLength} showPasswordToggle={showPasswordToggle} />;
}
