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
 * Génère une string CSS avec les variables de couleur unifiées pour toutes les apps.
 *
 * @param {string} hex   - Couleur hexadécimale primaire
 * @param {string} scope - Sélecteur CSS cible. Par défaut ':root' (+ dark mode).
 *                         Utiliser '.odyssee-root' pour Odyssée (toujours en mode clair).
 * @returns {string} CSS complet
 */
export function generateAppColorVars(hex = DEFAULT_COLOR, scope = ':root') {
  if (!hex) hex = DEFAULT_COLOR;

  // ── Valeurs mode clair ────────────────────────────────────────────────────
  const lightness  = lighten(hex, LIGHTNESS);
  const light      = lighten(hex, LIGHT);
  const dark       = darken(hex, DARK);
  const darker     = darken(hex, DARKER);
  const darkest    = darken(hex, DARKEST);

  const vars = `
      --color-1: ${hex};
      --color-lightness: ${lightness};
      --color-light: ${light};
      --color-dark: ${dark};
      --color-darker: ${darker};
      --color-darkest: ${darkest};
      --color-contrast-1: ${getContrast(hex)};
      --color-contrast-lightness: ${getContrast(lightness)};
      --color-contrast-light: ${getContrast(light)};
      --color-contrast-dark: ${getContrast(dark)};
      --color-contrast-darker: ${getContrast(darker)};
      --color-contrast-darkest: ${getContrast(darkest)};
      --color-danger: #6c0a0a;
      --color-danger-light: #6c0a0a;
      --color-success: #0a6c0c;`;

  if (scope !== ':root') {
    // Scope personnalisé (ex. '.odyssee-root') : valeurs mode clair uniquement.
    // Les éléments enfants héritent de ce scope, pas du [data-theme="dark"] global.
    return `${scope} { ${vars} }`;
  }

  // ── Valeurs mode sombre ──────────────────────────────────────────────────
  const dLightness = darken(hex, 85);
  const dLight     = darken(hex, 70);
  const dDark      = darken(hex, 50);
  const dDarker    = lighten(hex, 65);
  const dDarkest   = lighten(hex, 93);

  const darkVars = `
      --color-1: ${hex};
      --color-lightness: ${dLightness};
      --color-light: ${dLight};
      --color-dark: ${dDark};
      --color-darker: ${dDarker};
      --color-darkest: ${dDarkest};
      --color-contrast-1: ${getContrast(hex)};
      --color-contrast-lightness: ${getContrast(dLightness)};
      --color-contrast-light: ${getContrast(dLight)};
      --color-contrast-dark: ${getContrast(dDark)};
      --color-contrast-darker: ${getContrast(dDarker)};
      --color-contrast-darkest: ${getContrast(dDarkest)};
      --color-danger: #6c0a0a;
      --color-danger-light: #6c0a0a;
      --color-success: #0a6c0c;`;

  return `:root { ${vars} } [data-theme="dark"] { ${darkVars} }`;
}
