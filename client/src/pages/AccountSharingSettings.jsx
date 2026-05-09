import "./AccountSharingSettings.scss";

import { useCallback, useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../components/AppShell";
import ConfirmationModal from "../components/ConfirmationModal";
import { getContacts } from "../components/utils/contactsApi";
import {
  getMembers,
  inviteUser,
  removeMember,
  revokeInvitation,
  updateMemberRole,
} from "../components/utils/sharingApi";
import Loader from "../components/Loader";
import { useAccounts } from "../contexts/useAccounts";

const ROLE_LABELS = {
  reader: "Lecteur",
  editor: "Éditeur",
};

const ROLE_DESCRIPTIONS = {
  reader: "Consultation uniquement",
  editor: "Consultation, création et modification des transactions",
};

export default function AccountSharingSettings() {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const { accounts, refresh: refreshAccounts } = useAccounts();

  const account = accounts.find((a) => a.id === accountId);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = account?.userId === currentUser.id;

  const [members, setMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Contacts disponibles pour l'auto-complétion
  const [contacts, setContacts] = useState([]);

  // Formulaire invitation
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);

  // Modal confirmation
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    label: "",
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersData, contactsData] = await Promise.all([
        getMembers(accountId),
        getContacts(),
      ]);
      setMembers(membersData.members ?? []);
      setPendingInvitations(membersData.pendingInvitations ?? []);
      setContacts(contactsData);
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (accountId) loadData();
  }, [accountId, loadData]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      await inviteUser(accountId, inviteEmail, inviteRole);
      setInviteEmail("");
      showMessage("success", "Invitation envoyée");
      await loadData();
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateMemberRole(accountId, memberId, newRole);
      showMessage("success", "Rôle mis à jour");
      await loadData();
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleRemoveMember = (member) => {
    setConfirmModal({
      isOpen: true,
      label: `Retirer ${member.name} (${member.email}) du compte ?`,
      action: async () => {
        try {
          await removeMember(accountId, member.userId);
          showMessage("success", "Membre retiré");
          await loadData();
          refreshAccounts();
        } catch (err) {
          showMessage("error", err.message);
        }
      },
    });
  };

  const handleRevokeInvitation = (invitation) => {
    setConfirmModal({
      isOpen: true,
      label: `Révoquer l'invitation envoyée à ${invitation.invitedEmail} ?`,
      action: async () => {
        try {
          await revokeInvitation(accountId, invitation.token);
          showMessage("success", "Invitation révoquée");
          await loadData();
        } catch (err) {
          showMessage("error", err.message);
        }
      },
    });
  };

  if (!account) {
    return (
      <AppShell>
        <div className="account-sharing">
          <div className="account-sharing__message account-sharing__message--error">
            Compte introuvable
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="account-sharing">
        <div className="account-sharing__header">
          <button
            className="account-sharing__back"
            onClick={() => navigate("/")}
          >
            ← Retour
          </button>
          <h1 className="account-sharing__title">Partage — {account.name}</h1>
          <p className="account-sharing__subtitle">
            {isOwner
              ? "Gérez les personnes qui ont accès à ce compte"
              : "Vous avez accès à ce compte en tant que membre partagé"}
          </p>
        </div>

        {message && (
          <div
            className={`account-sharing__message account-sharing__message--${message.type}`}
          >
            {message.text}
          </div>
        )}

        {/* Section invitation (propriétaire uniquement) */}
        {isOwner && (
          <section className="account-sharing__section">
            <h2 className="account-sharing__section-title">
              Inviter un membre
            </h2>

            {/* Sélection depuis les contacts */}
            {contacts.length > 0 && (
              <div className="account-sharing__contact-picker">
                <label className="account-sharing__contact-picker-label">
                  Depuis mes contacts
                </label>
                <div className="account-sharing__form-row">
                  <select
                    className="account-sharing__select"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) setInviteEmail(e.target.value);
                    }}
                  >
                    <option value="">— Choisir un contact —</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.email}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <form
              className="account-sharing__invite-form"
              onSubmit={handleInvite}
            >
              {contacts.length > 0 && (
                <p className="account-sharing__or-label">
                  Ou saisir manuellement
                </p>
              )}
              <div className="account-sharing__form-row">
                <input
                  type="email"
                  className="account-sharing__input"
                  placeholder="Adresse email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
                <select
                  className="account-sharing__select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label} — {ROLE_DESCRIPTIONS[value]}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="account-sharing__btn-primary"
                  disabled={inviting || !inviteEmail}
                >
                  {inviting ? "Envoi…" : "Inviter"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Membres actuels */}
        <section className="account-sharing__section">
          <h2 className="account-sharing__section-title">Membres</h2>
          {loading ? (
            <Loader />
          ) : members.length === 0 ? (
            <p className="account-sharing__empty">
              Aucun membre pour l'instant
            </p>
          ) : (
            <ul className="account-sharing__member-list">
              {members.map((member) => (
                <li
                  key={member.userId}
                  className="account-sharing__member-item"
                >
                  <div className="account-sharing__member-info">
                    <span className="account-sharing__member-name">
                      {member.name}
                    </span>
                    <span className="account-sharing__member-email">
                      {member.email}
                    </span>
                  </div>
                  <div className="account-sharing__member-actions">
                    {isOwner ? (
                      <>
                        <select
                          className="account-sharing__select account-sharing__select--small"
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(member.userId, e.target.value)
                          }
                        >
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="account-sharing__btn-danger"
                          onClick={() => handleRemoveMember(member)}
                        >
                          Retirer
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="account-sharing__role-badge">
                          {ROLE_LABELS[member.role] ?? member.role}
                        </span>
                        {member.userId === currentUser.id && (
                          <button
                            type="button"
                            className="account-sharing__btn-danger"
                            onClick={() => handleRemoveMember(member)}
                          >
                            Quitter
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Invitations en attente (propriétaire uniquement) */}
        {isOwner && pendingInvitations.length > 0 && (
          <section className="account-sharing__section">
            <h2 className="account-sharing__section-title">
              Invitations en attente
            </h2>
            <ul className="account-sharing__member-list">
              {pendingInvitations.map((inv) => (
                <li key={inv.token} className="account-sharing__member-item">
                  <div className="account-sharing__member-info">
                    <span className="account-sharing__member-name">
                      {inv.invitedEmail}
                    </span>
                    <span className="account-sharing__member-email">
                      {ROLE_LABELS[inv.role]} · Expire le{" "}
                      {new Date(inv.expiresAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="account-sharing__btn-ghost"
                    onClick={() => handleRevokeInvitation(inv)}
                  >
                    Révoquer
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title="Confirmer l'action"
          message={confirmModal.label}
          confirmText="Confirmer"
          cancelText="Annuler"
          onConfirm={async () => {
            setConfirmModal({ isOpen: false, action: null, label: "" });
            await confirmModal.action?.();
          }}
          onCancel={() =>
            setConfirmModal({ isOpen: false, action: null, label: "" })
          }
        />
      </div>
    </AppShell>
  );
}
