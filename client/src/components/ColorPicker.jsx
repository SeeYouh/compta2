import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  addColorToHistory,
  getColorPreferences,
  setDefaultColor,
  updateColorVariable,
} from './utils/colorPreferencesApi.js';

// ─── Utilitaires couleur ───────────────────────────────────────────────────────

function hexToHsv(hex) {
  const full =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  const r = parseInt(full.slice(1, 3), 16) / 255;
  const g = parseInt(full.slice(3, 5), 16) / 255;
  const b = parseInt(full.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return {
    h,
    s: max === 0 ? 0 : Math.round((delta / max) * 100),
    v: Math.round(max * 100),
  };
}

function hsvToHex(h, s, v) {
  const sn = s / 100;
  const vn = v / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vn - c;
  let r, g, b;
  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }
  const toH = (n) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toH(r)}${toH(g)}${toH(b)}`;
}

function hslToHex(h, s, l) {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r, g, b;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const toH = (n) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${toH(r)}${toH(g)}${toH(b)}`;
}

const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const HISTORY_SIZE = 30;

function isLightColor(hex) {
  const full =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  const r = parseInt(full.slice(1, 3), 16);
  const g = parseInt(full.slice(3, 5), 16);
  const b = parseInt(full.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 140;
}

// ─── Familles de couleurs ──────────────────────────────────────────────────────

const FAMILIES = [
  { key: "red", color: "#ef4444", hueCenter: 0, hueSpread: 20 },
  { key: "orange", color: "#f97316", hueCenter: 25, hueSpread: 15 },
  { key: "yellow", color: "#eab308", hueCenter: 55, hueSpread: 15 },
  { key: "green", color: "#22c55e", hueCenter: 130, hueSpread: 50 },
  { key: "cyan", color: "#06b6d4", hueCenter: 190, hueSpread: 20 },
  { key: "blue", color: "#3b82f6", hueCenter: 220, hueSpread: 40 },
  { key: "purple", color: "#a855f7", hueCenter: 285, hueSpread: 60 },
];

const COLS = 11;
const ROWS = 5;

// Swatches précalculés au chargement du module — tableaux de hex par famille
const FAMILY_SWATCHES = Object.fromEntries(
  FAMILIES.map(({ key, hueCenter, hueSpread }) => {
    const colors = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const h = (hueCenter - hueSpread / 2 + (c / (COLS - 1)) * hueSpread + 360) % 360;
        const s = Math.round(15 + (c / (COLS - 1)) * 80);
        const l = Math.round(95 - (r / (ROWS - 1)) * 82);
        colors.push(hslToHex(Math.round(h), s, l));
      }
    }
    return [key, colors];
  })
);

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * ColorPicker générique et réutilisable.
 *
 * Props :
 *   value          {string}   Couleur initiale (hex). Contrôlée par le parent.
 *   onChange       {function} Appelé UNIQUEMENT au clic "Ok" avec la couleur hex choisie.
 *   onClose        {function} Appelé à la fermeture (Ok ou Annuler).
 *   cssVar         {string}   Nom de la CSS custom property à persister en DB (ex: "--color-primary").
 *   contextKey     {string}   Clé unique pour la couleur par défaut de ce contexte (ex: "app-primary").
 *   defaultColor   {string}   Couleur par défaut fallback si aucune n'est sauvegardée en DB.
 *   showHistory    {boolean}  Afficher la grille d'historique (défaut: true).
 *   showDefaultButtons {boolean} Afficher "Définir par défaut" / "Par défaut" (défaut: true).
 */
