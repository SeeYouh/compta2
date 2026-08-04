import { useEffect } from 'react';

import { generateAppColorVars } from '../../utils/colorPalette.js';

/**
 * Injecte les variables CSS d'un thème applicatif via une balise <style> dans <head>.
 * Nettoyage automatique au démontage.
 *
 * @param {object} params
 * @param {string} params.styleId  - id de la balise <style> (unique par app)
 * @param {string} params.color    - couleur hex choisie par l'utilisateur
 * @param {string} [params.scope]  - sélecteur CSS cible (défaut ':root')
 */
export function useAppTheme({ styleId, color, scope = ':root' }) {
  useEffect(() => {
    if (!color) return;

    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
    }
    document.head.appendChild(styleEl);
    styleEl.textContent = generateAppColorVars(color, scope);

    return () => styleEl.remove();
  }, [styleId, color, scope]);
}
