import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type AlertVariant = 'error' | 'info' | 'success' | 'warning';

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = 'error', children, className }: AlertProps) {
  return (
    <div className={cn('alert', `alert--${variant}`, className)} role="alert">
      {children}
    </div>
  );
}
