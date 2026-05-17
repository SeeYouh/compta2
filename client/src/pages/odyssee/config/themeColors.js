import { darken, getContrast, lighten } from "../utils/colorUtils.js";

// Couleur de base par défaut du thème Odyssée (miroir de $color-1 dans __variable.scss)
export const DEFAULT_THEME_COLOR = "#969696";

// Coefficients de luminosité (miroir de $change-brightness * n dans __variable.scss)
const LIGHTNESS = 88;
const LIGHT = 69;
const DARK = 53;
const DARKER = 66;
const DARKEST = 73;

// Couleurs sémantiques fixes (indépendantes de la couleur de base)
export const COLOR_DANGER = "#c0392b";
export const COLOR_DANGER_LIGHT = "#e57373";

/**
 * Calcule toutes les CSS custom properties du thème à partir d'une couleur de base.
 * @param {string} baseColor — hex (#rrggbb)
 * @returns {Object} map { "--color-xxx": "valeur" }
 */
export function computeThemeTokens(baseColor) {
  const colorLightness = lighten(baseColor, LIGHTNESS);
  const colorLight = lighten(baseColor, LIGHT);
  const colorDark = darken(baseColor, DARK);
  const colorDarker = darken(baseColor, DARKER);
  const colorDarkest = darken(baseColor, DARKEST);

  return {
    "--color-1": baseColor,
    "--color-lightness": colorLightness,
    "--color-light": colorLight,
    "--color-dark": colorDark,
    "--color-darker": colorDarker,
    "--color-darkest": colorDarkest,
    "--color-danger": COLOR_DANGER,
    "--color-danger-light": COLOR_DANGER_LIGHT,

    // Valeurs pré-calculées pour remplacer get-contrast($color-xxx) dans le SCSS
    "--color-contrast-1": getContrast(baseColor),
    "--color-contrast-lightness": getContrast(colorLightness),
    "--color-contrast-light": getContrast(colorLight),
    "--color-contrast-dark": getContrast(colorDark),
    "--color-contrast-darker": getContrast(colorDarker),
    "--color-contrast-darkest": getContrast(colorDarkest),
  };
}

/**
 * Injecte les CSS custom properties du thème sur :root.
 * @param {string} baseColor — hex (#rrggbb), défaut = DEFAULT_THEME_COLOR
 */
export function applyThemeColors(baseColor = DEFAULT_THEME_COLOR) {
  const tokens = computeThemeTokens(baseColor);
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(tokens)) {
    root.style.setProperty(prop, value);
  }
}
