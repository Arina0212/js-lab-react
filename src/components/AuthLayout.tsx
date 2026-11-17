import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Logo } from './Logo';
import { ProviderIcon } from './ProviderIcon';
import { PasskeyIcon } from './PasskeyIcon';
import { KeyIcon, ShieldIcon } from './Icons';

interface AuthLayoutProps {
  children: ReactNode;
  wide?: boolean;
}

export function AuthLayout({ children, wide = false }: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="aside-top">
          <Logo inverse />
        </div>

        <div className="aside-copy">
          <p className="aside-kicker">Единый аккаунт</p>
          <h1 className="aside-title">Вход, профиль и безопасность</h1>
          <p className="aside-lead">
            Пароль, passkey или аккаунт Яндекса, Google и VK. Способы входа и данные профиля
            меняются в личном кабинете.
          </p>
        </div>

        <div className="aside-visual" aria-hidden="true">
          <span className="visual-ring visual-ring--one" />
          <span className="visual-ring visual-ring--two" />
          <span className="visual-ring visual-ring--three" />
          <span className="visual-core">
            <ShieldIcon size={34} strokeWidth={1.5} />
          </span>
          <span className="visual-chip visual-chip--passkey">
            <PasskeyIcon size={16} tone="light" />
            Passkey
          </span>
          <span className="visual-chip visual-chip--oauth">
            <ProviderIcon provider="yandex" size={16} />
            Яндекс ID
          </span>
          <span className="visual-chip visual-chip--password">
            <KeyIcon size={15} />
            Пароль
          </span>
        </div>

        <p className="aside-note">
          <span className="aside-note-dot" aria-hidden="true" />
          Демо-режим. Данные хранятся только в этом браузере, код подтверждения 000000.
        </p>
      </aside>

      <main className="auth-main">
        <div className="auth-mobile-brand">
          <Logo />
        </div>
        <div className={cn('auth-card', wide && 'auth-card--wide')}>{children}</div>
      </main>
    </div>
  );
}
