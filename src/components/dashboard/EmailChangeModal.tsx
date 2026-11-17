import { useEffect, useState, type FormEvent } from 'react';
import { AuthError, useAuth } from '../../auth/AuthContext';
import { CONFIRMATION_CODE } from '../../lib/storage';
import { validateEmail } from '../../lib/validation';
import { useToast } from '../Toast';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { CodeInput } from '../CodeInput';
import { Modal } from '../Modal';
import { TextField } from '../TextField';
import { AlertCircleIcon, MailIcon } from '../Icons';

interface EmailChangeModalProps {
  open: boolean;
  currentEmail: string;
  onClose: () => void;
}

export function EmailChangeModal({ open, currentEmail, onClose }: EmailChangeModalProps) {
  const { requestEmailChange, changeEmail } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(60);

  useEffect(() => {
    if (!open) return;
    setStep('email');
    setEmail('');
    setCode('');
    setErrors({});
    setSubmitting(false);
    setResendIn(60);
  }, [open]);

  useEffect(() => {
    if (!open || step !== 'code' || resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [open, step, resendIn]);

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setErrors({ email: error });
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      await requestEmailChange(email);
      setStep('code');
      setResendIn(60);
      showToast('Код отправлен на новый адрес', 'info');
    } catch (authError) {
      setErrors({
        email:
          authError instanceof AuthError
            ? authError.message
            : 'Не удалось отправить код. Попробуйте ещё раз.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCodeSubmit(event: FormEvent) {
    event.preventDefault();
    if (code.length !== 6) {
      setErrors({ code: 'Введите все шесть цифр' });
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      await changeEmail(email, code);
      showToast('Почта изменена и подтверждена');
      onClose();
    } catch (authError) {
      if (authError instanceof AuthError && authError.field === 'email') {
        setStep('email');
        setErrors({ email: authError.message });
      } else {
        setErrors({
          code:
            authError instanceof AuthError
              ? authError.message
              : 'Не удалось изменить почту. Попробуйте ещё раз.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Изменить почту"
      description="Новый адрес нужно подтвердить кодом. Пароль и способы входа останутся прежними."
    >
      {step === 'email' ? (
        <form className="form" onSubmit={handleEmailSubmit} noValidate>
          <div className="current-email">
            <MailIcon size={17} />
            <span>Сейчас: {currentEmail}</span>
          </div>
          <TextField
            label="Новая почта"
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
            placeholder="new@example.com"
          />
          <Button type="submit" block loading={submitting}>
            Получить код
          </Button>
        </form>
      ) : (
        <form className="form" onSubmit={handleCodeSubmit} noValidate>
          <div className="email-target">
            Код отправлен на <strong>{email}</strong>
          </div>

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
              <code>{CONFIRMATION_CODE}</code>
              <button
                type="button"
                className="demo-fill"
                onClick={() => {
                  setCode(CONFIRMATION_CODE);
                  setErrors({});
                }}
              >
                Подставить
              </button>
            </div>
          </div>

          <button
            type="button"
            className="link-button link-button--back"
            onClick={() => {
              setStep('email');
              setCode('');
              setErrors({});
            }}
          >
            Изменить адрес
          </button>
        </form>
      )}
    </Modal>
  );
}
