import { createContext, useContext, useMemo, useState } from "react";

import { computeColorPalette, DEFAULT_COLOR } from "../utils/colorPalette.js";

const OdysseeColorContext = createContext(null);

/**
 * Génère le CSS global pour tous les éléments d'interface de l'Odyssée.
 * Injecte les variables CSS scoped à .odyssee-root (pas de pollution de :root)
 * ET les règles concrètes pour les composants de layout.
 */
export function buildOdysseeGlobalStyles(c) {
  return `
    /* ─── Variables CSS scoped à .odyssee-root ─── */
    .odyssee-root {
      --ody-1: ${c.base};
      --ody-lightness: ${c.lightness};
      --ody-light: ${c.light};
      --ody-dark: ${c.dark};
      --ody-darker: ${c.darker};
      --ody-darkest: ${c.darkest};
      --ody-danger: ${c.danger};
      --ody-danger-light: ${c.dangerLight};
      --ody-contrast-base: ${c.contrastBase};
      --ody-contrast-lightness: ${c.contrastLightness};
      --ody-contrast-light: ${c.contrastLight};
      --ody-contrast-dark: ${c.contrastDark};
      --ody-contrast-darker: ${c.contrastDarker};
      --ody-contrast-darkest: ${c.contrastDarkest};

      /* ─── Aliases --color-xxx pour compatibilité composants génériques ─── */
      --color-1: var(--ody-1);
      --color-lightness: var(--ody-lightness);
      --color-light: var(--ody-light);
      --color-dark: var(--ody-dark);
      --color-darker: var(--ody-darker);
      --color-darkest: var(--ody-darkest);
    }

    /* ─── Body ─── */
    .odyssee-root { background-color: ${c.light}; }

    /* ─── Left Menu ─── */
    .left-menu { background-color: ${c.darkest}; }
    .left-menu-resizer:hover { border-right-color: ${c.dark}; }

    /* ─── Library ─── */
    .library-resize-handle { background: ${c.base}; }
    .library-navBar {
      background-color: ${c.darkest};
      border-bottom: 5px solid ${c.dark};
    }
    .library-navBar li { background-color: ${c.darker}; }
    .library-navBar li:first-child::after,
    .library-navBar li:last-child::before { background-color: ${c.dark}; }
    .library-navBar li:hover { background-color: ${c.dark}; }
    .library-navBar li:has(input[type="radio"]:checked) { background-color: ${c.dark}; }
    .library-navBar li label,
    .library-navBar li input[type="radio"]:checked + label { color: ${c.lightness}; }
    .title-library::after { background-color: ${c.base}; }
    .loading-message { background-color: ${c.light}; color: ${c.dark}; }
    .error-message { background-color: ${c.dark}; color: ${c.lightness}; }
    .error-message button { background-color: ${c.lightness}; color: ${c.darker}; }
    .error-message button:hover { background-color: ${c.light}; }
    .no-products-message {
      background-color: ${c.lightness};
      color: ${c.dark};
      border: 2px dashed ${c.base};
    }
    .default-product-icon {
      background-color: ${c.lightness};
      border: 2px solid ${c.base};
    }
    .default-product-icon p { color: ${c.dark}; }

    /* ─── Editable NavBar ─── */
    .nav-bar-minitools { background: ${c.base}; }
  `;
}

/**
 * Fournit la palette de couleurs globale de l'Odyssée à tous les composants enfants.
 * Injecte un <style> global pour tous les éléments d'interface non liés à une entité.
 */
export function OdysseeColorProvider({
  initialColor = DEFAULT_COLOR,
  children,
}) {
  const [baseColor, setBaseColor] = useState(initialColor);
  const colors = useMemo(() => computeColorPalette(baseColor), [baseColor]);
  const globalStyles = useMemo(
    () => buildOdysseeGlobalStyles(colors),
    [colors],
  );

  return (
    <OdysseeColorContext.Provider value={{ colors, baseColor, setBaseColor }}>
      <style>{globalStyles}</style>
      {children}
    </OdysseeColorContext.Provider>
  );
}

export function useOdysseeColor() {
  return useContext(OdysseeColorContext);
}
