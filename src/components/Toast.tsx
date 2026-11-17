import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircleIcon, CheckCircleIcon, InfoIcon, XIcon } from './Icons';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function dismiss(id: number) {
    setToasts((items) => items.filter((item) => item.id !== id));
  }

  function showToast(message: string, kind: ToastKind = 'success') {
    const id = nextId;
    nextId += 1;
    setToasts((items) => [...items, { id, message, kind }]);
    window.setTimeout(() => dismiss(id), 4600);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toasts" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.kind}`} role="status">
            <span className="toast-icon" aria-hidden="true">
              {toast.kind === 'success' && <CheckCircleIcon size={19} />}
              {toast.kind === 'error' && <AlertCircleIcon size={19} />}
              {toast.kind === 'info' && <InfoIcon size={19} />}
            </span>
            <span className="toast-text">{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismiss(toast.id)}
              aria-label="Закрыть уведомление"
            >
              <XIcon size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
