import { cn } from '../lib/cn';

interface LogoProps {
  inverse?: boolean;
  compact?: boolean;
  className?: string;
}

export function Logo({ inverse = false, compact = false, className }: LogoProps) {
  return (
    <span className={cn('logo', inverse && 'logo--inverse', className)} aria-label="Aurora">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" focusable="false">
          <path
            d="M9 23.5 16 8.5l7 15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="19.4" r="2.2" fill="currentColor" />
        </svg>
      </span>
      {!compact && <span className="logo-word">Aurora</span>}
    </span>
  );
}
