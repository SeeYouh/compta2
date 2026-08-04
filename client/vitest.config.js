import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * Département de test — client.
 *
 * Les tests vivent dans `client/tests/`, jamais à côté du composant testé.
 * - `tests/unit/`       → fonctions pures (aucun DOM requis)
 * - `tests/components/` → rendu React, environnement jsdom
 *
 * Chaque exécution produit un rapport JSON dans `../tests-reports/`.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    include: ["tests/**/*.test.{js,jsx}"],
    environment: "jsdom",
    globals: false,
    setupFiles: ["./tests/setup.js"],
    reporters: ["default", "json"],
    outputFile: {
      json: "../tests-reports/client-latest.json",
    },
  },
});
