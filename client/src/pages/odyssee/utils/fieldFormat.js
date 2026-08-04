/**
 * Formatage par champ de Rubrique (MODE_TEMPLATE).
 *
 * La source de vérité est un objet plat `fieldFormat` — pas de rich text, pas de
 * sélection, pas de curseur. La toolbar agit sur la totalité du champ.
 *
 * - `cssFromFormat()`     → styles CSS inline (rendu navigateur)
 * - `fieldFormatToHtml()` → HTML sémantique déterministe (rendu PDF)
 *
 * Extrait de `components/OdysseeFieldEditor.jsx` : un module qui exporte un
 * composant ne doit pas exporter autre chose, sinon Fast Refresh ne peut pas le
 * traiter (react-refresh/only-export-components).
 */

export const DEFAULT_FIELD_FORMAT = {
  bold: false,
  italic: false,
  underline: false,
  align: "left",
  fontFamily: "Inter",
  fontSize: "12px",
};

export function cssFromFormat(format) {
  const f = { ...DEFAULT_FIELD_FORMAT, ...format };
  return {
    fontWeight: f.bold ? "bold" : "normal",
    fontStyle: f.italic ? "italic" : "normal",
    textDecoration: f.underline ? "underline" : "none",
    textAlign: f.align,
    fontFamily: f.fontFamily,
    fontSize: f.fontSize,
  };
}

export function fieldFormatToHtml(value, format) {
  const f = { ...DEFAULT_FIELD_FORMAT, ...format };
  let inner = value;
  if (f.underline) inner = `<u>${inner}</u>`;
  if (f.italic) inner = `<em>${inner}</em>`;
  if (f.bold) inner = `<strong>${inner}</strong>`;
  const style = `text-align:${f.align};font-family:${f.fontFamily};font-size:${f.fontSize}`;
  return `<p style="${style}">${inner}</p>`;
}
