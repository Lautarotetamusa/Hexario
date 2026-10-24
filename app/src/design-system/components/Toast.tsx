import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from '../theme/tokens';
import { IconCheck } from './icons';

type ToastItem = { id: number; message: ReactNode; icon?: ReactNode };

/** Toast de confirmación: una línea, arriba al centro, se va solo a los 3 s. */
export function Toast({ message, icon }: { message: ReactNode; icon?: ReactNode }) {
  return (
    <div className="hx-toast">
      <span className="hx-toast__badge">{icon ?? <IconCheck size={16} strokeWidth={2.5} />}</span>
      {message}
    </div>
  );
}

const ToastContext = createContext<(message: ReactNode, icon?: ReactNode) => void>(() => {});

/** Envolvé la app con <ToastProvider> y llamá useToast()('Hexágono reclamado'). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const seq = useRef(0);

  const show = useCallback((message: ReactNode, icon?: ReactNode) => {
    window.clearTimeout(timer.current);
    seq.current += 1;
    setCurrent({ id: seq.current, message, icon });
    timer.current = window.setTimeout(() => setCurrent(null), motion.toast.visible);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="hx-toast-region" role="status" aria-live="polite">
        {current && <Toast key={current.id} message={current.message} icon={current.icon} />}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
