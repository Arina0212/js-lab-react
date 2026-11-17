import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AuthError, useAuth } from '../auth/AuthContext';
import { PROVIDERS, isProviderId } from '../lib/providers';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../components/Toast';
import { Alert } from '../components/Alert';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { ProviderIcon } from '../components/ProviderIcon';
import { Splash } from '../components/Splash';
import {
  AlertCircleIcon,
  CheckIcon,
  ShieldIcon,
} from '../components/Icons';

export function OAuthPage() {
  const { provider } = useParams<{ provider: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, ready, loginWithOAuth, connectOAuth } = useAuth();
  const { showToast } = useToast();
  const mode = new URLSearchParams(location.search).get('mode') === 'connect' ? 'connect' : 'login';
  const config = isProviderId(provider) ? PROVIDERS[provider] : null;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  usePageTitle(config ? `Вход через ${config.name}` : 'Вход через сервис');

  if (!ready) return <Splash />;
  if (!config) return <Navigate to="/login" replace />;
  if (mode === 'connect' && !user) {
    return <Navigate to="/login" replace state={{ from: '/?section=security' }} />;
  }
  if (mode === 'login' && user) return <Navigate to="/" replace />;

  const account = config.account;
  const nameParts = account.name.split(' ');
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ');

  async function handleContinue() {
    if (!config) return;
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'connect') {
        await connectOAuth(config.id, account);
        showToast(`${config.name} подключён к аккаунту`);
        navigate('/?section=security');
      } else {
        await loginWithOAuth(config.id, account);
        showToast(`Вы вошли через ${config.name}`);
        navigate('/');
      }
    } catch (authError) {
      setError(
        authError instanceof AuthError
          ? authError.message
          : 'Не удалось завершить вход. Попробуйте ещё раз.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate(mode === 'connect' ? '/?section=security' : '/login');
  }

  return (
    <div className="oauth-shell">
      <header className="oauth-topbar">
        <Logo />
        <span className="oauth-topbar-line" aria-hidden="true" />
        <span className="oauth-provider">
          <ProviderIcon provider={config.id} size={20} />
          {config.name}
        </span>
        <Badge tone="warning">демо</Badge>
      </header>

      <main className="oauth-main">
        <div className="oauth-card">
          <div className="oauth-logos" aria-hidden="true">
            <span className="oauth-logo">
              <ProviderIcon provider={config.id} size={32} />
            </span>
            <span className="oauth-link-dots">
              <span />
              <span />
              <span />
            </span>
            <span className="oauth-logo oauth-logo--app">
              <Logo compact />
            </span>
          </div>

          <h1 className="oauth-title">
            {mode === 'connect' ? `Подключить ${config.name}` : 'Войти в Aurora'}
          </h1>
          <p className="oauth-sub">
            {mode === 'connect'
              ? `Разрешите Aurora использовать аккаунт ${config.name} для входа.`
              : `Продолжите как ${account.name}, чтобы вернуться в личный кабинет.`}
          </p>

          {error && (
            <Alert>
              <AlertCircleIcon size={18} />
              <span>{error}</span>
            </Alert>
          )}

          <div className="oauth-account">
            <Avatar firstName={firstName} lastName={lastName} size="sm" />
            <div className="oauth-account-body">
              <strong>{account.name}</strong>
              <span>{account.email}</span>
            </div>
            <span className="oauth-account-check" aria-label="Выбранный аккаунт">
              <CheckIcon size={16} strokeWidth={2.2} />
            </span>
          </div>

          <div className="oauth-permissions">
            <p>
              <ShieldIcon size={16} />
              Aurora получит доступ к:
            </p>
            <ul>
              <li>
                <CheckIcon size={15} /> имени и фамилии
              </li>
              <li>
                <CheckIcon size={15} /> адресу почты
              </li>
            </ul>
          </div>

          <Button block loading={submitting} onClick={handleContinue}>
            Продолжить
          </Button>
          <button type="button" className="oauth-cancel" onClick={handleCancel}>
            Отмена
          </button>

          <p className="oauth-note">
            Это демонстрация OAuth. Запрос к {config.name} не отправляется, данные не покидают
            браузер.
          </p>
        </div>

        {mode === 'connect' && user && (
          <p className="oauth-footer-note">Подключение к аккаунту {user.email}</p>
        )}
      </main>
    </div>
  );
}
