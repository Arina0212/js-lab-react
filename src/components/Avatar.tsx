import { cn } from '../lib/cn';
import { initials } from '../lib/format';

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ firstName, lastName, size = 'md', className }: AvatarProps) {
  return (
    <span className={cn('avatar', `avatar--${size}`, className)} aria-hidden="true">
      {initials(firstName, lastName)}
    </span>
  );
}
