import { useEffect } from 'react';

import { generateColorVars } from '../../../utils/colorPalette';

export function usePortalTheme(userColor) {
  useEffect(() => {
    let styleEl = document.getElementById('portal-theme-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'portal-theme-style';
      document.head.appendChild(styleEl);
    } else {
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = generateColorVars(userColor, 'dashboard');
  }, [userColor]);

  useEffect(() => {
    return () => {
      document.getElementById('portal-theme-style')?.remove();
    };
  }, []);
}
