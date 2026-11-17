import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  children: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({ children, onCheckedChange, className, ...rest }: CheckboxProps) {
  return (
    <label className={cn('checkbox', className)}>
      <input
        type="checkbox"
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        {...rest}
      />
      <span className="checkbox-box" aria-hidden="true" />
      <span className="checkbox-label">{children}</span>
    </label>
  );
}
