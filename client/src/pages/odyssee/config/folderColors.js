// ─── Palette de couleurs prédéfinies pour les dossiers ───────────────────────
// Pour ajouter ou modifier une couleur : éditez FOLDER_PALETTE.
// Chaque entrée est un code hexadécimal sans transparence.
export const FOLDER_PALETTE = [
  "#969696", // gris (défaut — $color-1 du projet)
  "#e74c3c", // rouge
  "#e67e22", // orange
  "#f1c40f", // jaune
  "#2ecc71", // vert clair
  "#27ae60", // vert foncé
  "#1abc9c", // turquoise
  "#3498db", // bleu
  "#2980b9", // bleu foncé
  "#9b59b6", // violet
  "#8e44ad", // violet foncé
  "#e91e63", // rose
];

// ─── Pourcentages de mélange (miroir des variables SCSS du projet) ────────────
// DARKEN_BG  → équivalent $color-darker : fond du groupe dossier
// DARKEN_BORDER → équivalent $color-dark : contour du groupe + couleur icône
export const DARKEN_BG = 66;
export const DARKEN_BORDER = 53;

// Couleur par défaut à la création d'un dossier
export const DEFAULT_FOLDER_COLOR = "#969696";
