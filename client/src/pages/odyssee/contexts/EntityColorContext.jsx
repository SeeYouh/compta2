import {
  createContext,
  useContext,
  useMemo,
} from 'react';

import { computeColorPalette } from '../utils/colorPalette.js';
import { useOdysseeColor } from './OdysseeColorContext.jsx';

const EntityColorContext = createContext(null);

/**
 * Fournit une palette de couleurs spécifique à une entité (produit, passager, etc.).
 * Si l'entité n'a pas de couleur propre, utilise la palette globale de l'Odyssée.
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

export function useEntityColor() {
  return useContext(EntityColorContext);
}
