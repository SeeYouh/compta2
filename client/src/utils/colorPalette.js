import {
  darken,
  getContrast,
  lighten,
} from './colorUtils.js';

export const DEFAULT_COLOR = "#969696";

// Constantes identiques aux thèmes (conservées pour cohérence)
const LIGHTNESS = 88;
const LIGHT = 69;
const DARK = 53;
const DARKER = 66;
const DARKEST = 73;

// Niveau de désaturation appliqué aux variantes "muted" (0–100)
const DESAT = 55;

/**
 * Calcule une palette complète de couleurs à partir d'une couleur hexadécimale.
 * Retourne un objet JS avec des clés lisibles (pas des noms de variables CSS).
 *
 * @param {string} hex - Couleur hexadécimale (ex: "#969696")
 * @returns {Object} Palette complète avec variantes claires, sombres, désaturées et contrastes
 */
export function computeColorPalette(hex = DEFAULT_COLOR) {
  const lightness = lighten(hex, LIGHTNESS);
  const light = lighten(hex, LIGHT);
  const dark = darken(hex, DARK);
  const darker = darken(hex, DARKER);
  const darkest = darken(hex, DARKEST);

  const lightnessMuted = lighten(hex, LIGHTNESS, DESAT);
  const lightMuted     = lighten(hex, LIGHT, DESAT);
  const darkMuted      = darken(hex, DARK, DESAT);
  const darkerMuted    = darken(hex, DARKER, DESAT);
  const darkestMuted   = darken(hex, DARKEST, DESAT);

  return {
    base: hex,
    lightness,
    light,
    dark,
    darker,
    darkest,
    lightnessMuted,
    lightMuted,
    darkMuted,
    darkerMuted,
    darkestMuted,
    contrastBase: getContrast(hex),
    contrastLightness: getContrast(lightness),
    contrastLight: getContrast(light),
    contrastDark: getContrast(dark),
    contrastDarker: getContrast(darker),
    contrastDarkest: getContrast(darkest),
    danger: "#6c0a0a",
    dangerLight: "#6c0a0a",
  };
}

/**
 * Retourne un objet de variables CSS `--lex-*` pour la toolbar de LexicalEditor,
 * calculées à partir de la palette standardisée d'une couleur de bloc.
 * Conçu pour être passé directement à l'attribut `style` du composant.
 *
 * @param {string} hex - Couleur hexadécimale
 * @returns {Object} Variables CSS pour LexicalEditor
 */
export function getLexicalColorVars(hex) {
  if (!hex) return {};
  const palette = computeColorPalette(hex);
  return {
    "--lex-border": palette.light,
    "--lex-hover": palette.base,
    "--lex-text": palette.darker,
    "--lex-active-bg": palette.light,
    "--lex-active-border": palette.dark,
    "--lex-select-bg": palette.lightness,
    "--lex-select-border": palette.light,
  };
}

/**
 * Converti #RRGGBB en rgba(r, g, b, a)
 */
function hexToRgba(hex, alpha = 1) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Génère une string CSS avec toutes les variables de couleur pour un préfixe donné.
 * Utilisable par n'importe quel module (Dashboard, Synapse, Trame, etc.)
 * pour les deux modes (light et dark).
 *
 * @param {string} hex - Couleur hexadécimale primaire
 * @param {string} prefix - Préfixe des variables CSS (ex: "color", "dashboard", "synapse")
 * @returns {string} CSS complet avec :root et [data-theme="dark"]
 */
