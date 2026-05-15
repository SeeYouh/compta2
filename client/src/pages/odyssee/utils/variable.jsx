import { globalFolders } from "./data/folders";
import LibraryOdyssey from "../components/LibraryOdyssey";
import LibraryPassengers from "../components/LibraryPassengers";

export const categoryLibrary = [
  {
    name: "Passagers",
    width: 35,
    linkLibrary: (props) => <LibraryPassengers {...props} />,
  },
  {
    name: "Odyssée",
    width: 30,
    linkLibrary: (props) => <LibraryOdyssey {...props} />,
  },
  {
    name: "Catalogues",
    width: 35,
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
