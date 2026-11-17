import { useState, type InputHTMLAttributes } from 'react';
import { TextField } from './TextField';
import { EyeIcon, EyeOffIcon } from './Icons';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string | null;
  hint?: string;
}

export function PasswordField({
  label,
  error,
  hint,
  autoComplete = 'current-password',
  ...rest
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      label={label}
      error={error}
      hint={hint}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      addon={
        <button
          type="button"
          className="icon-button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
          title={visible ? 'Скрыть пароль' : 'Показать пароль'}
        >
          {visible ? <EyeOffIcon size={19} /> : <EyeIcon size={19} />}
        </button>
      }
      {...rest}
    />
  );
}
