import { createContext, useContext } from 'react';

import { useSynapseColor } from '../hooks/useSynapseColor';

const SynapseColorContext = createContext();

export function SynapseColorProvider({ children }) {
  const colorData = useSynapseColor();

  return (
    <SynapseColorContext.Provider value={colorData}>
      {children}
    </SynapseColorContext.Provider>
  );
}

export function useSynapseColorContext() {
  const context = useContext(SynapseColorContext);
  if (!context) {
    throw new Error(
      'useSynapseColorContext doit être utilisé dans SynapseColorProvider',
    );
  }
  return context;
}
