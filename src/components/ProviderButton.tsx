import type { ProviderId } from '../types';
import { PROVIDERS } from '../lib/providers';
import { ProviderIcon } from './ProviderIcon';

interface ProviderButtonProps {
  provider: ProviderId;
  onClick: () => void;
  disabled?: boolean;
}

export function ProviderButton({ provider, onClick, disabled }: ProviderButtonProps) {
  const config = PROVIDERS[provider];
  return (
    <button
      type="button"
      className="provider-btn"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Войти через ${config.name}`}
    >
      <ProviderIcon provider={provider} size={20} />
      <span>{config.name}</span>
    </button>
  );
}
