import { useContext } from "react";

import { SynapseColorContext } from "./createSynapseColorContext";

/**
 * Hook d'accès à la couleur d'application de Synapse.
 * @returns {{ color: string, updateColor: (hex: string) => void }}
 */
export function useSynapseColorContext() {
  const context = useContext(SynapseColorContext);
  if (!context) {
    throw new Error(
      "useSynapseColorContext doit être utilisé dans SynapseColorProvider",
    );
  }
  return context;
}
