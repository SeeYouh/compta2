import { describe, expect, it } from "vitest";

import {
  cssFromFormat,
  DEFAULT_FIELD_FORMAT,
  fieldFormatToHtml,
} from "../../src/pages/odyssee/utils/fieldFormat.js";

/**
 * fieldFormat alimente deux rendus qui doivent rester cohérents : les styles inline
 * du navigateur (cssFromFormat) et le HTML sémantique du PDF (fieldFormatToHtml).
 * Une divergence entre les deux produirait un PDF qui ne ressemble pas à l'écran.
 */
describe("cssFromFormat", () => {
  it("applique les valeurs par défaut quand le format est vide", () => {
    expect(cssFromFormat({})).toEqual({
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      textAlign: "left",
      fontFamily: "Inter",
      fontSize: "12px",
    });
  });

  it("traduit gras, italique et souligné", () => {
    const css = cssFromFormat({ bold: true, italic: true, underline: true });
    expect(css.fontWeight).toBe("bold");
    expect(css.fontStyle).toBe("italic");
    expect(css.textDecoration).toBe("underline");
  });

  it("laisse les valeurs par défaut intactes — pas de mutation", () => {
    cssFromFormat({ bold: true, fontSize: "24px" });
    expect(DEFAULT_FIELD_FORMAT.bold).toBe(false);
    expect(DEFAULT_FIELD_FORMAT.fontSize).toBe("12px");
  });

  it("respecte un format partiel sans écraser le reste", () => {
    const css = cssFromFormat({ align: "center" });
    expect(css.textAlign).toBe("center");
    expect(css.fontFamily).toBe("Inter");
  });
});

describe("fieldFormatToHtml", () => {
  it("rend le texte nu quand aucun style n'est actif", () => {
    expect(fieldFormatToHtml("Bonjour", {})).toBe(
      '<p style="text-align:left;font-family:Inter;font-size:12px">Bonjour</p>',
    );
  });

  it("imbrique les balises dans l'ordre attendu : strong > em > u", () => {
    const html = fieldFormatToHtml("X", {
      bold: true,
      italic: true,
      underline: true,
    });
    expect(html).toContain("<strong><em><u>X</u></em></strong>");
  });

  it("n'émet que les balises correspondant aux styles actifs", () => {
    const html = fieldFormatToHtml("X", { bold: true });
    expect(html).toContain("<strong>X</strong>");
    expect(html).not.toContain("<em>");
    expect(html).not.toContain("<u>");
  });

  it("reporte l'alignement et la typographie dans l'attribut style", () => {
    const html = fieldFormatToHtml("X", {
      align: "right",
      fontFamily: "Georgia",
      fontSize: "18px",
    });
    expect(html).toContain("text-align:right");
    expect(html).toContain("font-family:Georgia");
    expect(html).toContain("font-size:18px");
  });

  it("reste cohérent avec cssFromFormat sur les mêmes entrées", () => {
    const format = { align: "center", fontSize: "16px", fontFamily: "Inter" };
    const css = cssFromFormat(format);
    const html = fieldFormatToHtml("X", format);

    expect(html).toContain(`text-align:${css.textAlign}`);
    expect(html).toContain(`font-size:${css.fontSize}`);
    expect(html).toContain(`font-family:${css.fontFamily}`);
  });
});
