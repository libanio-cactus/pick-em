"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Modal({
  open,
  onClose,
  title,
  description,
  width = 440,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full rounded-card border border-border bg-surface shadow-[var(--shadow-modal)]"
        style={{ maxWidth: width }}
      >
        <div className="flex items-start justify-between gap-4 p-5 pb-3">
          <div>
            <h2 className="font-heading text-xl font-bold text-text">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-text-2">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className={cn(
              "grid place-items-center h-10 w-10 rounded-btn shrink-0 -mr-1 -mt-1",
              "text-text-2 hover:bg-surface-2 hover:text-text transition-colors",
            )}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="px-5 py-2">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-5 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
