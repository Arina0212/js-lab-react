import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProviderId, User } from '../../types';
import { AuthError, useAuth } from '../../auth/AuthContext';
import { PROVIDERS, PROVIDER_LIST } from '../../lib/providers';
import { formatDate } from '../../lib/format';
import { useToast } from '../Toast';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { ConfirmDialog } from '../ConfirmDialog';
import { ProviderIcon } from '../ProviderIcon';
import { PasskeyIcon } from '../PasskeyIcon';
import { PasswordModal } from './PasswordModal';
import {
  LockIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon,
} from '../Icons';

interface SecuritySectionProps {
  user: User;
}

type Removal =
  | { kind: 'oauth'; provider: ProviderId }
  | { kind: 'passkey'; id: string; name: string }
  | null;

export function SecuritySection({ user }: SecuritySectionProps) {
  const { disconnectOAuth, addPasskey, removePasskey, passkeysAvailable } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [addingPasskey, setAddingPasskey] = useState(false);
  const [removal, setRemoval] = useState<Removal>(null);
  const [removing, setRemoving] = useState(false);

  const hasPassword = Boolean(user.passwordHash);
  const connectedCount = Object.keys(user.oauth).length + user.passkeys.length;

  async function handleAddPasskey() {
    setAddingPasskey(true);
    try {
      const passkey = await addPasskey();
      showToast(`Passkey «${passkey.name}» добавлен`);
    } catch (error) {
      showToast(
        error instanceof AuthError ? error.message : 'Не удалось добавить passkey',
        'error',
      );
    } finally {
      setAddingPasskey(false);
    }
  }

  async function handleRemove() {
    if (!removal) return;
    setRemoving(true);
    try {
      if (removal.kind === 'oauth') {
        await disconnectOAuth(removal.provider);
        showToast(`${PROVIDERS[removal.provider].name} отключён`, 'info');
      } else {
        await removePasskey(removal.id);
        showToast('Passkey удалён', 'info');
      }
      setRemoval(null);
    } catch (error) {
      showToast(
        error instanceof AuthError ? error.message : 'Не удалось отключить способ входа',
        'error',
      );
    } finally {
      setRemoving(false);
    }
  }

  const removalTitle =
    removal?.kind === 'oauth'
      ? `Отключить ${PROVIDERS[removal.provider].name}?`
      : removal?.kind === 'passkey'
        ? `Удалить passkey «${removal.name}»?`
        : '';

  const removalDescription =
    removal?.kind === 'oauth'
      ? 'Вход через этот сервис станет недоступен. Пароль, passkey и другие сервисы останутся.'
      : 'Ключ удалится из аккаунта. Если браузер умеет, он удалит passkey и с этого устройства.';

  return (
    <>
      <div className="card">
        <div className="card-head">
          <div>
            <h2 className="card-title">Пароль</h2>
            <p className="card-sub">
              {hasPassword
                ? 'Основной способ входа, если сервисы недоступны.'
                : 'Пароль пока не задан. Его можно добавить в любой момент.'}
            </p>
          </div>
          <Badge tone={hasPassword ? 'success' : 'muted'}>
            {hasPassword ? 'Задан' : 'Не задан'}
          </Badge>
        </div>
        <div className="method-row method-row--first">
          <span className="method-icon">
            <LockIcon size={20} />
          </span>
          <div className="method-body">
            <div className="method-name">{hasPassword ? 'Пароль для входа' : 'Пароль не задан'}</div>
            <p className="method-note">
              {hasPassword
                ? 'Используется вместе с почтой или именем пользователя.'
                : 'Вы входите через подключённый сервис. Пароль можно задать в любой момент.'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setPasswordOpen(true)}>
            {hasPassword ? 'Изменить пароль' : 'Задать пароль'}
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2 className="card-title">Способы входа</h2>
            <p className="card-sub">
              Подключайте сервисы и добавляйте passkey. Пароль меняется отдельно.
            </p>
          </div>
          <Badge tone="accent">Активно: {connectedCount + (hasPassword ? 1 : 0)}</Badge>
        </div>

        <div className="methods">
          {PROVIDER_LIST.map((provider) => {
            const link = user.oauth[provider.id];
            return (
              <div className="method-row" key={provider.id}>
                <span className="method-icon">
                  <ProviderIcon provider={provider.id} size={21} />
                </span>
                <div className="method-body">
                  <div className="method-name">{provider.name} ID</div>
                  <p className="method-note">
                    {link
                      ? link.email
                      : 'Не подключён. Вход в один клик, без пароля.'}
                  </p>
                </div>
                {link ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemoval({ kind: 'oauth', provider: provider.id })}
                  >
                    Отключить
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/oauth/${provider.id}?mode=connect`)}
                  >
                    Подключить
                  </Button>
                )}
              </div>
            );
          })}

          <div className="method-row method-row--stack">
            <span className="method-icon">
              <PasskeyIcon size={21} />
            </span>
            <div className="method-body">
              <div className="method-name">Passkey</div>
              <p className="method-note">
                {user.passkeys.length > 0
                  ? `${user.passkeys.length} passkey на этом аккаунте`
                  : 'Быстрый вход по отпечатку, лицу или PIN устройства.'}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<PlusIcon size={16} />}
              onClick={handleAddPasskey}
              loading={addingPasskey}
              disabled={!passkeysAvailable}
              title={passkeysAvailable ? undefined : 'Браузер не поддерживает passkey'}
            >
              Добавить
            </Button>
          </div>

          {!passkeysAvailable && (
            <p className="inline-note">
              Этот браузер не поддерживает passkey. Попробуйте Chrome, Edge или Safari на
              устройстве с биометрией.
            </p>
          )}

          {user.passkeys.length > 0 && (
            <ul className="passkey-list">
              {user.passkeys.map((passkey) => (
                <li className="passkey-item" key={passkey.id}>
                  <span className="passkey-item-icon">
                    <PasskeyIcon size={18} />
                  </span>
                  <div className="passkey-item-body">
                    <strong>{passkey.name}</strong>
                    <span>Добавлен {formatDate(passkey.createdAt)}</span>
                  </div>
                  <button
                    type="button"
                    className="icon-button icon-button--danger"
                    onClick={() =>
                      setRemoval({ kind: 'passkey', id: passkey.id, name: passkey.name })
                    }
                    aria-label={`Удалить passkey ${passkey.name}`}
                  >
                    <TrashIcon size={17} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2 className="card-title">Двухфакторная аутентификация</h2>
            <p className="card-sub">Второй шаг при входе: код из приложения или push.</p>
          </div>
          <Badge tone="warning">Скоро</Badge>
        </div>
        <div className="method-row method-row--muted">
          <span className="method-icon">
            <ShieldIcon size={20} />
          </span>
          <div className="method-body">
            <div className="method-name">Защита вторым фактором</div>
            <p className="method-note">
              Появится в следующем обновлении. Сейчас работают пароль, OAuth и passkey.
            </p>
          </div>
          <span className="switch switch--disabled" aria-hidden="true">
            <span className="switch-knob" />
          </span>
        </div>
      </div>

      <PasswordModal
        open={passwordOpen}
        hasPassword={hasPassword}
        onClose={() => setPasswordOpen(false)}
      />

      <ConfirmDialog
        open={removal !== null}
        title={removalTitle}
        description={removalDescription}
        confirmLabel={removal?.kind === 'passkey' ? 'Удалить' : 'Отключить'}
        danger
        loading={removing}
        onConfirm={handleRemove}
        onClose={() => {
          if (!removing) setRemoval(null);
        }}
      />
    </>
  );
}
