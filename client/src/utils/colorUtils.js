// Reproduit le comportement de color.mix(black, $c, $percent) du SCSS.
// percent : 0–100, part de noir à mélanger (0 = couleur pure, 100 = noir)
// desat : 0–100, part de gris neutre à mélanger après (0 = aucune désaturation)
export function darken(hex, percent, desat = 0) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const factor = (100 - percent) / 100;
  let rr = Math.round(r * factor);
  let gg = Math.round(g * factor);
  let bb = Math.round(b * factor);
  if (desat > 0) {
    const gray = Math.round((rr + gg + bb) / 3);
    const f = desat / 100;
    rr = Math.round(rr + (gray - rr) * f);
    gg = Math.round(gg + (gray - gg) * f);
    bb = Math.round(bb + (gray - bb) * f);
  }
  return `rgb(${rr}, ${gg}, ${bb})`;
}

// Reproduit color.mix(white, $c, $percent) du SCSS.
// percent : 0–100, part de blanc à mélanger
// desat : 0–100, part de gris neutre à mélanger après (0 = aucune désaturation)
export function lighten(hex, percent, desat = 0) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const factor = percent / 100;
  let rr = Math.round(r + (255 - r) * factor);
  let gg = Math.round(g + (255 - g) * factor);
  let bb = Math.round(b + (255 - b) * factor);
  if (desat > 0) {
    const gray = Math.round((rr + gg + bb) / 3);
    const f = desat / 100;
    rr = Math.round(rr + (gray - rr) * f);
    gg = Math.round(gg + (gray - gg) * f);
    bb = Math.round(bb + (gray - bb) * f);
  }
  return `rgb(${rr}, ${gg}, ${bb})`;
}

// Reproduit get-contrast() du SCSS.
// Retourne "black" si la couleur est claire (lightness > 50%), sinon "white".
// Accepte un hex (#rrggbb) ou un rgb(r, g, b).
export function getContrast(color) {
  let r, g, b;
  if (color.startsWith("#")) {
    r = parseInt(color.slice(1, 3), 16);
    g = parseInt(color.slice(3, 5), 16);
    b = parseInt(color.slice(5, 7), 16);
  } else {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return "white";
    [, r, g, b] = match.map(Number);
  }
  const lightness = (Math.max(r, g, b) + Math.min(r, g, b)) / 2 / 255;
  return lightness > 0.5 ? "black" : "white";
}
