import { useEffect, useState, type FormEvent } from 'react';
import { AuthError, useAuth } from '../../auth/AuthContext';
import { validatePassword, validatePasswordRepeat } from '../../lib/validation';
import { useToast } from '../Toast';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { PasswordField } from '../PasswordField';
import { PasswordStrength } from '../PasswordStrength';
import { AlertCircleIcon } from '../Icons';

interface PasswordModalProps {
  open: boolean;
  hasPassword: boolean;
  onClose: () => void;
}

export function PasswordModal({ open, hasPassword, onClose }: PasswordModalProps) {
  const { changePassword } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCurrentPassword('');
    setNextPassword('');
    setRepeat('');
    setErrors({});
    setSubmitting(false);
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (hasPassword && !currentPassword) {
      nextErrors.currentPassword = 'Введите текущий пароль';
    }

    const passwordError = validatePassword(nextPassword);
    if (passwordError) nextErrors.password = passwordError;

    const repeatError = validatePasswordRepeat(nextPassword, repeat);
    if (repeatError) nextErrors.repeat = repeatError;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      await changePassword(hasPassword ? currentPassword : null, nextPassword);
      showToast(hasPassword ? 'Пароль изменён' : 'Пароль задан');
      onClose();
    } catch (error) {
      if (error instanceof AuthError) {
        const field =
          error.field === 'currentPassword'
            ? 'currentPassword'
            : error.field === 'password'
              ? 'password'
              : 'form';
        setErrors({ [field]: error.message });
      } else {
        setErrors({ form: 'Не удалось сохранить пароль. Попробуйте ещё раз.' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={hasPassword ? 'Изменить пароль' : 'Задать пароль'}
      description={
        hasPassword
          ? 'После смены пароля вход останется доступен через почту и подключённые сервисы.'
          : 'Пароль позволит входить без сервисов и passkey. Его можно будет сменить в любой момент.'
      }
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        {errors.form && (
          <Alert>
            <AlertCircleIcon size={18} />
            <span>{errors.form}</span>
          </Alert>
        )}

        {hasPassword && (
          <PasswordField
            label="Текущий пароль"
            name="currentPassword"
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              setErrors((current) => ({ ...current, currentPassword: undefined, form: undefined }));
            }}
            error={errors.currentPassword}
            autoComplete="current-password"
            autoFocus
            placeholder="Текущий пароль"
          />
        )}

        <PasswordField
          label="Новый пароль"
          name="nextPassword"
          value={nextPassword}
          onChange={(event) => {
            setNextPassword(event.target.value);
            setErrors((current) => ({ ...current, password: undefined, form: undefined }));
          }}
          error={errors.password}
          autoComplete="new-password"
          autoFocus={!hasPassword}
          placeholder="Минимум 8 символов"
        />
        <PasswordStrength value={nextPassword} />

        <PasswordField
          label="Повторите новый пароль"
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
          {hasPassword ? 'Сохранить пароль' : 'Задать пароль'}
        </Button>
      </form>
    </Modal>
  );
}
