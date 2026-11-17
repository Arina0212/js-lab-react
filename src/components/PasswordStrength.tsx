import { PASSWORD_SCORE_LABELS, passwordScore } from '../lib/validation';

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const score = passwordScore(value);

  return (
    <div className={`strength strength--${score}`}>
      <div className="strength-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className={step <= score ? 'strength-bar strength-bar--on' : 'strength-bar'} />
        ))}
      </div>
      <span className="strength-label">{PASSWORD_SCORE_LABELS[score]}</span>
    </div>
  );
}
