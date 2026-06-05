export function numberArray(min, max) {
  return Array.from({ length: max - min + 1 }, (_, i) => ({
    display: (i + min).toString(),
    value: i + min,
  }));
}
