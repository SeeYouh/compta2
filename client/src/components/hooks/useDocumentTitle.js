import { useEffect } from "react";

/**
 * Hook pour mettre à jour dynamiquement le titre du document
 * @param {string} title - Le titre à afficher (ex: nom du compte)
 * @param {string} appName - Le nom de l'application (par défaut "Synapse")
 */
export function useDocumentTitle(title, appName = "Synapse") {
  useEffect(() => {
    if (title) {
      document.title = `${appName} - ${title}`;
    } else {
      document.title = appName;
    }
  }, [title, appName]);
}
