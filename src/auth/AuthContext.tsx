import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  OAuthAccount,
  PasskeyRecord,
  PendingRegistration,
  ProfilePatch,
  ProviderId,
  RegistrationDraft,
  User,
} from '../types';
import {
  CONFIRMATION_CODE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_USER_ID,
  clearPending,
  clearSession,
  loadPending,
  loadSession,
  loadUsers,
  savePending,
  saveSession,
  saveUsers,
} from '../lib/storage';
import { createId, hashPassword, randomSalt } from '../lib/password';
import { normalizeEmail, normalizeIdentifier, normalizePhoneDigits } from '../lib/validation';
import {
  createPasskey,
  describePasskeyError,
  getPasskeyId,
  passkeysSupported,
  signalPasskeyRemoval,
} from '../lib/webauthn';

export type AuthField =
  | 'identifier'
  | 'email'
  | 'password'
  | 'currentPassword'
  | 'code'
  | 'username'
  | 'form';

export class AuthError extends Error {
  field?: AuthField;

  constructor(message: string, field?: AuthField) {
    super(message);
    this.name = 'AuthError';
    this.field = field;
  }
}

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  pending: PendingRegistration | null;
  passkeysAvailable: boolean;
  login(identifier: string, password: string, remember: boolean): Promise<User>;
  register(draft: RegistrationDraft): Promise<void>;
  confirmRegistration(code: string): Promise<User>;
  resendConfirmation(): Promise<void>;
  loginWithOAuth(provider: ProviderId, account: OAuthAccount): Promise<User>;
  connectOAuth(provider: ProviderId, account: OAuthAccount): Promise<void>;
  disconnectOAuth(provider: ProviderId): Promise<void>;
  loginWithPasskey(): Promise<User>;
  addPasskey(): Promise<PasskeyRecord>;
  removePasskey(id: string): Promise<void>;
  updateProfile(patch: ProfilePatch): Promise<void>;
  requestEmailChange(email: string): Promise<void>;
  changeEmail(email: string, code: string): Promise<void>;
  changePassword(currentPassword: string | null, nextPassword: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(email: string, code: string, nextPassword: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function buildUsername(email: string, users: User[]): string {
  const base = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 15);
  let candidate = base ? (/^[a-z]/.test(base) ? base : `user${base}`) : 'user';
  if (candidate.length < 3) candidate = `${candidate}user`.slice(0, 8);
  let suffix = 1;
  const taken = (value: string) =>
    users.some((item) => item.username.toLowerCase() === value.toLowerCase());
  while (taken(candidate)) {
    suffix += 1;
    candidate = `${candidate.slice(0, 20 - String(suffix).length)}${suffix}`;
  }
  return candidate;
}

function splitName(name: string, email: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: email.split('@')[0] || 'Гость', lastName: '' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

async function createDemoUser(): Promise<User> {
  const salt = randomSalt();
  return {
    id: DEMO_USER_ID,
    email: DEMO_EMAIL,
    username: 'ivan',
    firstName: 'Иван',
    lastName: 'Петров',
    patronymic: 'Сергеевич',
    phone: '+7 (912) 345-67-89',
    passwordHash: await hashPassword(DEMO_PASSWORD, salt),
    passwordSalt: salt,
    createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
    emailVerified: true,
    oauth: {},
    passkeys: [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<PendingRegistration | null>(null);
  const usersRef = useRef<User[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      let users = loadUsers();
      if (!users.some((item) => item.id === DEMO_USER_ID)) {
        users = [...users, await createDemoUser()];
        saveUsers(users);
      }
      if (cancelled) return;

      usersRef.current = users;
      const session = loadSession();
      if (session) {
        const sessionUser = users.find((item) => item.id === session.userId);
        if (sessionUser) {
          setUser(sessionUser);
        } else {
          clearSession();
        }
      }
      setPending(loadPending());
      setReady(true);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  function requireUser(): User {
    if (!user) throw new AuthError('Сначала войдите в аккаунт', 'form');
    return user;
  }

  function applyUserUpdate(updated: User): void {
    const users = usersRef.current.map((item) => (item.id === updated.id ? updated : item));
    usersRef.current = users;
    saveUsers(users);
    setUser(updated);
  }

  function findByIdentifier(identifier: string): User | undefined {
    const value = normalizeIdentifier(identifier);
    const phone = normalizePhoneDigits(identifier);
    return usersRef.current.find((item) => {
      if (normalizeEmail(item.email) === value) return true;
      if (item.username.toLowerCase() === value) return true;
      if (phone && normalizePhoneDigits(item.phone) === phone) return true;
      return false;
    });
  }

  async function login(identifier: string, password: string, remember: boolean): Promise<User> {
    const found = findByIdentifier(identifier);
    if (!found) {
      throw new AuthError('Неверная почта или пароль', 'identifier');
    }
    if (!found.passwordHash || !found.passwordSalt) {
      throw new AuthError(
        'У аккаунта нет пароля. Войдите через подключённый сервис или passkey.',
        'password',
      );
    }
    const hash = await hashPassword(password, found.passwordSalt);
    if (hash !== found.passwordHash) {
      throw new AuthError('Неверная почта или пароль', 'password');
    }
    saveSession(found.id, remember);
    setUser(found);
    return found;
  }

  async function register(draft: RegistrationDraft): Promise<void> {
    const email = normalizeEmail(draft.email);
    const username = draft.username.trim();
    if (usersRef.current.some((item) => normalizeEmail(item.email) === email)) {
      throw new AuthError('Аккаунт с такой почтой уже существует', 'email');
    }
    if (usersRef.current.some((item) => item.username.toLowerCase() === username.toLowerCase())) {
      throw new AuthError('Это имя пользователя уже занято', 'username');
    }

    const salt = randomSalt();
    const nextPending: PendingRegistration = {
      email,
      username,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      patronymic: draft.patronymic.trim(),
      phone: draft.phone.trim(),
      passwordHash: await hashPassword(draft.password, salt),
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
    };

    savePending(nextPending);
    setPending(nextPending);
  }

  async function confirmRegistration(code: string): Promise<User> {
    if (!pending) {
      throw new AuthError('Заявка на регистрацию не найдена. Заполните форму заново.', 'form');
    }
    if (code.trim() !== CONFIRMATION_CODE) {
      throw new AuthError('Неверный код. Проверьте цифры и попробуйте снова.', 'code');
    }
    if (usersRef.current.some((item) => normalizeEmail(item.email) === pending.email)) {
      throw new AuthError('Аккаунт с такой почтой уже существует', 'email');
    }

    const newUser: User = {
      id: createId(),
      email: pending.email,
      username: pending.username,
      firstName: pending.firstName,
      lastName: pending.lastName,
      patronymic: pending.patronymic,
      phone: pending.phone,
      passwordHash: pending.passwordHash,
      passwordSalt: pending.passwordSalt,
      createdAt: new Date().toISOString(),
      emailVerified: true,
      oauth: {},
      passkeys: [],
    };

    usersRef.current = [...usersRef.current, newUser];
    saveUsers(usersRef.current);
    saveSession(newUser.id, true);
    clearPending();
    setPending(null);
    setUser(newUser);
    return newUser;
  }

  async function resendConfirmation(): Promise<void> {
    if (!pending) throw new AuthError('Заявка на регистрацию не найдена', 'form');
    const refreshed = { ...pending, createdAt: new Date().toISOString() };
    savePending(refreshed);
    setPending(refreshed);
  }

  async function loginWithOAuth(provider: ProviderId, account: OAuthAccount): Promise<User> {
    const email = normalizeEmail(account.email);
    const existing =
      usersRef.current.find(
        (item) => normalizeEmail(item.oauth[provider]?.email ?? '') === email,
      ) ?? usersRef.current.find((item) => normalizeEmail(item.email) === email);
    const link = {
      email,
      name: account.name,
      connectedAt: new Date().toISOString(),
    };

    let accountUser: User;
    if (existing) {
      accountUser = {
        ...existing,
        emailVerified: true,
        oauth: { ...existing.oauth, [provider]: link },
      };
      usersRef.current = usersRef.current.map((item) =>
        item.id === accountUser.id ? accountUser : item,
      );
    } else {
      const { firstName, lastName } = splitName(account.name, email);
      accountUser = {
        id: createId(),
        email,
        username: buildUsername(email, usersRef.current),
        firstName,
        lastName,
        patronymic: '',
        phone: '',
        passwordHash: null,
        passwordSalt: null,
        createdAt: new Date().toISOString(),
        emailVerified: true,
        oauth: { [provider]: link },
        passkeys: [],
      };
      usersRef.current = [...usersRef.current, accountUser];
    }

    saveUsers(usersRef.current);
    saveSession(accountUser.id, true);
    setUser(accountUser);
    return accountUser;
  }

  async function connectOAuth(provider: ProviderId, account: OAuthAccount): Promise<void> {
    const current = requireUser();
    const email = normalizeEmail(account.email);
    const conflict = usersRef.current.find(
      (item) =>
        item.id !== current.id &&
        normalizeEmail(item.oauth[provider]?.email ?? '') === email,
    );
    if (conflict) {
      throw new AuthError('Этот аккаунт уже подключён к другому пользователю', 'form');
    }
    const updated: User = {
      ...current,
      oauth: {
        ...current.oauth,
        [provider]: {
          email,
          name: account.name,
          connectedAt: new Date().toISOString(),
        },
      },
    };
    applyUserUpdate(updated);
  }

  async function disconnectOAuth(provider: ProviderId): Promise<void> {
    const current = requireUser();
    const oauth = { ...current.oauth };
    delete oauth[provider];
    const updated: User = { ...current, oauth };
    const methods =
      (updated.passwordHash ? 1 : 0) + Object.keys(updated.oauth).length + updated.passkeys.length;
    if (methods === 0) {
      throw new AuthError('Оставьте хотя бы один способ входа', 'form');
    }
    applyUserUpdate(updated);
  }

  async function loginWithPasskey(): Promise<User> {
    if (!usersRef.current.some((item) => item.passkeys.length > 0)) {
      throw new AuthError(
        'Passkey пока не настроен. Добавьте его в разделе «Безопасность».',
        'form',
      );
    }
    try {
      const credentialId = await getPasskeyId();
      if (!credentialId) throw new AuthError('Passkey не выбран', 'form');
      const found = usersRef.current.find((item) =>
        item.passkeys.some((passkey) => passkey.id === credentialId),
      );
      if (!found) {
        throw new AuthError('Этот passkey не привязан к аккаунту в этом браузере', 'form');
      }
      saveSession(found.id, true);
      setUser(found);
      return found;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(describePasskeyError(error), 'form');
    }
  }

  async function addPasskey(): Promise<PasskeyRecord> {
    const current = requireUser();
    try {
      const passkey = await createPasskey(current);
      if (current.passkeys.some((item) => item.id === passkey.id)) {
        throw new AuthError('Этот passkey уже добавлен', 'form');
      }
      applyUserUpdate({ ...current, passkeys: [...current.passkeys, passkey] });
      return passkey;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(describePasskeyError(error), 'form');
    }
  }

  async function removePasskey(id: string): Promise<void> {
    const current = requireUser();
    const passkeys = current.passkeys.filter((item) => item.id !== id);
    const updated: User = { ...current, passkeys };
    const methods =
      (updated.passwordHash ? 1 : 0) + Object.keys(updated.oauth).length + updated.passkeys.length;
    if (methods === 0) {
      throw new AuthError('Оставьте хотя бы один способ входа', 'form');
    }
    applyUserUpdate(updated);
    await signalPasskeyRemoval(id);
  }

  async function updateProfile(patch: ProfilePatch): Promise<void> {
    const current = requireUser();
    const username = patch.username.trim();
    if (
      usersRef.current.some(
        (item) =>
          item.id !== current.id && item.username.toLowerCase() === username.toLowerCase(),
      )
    ) {
      throw new AuthError('Это имя пользователя уже занято', 'username');
    }
    applyUserUpdate({
      ...current,
      username,
      firstName: patch.firstName.trim(),
      lastName: patch.lastName.trim(),
      patronymic: patch.patronymic.trim(),
      phone: patch.phone.trim(),
    });
  }

  async function requestEmailChange(email: string): Promise<void> {
    const current = requireUser();
    const next = normalizeEmail(email);
    if (next === normalizeEmail(current.email)) {
      throw new AuthError('Это уже ваша почта', 'email');
    }
    if (usersRef.current.some((item) => item.id !== current.id && normalizeEmail(item.email) === next)) {
      throw new AuthError('Эта почта уже используется', 'email');
    }
  }

  async function changeEmail(email: string, code: string): Promise<void> {
    const current = requireUser();
    if (code.trim() !== CONFIRMATION_CODE) {
      throw new AuthError('Неверный код из письма', 'code');
    }
    const next = normalizeEmail(email);
    if (
      usersRef.current.some((item) => item.id !== current.id && normalizeEmail(item.email) === next)
    ) {
      throw new AuthError('Эта почта уже используется', 'email');
    }
    applyUserUpdate({ ...current, email: next, emailVerified: true });
  }

  async function changePassword(
    currentPassword: string | null,
    nextPassword: string,
  ): Promise<void> {
    const current = requireUser();
    if (current.passwordHash && current.passwordSalt) {
      if (!currentPassword) {
        throw new AuthError('Введите текущий пароль', 'currentPassword');
      }
      const currentHash = await hashPassword(currentPassword, current.passwordSalt);
      if (currentHash !== current.passwordHash) {
        throw new AuthError('Текущий пароль не подходит', 'currentPassword');
      }
    }
    const salt = randomSalt();
    applyUserUpdate({
      ...current,
      passwordSalt: salt,
      passwordHash: await hashPassword(nextPassword, salt),
    });
  }

  async function requestPasswordReset(email: string): Promise<void> {
    const found = usersRef.current.find(
      (item) => normalizeEmail(item.email) === normalizeEmail(email),
    );
    if (!found) {
      throw new AuthError('Аккаунт с такой почтой не найден', 'email');
    }
  }

  async function resetPassword(
    email: string,
    code: string,
    nextPassword: string,
  ): Promise<void> {
    const found = usersRef.current.find(
      (item) => normalizeEmail(item.email) === normalizeEmail(email),
    );
    if (!found) {
      throw new AuthError('Аккаунт с такой почтой не найден', 'email');
    }
    if (code.trim() !== CONFIRMATION_CODE) {
      throw new AuthError('Неверный код из письма', 'code');
    }
    const salt = randomSalt();
    const updated: User = {
      ...found,
      passwordSalt: salt,
      passwordHash: await hashPassword(nextPassword, salt),
    };
    usersRef.current = usersRef.current.map((item) =>
      item.id === updated.id ? updated : item,
    );
    saveUsers(usersRef.current);
  }

  function logout(): void {
    clearSession();
    setUser(null);
  }

  const value: AuthContextValue = {
    user,
    ready,
    pending,
    passkeysAvailable: passkeysSupported(),
    login,
    register,
    confirmRegistration,
    resendConfirmation,
    loginWithOAuth,
    connectOAuth,
    disconnectOAuth,
    loginWithPasskey,
    addPasskey,
    removePasskey,
    updateProfile,
    requestEmailChange,
    changeEmail,
    changePassword,
    requestPasswordReset,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
