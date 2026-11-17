export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[A-Za-z][A-Za-z0-9_]{2,19}$/;
const NAME_RE = /^[А-Яа-яЁёA-Za-z][А-Яа-яЁёA-Za-z\- ]{0,49}$/;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Введите почту';
  if (!EMAIL_RE.test(email)) return 'Проверьте адрес: похоже, есть опечатка';
  return null;
}

export function validateUsername(value: string): string | null {
  const username = value.trim();
  if (!username) return 'Придумайте имя пользователя';
  if (!USERNAME_RE.test(username)) {
    return '3–20 символов: латиница, цифры и подчёркивание, первая буква';
  }
  return null;
}

export function validateName(value: string, field: string, required: boolean): string | null {
  const name = value.trim();
  if (!name) return required ? `Введите ${field}` : null;
  if (!NAME_RE.test(name)) return 'Используйте буквы, пробел и дефис';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Введите пароль';
  if (value.length < 8) return 'Минимум 8 символов';
  if (!/[A-Za-zА-Яа-яЁё]/.test(value)) return 'Добавьте хотя бы одну букву';
  if (!/\d/.test(value)) return 'Добавьте хотя бы одну цифру';
  return null;
}

export function validatePasswordRepeat(password: string, repeat: string): string | null {
  if (!repeat) return 'Повторите пароль';
  if (password !== repeat) return 'Пароли не совпадают';
  return null;
}

export function formatPhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits[0] === '8') digits = `7${digits.slice(1)}`;
  if (digits[0] !== '7') digits = `7${digits}`;
  digits = digits.slice(0, 11);
  const rest = digits.slice(1);
  let result = '+7';
  if (rest.length > 0) result += ` (${rest.slice(0, 3)}`;
  if (rest.length >= 3) result += ')';
  if (rest.length > 3) result += ` ${rest.slice(3, 6)}`;
  if (rest.length > 6) result += `-${rest.slice(6, 8)}`;
  if (rest.length > 8) result += `-${rest.slice(8, 10)}`;
  return result;
}

export function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length < 11) return 'Введите номер полностью';
  if (digits.length > 11) return 'В номере слишком много цифр';
  return null;
}

export function passwordScore(value: string): number {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-ZА-ЯЁ]/.test(value) && /[a-zа-яё]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-zА-Яа-яЁё0-9]/.test(value)) score += 1;
  return Math.min(score, 4);
}

export const PASSWORD_SCORE_LABELS = ['', 'Слабый', 'Средний', 'Хороший', 'Надёжный'];

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhoneDigits(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 10) digits = `7${digits}`;
  if (digits[0] === '8') digits = `7${digits.slice(1)}`;
  return digits;
}
