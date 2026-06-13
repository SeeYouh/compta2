import { useEffect } from 'react';

import { generateSynapseColorVars } from '../../../utils/colorPalette';
import { useSynapseColorContext } from '../contexts/SynapseColorContext';

/**
 * Injecte les variables CSS dynamiques basées sur la couleur utilisateur Synapse
 * Génère le système complet de couleurs (--color-primary, --color-neutral-*, etc.)
 */
export function useSynapseTheme() {
  const { userColor } = useSynapseColorContext();

  useEffect(() => {
    if (!userColor) return;

    let styleEl = document.getElementById('synapse-theme-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'synapse-theme-style';
    }
    // Toujours en dernier dans <head> pour gagner la cascade CSS
    document.head.appendChild(styleEl);

    styleEl.textContent = generateSynapseColorVars(userColor);

    return () => {
      styleEl.remove();
    };
  }, [userColor]);
}
