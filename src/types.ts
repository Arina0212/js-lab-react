export type ProviderId = 'yandex' | 'google' | 'vk';

export interface OAuthLink {
  email: string;
  name: string;
  connectedAt: string;
}

export interface PasskeyRecord {
  id: string;
  name: string;
  createdAt: string;
  transports: string[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  phone: string;
  passwordHash: string | null;
  passwordSalt: string | null;
  createdAt: string;
  emailVerified: boolean;
  oauth: Partial<Record<ProviderId, OAuthLink>>;
  passkeys: PasskeyRecord[];
}

export interface PendingRegistration {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  phone: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}

export interface SessionRecord {
  userId: string;
  createdAt: string;
  expiresAt: string | null;
}

export interface ProfilePatch {
  username: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  phone: string;
}

export interface OAuthAccount {
  name: string;
  email: string;
}

export interface RegistrationDraft {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  phone: string;
}
