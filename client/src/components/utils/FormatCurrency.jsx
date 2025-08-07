const FormatCurrency = (value) => {
  if (value === "" || value === null) return "";

  const number = Number(value);
  if (Number.isNaN(number)) return "";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

export default FormatCurrency;
