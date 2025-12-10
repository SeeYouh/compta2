/**
 * Utilitaires pour résoudre les thèmes et sous-thèmes
 * Ces fonctions permettent de transformer les IDs en noms pour l'affichage
 */

/**
 * Enrichit une transaction avec les noms de thème et sous-thème
 * @param {Object} transaction - Transaction avec themeId et subThemeId
 * @param {Object} themes - Objet des thèmes chargés
 * @returns {Object} Transaction enrichie avec theme et subTheme
 */
export function enrichTransaction(transaction, themes) {
  if (!themes || !transaction) return transaction;

  const { themeId, subThemeId } = transaction;

  const theme = themes[themeId];
  const subTheme = theme?.subThemes?.[subThemeId];

  return {
    ...transaction,
    theme: theme?.name || transaction.theme_legacy || "Non catégorisé",
    subTheme: subTheme?.name || transaction.subTheme_legacy || "Sans catégorie",
  };
}

/**
 * Enrichit un tableau de transactions
 * @param {Array} transactions - Tableau de transactions
 * @param {Object} themes - Objet des thèmes chargés
 * @returns {Array} Transactions enrichies
 */
export function enrichTransactions(transactions, themes) {
  if (!themes || !Array.isArray(transactions)) return transactions;
  return transactions.map((tx) => enrichTransaction(tx, themes));
}
