import { API_ERRORS } from './index';

// Configuration de l'URL de base à partir des variables d'environnement
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE_URL}/transactions`;

/**
 * Génère un UUID v4 compatible (128 bits)
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getTransactions = async () => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error(API_ERRORS.loadTransactions);
  return res.json();
};

export const addTransaction = async (txn) => {
  const now = Date.now();
  const transactionWithTimestamps = {
    id: generateUUID(), // Génère un UUID unique (ex: "550e8400-e29b-41d4-a716-446655440000")
    ...txn,
    createdAt: now,
    updatedAt: now,
  };

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transactionWithTimestamps),
  });
  if (!res.ok) throw new Error(API_ERRORS.addTransaction);
  return res.json();
};

export const deleteTransaction = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(API_ERRORS.deleteTransaction);
  return true;
};

export const updateTransaction = async (id, updates) => {
  const updatesWithTimestamp = {
    ...updates,
    updatedAt: Date.now(),
  };

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH", // PATCH = partiel (JSON Server/REST standard)
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatesWithTimestamp),
  });
  if (!res.ok) throw new Error(API_ERRORS.updateTransaction);
  return res.json();
};
