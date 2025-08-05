const BalanceCalculator = ({ transactions }) => {
  let runningBalance = 0;

  const transactionsWithBalance = transactions.map((t) => {
    // Ajoute ou soustrait selon recette/dépense
    if (t.recette) {
      runningBalance += parseFloat(t.recette);
    } else if (t.depense) {
      runningBalance -= parseFloat(t.depense);
    }

    return {
      ...t,
      solde: runningBalance.toFixed(2) + "€",
    };
  });

  return transactionsWithBalance;
};

export default BalanceCalculator;
