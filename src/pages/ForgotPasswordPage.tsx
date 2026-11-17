import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthError, useAuth } from '../auth/AuthContext';
import { CONFIRMATION_CODE } from '../lib/storage';
import {
  validateEmail,
  validatePassword,
  validatePasswordRepeat,
} from '../lib/validation';
import { cn } from '../lib/cn';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../components/Toast';
import { AuthLayout } from '../components/AuthLayout';
import { AuthHeader } from '../components/AuthHeader';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { CodeInput } from '../components/CodeInput';
import { PasswordField } from '../components/PasswordField';
import { PasswordStrength } from '../components/PasswordStrength';
import { TextField } from '../components/TextField';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckIcon,
} from '../components/Icons';

type Step = 1 | 2 | 3;

const STEP_LABELS = ['Почта', 'Код', 'Пароль'];

export function ForgotPasswordPage() {
  const { requestPasswordReset, resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  usePageTitle('Восстановление доступа');

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(60);

  useEffect(() => {
    if (step !== 2 || resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn, step]);

  function goBack() {
    setErrors({});
    if (step === 1) {
      navigate('/login');
    } else {
      setStep((current) => (current === 3 ? 2 : 1));
    }
  }

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      await requestPasswordReset(email);
      setStep(2);
      setResendIn(60);
      showToast('Код восстановления отправлен на почту', 'info');
    } catch (error) {
      setErrors({
        email: error instanceof AuthError ? error.message : 'Не удалось отправить код',
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleCodeSubmit(event: FormEvent) {
    event.preventDefault();
    if (code.length !== 6) {
      setErrors({ code: 'Введите все шесть цифр' });
      return;
    }
    if (code !== CONFIRMATION_CODE) {
      setErrors({ code: 'Неверный код. Попробуйте ещё раз.' });
      return;
    }
    setErrors({});
    setStep(3);
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;
    const repeatError = validatePasswordRepeat(password, repeat);
    if (repeatError) nextErrors.repeat = repeatError;
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      await resetPassword(email, code, password);
      showToast('Пароль обновлён. Войдите с новым паролем.');
      navigate('/login');
    } catch (error) {
      if (error instanceof AuthError) {
        setErrors({ [error.field ?? 'form']: error.message });
        if (error.field === 'code') setStep(2);
      } else {
        setErrors({ form: 'Не удалось обновить пароль. Попробуйте ещё раз.' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const titles: Record<Step, { title: string; subtitle: string }> = {
    1: {
      title: 'Забыли пароль?',
      subtitle: 'Укажите почту аккаунта, и мы отправим код для смены пароля.',
    },
    2: {
      title: 'Введите код',
      subtitle: `Отправили код на ${email}. Он действует 30 минут.`,
    },
    3: {
      title: 'Новый пароль',
      subtitle: 'Придумайте пароль, которого не было раньше.',
    },
  };

  return (
    <AuthLayout>
      <div className="steps" aria-label={`Шаг ${step} из 3`}>
        {STEP_LABELS.map((label, index) => {
          const number = (index + 1) as Step;
          return (
            <div
              key={label}
              className={cn(
                'steps__item',
                number < step && 'steps__item--done',
                number === step && 'steps__item--current',
              )}
            >
              <span className="steps__dot">
                {number < step ? <CheckIcon size={14} strokeWidth={2.2} /> : number}
              </span>
              <span className="steps__label">{label}</span>
            </div>
          );
        })}
      </div>

      <AuthHeader
        eyebrow="Восстановление доступа"
        title={titles[step].title}
        subtitle={titles[step].subtitle}
      />

      {errors.form && (
        <Alert>
          <AlertCircleIcon size={18} />
          <span>{errors.form}</span>
        </Alert>
      )}

      {step === 1 && (
        <form className="form" onSubmit={handleEmailSubmit} noValidate>
          <TextField
            label="Почта"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors({});
            }}
            error={errors.email}
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
          />
          <Button type="submit" block loading={submitting}>
            Отправить код
          </Button>
        </form>
      )}

      {step === 2 && (
        <form className="form" onSubmit={handleCodeSubmit} noValidate>
          {errors.code && (
            <Alert>
              <AlertCircleIcon size={18} />
              <span>{errors.code}</span>
            </Alert>
          )}
          <CodeInput
            value={code}
            onChange={(value) => {
              setCode(value);
              setErrors({});
            }}
            error={Boolean(errors.code)}
            disabled={submitting}
            autoFocus
          />
          <Button type="submit" block disabled={code.length !== 6}>
            Продолжить
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
                onClick={() => {
                  setResendIn(60);
                  showToast('Код отправлен повторно', 'info');
                }}
              >
                Отправить код ещё раз
              </button>
            )}
          </div>
          <div className="demo-note demo-note--inline">
            <div className="demo-note-head">Демо-код</div>
            <div className="demo-note-body">
              <code>000000</code>
              <button
                type="button"
                className="demo-fill"
                onClick={() => {
                  setCode('000000');
                  setErrors({});
                }}
              >
                Подставить
              </button>
            </div>
          </div>
        </form>
      )}

      {step === 3 && (
        <form className="form" onSubmit={handlePasswordSubmit} noValidate>
          <PasswordField
            label="Новый пароль"
            name="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: undefined, form: undefined }));
            }}
            error={errors.password}
            autoComplete="new-password"
            autoFocus
            placeholder="Минимум 8 символов"
          />
          <PasswordStrength value={password} />
          <PasswordField
            label="Повторите пароль"
            name="repeat"
            value={repeat}
            onChange={(event) => {
              setRepeat(event.target.value);
              setErrors((current) => ({ ...current, repeat: undefined, form: undefined }));
            }}
            error={errors.repeat}
            autoComplete="new-password"
            placeholder="Ещё раз"
          />
          <Button type="submit" block loading={submitting}>
            Сохранить пароль
          </Button>
        </form>
      )}

      <button type="button" className="back-link" onClick={goBack}>
        <ArrowLeftIcon size={17} />
        {step === 1 ? 'Вернуться ко входу' : 'Назад'}
      </button>

      {step === 1 && (
        <p className="auth-switch">
          Вспомнили пароль? <Link to="/login">Войти</Link>
        </p>
      )}
    </AuthLayout>
  );
}
