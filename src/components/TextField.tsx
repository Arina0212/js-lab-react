import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
  optional?: boolean;
  prefix?: string;
  addon?: ReactNode;
}

export function TextField({
  label,
  error,
  hint,
  optional = false,
  prefix,
  addon,
  id,
  className,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn('field', className)}>
      <label className="field-label" htmlFor={inputId}>
        <span className="field-label-text">
          {label}
          {!optional && (
            <span className="field-required" aria-hidden="true">
              *
            </span>
          )}
        </span>
      </label>
      <div className={cn('input-wrap', prefix && 'input-wrap--prefix')}>
        {prefix && (
          <span className="input-prefix" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'input',
            prefix && 'input--prefixed',
            Boolean(addon) && 'input--with-addon',
            error && 'input--invalid',
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          required={!optional}
          {...rest}
        />
        {addon && <span className="input-addon">{addon}</span>}
      </div>
      {error ? (
        <p className="field-error" id={`${inputId}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint" id={`${inputId}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
