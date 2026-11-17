import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { cn } from '../lib/cn';
import { formatDate, greetingForNow, pluralize } from '../lib/format';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../components/Toast';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Logo } from '../components/Logo';
import { ProfileSection } from '../components/dashboard/ProfileSection';
import { SecuritySection } from '../components/dashboard/SecuritySection';
import {
  CheckIcon,
  ClockIcon,
  InfoIcon,
  LogOutIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
} from '../components/Icons';

type Section = 'profile' | 'security';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const section: Section = searchParams.get('section') === 'security' ? 'security' : 'profile';
  usePageTitle(section === 'security' ? 'Безопасность' : 'Личный кабинет');

  if (!user) return null;

  const methodCount =
    (user.passwordHash ? 1 : 0) + Object.keys(user.oauth).length + user.passkeys.length;

  function setSection(next: Section) {
    if (next === 'security') {
      setSearchParams({ section: 'security' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

  function handleLogout() {
    logout();
    showToast('Вы вышли из аккаунта', 'info');
    navigate('/login', { replace: true });
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <Logo />
            <span className="topbar-sep" aria-hidden="true" />
            <span className="topbar-caption">Личный кабинет</span>
          </div>
          <div className="topbar-right">
            <div className="user-chip">
              <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
              <div className="user-chip-text">
                <strong>{user.firstName}</strong>
                <span>{user.email}</span>
              </div>
            </div>
            <button
              type="button"
              className="icon-button icon-button--bordered"
              onClick={handleLogout}
              aria-label="Выйти из аккаунта"
              title="Выйти"
            >
              <LogOutIcon size={19} />
            </button>
          </div>
        </div>
      </header>

      <main className="account-layout">
        <aside className="account-sidebar">
          <div className="account-card">
            <div className="account-card-top">
              <Avatar firstName={user.firstName} lastName={user.lastName} size="lg" />
              <span className="account-presence" aria-hidden="true" />
            </div>
            <h2 className="account-name">
              {user.lastName} {user.firstName}
            </h2>
            <p className="account-username">@{user.username}</p>

            <div className="account-meta">
              <span className="account-meta-row">
                <MailIcon size={15} />
                <span>{user.email}</span>
              </span>
              <span className="account-meta-row">
                <ClockIcon size={15} />
                На Aurora с {formatDate(user.createdAt)}
              </span>
            </div>

            <div className="account-badges">
              <Badge tone="success">
                <CheckIcon size={12} strokeWidth={2.4} />
                Почта подтверждена
              </Badge>
              <Badge tone="muted">
                {methodCount} {pluralize(methodCount, 'способ', 'способа', 'способов')} входа
              </Badge>
            </div>
          </div>

          <nav className="account-nav" aria-label="Разделы личного кабинета">
            <button
              type="button"
              className={cn('account-nav__item', section === 'profile' && 'is-active')}
              onClick={() => setSection('profile')}
              aria-current={section === 'profile' ? 'page' : undefined}
            >
              <UserIcon size={18} />
              Общие данные
            </button>
            <button
              type="button"
              className={cn('account-nav__item', section === 'security' && 'is-active')}
              onClick={() => setSection('security')}
              aria-current={section === 'security' ? 'page' : undefined}
            >
              <ShieldIcon size={18} />
              Безопасность
            </button>
          </nav>

          <p className="sidebar-note">
            <InfoIcon size={15} />
            Демо-проект. Аккаунт хранится только в localStorage этого браузера.
          </p>
        </aside>

        <section className="account-content">
          <header className="account-heading">
            <p className="page-eyebrow">
              {section === 'profile' ? 'Профиль' : 'Настройки входа'}
            </p>
            <h1>
              {section === 'profile'
                ? `${greetingForNow()}, ${user.firstName}`
                : 'Безопасность аккаунта'}
            </h1>
            <p className="page-sub">
              {section === 'profile'
                ? 'Проверьте контактные данные и имя пользователя. Изменения сохраняются вручную.'
                : 'Пароль, сервисы входа и passkey. Двухфакторная защита появится позже.'}
            </p>
          </header>

          {section === 'profile' ? (
            <ProfileSection user={user} />
          ) : (
            <SecuritySection user={user} />
          )}

          <footer className="account-footer">
            <span>Aurora · демо-аккаунт</span>
            <span>Без сервера: данные не покидают браузер</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
