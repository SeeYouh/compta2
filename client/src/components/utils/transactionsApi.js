// const BASE_URL = "http://localhost:3001/transactions";

// export const getTransactions = async () => {
//   const res = await fetch(BASE_URL);
//   if (!res.ok) throw new Error("Erreur chargement transactions");
//   return res.json();
// };

// export const createTransaction = async (payload) => {
//   const res = await fetch(BASE_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
//   if (!res.ok) throw new Error("Erreur ajout transaction");
//   return res.json();
// };

// export const deleteTransaction = async (id) => {
//   const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
//   if (!res.ok) throw new Error("Erreur suppression transaction");
//   return true;
// };

// utils/transactionApi.js
const BASE_URL = "http://localhost:3001/transactions";

export const getTransactions = async () => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Erreur chargement transactions");
  return res.json();
};

export const createTransaction = async (payload) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur ajout transaction");
  return res.json();
};

export const deleteTransaction = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur suppression transaction");
  return true;
};

// ⬇️ Nouveau : mise à jour partielle (édition inline)
export const updateTransaction = async (id, patch) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH", // PATCH = partiel (JSON Server/REST standard)
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Erreur mise à jour transaction");
  return res.json();
};
