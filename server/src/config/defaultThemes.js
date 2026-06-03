/**
 * Thèmes et sous-thèmes par défaut injectés dans le compte template.
 * Triés par ordre alphabétique (thèmes et sous-thèmes).
 *
 * Chaque thème reçoit un id stable préfixé "theme-default-" afin
 * d'éviter les conflits avec les thèmes créés par l'utilisateur
 * (qui reçoivent des UUIDs) et avec le thème système "Compte"
 * (id: "theme-compte-transfer").
 */

function slug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makeSubTheme(id, name) {
  return {
    id,
    name,
    slug: slug(name),
    linkedAccountId: null,
    linkedThemeId: null,
    linkedSubThemeId: null,
    autoCreated: false,
  };
}

function makeTheme(id, name, subThemeNames) {
  const subThemes = {};
  subThemeNames.forEach((stName, idx) => {
    const stId = `${id}-st-${String(idx + 1).padStart(2, "0")}`;
    subThemes[stId] = makeSubTheme(stId, stName);
  });
  return { id, name, slug: slug(name), subThemes };
}

// ---------------------------------------------------------------------------
// Liste — ordre alphabétique par thème, sous-thèmes également alphabétiques
// ---------------------------------------------------------------------------

export const DEFAULT_THEMES = [
  makeTheme("theme-default-abonnements", "Abonnements & Télécoms", [
    "Autres abonnements",
    "Internet / Box",
    "Logiciels / Cloud",
    "Presse / Médias",
    "Streaming musique",
    "Streaming vidéo",
    "Téléphone mobile",
  ]),

  makeTheme("theme-default-alimentation", "Alimentation", [
    "Café / Bar",
    "Fast-food / Snack",
    "Livraison repas",
    "Marché / Épicerie",
    "Restaurant",
    "Supermarché",
  ]),

  makeTheme("theme-default-banque", "Banque & Finance", [
    "Assurance emprunteur",
    "Cotisation carte",
    "Crédit conso",
    "Crédit immobilier",
    "Frais bancaires",
    "Investissement",
    "Virement épargne",
  ]),

  makeTheme("theme-default-energie", "Énergie & Eau", [
    "Eau",
    "Électricité",
    "Fioul / Bois",
    "Gaz",
  ]),

  makeTheme("theme-default-famille", "Famille & Enfants", [
    "Activités extrascolaires",
    "Cantine",
    "Fournitures scolaires",
    "Garde d'enfants",
    "Jouets",
    "Vêtements enfants",
  ]),

  makeTheme("theme-default-impots", "Impôts & Taxes", [
    "Autres taxes",
    "Impôt sur le revenu",
    "Taxe foncière",
  ]),

  makeTheme("theme-default-loisirs", "Loisirs & Sorties", [
    "Cinéma / Spectacle",
    "Concert / Festival",
    "Jeux / Jeux vidéo",
    "Musées / Expositions",
    "Sport",
  ]),

  makeTheme("theme-default-logement", "Logement", [
    "Assurance habitation",
    "Charges de copropriété",
    "Électroménager",
    "Entretien",
    "Loyer",
    "Mobilier",
    "Taxe foncière / d'habitation",
    "Travaux",
  ]),

  makeTheme("theme-default-revenus", "Revenus", [
    "Allocations (CAF / APL / RSA)",
    "Acompte",
    "Autres revenus",
    "Dividendes",
    "Indemnités (maladie / arrêt)",
    "Loyers perçus",
    "Prime / Bonus",
    "Remboursements reçus",
    "Retraite / Pension",
    "Salaire",
  ]),

  makeTheme("theme-default-sante", "Santé", [
    "Dentiste",
    "Kinésithérapeute / Ostéo",
    "Médecin / Spécialiste",
    "Mutuelle",
    "Optique",
    "Pharmacie",
    "Psychologue",
  ]),

  makeTheme("theme-default-shopping", "Shopping", [
    "Beauté / Hygiène",
    "Bricolage / Jardinage",
    "Cadeaux",
    "High-tech / Informatique",
    "Livres",
    "Vêtements / Mode",
  ]),

  makeTheme("theme-default-transport", "Transport", [
    "Assurance auto",
    "Carburant",
    "Contrôle technique",
    "Entretien / Réparation",
    "Location véhicule",
    "Parking",
    "Péages",
    "Transports en commun",
  ]),

  makeTheme("theme-default-vacances", "Vacances & Voyages", [
    "Activités sur place",
    "Billet de transport",
    "Hébergement",
    "Restauration voyage",
  ]),
];
