import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthError, useAuth } from '../auth/AuthContext';
import { PROVIDER_LIST } from '../lib/providers';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../components/Toast';
import { AuthLayout } from '../components/AuthLayout';
import { AuthHeader } from '../components/AuthHeader';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { PasswordField } from '../components/PasswordField';
import { TextField } from '../components/TextField';
import { ProviderButton } from '../components/ProviderButton';
import { PasskeyIcon } from '../components/PasskeyIcon';
import { AlertCircleIcon } from '../components/Icons';

interface LoginErrors {
  identifier?: string;
  password?: string;
  form?: string;
}

export function LoginPage() {
  const { login, loginWithPasskey, passkeysAvailable } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  usePageTitle('Вход');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const from =
    typeof (location.state as { from?: unknown } | null)?.from === 'string'
      ? (location.state as { from: string }).from
      : '/';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: LoginErrors = {};
    if (!identifier.trim()) nextErrors.identifier = 'Введите почту или имя пользователя';
    if (!password) nextErrors.password = 'Введите пароль';
    if (nextErrors.identifier || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await login(identifier, password, remember);
      showToast('Вы вошли в аккаунт');
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof AuthError) {
        const field = error.field === 'identifier' || error.field === 'password' ? error.field : 'form';
        setErrors({ [field]: error.message });
      } else {
        setErrors({ form: 'Не удалось войти. Попробуйте ещё раз.' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasskey() {
    setErrors({});
    setPasskeyLoading(true);
    try {
      await loginWithPasskey();
      showToast('Вход по passkey выполнен');
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof AuthError) {
        setErrors({ form: error.message });
      } else {
        setErrors({ form: 'Не удалось войти по passkey.' });
      }
    } finally {
      setPasskeyLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthHeader
        eyebrow="С возвращением"
        title="Вход в аккаунт"
        subtitle="Введите почту или имя пользователя и пароль."
      />

      {errors.form && (
        <Alert>
          <AlertCircleIcon size={18} />
          <span>{errors.form}</span>
        </Alert>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Почта или имя пользователя"
          name="identifier"
          value={identifier}
          onChange={(event) => {
            setIdentifier(event.target.value);
            setErrors((current) => ({ ...current, identifier: undefined, form: undefined }));
          }}
          error={errors.identifier}
          autoComplete="username"
          autoFocus
          placeholder="you@example.com"
        />
        <PasswordField
          label="Пароль"
          name="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({ ...current, password: undefined, form: undefined }));
          }}
          error={errors.password}
          autoComplete="current-password"
          placeholder="Ваш пароль"
        />

        <div className="form-row form-row--between">
          <Checkbox checked={remember} onCheckedChange={setRemember}>
            Запомнить меня
          </Checkbox>
          <Link className="link link--small" to="/forgot-password">
            Забыли пароль?
          </Link>
        </div>

        <Button type="submit" block loading={submitting}>
          Войти
        </Button>
      </form>

      <div className="divider">или войдите через</div>

      <div className="providers">
        {PROVIDER_LIST.map((provider) => (
          <ProviderButton
            key={provider.id}
            provider={provider.id}
            onClick={() => navigate(`/oauth/${provider.id}`)}
            disabled={submitting || passkeyLoading}
          />
        ))}
      </div>

      <Button
        variant="secondary"
        block
        icon={<PasskeyIcon size={19} />}
        onClick={handlePasskey}
        loading={passkeyLoading}
        disabled={submitting || !passkeysAvailable}
        title={passkeysAvailable ? undefined : 'Браузер не поддерживает passkey'}
      >
        {passkeyLoading ? 'Проверяем passkey' : 'Войти с passkey'}
      </Button>

      <p className="auth-switch">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>

      <div className="demo-note">
        <div className="demo-note-head">Демо-доступ</div>
        <div className="demo-note-body">
          <span>demo@example.com</span>
          <span className="demo-note-slash">/</span>
          <code>demo1234</code>
        </div>
      </div>
    </AuthLayout>
  );
}