export default function ColorPicker({
  value = "#000000",
  onChange,
  onClose,
  cssVar,
  contextKey,
  defaultColor = "#000000",
  showHistory = true,
  showDefaultButtons = true,
}) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [hexInput, setHexInput] = useState(value);
  const [activeFamily, setActiveFamily] = useState("red");
  const [history, setHistory] = useState([]);
  const [savedDefault, setSavedDefault] = useState(null);

  const canvasRef = useRef(null);
  const hueSliderRef = useRef(null);

  // Initialise le state HSV depuis la prop value
  useEffect(() => {
    if (HEX_REGEX.test(value)) {
      const { h, s, v } = hexToHsv(value);
      setHue(h);
      setSaturation(s);
      setBrightness(v);
      setHexInput(value);
    }
  }, [value]);

  // Charge l'historique et la couleur par défaut du contexte depuis la DB
  useEffect(() => {
    getColorPreferences()
      .then(({ history: h, defaults }) => {
        setHistory(h || []);
        if (contextKey && defaults[contextKey]) {
          setSavedDefault(defaults[contextKey]);
        }
      })
      .catch((e) =>
        console.warn("[ColorPicker] Chargement des préférences :", e),
      );
  }, [contextKey]);

  // Redessine le canvas HSV à chaque changement de teinte
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);
    const wGrad = ctx.createLinearGradient(0, 0, width, 0);
    wGrad.addColorStop(0, "rgba(255,255,255,1)");
    wGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = wGrad;
    ctx.fillRect(0, 0, width, height);
    const bGrad = ctx.createLinearGradient(0, 0, 0, height);
    bGrad.addColorStop(0, "rgba(0,0,0,0)");
    bGrad.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = bGrad;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const currentHex = hsvToHex(hue, saturation, brightness);

  // ─── Drag canvas HSV ────────────────────────────────────────────────────────

  const handleCanvasDrag = useCallback(
    (clientX, clientY) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      const s = Math.round(x * 100);
      const v = Math.round((1 - y) * 100);
      setSaturation(s);
      setBrightness(v);
      setHexInput(hsvToHex(hue, s, v));
    },
    [hue],
  );

  const handleCanvasMouseDown = (e) => {
    handleCanvasDrag(e.clientX, e.clientY);
    const onMove = (ev) => handleCanvasDrag(ev.clientX, ev.clientY);
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ─── Drag slider teinte ─────────────────────────────────────────────────────

  const handleHueDrag = useCallback(
    (clientX) => {
      const slider = hueSliderRef.current;
      if (!slider) return;
      const rect = slider.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newHue = Math.round(x * 360);
      setHue(newHue);
      setHexInput(hsvToHex(newHue, saturation, brightness));
    },
    [saturation, brightness],
  );

  const handleHueMouseDown = (e) => {
    handleHueDrag(e.clientX);
    const onMove = (ev) => handleHueDrag(ev.clientX);
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ─── Input hex ──────────────────────────────────────────────────────────────

  const applyHex = (hex) => {
    if (!HEX_REGEX.test(hex)) return;
    const { h, s, v } = hexToHsv(hex);
    setHue(h);
    setSaturation(s);
    setBrightness(v);
    setHexInput(hex);
  };

  const handleHexBlur = () => {
    if (HEX_REGEX.test(hexInput)) applyHex(hexInput);
    else setHexInput(currentHex);
  };

  // ─── Boutons ────────────────────────────────────────────────────────────────

  const handleOk = async () => {
    const hex = currentHex;
    onChange?.(hex);
    try {
      const { history: updated } = await addColorToHistory(hex);
      setHistory(updated);
    } catch (e) {
      console.warn("[ColorPicker] Erreur historique :", e);
    }
    if (cssVar) {
      try {
        await updateColorVariable(cssVar, hex);
      } catch (e) {
        console.warn("[ColorPicker] Erreur variable CSS :", e);
      }
    }
    onClose?.();
  };

  const handleSetDefault = async () => {
    if (!contextKey) return;
    try {
      await setDefaultColor(contextKey, currentHex);
      setSavedDefault(currentHex);
    } catch (e) {
      console.warn("[ColorPicker] Erreur couleur par défaut :", e);
    }
  };

  const handleResetDefault = () => {
    applyHex(savedDefault || defaultColor);
  };

  // ─── Clic swatch ────────────────────────────────────────────────────────────

  const handleSwatchClick = (color) => {
    applyHex(color);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const cursorX = `${saturation}%`;
  const cursorY = `${100 - brightness}%`;
  const hueX = `${(hue / 360) * 100}%`;

  const swatches = FAMILY_SWATCHES[activeFamily] ?? [];

  return (
    <div className="color-picker">
      {/* Zone haute : canvas HSV + colonne actions/historique */}
      <div className="color-picker__top">
        <div className="color-picker__canvas-wrap">
          <canvas
            ref={canvasRef}
            className="color-picker__canvas"
            width={240}
            height={160}
            onMouseDown={handleCanvasMouseDown}
          />
          <div
            className="color-picker__canvas-cursor"
            style={{ left: cursorX, top: cursorY, background: currentHex }}
          />
        </div>

        <div className="color-picker__right">
          <div className="color-picker__actions">
            <div className="color-picker__actions-row">
              <button type="button" className="color-picker__btn" onClick={handleOk}>
                Ok
              </button>
              <button
                type="button"
                className="color-picker__btn color-picker__btn"
                onClick={() => onClose?.()}
              >
                Annuler
              </button>
            </div>
            {showDefaultButtons && contextKey && (
              <>
                <button
                  type="button"
                  className="color-picker__btn color-picker__btn--secondary"
                  onClick={handleSetDefault}
                >
                  Définir par défaut
                </button>
                <button
                  type="button"
                  className="color-picker__btn color-picker__btn--secondary"
                  onClick={handleResetDefault}
                >
                  Par défaut
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Zone milieu : slider+hex | historique */}
      <div className="color-picker__mid">
        <div className="color-picker__controls">
          {/* Slider teinte */}
          <div className="color-picker__hue-wrap">
            <div
              ref={hueSliderRef}
              className="color-picker__hue-slider"
              onMouseDown={handleHueMouseDown}
            >
              <div
                className="color-picker__hue-cursor"
                style={{ left: hueX, background: `hsl(${hue}, 100%, 50%)` }}
              />
            </div>
          </div>

          {/* Aperçu + input hex */}
          <div className="color-picker__preview-row">
            <div
              className="color-picker__preview"
              style={{ background: currentHex }}
            />
            <input
              type="text"
              className="color-picker__hex-input"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={handleHexBlur}
              onKeyDown={(e) => e.key === "Enter" && handleHexBlur()}
              maxLength={7}
              spellCheck={false}
              style={{
                background: currentHex,
                color: isLightColor(currentHex) ? "var(--color-darker)" : "var(--color-lightness)",
              }}
            />
          </div>
        </div>

        {showHistory && (
          <div className="color-picker__history">
            {Array.from({ length: HISTORY_SIZE }).map((_, i) => (
              <div
                key={i}
                className={`color-picker__history-slot${history[i] ? " color-picker__history-slot--filled" : ""}`}
                style={history[i] ? { background: history[i] } : undefined}
                onClick={() => history[i] && handleSwatchClick(history[i])}
                title={history[i] || ""}
              />
            ))}
          </div>
        )}
      </div>

      {/* Zone basse : familles + palette */}
      <div className="color-picker__bottom">
        <div className="color-picker__families">
          {FAMILIES.map((f) => (
            <div
              key={f.key}
              className={`color-picker__family-btn${activeFamily === f.key ? " color-picker__family-btn--active" : ""}`}
              style={{ background: f.color }}
              onClick={() => setActiveFamily(f.key)}
              title={f.key}
            />
          ))}
        </div>

        <div
          className="color-picker__swatches"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {swatches.map((color, i) => (
            <div
              key={i}
              className={`color-picker__swatch${hexInput === color ? " color-picker__swatch--active" : ""}`}
              style={{ background: color }}
              onClick={() => handleSwatchClick(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
