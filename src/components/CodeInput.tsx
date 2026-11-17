import { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

const LENGTH = 6;

export function CodeInput({ value, onChange, error, disabled, autoFocus }: CodeInputProps) {
  const [chars, setChars] = useState<string[]>(() => Array<string>(LENGTH).fill(''));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (value === chars.join('')) return;
    const next = Array<string>(LENGTH).fill('');
    value
      .split('')
      .slice(0, LENGTH)
      .forEach((digit, index) => {
        next[index] = digit;
      });
    setChars(next);
  }, [value, chars]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function commit(next: string[]) {
    setChars(next);
    onChange(next.join(''));
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      const next = [...chars];
      next[index] = '';
      commit(next);
      return;
    }

    const next = [...chars];
    for (let offset = 0; offset < digits.length && index + offset < LENGTH; offset += 1) {
      next[index + offset] = digits[offset];
    }
    commit(next);
    const focusIndex = Math.min(index + digits.length, LENGTH - 1);
    refs.current[focusIndex]?.focus();
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = [...chars];
      if (next[index]) {
        next[index] = '';
        commit(next);
      } else if (index > 0) {
        next[index - 1] = '';
        commit(next);
        refs.current[index - 1]?.focus();
      }
      return;
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < LENGTH - 1) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!digits) return;
    event.preventDefault();
    const next = Array<string>(LENGTH).fill('');
    digits.split('').forEach((digit, index) => {
      next[index] = digit;
    });
    commit(next);
    refs.current[Math.min(digits.length, LENGTH - 1)]?.focus();
  }

  return (
    <div className={cn('code', error && 'code--error')} onPaste={handlePaste}>
      {chars.map((char, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          className="code__input"
          value={char}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.target.select()}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Цифра ${index + 1}`}
          aria-invalid={error || undefined}
        />
      ))}
    </div>
  );
}
