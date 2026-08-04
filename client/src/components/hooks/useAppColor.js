import { useCallback, useEffect, useRef, useState } from 'react';

import { DEFAULT_COLOR } from '../../utils/colorPalette.js';
import { useColorPreferences } from './useColorPreferences.js';

/**
 * Charge et persiste la couleur applicative d'une app via useColorPreferences.
 *
 * @param {object} params
 * @param {string} params.contextKey   - clé unique par app (ex. 'portal-primary')
 * @param {string} params.storageKey   - clé localStorage (ex. 'portalColor')
 * @param {string} [params.defaultColor] - couleur par défaut si aucune sauvegardée
 * @returns {{ color: string, updateColor: (hex: string) => Promise<void> }}
 */
export function useAppColor({
  contextKey,
  storageKey,
  defaultColor = DEFAULT_COLOR,
}) {
  const { getDefault, saveDefault, ready } = useColorPreferences();

  const [color, setColor] = useState(
    () => localStorage.getItem(storageKey) ?? defaultColor,
  );

  const initialized = useRef(false);

  useEffect(() => {
    if (!ready || initialized.current) return;
    initialized.current = true;
    const serverColor = getDefault(contextKey);
    if (serverColor) {
      setColor(serverColor);
      localStorage.setItem(storageKey, serverColor);
    }
  }, [ready, contextKey, storageKey, getDefault]);

  const updateColor = useCallback(
    async (newColor) => {
      setColor(newColor);
      localStorage.setItem(storageKey, newColor);
      await saveDefault(contextKey, newColor);
    },
    [contextKey, storageKey, saveDefault],
  );

  return { color, updateColor };
}
