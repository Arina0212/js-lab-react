import { Logo } from './Logo';

export function Splash() {
  return (
    <div className="splash">
      <div className="splash-inner">
        <Logo />
        <span className="splash-loader" aria-hidden="true" />
        <p>Загружаем аккаунт</p>
      </div>
    </div>
  );
}
