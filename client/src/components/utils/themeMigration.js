/**
 * Utilitaires pour migrer les anciennes transactions (avec noms) vers le nouveau système (avec IDs)
 */

/**
 * Trouve l'ID d'un thème par son nom
 */
export function findThemeIdByName(themeName, themes) {
  if (!themes || !themeName) return null;

  const themeEntry = Object.entries(themes).find(
    ([theme]) => theme.name === themeName
  );

  return themeEntry ? themeEntry[0] : null;
}

/**
 * Trouve l'ID d'un sous-thème par son nom
 */
export function findSubThemeIdByName(themeId, subThemeName, themes) {
  if (!themes || !themeId || !subThemeName) return null;

  const theme = themes[themeId];
  if (!theme || !theme.subThemes) return null;

  const subThemeEntry = Object.entries(theme.subThemes).find(
    ([subTheme]) => subTheme.name === subThemeName
  );

  return subThemeEntry ? subThemeEntry[0] : null;
}

/**
 * Migre une transaction du format ancien (noms) vers le nouveau (IDs)
 * Si la transaction a déjà des IDs, la retourne telle quelle
 */
export function migrateTransaction(transaction, themes) {
  if (!transaction || !themes) return transaction;

  // Si la transaction a déjà des IDs valides, pas besoin de migrer
  if (transaction.themeId && themes[transaction.themeId]) {
    return transaction;
  }

  // Sinon, essayer de trouver les IDs à partir des noms
  const themeId = findThemeIdByName(transaction.theme, themes);
  const subThemeId = themeId
    ? findSubThemeIdByName(themeId, transaction.subTheme, themes)
    : null;

  return {
    ...transaction,
    themeId: themeId || transaction.themeId,
    subThemeId: subThemeId || transaction.subThemeId,
    // Conserver les noms originaux en tant que fallback legacy
    theme_legacy: transaction.theme,
    subTheme_legacy: transaction.subTheme,
  };
}

/**
 * Migre un tableau de transactions
 */
export function migrateTransactions(transactions, themes) {
  if (!Array.isArray(transactions) || !themes) return transactions;
  return transactions.map((tx) => migrateTransaction(tx, themes));
}
