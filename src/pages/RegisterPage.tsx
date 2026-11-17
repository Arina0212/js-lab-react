import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthError, useAuth } from '../auth/AuthContext';
import type { RegistrationDraft } from '../types';
import {
  formatPhone,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordRepeat,
  validatePhone,
  validateUsername,
} from '../lib/validation';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../components/Toast';
import { AuthLayout } from '../components/AuthLayout';
import { AuthHeader } from '../components/AuthHeader';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PasswordField } from '../components/PasswordField';
import { PasswordStrength } from '../components/PasswordStrength';
import { TextField } from '../components/TextField';
import { AlertCircleIcon, ArrowRightIcon } from '../components/Icons';

interface RegisterForm extends RegistrationDraft {
  repeat: string;
}

type RegisterErrors = Partial<Record<keyof RegisterForm | 'form', string>>;

export function RegisterPage() {
  const { register, pending } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  usePageTitle('Регистрация');

  const [form, setForm] = useState<RegisterForm>({
    email: pending?.email ?? '',
    password: '',
    repeat: '',
    username: pending?.username ?? '',
    lastName: pending?.lastName ?? '',
    firstName: pending?.firstName ?? '',
    patronymic: pending?.patronymic ?? '',
    phone: pending?.phone ?? '',
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: RegisterErrors = {};

    const emailError = validateEmail(form.email);
    if (emailError) nextErrors.email = emailError;

    const passwordError = validatePassword(form.password);
    if (passwordError) nextErrors.password = passwordError;

    const repeatError = validatePasswordRepeat(form.password, form.repeat);
    if (repeatError) nextErrors.repeat = repeatError;

    const usernameError = validateUsername(form.username);
    if (usernameError) nextErrors.username = usernameError;

    const lastNameError = validateName(form.lastName, 'фамилию', true);
    if (lastNameError) nextErrors.lastName = lastNameError;

    const firstNameError = validateName(form.firstName, 'имя', true);
    if (firstNameError) nextErrors.firstName = firstNameError;

    const patronymicError = validateName(form.patronymic, 'отчество', false);
    if (patronymicError) nextErrors.patronymic = patronymicError;

    const phoneError = validatePhone(form.phone);
    if (phoneError) nextErrors.phone = phoneError;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      await register({
        email: form.email,
        password: form.password,
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
        patronymic: form.patronymic,
        phone: form.phone,
      });
      showToast('Код подтверждения отправлен на почту', 'info');
      navigate('/register/confirm');
    } catch (error) {
      if (error instanceof AuthError) {
        const field =
          error.field === 'email' || error.field === 'username' || error.field === 'password'
            ? error.field
            : 'form';
        setErrors({ [field]: error.message });
      } else {
        setErrors({ form: 'Не удалось создать заявку. Попробуйте ещё раз.' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout wide>
      <AuthHeader
        eyebrow="Новый аккаунт"
        title="Создание аккаунта"
        subtitle="Заполните данные, а затем подтвердите почту кодом из письма."
      />

      {pending && (
        <Alert variant="info">
          <AlertCircleIcon size={18} />
          <span>
            У вас есть незавершённая регистрация. <Link to="/register/confirm">Ввести код</Link>.
          </span>
        </Alert>
      )}

      {errors.form && (
        <Alert>
          <AlertCircleIcon size={18} />
          <span>{errors.form}</span>
        </Alert>
      )}

      <form className="form form--register" onSubmit={handleSubmit} noValidate>
        <section className="form-section">
          <div className="form-section-head">
            <span className="form-section-index">01</span>
            <div>
              <h2>Данные для входа</h2>
              <p>Эти данные понадобятся при каждом входе.</p>
            </div>
          </div>

          <div className="form-grid">
            <TextField
              className="form-grid__full"
              label="Почта"
              name="email"
              type="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              error={errors.email}
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
            />
            <div className="field-stack">
              <PasswordField
                label="Пароль"
                name="password"
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
                error={errors.password}
                autoComplete="new-password"
                placeholder="Минимум 8 символов"
              />
              <PasswordStrength value={form.password} />
            </div>
            <PasswordField
              label="Повторите пароль"
              name="repeat"
              value={form.repeat}
              onChange={(event) => update('repeat', event.target.value)}
              error={errors.repeat}
              autoComplete="new-password"
              placeholder="Ещё раз"
            />
            <TextField
              label="Имя пользователя"
              name="username"
              prefix="@"
              value={form.username}
              onChange={(event) => update('username', event.target.value)}
              error={errors.username}
              hint="3–20 символов, латиница, цифры и _"
              autoComplete="username"
              placeholder="ivan_petrov"
            />
            <TextField
              label="Телефон"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={(event) => update('phone', formatPhone(event.target.value))}
              error={errors.phone}
              optional
              autoComplete="tel"
              placeholder="+7 (999) 123-45-67"
            />
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-head">
            <span className="form-section-index">02</span>
            <div>
              <h2>О вас</h2>
              <p>Имя и контакты можно будет изменить в профиле.</p>
            </div>
          </div>

          <div className="form-grid">
            <TextField
              label="Фамилия"
              name="lastName"
              value={form.lastName}
              onChange={(event) => update('lastName', event.target.value)}
              error={errors.lastName}
              autoComplete="family-name"
              placeholder="Петров"
            />
            <TextField
              label="Имя"
              name="firstName"
              value={form.firstName}
              onChange={(event) => update('firstName', event.target.value)}
              error={errors.firstName}
              autoComplete="given-name"
              placeholder="Иван"
            />
            <TextField
              label="Отчество"
              name="patronymic"
              value={form.patronymic}
              onChange={(event) => update('patronymic', event.target.value)}
              error={errors.patronymic}
              optional
              autoComplete="additional-name"
              placeholder="Сергеевич"
            />
          </div>
        </section>

        <Button type="submit" block loading={submitting} icon={<ArrowRightIcon size={18} />}>
          Далее
        </Button>
        <p className="form-consent">На следующем шаге отправим код подтверждения на почту.</p>
      </form>

      <p className="auth-switch">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </AuthLayout>
  );
}
