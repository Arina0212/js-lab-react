import { useEffect, useState, type FormEvent } from 'react';
import type { User } from '../../types';
import { AuthError, useAuth } from '../../auth/AuthContext';
import {
  formatPhone,
  validateName,
  validatePhone,
  validateUsername,
} from '../../lib/validation';
import { useToast } from '../Toast';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { TextField } from '../TextField';
import { EmailChangeModal } from './EmailChangeModal';
import { CheckIcon, MailIcon } from '../Icons';

interface ProfileSectionProps {
  user: User;
}

interface ProfileForm {
  username: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  phone: string;
}

function profileFromUser(user: User): ProfileForm {
  return {
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    patronymic: user.patronymic,
    phone: user.phone,
  };
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const { updateProfile } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState<ProfileForm>(() => profileFromUser(user));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  useEffect(() => {
    setForm(profileFromUser(user));
    setErrors({});
  }, [user.id]);

  const dirty =
    form.username.trim() !== user.username ||
    form.firstName.trim() !== user.firstName ||
    form.lastName.trim() !== user.lastName ||
    form.patronymic.trim() !== user.patronymic ||
    form.phone.trim() !== user.phone;

  function update(key: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  }

  function reset() {
    setForm(profileFromUser(user));
    setErrors({});
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

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

    const trimmed: ProfileForm = {
      username: form.username.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      patronymic: form.patronymic.trim(),
      phone: form.phone.trim(),
    };

    setSaving(true);
    setErrors({});
    try {
      await updateProfile(trimmed);
      setForm(trimmed);
      showToast('Данные профиля сохранены');
    } catch (error) {
      if (error instanceof AuthError) {
        setErrors({ [error.field ?? 'form']: error.message });
        if (error.field === 'form') showToast(error.message, 'error');
      } else {
        showToast('Не удалось сохранить данные', 'error');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div>
            <h2 className="card-title">Общие данные</h2>
            <p className="card-sub">Как вас зовут, как с вами связаться и как вас найти.</p>
          </div>
          {dirty && <Badge tone="warning">Есть изменения</Badge>}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <TextField
              label="Фамилия"
              name="lastName"
              value={form.lastName}
              onChange={(event) => update('lastName', event.target.value)}
              error={errors.lastName}
              autoComplete="family-name"
            />
            <TextField
              label="Имя"
              name="firstName"
              value={form.firstName}
              onChange={(event) => update('firstName', event.target.value)}
              error={errors.firstName}
              autoComplete="given-name"
            />
            <TextField
              label="Отчество"
              name="patronymic"
              value={form.patronymic}
              onChange={(event) => update('patronymic', event.target.value)}
              error={errors.patronymic}
              optional
              autoComplete="additional-name"
            />
            <TextField
              label="Имя пользователя"
              name="username"
              prefix="@"
              value={form.username}
              onChange={(event) => update('username', event.target.value)}
              error={errors.username}
              hint="Используется для входа вместе с почтой"
              autoComplete="username"
            />
            <TextField
              className="form-grid__full"
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

          <div className="card-divider" />

          <div className="info-row">
            <span className="method-icon">
              <MailIcon size={19} />
            </span>
            <div className="method-body">
              <div className="method-name">Почта</div>
              <div className="info-row-value">
                {user.email}
                <Badge tone="success">
                  <CheckIcon size={12} strokeWidth={2.4} />
                  Подтверждена
                </Badge>
              </div>
              <p className="method-note">Нужна для входа и кодов подтверждения.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setEmailModalOpen(true)}>
              Изменить
            </Button>
          </div>

          <div className="save-bar">
            <span className={dirty ? 'save-bar-status save-bar-status--dirty' : 'save-bar-status'}>
              {dirty ? 'Есть несохранённые изменения' : 'Все изменения сохранены'}
            </span>
            <div className="save-bar-actions">
              <Button variant="ghost" size="sm" onClick={reset} disabled={!dirty || saving}>
                Отменить
              </Button>
              <Button type="submit" size="sm" loading={saving} disabled={!dirty}>
                Сохранить
              </Button>
            </div>
          </div>
        </form>
      </div>

      <EmailChangeModal
        open={emailModalOpen}
        currentEmail={user.email}
        onClose={() => setEmailModalOpen(false)}
      />
    </>
  );
}
