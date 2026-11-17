import type { PasskeyRecord, User } from '../types';

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function passkeysSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator.credentials !== 'undefined'
  );
}

export function passkeyDeviceName(): string {
  const agent = navigator.userAgent;
  if (/Windows/i.test(agent)) return 'Windows Hello';
  if (/Macintosh|iPhone|iPad/i.test(agent)) return 'Touch ID';
  if (/Android/i.test(agent)) return 'Android';
  return 'Passkey';
}

export async function createPasskey(user: User): Promise<PasskeyRecord> {
  if (!passkeysSupported()) {
    throw new Error('Этот браузер не поддерживает passkey');
  }

  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      rp: { name: 'Aurora' },
      user: {
        id: new TextEncoder().encode(user.id),
        name: user.email,
        displayName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
      timeout: 60_000,
      attestation: 'none',
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Не удалось создать passkey');
  }

  const response = credential.response as AuthenticatorAttestationResponse & {
    getTransports?: () => string[];
  };

  return {
    id: toBase64Url(credential.rawId),
    name: passkeyDeviceName(),
    createdAt: new Date().toISOString(),
    transports: response.getTransports?.() ?? [],
  };
}

export async function getPasskeyId(): Promise<string | null> {
  if (!passkeysSupported()) {
    throw new Error('Этот браузер не поддерживает passkey');
  }

  const credential = (await navigator.credentials.get({
    publicKey: {
      challenge: randomBytes(32),
      timeout: 60_000,
      userVerification: 'preferred',
    },
  })) as PublicKeyCredential | null;

  return credential ? toBase64Url(credential.rawId) : null;
}

export function describePasskeyError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return 'Запрос отменён или истёк. Попробуйте ещё раз.';
    }
    if (error.name === 'SecurityError') {
      return 'Passkey работает только на localhost или по HTTPS.';
    }
    if (error.name === 'InvalidStateError') {
      return 'Этот passkey уже добавлен в аккаунт.';
    }
    if (error.name === 'NotSupportedError') {
      return 'На этом устройстве нет подходящего способа проверки.';
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Не удалось выполнить запрос passkey.';
}

export async function signalPasskeyRemoval(credentialId: string): Promise<boolean> {
  if (!passkeysSupported()) return false;

  const api = PublicKeyCredential as unknown as {
    signalUnknownCredential?: (options: {
      rpId: string;
      credentialId: string;
    }) => Promise<void>;
  };

  if (typeof api.signalUnknownCredential !== 'function') return false;

  try {
    await api.signalUnknownCredential({
      rpId: window.location.hostname,
      credentialId,
    });
    return true;
  } catch {
    // The local passkey record is still removed. The authenticator may keep its copy.
    return false;
  }
}
