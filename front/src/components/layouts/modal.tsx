import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { X } from "lucide-react";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "auto";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  className?: string;
  hideCloseButton?: boolean;
  closeOnBackdrop?: boolean;
}

const sizeClasses: Record<Exclude<ModalSize, "auto">, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className,
  hideCloseButton,
  closeOnBackdrop = true,
}: ModalProps) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(open);
  const [exiting, setExiting] = useState(false);
  const exitDurationMs = 200;

  // Fechar com tecla ESC
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, onClose]);

  // Controla montagem para permitir animação de saída
  useEffect(() => {
    let t: number | undefined;
    if (open) {
      setMounted(true);
      setExiting(false);
    } else if (mounted) {
      setExiting(true);
      // aguarda animação de saída antes de desmontar
      t = window.setTimeout(() => {
        setMounted(false);
        setExiting(false);
      }, exitDurationMs);
    }
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [open, mounted]);

  if (!mounted) return null;

  const modalContent = (
    <div
      ref={backdropRef}
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-dark/60 backdrop-blur-sm",
        exiting ? "animate-out fade-out-0 duration-200" : "animate-in fade-in-0 duration-200"
      )}
      onMouseDown={(e) => {
        if (!closeOnBackdrop) return;
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div
        className={clsx(
          // When size is 'auto', do not force full width; let content define width up to viewport padding
          size === "auto" ? "w-auto max-w-[calc(100vw-2rem)]" : "w-full",
          "bg-light text-font border border-light-border rounded-2xl shadow-xl",
          exiting ? "animate-out fade-out-0 zoom-out-95 duration-200" : "animate-in fade-in-0 zoom-in-95 duration-200",
          size === "auto" ? undefined : sizeClasses[size as Exclude<ModalSize, "auto">],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-light-border">
            {title ? (
              <h2 id="modal-title" className="text-lg font-semibold">
                {title}
              </h2>
            ) : <span />}
            {!hideCloseButton && (
              <button
                type="button"
                aria-label="Fechar"
                onClick={onClose}
                className="inline-flex items-center justify-center size-8 rounded-full hover:bg-input text-font/70 hover:text-primary transition-colors"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        )}

        <div className="px-5 py-4">{children}</div>

        {footer && (
          <div className="px-5 py-4 border-t border-light-border bg-light/60 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Elementos auxiliares opcionais para composição
export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("flex items-center justify-end gap-2", className)}>{children}</div>
  );
}

export function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
}: {
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  return (
    <ModalFooter>
      <button
        type="button"
        onClick={onCancel}
        className="h-10 px-4 rounded-lg border border-input-border bg-input text-font hover:border-primary/60"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="h-10 px-4 rounded-lg bg-primary text-dark font-semibold hover:opacity-90"
      >
        {confirmLabel}
      </button>
    </ModalFooter>
  );
}
