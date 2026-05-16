// Reproduit le comportement de color.mix(black, $c, $percent) du SCSS Odyssée.
// percent : 0–100, part de noir à mélanger (0 = couleur pure, 100 = noir)
export function darken(hex, percent) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const factor = (100 - percent) / 100;
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
}

// Reproduit color.mix(white, $c, $percent) du SCSS Odyssée.
// percent : 0–100, part de blanc à mélanger
export function lighten(hex, percent) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const factor = percent / 100;
  return `rgb(${Math.round(r + (255 - r) * factor)}, ${Math.round(g + (255 - g) * factor)}, ${Math.round(b + (255 - b) * factor)})`;
}
