/**
 * Retourne les initiales d'un nom (max 3 caractères).
 * Ex: "Nouveau bloc" → "Nb"
 */
export const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] || "")
    .join("")
    .slice(0, 3);
