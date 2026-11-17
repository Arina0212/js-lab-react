import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthError, useAuth } from '../auth/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../components/Toast';
import { AuthLayout } from '../components/AuthLayout';
import { AuthHeader } from '../components/AuthHeader';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { CodeInput } from '../components/CodeInput';
import { AlertCircleIcon, ArrowLeftIcon } from '../components/Icons';

export function ConfirmEmailPage() {
  const { pending, confirmRegistration, resendConfirmation } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  usePageTitle('Подтверждение почты');

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(60);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  if (!pending) {
    return <Navigate to="/register" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (code.length !== 6) {
      setError('Введите все шесть цифр из письма');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await confirmRegistration(code);
      showToast('Почта подтверждена. Добро пожаловать в Aurora!');
      navigate('/', { replace: true });
    } catch (authError) {
      if (authError instanceof AuthError) {
        setError(authError.message);
      } else {
        setError('Не удалось подтвердить почту. Попробуйте ещё раз.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await resendConfirmation();
      setResendIn(60);
      setError(null);
      showToast('Код отправлен повторно', 'info');
    } catch (authError) {
      setError(authError instanceof AuthError ? authError.message : 'Не удалось отправить код');
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout>
      <div className="step-track" aria-label="Шаг 2 из 2">
        <span className="step-track__item step-track__item--done">Данные</span>
        <span className="step-track__line step-track__line--done" />
        <span className="step-track__item step-track__item--current">Подтверждение</span>
      </div>

      <AuthHeader
        eyebrow="Шаг 2 из 2"
        title="Проверьте почту"
        subtitle={
          <>
            Отправили шестизначный код на <strong>{pending.email}</strong>. Введите его ниже.
          </>
        }
      />

      {error && (
        <Alert>
          <AlertCircleIcon size={18} />
          <span>{error}</span>
        </Alert>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <CodeInput
          value={code}
          onChange={(value) => {
            setCode(value);
            setError(null);
          }}
          error={Boolean(error)}
          disabled={submitting}
          autoFocus
        />

        <Button type="submit" block loading={submitting} disabled={code.length !== 6}>
          Подтвердить
        </Button>

        <div className="resend-row">
          {resendIn > 0 ? (
            <span>
              Отправить код повторно через 0:{String(resendIn).padStart(2, '0')}
            </span>
          ) : (
            <button
              type="button"
              className="link-button"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? 'Отправляем…' : 'Отправить код ещё раз'}
            </button>
          )}
        </div>
      </form>

      <div className="demo-note demo-note--inline">
        <div className="demo-note-head">Демо-код</div>
        <div className="demo-note-body">
          <code>000000</code>
          <button
            type="button"
            className="demo-fill"
            onClick={() => {
              setCode('000000');
              setError(null);
            }}
          >
            Подставить
          </button>
        </div>
      </div>

      <Link className="back-link" to="/register">
        <ArrowLeftIcon size={17} />
        Изменить данные
      </Link>
    </AuthLayout>
  );
}
