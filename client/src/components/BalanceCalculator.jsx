const BalanceCalculator = ({ transactions }) => {
  return transactions.reduce((acc, t) => {
    const prev = acc.length ? acc[acc.length - 1].solde : 0;

    // Si la transaction est désactivée, on ne compte pas son montant mais on garde le solde précédent
    const isDisabled = t.disabled === true;

    const credit = isDisabled ? 0 : Number.parseFloat(t.recette);
    const debit = isDisabled ? 0 : Number.parseFloat(t.depense);

    const delta =
      (Number.isFinite(credit) ? credit : 0) -
      (Number.isFinite(debit) ? debit : 0);

    const solde = prev + delta;

    acc.push({ ...t, solde }); // solde NUMÉRIQUE ici
    return acc;
  }, []);
};

export default BalanceCalculator;
