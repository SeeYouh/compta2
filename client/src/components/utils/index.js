export const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export const TABLE_HEADERS = [
  "Dates",
  "Thèmes",
  "Moyens de paiement",
  "Désignations",
  "Recettes",
  "Dépenses",
  "Soldes",
  "Actions",
];

export const FIELD_RULES = [
  { field: "date", message: "La date est obligatoire." },
  { field: "theme", message: "Le thème est obligatoire." },
  { field: "payment", message: "Le moyen de paiement est obligatoire." },
  { field: "designation", message: "La désignation est obligatoire." },
  {
    field: "amount",
    validate: (data) => !data.amount || !data.bankMovement,
    message: "Le montant et le type (recette ou dépense) sont obligatoires.",
  },
];
