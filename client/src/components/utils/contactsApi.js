import { authFetch } from "./authFetch.js";

export const getContacts = async () => {
  const res = await authFetch("/api/contacts");
  if (!res.ok) throw new Error("Erreur lors du chargement des contacts");
  return res.json();
};

export const addContact = async (name, email) => {
  const res = await authFetch("/api/contacts", {
    method: "POST",
    body: JSON.stringify({ name, email }),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Erreur lors de l'ajout du contact");
  return data;
};

export const updateContact = async (id, updates) => {
  const res = await authFetch(`/api/contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour");
  return data;
};

export const deleteContact = async (id) => {
  const res = await authFetch(`/api/contacts/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur lors de la suppression");
  return data;
};
