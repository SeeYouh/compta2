import { useCallback, useEffect, useState } from 'react';

import { authFetch } from '../../../components/utils/authFetch';
import { computeColorPalette, DEFAULT_COLOR } from '../../../utils/colorPalette';

const PORTAL_COLOR_KEY = 'portal-primary';
const STORAGE_KEY = 'portalColor';

export const usePortalColor = () => {
  const [userColor, setUserColor] = useState(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_COLOR,
  );
  const [palette, setPalette] = useState(() => computeColorPalette(userColor));

  useEffect(() => {
    authFetch('/api/synapse/color-preferences')
      .then((r) => r.json())
      .then((data) => {
        const saved = data.defaults?.[PORTAL_COLOR_KEY];
        if (saved) {
          setUserColor(saved);
          setPalette(computeColorPalette(saved));
          localStorage.setItem(STORAGE_KEY, saved);
        }
      })
      .catch(console.error);
  }, []);

  const updateColor = useCallback(async (newColor) => {
    setUserColor(newColor);
    setPalette(computeColorPalette(newColor));
    localStorage.setItem(STORAGE_KEY, newColor);
    authFetch(`/api/synapse/color-preferences/default/${PORTAL_COLOR_KEY}`, {
      method: 'PATCH',
      body: JSON.stringify({ color: newColor }),
    }).catch(console.error);
  }, []);

  return { userColor, palette, updateColor };
};
