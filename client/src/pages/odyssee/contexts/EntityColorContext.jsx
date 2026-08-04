import { useMemo } from 'react';

import { computeColorPalette } from '../../../utils/colorPalette.js';
import { EntityColorContext } from './createEntityColorContext';
import { useOdysseeColor } from './useOdysseeColor';

/**
 * Fournit une palette de couleurs spécifique à une entité (produit, passager, etc.).
 * Si l'entité n'a pas de couleur propre, utilise la palette globale de l'Odyssée.
 *
 * ⚠️ Ce provider n'est branché nulle part. L'expression qu'il factorise est écrite
 * à l'identique dans OdysseeItem, PaperProduct et PassagerItem. Sort en attente
 * d'arbitrage — voir DUP-03 dans AUDIT_2.md.
 */
export function EntityColorProvider({ color, children }) {
  const { colors: themeColors } = useOdysseeColor();
  const colors = useMemo(
    () => (color ? computeColorPalette(color) : themeColors),
    [color, themeColors],
  );

  return (
    <EntityColorContext.Provider value={colors}>
      {children}
    </EntityColorContext.Provider>
  );
}
