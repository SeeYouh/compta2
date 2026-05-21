import { globalFolders } from "./data/folders";

export const categoryLibrary = [
  {
    name: "Passagers",
    width: 35,
    labels: {
      item: "passager",
      itemCapitalized: "Passager",
      createLabel: "passager",
    },
  },
  {
    name: "Odyssée",
    width: 30,
    labels: {
      item: "voyage",
      itemCapitalized: "Voyage",
      createLabel: "odyssée",
    },
  },
  {
    name: "Catalogues",
    width: 35,
    labels: {
      item: "produit",
      itemCapitalized: "Produit",
      createLabel: "article",
    },
  },
];

export const contentLibraryTitle = globalFolders.map((folderList, index) => ({
  titleName: `Dossier ${index + 1}`,
  contentFiles: folderList.map((f) => ({ ...f })),
}));

export const inTakeTimeMoment = ["Matin", "Midi", "Soir", "Nuit"];

export const daysTime = [
  {
    id: "beforeMeal",
    label: "Avant le repas",
    hasRange: true,
    rangeValue: 10,
  },
  {
    id: "duringMeal",
    label: "Pendant le repas",
    hasRange: false,
    rangeValue: null,
  },
  {
    id: "afterMeal",
    label: "Après le repas",
    hasRange: true,
    rangeValue: 10,
  },
];
