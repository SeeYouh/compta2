// Parse une date FR JJ/MM/AAAA en objet Date
export const parseFRDate = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};
