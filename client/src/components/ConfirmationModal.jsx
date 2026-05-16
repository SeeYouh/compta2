import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { APP_LABELS } from './utils';

function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  title = APP_LABELS.confirmTitle,
  message,
  confirmText = APP_LABELS.confirmButton,
  cancelText = APP_LABELS.confirmCancelButton,
  requireTextConfirmation = false,
  confirmationText = "",
  confirmationPlaceholder = "Tapez pour confirmer",
  toggleLabel = null,
  toggleChecked = false,
  onToggleChange = null,
  softDanger = false,
}) {
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  const isConfirmDisabled =
    requireTextConfirmation && inputValue !== confirmationText;

  // Reset input when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  // Focus sur l'input ou le bouton selon le mode
  useEffect(() => {
    if (isOpen) {
      if (requireTextConfirmation && inputRef.current) {
        inputRef.current.focus();
      } else if (confirmButtonRef.current) {
        confirmButtonRef.current.focus();
      }
    }
  }, [isOpen, requireTextConfirmation]);

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Enter" && !isConfirmDisabled) {
        onConfirm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onConfirm, onCancel, isConfirmDisabled]);

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-message"
      >
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">
            {title}
          </h3>
        </div>

        <div className="modal-body">
          <p id="modal-message" className="modal-message">
            {message}
          </p>
          {requireTextConfirmation && (
            <div className="modal-confirmation-input">
              <label htmlFor="confirmation-input">
                Tapez <strong>{confirmationText}</strong> pour confirmer :
              </label>
              <input
                id="confirmation-input"
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={confirmationPlaceholder}
                className="form-input"
              />
            </div>
          )}
          {toggleLabel && (
            <div className="modal-toggle">
              <span className="modal-toggle__label">{toggleLabel}</span>
              <div className="modal-toggle__options">
                <button
                  type="button"
                  className={`modal-toggle__opt${!toggleChecked ? " modal-toggle__opt--active" : ""}`}
                  onClick={() => onToggleChange?.(false)}
                >
                  NON
                </button>
                <button
                  type="button"
                  className={`modal-toggle__opt${toggleChecked ? " modal-toggle__opt--danger" : ""}`}
                  onClick={() => onToggleChange?.(true)}
                >
                  OUI
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${softDanger ? "btn-danger-soft" : "btn-danger"}`}
            onClick={onConfirm}
            ref={confirmButtonRef}
            disabled={isConfirmDisabled}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
