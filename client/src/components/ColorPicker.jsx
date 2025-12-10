import { useEffect, useRef, useState } from "react";

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
const STORAGE_KEY = "app-primary-color";

export default function ColorPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(DEFAULT_COLOR);
  const [customColor, setCustomColor] = useState(DEFAULT_COLOR);
  const [hexInput, setHexInput] = useState(DEFAULT_COLOR);
  const pickerRef = useRef(null);

  useClickOutside(pickerRef, () => setIsOpen(false));

  // Charger la couleur sauvegardée au montage
  useEffect(() => {
    const savedColor = localStorage.getItem(STORAGE_KEY);
    if (savedColor) {
      setCurrentColor(savedColor);
      setCustomColor(savedColor);
      setHexInput(savedColor);
      applyColorToDocument(savedColor);
    }
  }, []);

  const applyColorToDocument = (color) => {
    document.documentElement.style.setProperty("--color-primary", color);
  };

  const handleColorSelect = (color) => {
    setCurrentColor(color);
    setCustomColor(color);
    setHexInput(color);
    applyColorToDocument(color);
    localStorage.setItem(STORAGE_KEY, color);
  };

  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setCustomColor(color);
    setCurrentColor(color);
    setHexInput(color);
    applyColorToDocument(color);
    localStorage.setItem(STORAGE_KEY, color);
  };

  const handleReset = () => {
    setCurrentColor(DEFAULT_COLOR);
    setCustomColor(DEFAULT_COLOR);
    setHexInput(DEFAULT_COLOR);
    applyColorToDocument(DEFAULT_COLOR);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleHexInputChange = (e) => {
    const value = e.target.value;
    setHexInput(value);
  };

  const handleHexInputBlur = () => {
    // Validation du format hexa
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexPattern.test(hexInput)) {
      setCurrentColor(hexInput);
      setCustomColor(hexInput);
      applyColorToDocument(hexInput);
      localStorage.setItem(STORAGE_KEY, hexInput);
    } else {
      // Si invalide, revenir à la dernière couleur valide
      setHexInput(currentColor);
    }
  };

  const handleHexInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur(); // Déclenche la validation
    }
  };

  const togglePicker = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="color-picker" ref={pickerRef}>
      <button
        className="color-picker__trigger"
        onClick={togglePicker}
        aria-label="Choisir la couleur principale"
        title="Personnaliser la couleur"
      >
        🎨
      </button>

      {isOpen && (
        <div className="color-picker__panel">
          <div className="color-picker__header">
            <h3>Couleur principale</h3>
            <button
              className="color-picker__reset"
              onClick={handleReset}
              title="Réinitialiser au bleu par défaut"
            >
              ↺ Reset
            </button>
          </div>

          <div className="color-picker__presets">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.value}
                className={`color-picker__preset ${
                  currentColor === preset.value ? "active" : ""
                }`}
                style={{ backgroundColor: preset.value }}
                onClick={() => handleColorSelect(preset.value)}
                title={preset.name}
                aria-label={preset.name}
              />
            ))}
          </div>

          <div className="color-picker__custom">
            <label htmlFor="custom-color">Couleur personnalisée :</label>
            <div className="color-picker__input-wrapper">
              <input
                id="custom-color"
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
              />
              <input
                type="text"
                className="color-picker__hex"
                value={hexInput}
                onChange={handleHexInputChange}
                onBlur={handleHexInputBlur}
                onKeyDown={handleHexInputKeyDown}
                placeholder="#000000"
                maxLength={7}
                aria-label="Code couleur hexadécimal"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
