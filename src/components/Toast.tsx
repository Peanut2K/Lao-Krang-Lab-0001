"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ToastApi = { flash: (message: string) => void };

const ToastContext = createContext<ToastApi>({ flash: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((next: string) => {
    setMessage(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 2400);
  }, []);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  return (
    <ToastContext.Provider value={{ flash }}>
      {children}
      {message ? <div className="toast">{message}</div> : null}
    </ToastContext.Provider>
  );
}
