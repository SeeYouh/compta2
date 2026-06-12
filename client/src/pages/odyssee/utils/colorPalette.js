import {
  darken,
  getContrast,
  lighten,
} from './colorUtils.js';

export const DEFAULT_COLOR = "#969696";

// Constantes identiques à themeColors.js (conservées pour cohérence)
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
