import type { ReactNode } from 'react';

interface AuthHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
}

export function AuthHeader({ eyebrow, title, subtitle }: AuthHeaderProps) {
  return (
    <header className="auth-head">
      {eyebrow && <p className="auth-eyebrow">{eyebrow}</p>}
      <h1 className="auth-title">{title}</h1>
      {subtitle && <p className="auth-sub">{subtitle}</p>}
    </header>
  );
}
