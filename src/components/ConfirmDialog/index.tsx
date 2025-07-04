//
import React, { useEffect, useRef } from "react";
import "./styles.scss";

export interface DialogAction<T = any> {
  label: string;
  value: T;
  type?: "default" | "primary" | "danger" | "warning" | "info";
  autoFocus?: boolean;
}

interface ConfirmDialogProps<T = any> {
  isOpen: boolean;
  title: string;
  message: string;
  actions: DialogAction<T>[];
  onClose: (value: T) => void;
  dialogType?: "warning" | "danger" | "info";
}

export default function ConfirmDialog<T>({
  isOpen,
  title,
  message,
  actions,
  onClose,
  dialogType = "warning",
}: ConfirmDialogProps<T>) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const defaultButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key press - selects the last action (usually cancel)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && actions.length > 0) {
        onClose(actions[actions.length - 1].value);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, actions]);

  // Focus the default button when dialog opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (defaultButtonRef.current) {
          defaultButtonRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle click outside dialog
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (
      dialogRef.current &&
      !dialogRef.current.contains(e.target as Node) &&
      actions.length > 0
    ) {
      onClose(actions[actions.length - 1].value);
    }
  };

  const handleClose = () => {
    if (actions.length > 0) {
      onClose(actions[actions.length - 1].value);
    }
  };

  return (
    <div className="confirm-dialog-overlay" onClick={handleBackdropClick}>
      <div
        className={`confirm-dialog ${dialogType}`}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="dialog-header">
          <h3 id="dialog-title">{title}</h3>
          <button
            className="dialog-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div className="dialog-content">
          <div className="dialog-icon">
            {dialogType === "danger" && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="svg-icon"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  fill="currentColor"
                />
              </svg>
            )}
            {dialogType === "warning" && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="svg-icon"
              >
                <path
                  d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                  fill="currentColor"
                />
              </svg>
            )}
            {dialogType === "info" && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="svg-icon"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                  fill="currentColor"
                />
              </svg>
            )}
          </div>
          <p className="dialog-message">{message}</p>
        </div>
        <div className="dialog-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              ref={action.autoFocus ? defaultButtonRef : undefined}
              className={`dialog-button ${action.type || "default"}`}
              onClick={() => onClose(action.value)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
