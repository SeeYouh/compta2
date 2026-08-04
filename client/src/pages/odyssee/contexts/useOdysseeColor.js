import { useContext } from "react";

import { OdysseeColorContext } from "./createOdysseeColorContext";

/**
 * Hook d'accès à la couleur de thème d'Odyssée.
 * @returns {{ colors: object }} palette calculée par computeColorPalette
 */
export function useOdysseeColor() {
  return useContext(OdysseeColorContext);
}
