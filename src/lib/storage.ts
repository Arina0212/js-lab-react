import type { PendingRegistration, SessionRecord, User } from '../types';

const USERS_KEY = 'aurora.users.v1';
const SESSION_KEY = 'aurora.session.v1';
const PENDING_KEY = 'aurora.pending-registration.v1';

export const DEMO_EMAIL = 'demo@example.com';
export const DEMO_USER_ID = 'usr_demo_account';
export const DEMO_PASSWORD = 'demo1234';
export const CONFIRMATION_CODE = '000000';
export const CONFIRMATION_TTL_MS = 30 * 60 * 1000;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function readJson<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(storage: Storage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private mode or full. The app keeps working in memory.
  }
}

export function loadUsers(): User[] {
  const users = readJson<User[]>(window.localStorage, USERS_KEY);
  if (!Array.isArray(users)) return [];
  const unique = new Map<string, User>();
  for (const user of users) {
    if (!user?.id || !user?.email || unique.has(user.id)) continue;
    unique.set(user.id, user);
  }
  return Array.from(unique.values());
}

export function saveUsers(users: User[]): void {
  writeJson(window.localStorage, USERS_KEY, users);
}

export function loadSession(): SessionRecord | null {
  const fromLocal = readJson<SessionRecord>(window.localStorage, SESSION_KEY);
  const fromSession = readJson<SessionRecord>(window.sessionStorage, SESSION_KEY);
  const session = fromLocal ?? fromSession;
  if (!session?.userId) return null;
  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    clearSession();
    return null;
  }
  return session;
}

export function saveSession(userId: string, remember: boolean): void {
  const session: SessionRecord = {
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: remember ? new Date(Date.now() + SESSION_TTL_MS).toISOString() : null,
  };
  clearSession();
  writeJson(remember ? window.localStorage : window.sessionStorage, SESSION_KEY, session);
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function loadPending(): PendingRegistration | null {
  const pending = readJson<PendingRegistration>(window.sessionStorage, PENDING_KEY);
  if (!pending?.email || !pending.passwordHash) return null;
  const created = new Date(pending.createdAt).getTime();
  if (Number.isNaN(created) || Date.now() - created > CONFIRMATION_TTL_MS) {
    clearPending();
    return null;
  }
  return pending;
}

export function savePending(pending: PendingRegistration): void {
  writeJson(window.sessionStorage, PENDING_KEY, pending);
}

export function clearPending(): void {
  try {
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // Ignore storage failures.
  }
}
