import { useMemo } from 'react';

import { DEFAULT_COLOR } from '../../../utils/colorPalette';
import { SynapseColorContext } from './createSynapseColorContext';
import { useAppColor } from '../../../components/hooks/useAppColor';
import { useAppTheme } from '../../../components/hooks/useAppTheme';

export function SynapseColorProvider({ children }) {
  const { color, updateColor } = useAppColor({
    contextKey: 'synapse-primary',
    storageKey: 'synapseColor',
    defaultColor: DEFAULT_COLOR,
  });

  useAppTheme({ styleId: 'synapse-theme', color });

  // Mémoïsée : sans cela l'objet serait recréé à chaque rendu du provider et
  // ferait re-rendre tous les consommateurs du contexte (cf. PERF-C-01).
  const value = useMemo(() => ({ color, updateColor }), [color, updateColor]);

  return (
    <SynapseColorContext.Provider value={value}>
      {children}
    </SynapseColorContext.Provider>
  );
}
