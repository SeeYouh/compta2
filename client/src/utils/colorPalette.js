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
 * Génère une string CSS avec toutes les variables de couleur Synapse
 * pour les deux modes (light et dark). Reproduit la logique de _variable.scss
 * et ajoute les variables du ColorPicker (--color-darker, --color-light, etc.)
 *
 * @param {string} hex - Couleur hexadécimale primaire
 * @returns {string} CSS complet avec :root et [data-theme="dark"]
 */
export function generateSynapseColorVars(hex = DEFAULT_COLOR) {
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
  // --color-darker = fond du picker, --color-lightness = curseurs visibles
  const lPickerVars = `
      --color-1: ${lPrimary};
      --color-lightness: ${lN900};
      --color-light: ${lN400};
      --color-dark: ${lN200};
      --color-darker: ${lN100};
      --color-darkest: ${lN50};`;

  const dPickerVars = `
      --color-1: ${dPrimary};
      --color-lightness: ${dN900};
      --color-light: ${dN400};
      --color-dark: ${dN150};
      --color-darker: ${dN100};
      --color-darkest: ${dN50};`;

  // ─── Variables communes (success, danger) ────────────────────────────────
  const commonVars = `
      --color-success: ${success};
      --color-success-900: ${darken(success, 60)};
      --color-success-800: ${darken(success, 50)};
      --color-success-700: ${darken(success, 35)};
      --color-success-600: ${success};
      --color-success-500: ${lighten(success, 15)};
      --color-success-400: ${lighten(success, 35)};
      --color-success-300: ${lighten(success, 50)};
      --color-success-200: ${lighten(success, 70)};
      --color-success-100: ${lighten(success, 85)};

      --color-danger: ${danger};
      --color-danger-900: ${darken(danger, 60)};
      --color-danger-800: ${darken(danger, 50)};
      --color-danger-700: ${darken(danger, 35)};
      --color-danger-600: ${danger};
      --color-danger-500: ${lighten(danger, 15)};
      --color-danger-400: ${lighten(danger, 30)};
      --color-danger-300: ${lighten(danger, 45)};
      --color-danger-200: ${lighten(danger, 60)};
      --color-danger-100: ${lighten(danger, 85)};`;

  return `
    :root {
      --color-primary: ${lPrimary};
      --color-primary-900: ${lP900};
      --color-primary-800: ${lP800};
      --color-primary-700: ${lP700};
      --color-primary-600: ${lP600};
      --color-primary-500: ${lP500};
      --color-primary-400: ${lP400};
      --color-primary-300: ${lP300};
      --color-primary-200: ${lP200};
      --color-primary-100: ${lP100};
      --color-primary-50: ${lP50};
      --color-primary-20: ${lP20};
      --color-primary-10: ${lP10};
      --color-primary-5: ${lP5};
      --color-primary-4: ${lP4};
      --color-primary-alpha-10: ${hexToRgba(hex, 0.1)};
      --color-primary-alpha-15: ${hexToRgba(hex, 0.15)};
      --color-primary-alpha-30: ${hexToRgba(hex, 0.3)};
      --color-primary-alpha-40: ${hexToRgba(hex, 0.4)};
      --color-neutral-900: ${lN900};
      --color-neutral-700: ${lN700};
      --color-neutral-400: ${lN400};
      --color-neutral-200: ${lN200};
      --color-neutral-150: ${lN150};
      --color-neutral-100: ${lN100};
      --color-neutral-50: ${lN50};
      --color-bg: ${lN400};
      --color-subSurface: ${lN150};
      --color-surface: ${lN100};
      --color-surface-hover: ${lN200};
      --color-text: ${lN900};
      --color-text-dim: ${lN700};
      --color-border: ${lN400};
      --color-accent: ${lP600};
      --color-accent-hover: ${lP700};
      ${commonVars}
      ${lPickerVars}
    }

    [data-theme="dark"] {
      --color-primary: ${dPrimary};
      --color-primary-900: ${dP900};
      --color-primary-800: ${dP800};
      --color-primary-700: ${dP700};
      --color-primary-600: ${dP600};
      --color-primary-500: ${dP500};
      --color-primary-400: ${dP400};
      --color-primary-300: ${dP300};
      --color-primary-200: ${dP200};
      --color-primary-100: ${dP100};
      --color-primary-50: ${dP50};
      --color-primary-20: ${dP20};
      --color-primary-10: ${dP10};
      --color-primary-5: ${dP5};
      --color-primary-4: ${dP4};
      --color-primary-alpha-10: ${hexToRgba(hex, 0.1)};
      --color-primary-alpha-15: ${hexToRgba(hex, 0.15)};
      --color-primary-alpha-30: ${hexToRgba(hex, 0.3)};
      --color-primary-alpha-40: ${hexToRgba(hex, 0.4)};
      --color-neutral-900: ${dN900};
      --color-neutral-700: ${dN700};
      --color-neutral-400: ${dN400};
      --color-neutral-200: ${dN200};
      --color-neutral-150: ${dN150};
      --color-neutral-100: ${dN100};
      --color-neutral-50: ${dN50};
      --color-bg: ${dN50};
      --color-subSurface: ${dN150};
      --color-surface: ${dN100};
      --color-surface-hover: ${dN200};
      --color-text: ${dN900};
      --color-text-dim: ${dN700};
      --color-border: ${dN400};
      --color-accent: ${dP600};
      --color-accent-hover: ${dP800};
      ${commonVars}
      ${dPickerVars}
    }
  `;
}
