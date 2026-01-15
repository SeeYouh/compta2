import { useContext } from "react";
import { LabelsContext } from "../../contexts/createLabelsContext";

/**
 * Hook pour accéder aux labels personnalisés de l'application
 * @returns {Object} Contexte des labels
 */
export function useLabels() {
  const context = useContext(LabelsContext);

  if (!context) {
    throw new Error("useLabels must be used within a LabelsProvider");
  }

  return context;
}
