import passkeyIcon from '../assets/icons/passkey.svg';
import { cn } from '../lib/cn';

interface PasskeyIconProps {
  size?: number;
  tone?: 'ink' | 'light';
  className?: string;
}

export function PasskeyIcon({ size = 20, tone = 'ink', className }: PasskeyIconProps) {
  return (
    <img
      src={passkeyIcon}
      width={size}
      height={size}
      className={cn('passkey-icon', `passkey-icon--${tone}`, className)}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