export function generateColorVars(hex = DEFAULT_COLOR, prefix = "color") {
  if (!hex) hex = DEFAULT_COLOR;

  const success = "#22c55e";
  const danger = "#ef4444";

  // ─── Mode clair ───────────────────────────────────────────────────────────
  const lPrimary = hex;
  const lP900 = darken(lPrimary, 60);
  const lP800 = darken(lPrimary, 50);
  const lP700 = darken(lPrimary, 35);
  const lP600 = lPrimary;
  const lP500 = lighten(lPrimary, 25);
  const lP400 = lighten(lPrimary, 45);
  const lP300 = lighten(lPrimary, 65);
  const lP200 = lighten(lPrimary, 80);
  const lP100 = lighten(lPrimary, 90);
  const lP50  = lighten(lPrimary, 95);
  const lP20  = lighten(lPrimary, 97);
  const lP10  = lighten(lPrimary, 98);
  const lP5   = lighten(lPrimary, 99);
  const lP4   = lighten(lPrimary, 99.5);

  const lN900 = darken(lPrimary, 85);
  const lN700 = darken(lPrimary, 60);
  const lN400 = lighten(lPrimary, 85);
  const lN200 = lighten(lPrimary, 90);
  const lN150 = lighten(lPrimary, 92);
  const lN100 = lighten(lPrimary, 93);
  const lN50  = lighten(lPrimary, 95);

  // ─── Mode sombre ──────────────────────────────────────────────────────────
  const dPrimary = hex;
  const dP900 = lighten(dPrimary, 50);
  const dP800 = lighten(dPrimary, 35);
  const dP700 = lighten(dPrimary, 20);
  const dP600 = dPrimary;
  const dP500 = darken(dPrimary, 15);
  const dP400 = darken(dPrimary, 30);
  const dP300 = darken(dPrimary, 40);
  const dP200 = darken(dPrimary, 50);
  const dP100 = darken(dPrimary, 55);
  const dP50  = darken(dPrimary, 60);
  const dP20  = darken(dPrimary, 80);
  const dP10  = darken(dPrimary, 80);
  const dP5   = darken(dPrimary, 40);
  const dP4   = darken(dPrimary, 20);

  const dN900 = lighten(dPrimary, 93);
  const dN700 = lighten(dPrimary, 65);
  const dN400 = darken(dPrimary, 70);
  const dN200 = darken(dPrimary, 70);
  const dN150 = darken(dPrimary, 78);
  const dN100 = darken(dPrimary, 75);
  const dN50  = darken(dPrimary, 85);

  // ─── Variables ColorPicker scindées par mode ─────────────────────────────
  // --{prefix}-darker = fond du picker, --{prefix}-lightness = curseurs visibles
  const lPickerVars = `
      --${prefix}-1: ${lPrimary};
      --${prefix}-lightness: ${lN900};
      --${prefix}-light: ${lN400};
      --${prefix}-dark: ${lN200};
      --${prefix}-darker: ${lN100};
      --${prefix}-darkest: ${lN50};`;

  const dPickerVars = `
      --${prefix}-1: ${dPrimary};
      --${prefix}-lightness: ${dN900};
      --${prefix}-light: ${dN400};
      --${prefix}-dark: ${dN150};
      --${prefix}-darker: ${dN100};
      --${prefix}-darkest: ${dN50};`;

  // ─── Variables communes (success, danger) ────────────────────────────────
  const commonVars = `
      --${prefix}-success: ${success};
      --${prefix}-success-900: ${darken(success, 60)};
      --${prefix}-success-800: ${darken(success, 50)};
      --${prefix}-success-700: ${darken(success, 35)};
      --${prefix}-success-600: ${success};
      --${prefix}-success-500: ${lighten(success, 15)};
      --${prefix}-success-400: ${lighten(success, 35)};
      --${prefix}-success-300: ${lighten(success, 50)};
      --${prefix}-success-200: ${lighten(success, 70)};
      --${prefix}-success-100: ${lighten(success, 85)};

      --${prefix}-danger: ${danger};
      --${prefix}-danger-900: ${darken(danger, 60)};
      --${prefix}-danger-800: ${darken(danger, 50)};
      --${prefix}-danger-700: ${darken(danger, 35)};
      --${prefix}-danger-600: ${danger};
      --${prefix}-danger-500: ${lighten(danger, 15)};
      --${prefix}-danger-400: ${lighten(danger, 30)};
      --${prefix}-danger-300: ${lighten(danger, 45)};
      --${prefix}-danger-200: ${lighten(danger, 60)};
      --${prefix}-danger-100: ${lighten(danger, 85)};`;

  return `
    :root {
      --${prefix}-primary: ${lPrimary};
      --${prefix}-primary-900: ${lP900};
      --${prefix}-primary-800: ${lP800};
      --${prefix}-primary-700: ${lP700};
      --${prefix}-primary-600: ${lP600};
      --${prefix}-primary-500: ${lP500};
      --${prefix}-primary-400: ${lP400};
      --${prefix}-primary-300: ${lP300};
      --${prefix}-primary-200: ${lP200};
      --${prefix}-primary-100: ${lP100};
      --${prefix}-primary-50: ${lP50};
      --${prefix}-primary-20: ${lP20};
      --${prefix}-primary-10: ${lP10};
      --${prefix}-primary-5: ${lP5};
      --${prefix}-primary-4: ${lP4};
      --${prefix}-primary-alpha-10: ${hexToRgba(hex, 0.1)};
      --${prefix}-primary-alpha-15: ${hexToRgba(hex, 0.15)};
      --${prefix}-primary-alpha-30: ${hexToRgba(hex, 0.3)};
      --${prefix}-primary-alpha-40: ${hexToRgba(hex, 0.4)};
      --${prefix}-neutral-900: ${lN900};
      --${prefix}-neutral-700: ${lN700};
      --${prefix}-neutral-400: ${lN400};
      --${prefix}-neutral-200: ${lN200};
      --${prefix}-neutral-150: ${lN150};
      --${prefix}-neutral-100: ${lN100};
      --${prefix}-neutral-50: ${lN50};
      --${prefix}-bg: ${lN400};
      --${prefix}-subSurface: ${lN150};
      --${prefix}-surface: ${lN100};
      --${prefix}-surface-hover: ${lN200};
      --${prefix}-text: ${lN900};
      --${prefix}-text-dim: ${lN700};
      --${prefix}-border: ${lN400};
      --${prefix}-accent: ${lP600};
      --${prefix}-accent-hover: ${lP700};
      ${commonVars}
      ${lPickerVars}
    }

    [data-theme="dark"] {
      --${prefix}-primary: ${dPrimary};
      --${prefix}-primary-900: ${dP900};
      --${prefix}-primary-800: ${dP800};
      --${prefix}-primary-700: ${dP700};
      --${prefix}-primary-600: ${dP600};
      --${prefix}-primary-500: ${dP500};
      --${prefix}-primary-400: ${dP400};
      --${prefix}-primary-300: ${dP300};
      --${prefix}-primary-200: ${dP200};
      --${prefix}-primary-100: ${dP100};
      --${prefix}-primary-50: ${dP50};
      --${prefix}-primary-20: ${dP20};
      --${prefix}-primary-10: ${dP10};
      --${prefix}-primary-5: ${dP5};
      --${prefix}-primary-4: ${dP4};
      --${prefix}-primary-alpha-10: ${hexToRgba(hex, 0.1)};
      --${prefix}-primary-alpha-15: ${hexToRgba(hex, 0.15)};
      --${prefix}-primary-alpha-30: ${hexToRgba(hex, 0.3)};
      --${prefix}-primary-alpha-40: ${hexToRgba(hex, 0.4)};
      --${prefix}-neutral-900: ${dN900};
      --${prefix}-neutral-700: ${dN700};
      --${prefix}-neutral-400: ${dN400};
      --${prefix}-neutral-200: ${dN200};
      --${prefix}-neutral-150: ${dN150};
      --${prefix}-neutral-100: ${dN100};
      --${prefix}-neutral-50: ${dN50};
      --${prefix}-bg: ${dN50};
      --${prefix}-subSurface: ${dN150};
      --${prefix}-surface: ${dN100};
      --${prefix}-surface-hover: ${dN200};
      --${prefix}-text: ${dN900};
      --${prefix}-text-dim: ${dN700};
      --${prefix}-border: ${dN400};
      --${prefix}-accent: ${dP600};
      --${prefix}-accent-hover: ${dP800};
      ${commonVars}
      ${dPickerVars}
    }
  `;
}

// Alias pour rétrocompatibilité avec Synapse (utilise le préfixe par défaut "color")
export const generateSynapseColorVars = (hex) => generateColorVars(hex, "color");
