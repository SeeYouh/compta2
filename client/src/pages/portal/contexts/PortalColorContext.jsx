import { createContext, useContext } from 'react';

import { usePortalColor } from '../hooks/usePortalColor';
import { usePortalTheme } from '../hooks/usePortalTheme';

const PortalColorContext = createContext();

export function PortalColorProvider({ children }) {
  const colorData = usePortalColor();
  usePortalTheme(colorData.userColor);

  return (
    <PortalColorContext.Provider value={colorData}>
      {children}
    </PortalColorContext.Provider>
  );
}

export function usePortalColorContext() {
  const context = useContext(PortalColorContext);
  if (!context) {
    throw new Error(
      'usePortalColorContext doit être utilisé dans PortalColorProvider',
    );
  }
  return context;
}
