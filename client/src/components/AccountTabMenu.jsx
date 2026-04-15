import { useRef, useState } from "react";

import styles from "../sass/components/AccountTabMenu.module.scss";
import { useClickOutside } from "./hooks/useClickOutside";

const PRESET_COLORS = [
  { name: "Bleu par défaut", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Pourpre", value: "#a855f7" },
  { name: "Rose", value: "#ec4899" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Turquoise", value: "#14b8a6" },
  { name: "Émeraude", value: "#10b981" },
  { name: "Lime", value: "#84cc16" },
  { name: "Ambre", value: "#f59e0b" },
  { name: "Orange", value: "#f97316" },
  { name: "Ardoise", value: "#64748b" },
];

const DEFAULT_COLOR = "#3b82f6";

export default function AccountTabMenu({
  account,
  isVisible,
  onRename,
  onDeleteRequest,
  onColorChange,
  onShare,
  onClose,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(account.name);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState(account.color);
  const [hexInput, setHexInput] = useState(account.color);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useClickOutside(menuRef, onClose);

  const handleRenameClick = () => {
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (newName.trim() && newName !== account.name) {
      await onRename(newName.trim());
    }
    setIsEditingName(false);
  };

  const handleRenameCancel = () => {
    setNewName(account.name);
    setIsEditingName(false);
  };

  const handleDeleteClick = () => {
    onDeleteRequest();
  };

  const handleColorSelect = (color) => {
    setCustomColor(color);
    setHexInput(color);
    onColorChange(color);
  };

  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    setHexInput(color);
    onColorChange(color);
  };

  const handleHexInputChange = (e) => {
    const value = e.target.value;
    setHexInput(value);
  };

  const handleHexInputBlur = () => {
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexPattern.test(hexInput)) {
      setCustomColor(hexInput);
      onColorChange(hexInput);
    } else {
      setHexInput(account.color);
    }
  };

  const handleHexInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const handleReset = () => {
    setCustomColor(DEFAULT_COLOR);
    setHexInput(DEFAULT_COLOR);
    onColorChange(DEFAULT_COLOR);
  };

  if (!isVisible) return null;

  return (
    <div ref={menuRef} className={styles.menu}>
      {isEditingName ? (
        <form onSubmit={handleRenameSubmit} className={styles.editForm}>
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRenameCancel}
            onKeyDown={(e) => {
              if (e.key === "Escape") handleRenameCancel();
            }}
            className={styles.editInput}
            maxLength={50}
          />
        </form>
      ) : (
        <>
          <button
            type="button"
            className={styles.menuButton}
            onClick={handleRenameClick}
            title="Renommer le compte"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>

          <div className={styles.colorPickerWrapper}>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Changer la couleur"
            >
              🎨
            </button>

            {showColorPicker && (
              <div className={styles.colorPicker}>
                <div className={styles.colorHeader}>
                  <h4>Couleur du compte</h4>
                  <button
                    type="button"
                    className={styles.resetButton}
                    onClick={handleReset}
                    title="Réinitialiser au bleu par défaut"
                  >
                    ↺ Reset
                  </button>
                </div>

                <div className={styles.colorPresets}>
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      className={`${styles.colorPreset} ${
                        account.color === preset.value ? styles.active : ""
                      }`}
                      style={{ backgroundColor: preset.value }}
                      onClick={() => handleColorSelect(preset.value)}
                      title={preset.name}
                    />
                  ))}
                </div>

                <div className={styles.colorCustom}>
                  <label htmlFor={`custom-color-${account.id}`}>
                    Couleur personnalisée :
                  </label>
                  <div className={styles.colorInputWrapper}>
                    <input
                      id={`custom-color-${account.id}`}
                      type="color"
                      value={customColor}
                      onChange={handleCustomColorChange}
                    />
                    <input
                      type="text"
                      className={styles.colorHex}
                      value={hexInput}
                      onChange={handleHexInputChange}
                      onBlur={handleHexInputBlur}
                      onKeyDown={handleHexInputKeyDown}
                      placeholder="#000000"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className={styles.menuButton}
            onClick={() => onShare?.(account.id)}
            title="Partager le compte"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>

          <button
            type="button"
            className={`${styles.menuButton} ${styles.deleteButton}`}
            onClick={handleDeleteClick}
            title="Supprimer le compte"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
