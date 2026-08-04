import { useContext } from "react";

import { EntityColorContext } from "./createEntityColorContext";

/**
 * Hook d'accès à la palette scopée à une entité.
 * ⚠️ Jamais consommé à ce jour — voir DUP-03 dans AUDIT_2.md.
 */
export function useEntityColor() {
  return useContext(EntityColorContext);
}
