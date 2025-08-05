const FormatCurrency = (value) => {
  if (value === "" || value === null) return "";

  const number = parseFloat(value);

  // Séparateur de milliers uniquement si >= 1000
  if (Math.abs(number) >= 1000) {
    return (
      number.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "€"
    );
  }

  // Si < 1000 → pas de séparateur mais 2 décimales
  return number.toFixed(2) + "€";
};

export default FormatCurrency;
