import "./ContactsPage.scss";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  acceptInvitation,
  declineInvitation,
  getPendingInvitations,
  inviteUser,
} from "../components/utils/sharingApi";
import {
  addContact,
  deleteContact,
  getContacts,
  updateContact,
} from "../components/utils/contactsApi";
import AppShell from "../components/AppShell";
import ConfirmationModal from "../components/ConfirmationModal";
import Loader from "../components/Loader";
import { useAccounts } from "../contexts/useAccounts";
import { useDocumentTitle } from "../components/hooks/useDocumentTitle";

const ROLE_LABELS = {
  reader: "Lecteur",
  editor: "Éditeur",
};

const ROLE_DESCRIPTIONS = {
  reader: "Consultation uniquement",
  editor: "Consultation, création et modification",
};

export default function ContactsPage() {
  const navigate = useNavigate();
  const { accounts, refresh: refreshAccounts } = useAccounts();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Seulement les comptes dont l'utilisateur est propriétaire
  const ownedAccounts = accounts.filter((a) => a.userId === currentUser.id);

  useDocumentTitle("Contacts & invitations");

  const [activeTab, setActiveTab] = useState("contacts");

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Formulaire ajout contact
  const [addForm, setAddForm] = useState({ name: "", email: "" });
  const [adding, setAdding] = useState(false);

  // Contact en édition
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  // Panneau d'invitation ouvert pour un contact
  const [invitePanel, setInvitePanel] = useState(null); // contactId ou null
  const [inviteForm, setInviteForm] = useState({
    accountId: "",
    role: "editor",
  });
  const [inviting, setInviting] = useState(false);

  // Modal de confirmation de suppression
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    contact: null,
  });

  // Invitations reçues
  const [invitations, setInvitations] = useState([]);
  const [invLoading, setInvLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    setInvLoading(true);
    try {
      const data = await getPendingInvitations();
      setInvitations(data.invitations ?? []);
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setInvLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
    loadInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const contact = await addContact(addForm.name, addForm.email);
      setContacts((prev) => [
        ...prev,
        { ...contact, accountsAccess: [], isRegistered: false },
      ]);
      setAddForm({ name: "", email: "" });
      showMessage("success", "Contact ajouté");
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (contact) => {
    setEditingId(contact.id);
    setEditForm({ name: contact.name, email: contact.email });
    setInvitePanel(null);
  };

  const handleEditSave = async (contactId) => {
    try {
      const updated = await updateContact(contactId, editForm);
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, ...updated } : c)),
      );
      setEditingId(null);
      showMessage("success", "Contact modifié");
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleDelete = async () => {
    const contact = deleteConfirm.contact;
    setDeleteConfirm({ isOpen: false, contact: null });
    try {
      await deleteContact(contact.id);
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      showMessage("success", "Contact supprimé");
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleOpenInvite = (contactId) => {
    setInvitePanel(contactId);
    setEditingId(null);
    setInviteForm({ accountId: ownedAccounts[0]?.id ?? "", role: "editor" });
  };

  const handleInvite = async (contact) => {
    if (!inviteForm.accountId) return;
    setInviting(true);
    try {
      await inviteUser(inviteForm.accountId, contact.email, inviteForm.role);
      showMessage("success", `Invitation envoyée à ${contact.name}`);
      setInvitePanel(null);
      refreshAccounts();
      await loadContacts();
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleAccept = async (token) => {
    setProcessing(token);
    try {
      await acceptInvitation(token);
      showMessage("success", "Invitation acceptée !");
      refreshAccounts();
      await loadInvitations();
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (token) => {
    setProcessing(token);
    try {
      await declineInvitation(token);
      showMessage("success", "Invitation refusée.");
      await loadInvitations();
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AppShell>
      <div className="contacts-page">
        <div className="contacts-page__header">
          <button className="contacts-page__back" onClick={() => navigate(-1)}>
            ← Retour
          </button>
          <h1 className="contacts-page__title">Contacts & invitations</h1>
        </div>

        {message && (
          <div
            className={`contacts-page__message contacts-page__message--${message.type}`}
          >
            {message.text}
          </div>
        )}

        {/* Onglets */}
        <div className="contacts-page__tabs">
          <button
            className={`contacts-page__tab${
              activeTab === "contacts" ? " contacts-page__tab--active" : ""
            }`}
            onClick={() => setActiveTab("contacts")}
          >
            Mes contacts
            {contacts.length > 0 && (
              <span className="contacts-page__count">{contacts.length}</span>
            )}
          </button>
          <button
            className={`contacts-page__tab${
              activeTab === "invitations" ? " contacts-page__tab--active" : ""
            }`}
            onClick={() => setActiveTab("invitations")}
          >
            Invitations reçues
            {invitations.length > 0 && (
              <span className="contacts-page__count contacts-page__count--warn">
                {invitations.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "contacts" && (
          <>
            {/* Formulaire ajout */}
            <section className="contacts-page__section contacts-page__section--add">
              <h2 className="contacts-page__section-title">
                Ajouter un contact
              </h2>
              <form className="contacts-page__add-form" onSubmit={handleAdd}>
                <input
                  type="text"
                  className="contacts-page__input"
                  placeholder="Nom"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  maxLength={80}
                />
                <input
                  type="email"
                  className="contacts-page__input"
                  placeholder="Adresse email"
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
                <button
                  type="submit"
                  className="contacts-page__btn-primary"
                  disabled={adding || !addForm.name || !addForm.email}
                >
                  {adding ? "Ajout…" : "+ Ajouter"}
                </button>
              </form>
            </section>

            {/* Liste des contacts */}
            <section className="contacts-page__section">
              <h2 className="contacts-page__section-title">
                Liste
                {contacts.length > 0 && (
                  <span className="contacts-page__count">
                    {contacts.length}
                  </span>
                )}
              </h2>

              {loading ? (
                <Loader />
              ) : contacts.length === 0 ? (
                <p className="contacts-page__empty">
                  Aucun contact enregistré.
                </p>
              ) : (
                <ul className="contacts-page__list">
                  {contacts.map((contact) => (
                    <li key={contact.id} className="contacts-page__item">
                      {editingId === contact.id ? (
                        /* Mode édition */
                        <div className="contacts-page__edit-form">
                          <input
                            className="contacts-page__input contacts-page__input--sm"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Nom"
                            autoFocus
                          />
                          <input
                            className="contacts-page__input contacts-page__input--sm"
                            type="email"
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                email: e.target.value,
                              }))
                            }
                            placeholder="Email"
                          />
                          <div className="contacts-page__edit-actions">
                            <button
                              type="button"
                              className="contacts-page__btn-primary contacts-page__btn--sm"
                              onClick={() => handleEditSave(contact.id)}
                            >
                              Enregistrer
                            </button>
                            <button
                              type="button"
                              className="contacts-page__btn-ghost contacts-page__btn--sm"
                              onClick={() => setEditingId(null)}
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Affichage normal */
                        <>
                          <div className="contacts-page__item-main">
                            <div className="contacts-page__item-info">
                              <span className="contacts-page__item-name">
                                {contact.name}
                              </span>
                              <span className="contacts-page__item-email">
                                {contact.email}
                              </span>
                              {contact.isRegistered ? (
                                <span className="contacts-page__badge contacts-page__badge--registered">
                                  Inscrit
                                </span>
                              ) : (
                                <span className="contacts-page__badge contacts-page__badge--pending">
                                  Pas encore inscrit
                                </span>
                              )}
                            </div>

                            {/* Accès aux comptes */}
                            {contact.accountsAccess?.length > 0 && (
                              <div className="contacts-page__access-list">
                                {contact.accountsAccess.map((access) => (
                                  <span
                                    key={access.accountId}
                                    className="contacts-page__access-tag"
                                  >
                                    {access.accountName}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="contacts-page__item-actions">
                              {ownedAccounts.length > 0 && (
                                <button
                                  type="button"
                                  className={`contacts-page__btn-invite${invitePanel === contact.id ? " contacts-page__btn-invite--active" : ""}`}
                                  onClick={() =>
                                    invitePanel === contact.id
                                      ? setInvitePanel(null)
                                      : handleOpenInvite(contact.id)
                                  }
                                >
                                  Inviter sur un compte
                                </button>
                              )}
                              <button
                                type="button"
                                className="contacts-page__btn-icon"
                                onClick={() => handleStartEdit(contact)}
                                title="Modifier"
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className="contacts-page__btn-icon contacts-page__btn-icon--danger"
                                onClick={() =>
                                  setDeleteConfirm({ isOpen: true, contact })
                                }
                                title="Supprimer"
                              >
                                ✖
                              </button>
                            </div>
                          </div>

                          {/* Panneau d'invitation */}
                          {invitePanel === contact.id && (
                            <div className="contacts-page__invite-panel">
                              <div className="contacts-page__invite-row">
                                <select
                                  className="contacts-page__select"
                                  value={inviteForm.accountId}
                                  onChange={(e) =>
                                    setInviteForm((f) => ({
                                      ...f,
                                      accountId: e.target.value,
                                    }))
                                  }
                                >
                                  {ownedAccounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>
                                      {acc.name}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  className="contacts-page__select"
                                  value={inviteForm.role}
                                  onChange={(e) =>
                                    setInviteForm((f) => ({
                                      ...f,
                                      role: e.target.value,
                                    }))
                                  }
                                >
                                  {Object.entries(ROLE_LABELS).map(
                                    ([value, label]) => (
                                      <option key={value} value={value}>
                                        {label} — {ROLE_DESCRIPTIONS[value]}
                                      </option>
                                    ),
                                  )}
                                </select>
                                <button
                                  type="button"
                                  className="contacts-page__btn-primary contacts-page__btn--sm"
                                  disabled={inviting || !inviteForm.accountId}
                                  onClick={() => handleInvite(contact)}
                                >
                                  {inviting ? "Envoi…" : "Envoyer l'invitation"}
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {activeTab === "invitations" && (
          <section className="contacts-page__section">
            <h2 className="contacts-page__section-title">
              Invitations en attente
            </h2>
            {invLoading ? (
              <Loader />
            ) : invitations.length === 0 ? (
              <p className="contacts-page__empty">
                Vous n'avez aucune invitation en attente.
              </p>
            ) : (
              <ul className="contacts-page__list">
                {invitations.map((inv) => (
                  <li
                    key={inv.token}
                    className="contacts-page__item contacts-page__item--inv"
                  >
                    <div className="contacts-page__inv-info">
                      <p className="contacts-page__inv-account">
                        {inv.account ? inv.account.name : "Compte inconnu"}
                      </p>
                      <p className="contacts-page__inv-detail">
                        Invité par <strong>{inv.invitedBy?.name ?? "—"}</strong>{" "}
                        · Rôle :{" "}
                        <strong>{ROLE_LABELS[inv.role] ?? inv.role}</strong>
                      </p>
                      <p className="contacts-page__inv-expires">
                        Expire le{" "}
                        {new Date(inv.expiresAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="contacts-page__inv-actions">
                      <button
                        type="button"
                        className="contacts-page__btn-primary contacts-page__btn--sm"
                        disabled={processing === inv.token}
                        onClick={() => handleAccept(inv.token)}
                      >
                        Accepter
                      </button>
                      <button
                        type="button"
                        className="contacts-page__btn-ghost contacts-page__btn--sm"
                        disabled={processing === inv.token}
                        onClick={() => handleDecline(inv.token)}
                      >
                        Refuser
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <ConfirmationModal
          isOpen={deleteConfirm.isOpen}
          title="Supprimer le contact"
          message={`Supprimer ${deleteConfirm.contact?.name} (${deleteConfirm.contact?.email}) de vos contacts ?`}
          confirmText="Supprimer"
          cancelText="Annuler"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm({ isOpen: false, contact: null })}
        />
      </div>
    </AppShell>
  );
}
