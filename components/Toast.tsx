"use client";

import { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

const ToastContext = createContext<{ toast: (message: string, type?: ToastType) => void }>({
  toast: () => {},
});

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let nextId = 0;

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const colors: Record<ToastType, { bg: string; text: string; border: string }> = {
    success: { bg: "rgba(10,110,59,0.06)", text: "#0A6E3B", border: "rgba(10,110,59,0.15)" },
    error: { bg: "rgba(138,50,36,0.06)", text: "#8A3324", border: "rgba(138,50,36,0.15)" },
    info: { bg: "rgba(10,10,11,0.04)", text: "#0A0A0B", border: "#E8E6E1" },
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 99999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
        {toasts.map(t => {
          const c = colors[t.type];
          return (
            <div key={t.id} style={{
              padding: "12px 20px", background: c.bg, border: `1px solid ${c.border}`,
              borderRadius: 12, color: c.text, fontSize: 13, fontWeight: 500,
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              animation: "toastIn 0.3s ease",
              pointerEvents: "auto",
            }}>
              {t.message}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
