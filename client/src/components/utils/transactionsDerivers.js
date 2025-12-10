import { parseFRDate } from "./date";

export const sortByFRDate = (txs) =>
  [...txs].sort((a, b) => parseFRDate(a.date) - parseFRDate(b.date));

export const filterByMonth = (txs, monthIndex /* 0..11 or null */) =>
  monthIndex === null
    ? txs
    : txs.filter((t) => parseFRDate(t.date).getMonth() === monthIndex);
