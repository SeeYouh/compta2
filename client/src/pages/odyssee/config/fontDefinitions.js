// ─── Polices disponibles pour la mise en forme des champs de Rubrique ─────────
// Tableau dynamique : ajouter une police custom = ajouter le @font-face dans
// _fontFace.scss puis une entrée ici avec loaded: true. Le sélecteur de
// OdysseeFieldEditor lit ce tableau — rien d'autre à modifier.
//
// La family est stockée dans fieldPlacements[].fieldFormat.fontFamily et
// appliquée par cssFromFormat() (browser) et fieldFormatToHtml() (PDF).

export const FONT_DEFINITIONS = [
  {
    id: "inter",
    label: "Inter",
    family: "Inter",
    loaded: true, // chargée via @font-face dans _fontFace.scss
  },
  {
    id: "serif",
    label: "Serif",
    family: "serif",
    loaded: false, // police système — @font-face à prévoir pour le rendu PDF
  },
  {
    id: "monospace",
    label: "Mono",
    family: "monospace",
    loaded: false,
  },
  {
    id: "cursive",
    label: "Cursive",
    family: "cursive",
    loaded: false,
  },
];
