import type { ProviderId } from '../types';
import { cn } from '../lib/cn';
import yandexIcon from '../assets/icons/yandex.svg';
import googleIcon from '../assets/icons/google.svg';
import vkIcon from '../assets/icons/vk.svg';

interface ProviderIconProps {
  provider: ProviderId;
  size?: number;
  className?: string;
}

const ICONS: Record<ProviderId, string> = {
  yandex: yandexIcon,
  google: googleIcon,
  vk: vkIcon,
};

export function ProviderIcon({ provider, size = 20, className }: ProviderIconProps) {
  return (
    <img
      src={ICONS[provider]}
      width={size}
      height={size}
      className={cn('provider-icon', className)}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
