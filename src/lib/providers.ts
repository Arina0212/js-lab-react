import type { ProviderId, OAuthAccount } from '../types';

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  account: OAuthAccount;
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  yandex: {
    id: 'yandex',
    name: 'Яндекс',
    account: {
      name: 'Анна Смирнова',
      email: 'anna.smirnova@yandex.ru',
    },
  },
  google: {
    id: 'google',
    name: 'Google',
    account: {
      name: 'Иван Петров',
      email: 'demo@example.com',
    },
  },
  vk: {
    id: 'vk',
    name: 'VK',
    account: {
      name: 'Иван Петров',
      email: 'ivan.petrov@vk.com',
    },
  },
};

export const PROVIDER_LIST: ProviderConfig[] = Object.values(PROVIDERS);

export function isProviderId(value: string | undefined): value is ProviderId {
  return value === 'yandex' || value === 'google' || value === 'vk';
}
