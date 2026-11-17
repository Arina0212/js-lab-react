import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type BadgeTone = 'success' | 'muted' | 'warning' | 'accent';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'muted', children, className }: BadgeProps) {
  return <span className={cn('badge', `badge--${tone}`, className)}>{children}</span>;
}
