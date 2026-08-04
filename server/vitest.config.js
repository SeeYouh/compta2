import { defineConfig } from "vitest/config";

/**
 * Département de test — serveur.
 *
 * Les tests vivent dans `server/tests/`, jamais à côté du code testé :
 * l'arborescence de test est un inventaire consultable de ce qui est couvert.
 *
 * Chaque exécution produit un rapport JSON dans `../tests-reports/`, pour que les
 * échecs soient répertoriés et remontables — un test qui échoue en silence ne sert
 * à rien.
 */
export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    environment: "node",
    globals: false,
    // Le rapport par défaut reste lisible en console, le JSON alimente le journal.
    reporters: ["default", "json"],
    outputFile: {
      json: "../tests-reports/server-latest.json",
    },
  },
});
