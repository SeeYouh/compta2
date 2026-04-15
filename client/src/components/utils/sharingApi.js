import { authFetch } from "./authFetch.js";

export const inviteUser = async (accountId, email, role) => {
  const res = await authFetch(`/api/sharing/${accountId}/invite`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur lors de l'invitation");
  return data;
};

export const getMembers = async (accountId) => {
  const res = await authFetch(`/api/sharing/${accountId}/members`);
  if (!res.ok) throw new Error("Erreur lors du chargement des membres");
  return res.json();
};

export const updateMemberRole = async (accountId, memberId, role) => {
  const res = await authFetch(`/api/sharing/${accountId}/members/${memberId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Erreur lors de la mise à jour du rôle");
  return data;
};

export const removeMember = async (accountId, memberId) => {
  const res = await authFetch(`/api/sharing/${accountId}/members/${memberId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Erreur lors de la suppression du membre");
  return data;
};

export const revokeInvitation = async (accountId, token) => {
  const res = await authFetch(
    `/api/sharing/${accountId}/invitations/${token}`,
    {
      method: "DELETE",
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur lors de la révocation");
  return data;
};

export const getPendingInvitations = async () => {
  const res = await authFetch("/api/sharing/invitations/pending");
  if (!res.ok) throw new Error("Erreur lors du chargement des invitations");
  return res.json();
};

export const acceptInvitation = async (token) => {
  const res = await authFetch(`/api/sharing/invitations/${token}/accept`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur lors de l'acceptation");
  return data;
};

export const declineInvitation = async (token) => {
  const res = await authFetch(`/api/sharing/invitations/${token}/decline`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur lors du refus");
  return data;
};
