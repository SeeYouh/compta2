import { API_ERRORS } from "./index";
import { authFetch } from "./authFetch.js";

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
  const res = await authFetch("/api/transactions");
  if (!res.ok) throw new Error(API_ERRORS.loadTransactions);
  return res.json();
};

export const addTransaction = async (txn) => {
  const now = Date.now();
  const transactionWithTimestamps = {
    id: generateUUID(),
    ...txn,
    createdAt: now,
    updatedAt: now,
  };

  const res = await authFetch("/api/transactions", {
    method: "POST",
    body: JSON.stringify(transactionWithTimestamps),
  });
  if (!res.ok) throw new Error(API_ERRORS.addTransaction);
  return res.json();
};

export const deleteTransaction = async (id) => {
  const res = await authFetch(`/api/transactions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(API_ERRORS.deleteTransaction);
  return true;
};

export const updateTransaction = async (id, updates) => {
  const updatesWithTimestamp = {
    ...updates,
    updatedAt: Date.now(),
  };

  const res = await authFetch(`/api/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updatesWithTimestamp),
  });
  if (!res.ok) throw new Error(API_ERRORS.updateTransaction);
  return res.json();
};
