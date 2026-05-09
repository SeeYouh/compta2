import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { config } from "../config/env";
import Loader from "../components/Loader";
import styles from "./SettingsPage.module.scss";

function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${config.apiUrl}/api/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur chargement comptes");
    const data = await res.json();
    setAccounts(data.filter((a) => !a.isTemplate));
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts().catch(console.error);
  }, []);

  return { accounts, setAccounts, loading, refetch: fetchAccounts };
}

const PERMISSION_LABELS = {
  canViewTransactions: "Voir les transactions",
  canCreateTransactions: "Ajouter des transactions",
  canEditTransactions: "Modifier les transactions",
  canDeleteTransactions: "Supprimer les transactions",
  canManageThemes: "Gérer les thèmes",
  canRenameAccount: "Renommer le compte",
  canInviteUsers: "Inviter des utilisateurs",
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  // --- Profil ---
  const [name, setName] = useState(storedUser.name || "");
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // --- Mot de passe ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // --- Comptes ---
  const {
    accounts,
    setAccounts,
    loading: accountsLoading,
    refetch,
  } = useAccounts();
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountColor, setNewAccountColor] = useState("#3b82f6");
  const [accountMsg, setAccountMsg] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("token");
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // --- Handlers profil ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch(`${config.apiUrl}/api/auth/profile`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ type: "error", text: data.error });
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      setProfileMsg({ type: "success", text: "Pseudo mis à jour" });
    } catch {
      setProfileMsg({ type: "error", text: "Erreur réseau" });
    } finally {
      setProfileLoading(false);
    }
  };

  // --- Handlers mot de passe ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        type: "error",
        text: "Les mots de passe ne correspondent pas",
      });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/api/auth/password`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ type: "error", text: data.error });
        return;
      }
      setPasswordMsg({ type: "success", text: data.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMsg({ type: "error", text: "Erreur réseau" });
    } finally {
      setPasswordLoading(false);
    }
  };

  // --- Handlers comptes ---
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setAccountMsg(null);
    if (!newAccountName.trim()) return;
    try {
      const res = await fetch(`${config.apiUrl}/api/accounts`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name: newAccountName.trim(),
          color: newAccountColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccountMsg({ type: "error", text: data.error });
        return;
      }
      setNewAccountName("");
      setNewAccountColor("#3b82f6");
      setAccountMsg({ type: "success", text: "Compte créé" });
      await refetch();
    } catch {
      setAccountMsg({ type: "error", text: "Erreur réseau" });
    }
  };

  const startEdit = (account) => {
    setEditingAccount(account.id);
    setEditName(account.name);
    setEditColor(account.color || "#3b82f6");
  };

  const handleUpdateAccount = async (id) => {
    setAccountMsg(null);
    try {
      const res = await fetch(`${config.apiUrl}/api/accounts/${id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ name: editName.trim(), color: editColor }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccountMsg({ type: "error", text: data.error });
        return;
      }
      setEditingAccount(null);
      setAccountMsg({ type: "success", text: "Compte mis à jour" });
      await refetch();
    } catch {
      setAccountMsg({ type: "error", text: "Erreur réseau" });
    }
  };

  const handleDeleteAccount = async (id) => {
    setDeletingId(id);
    setAccountMsg(null);
    try {
      const res = await fetch(`${config.apiUrl}/api/accounts/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        setAccountMsg({ type: "error", text: data.error });
        return;
      }
      setAccountMsg({ type: "success", text: "Compte supprimé" });
      await refetch();
    } catch {
      setAccountMsg({ type: "error", text: "Erreur réseau" });
    } finally {
      setDeletingId(null);
    }
  };

  // --- Handler toggle permission ---
  const [togglingPerm, setTogglingPerm] = useState(null); // "accountId-userName-perm"

  const handleTogglePermission = async (
    accountId,
    userName,
    permission,
    currentValue,
  ) => {
    const key = `${accountId}-${userName}-${permission}`;
    setTogglingPerm(key);

    // Mise à jour optimiste
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== accountId) return acc;
        return {
          ...acc,
          sharedWith: acc.sharedWith.map((share) => {
            if (share.name !== userName) return share;
            return {
              ...share,
              permissions: {
                ...share.permissions,
                [permission]: !currentValue,
              },
            };
          }),
        };
      }),
    );

    try {
      const res = await fetch(
        `${config.apiUrl}/api/accounts/${accountId}/shared-permissions`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({ userName, permission, value: !currentValue }),
        },
      );
      if (!res.ok) {
        // Rollback
        setAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id !== accountId) return acc;
            return {
              ...acc,
              sharedWith: acc.sharedWith.map((share) => {
                if (share.name !== userName) return share;
                return {
                  ...share,
                  permissions: {
                    ...share.permissions,
                    [permission]: currentValue,
                  },
                };
              }),
            };
          }),
        );
      }
    } catch {
      // Rollback réseau
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc;
          return {
            ...acc,
            sharedWith: acc.sharedWith.map((share) => {
              if (share.name !== userName) return share;
              return {
                ...share,
                permissions: {
                  ...share.permissions,
                  [permission]: currentValue,
                },
              };
            }),
          };
        }),
      );
    } finally {
      setTogglingPerm(null);
    }
  };

  // Récupère les partages pour tous les comptes (sharedWith est dans le modèle Account)
  const sharedAccounts = accounts.filter(
    (a) => a.sharedWith && a.sharedWith.length > 0,
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          className={styles.back}
          onClick={() => navigate(-1)}
          aria-label="Retour"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className={styles.title}>Paramètres</h1>
      </header>

      <div className={styles.content}>
        {/* Section Profil */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Profil</h2>
          <p className={styles.sectionDesc}>
            Email : <strong>{storedUser.email}</strong>
          </p>
          <form className={styles.form} onSubmit={handleProfileSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">
                Pseudo
              </label>
              <input
                id="name"
                className={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                required
              />
            </div>
            {profileMsg && (
              <p className={`${styles.msg} ${styles[profileMsg.type]}`}>
                {profileMsg.text}
              </p>
            )}
            <button
              className={styles.btnPrimary}
              type="submit"
              disabled={profileLoading}
            >
              {profileLoading ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        </section>

        {/* Section Mot de passe */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Mot de passe</h2>
          <form className={styles.form} onSubmit={handlePasswordSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="currentPassword">
                Mot de passe actuel
              </label>
              <input
                id="currentPassword"
                className={styles.input}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="newPassword">
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                className={styles.input}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirmPassword">
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="confirmPassword"
                className={styles.input}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            {passwordMsg && (
              <p className={`${styles.msg} ${styles[passwordMsg.type]}`}>
                {passwordMsg.text}
              </p>
            )}
            <button
              className={styles.btnPrimary}
              type="submit"
              disabled={passwordLoading}
            >
              {passwordLoading ? "Modification…" : "Modifier le mot de passe"}
            </button>
          </form>
        </section>

        {/* Section Comptes */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Mes comptes</h2>

          {accountMsg && (
            <p className={`${styles.msg} ${styles[accountMsg.type]}`}>
              {accountMsg.text}
            </p>
          )}

          {accountsLoading ? (
            <Loader />
          ) : (
            <ul className={styles.accountList}>
              {accounts.map((account) => (
                <li key={account.id} className={styles.accountItem}>
                  {editingAccount === account.id ? (
                    <div className={styles.accountEdit}>
                      <input
                        className={styles.input}
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={60}
                      />
                      <div className={styles.colorRow}>
                        <label className={styles.label}>Couleur</label>
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className={styles.colorInput}
                        />
                      </div>
                      <div className={styles.accountActions}>
                        <button
                          className={styles.btnPrimary}
                          onClick={() => handleUpdateAccount(account.id)}
                        >
                          Valider
                        </button>
                        <button
                          className={styles.btnSecondary}
                          onClick={() => setEditingAccount(null)}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.accountRow}>
                      <span
                        className={styles.accountDot}
                        style={{
                          background: account.color || "var(--color-primary)",
                        }}
                      />
                      <span className={styles.accountName}>{account.name}</span>
                      <div className={styles.accountActions}>
                        <button
                          className={styles.btnSecondary}
                          onClick={() => startEdit(account)}
                        >
                          Modifier
                        </button>
                        <button
                          className={styles.btnDanger}
                          onClick={() => handleDeleteAccount(account.id)}
                          disabled={deletingId === account.id}
                        >
                          {deletingId === account.id
                            ? "Suppression…"
                            : "Supprimer"}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <form
            className={styles.newAccountForm}
            onSubmit={handleCreateAccount}
          >
            <h3 className={styles.subTitle}>Créer un compte</h3>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="newAccountName">
                Nom du compte
              </label>
              <input
                id="newAccountName"
                className={styles.input}
                type="text"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="Ex : Compte courant"
                maxLength={60}
                required
              />
            </div>
            <div className={styles.colorRow}>
              <label className={styles.label} htmlFor="newAccountColor">
                Couleur
              </label>
              <input
                id="newAccountColor"
                type="color"
                value={newAccountColor}
                onChange={(e) => setNewAccountColor(e.target.value)}
                className={styles.colorInput}
              />
            </div>
            <button className={styles.btnPrimary} type="submit">
              Créer
            </button>
          </form>
        </section>

        {/* Section Partages */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Partages actifs</h2>
          {accountsLoading ? (
            <Loader />
          ) : sharedAccounts.length === 0 ? (
            <p className={styles.empty}>Aucun compte partagé pour le moment.</p>
          ) : (
            <ul className={styles.shareList}>
              {sharedAccounts.map((account) => (
                <li key={account.id} className={styles.shareItem}>
                  <div className={styles.shareAccountName}>
                    <span
                      className={styles.accountDot}
                      style={{
                        background: account.color || "var(--color-primary)",
                      }}
                    />
                    {account.name}
                  </div>
                  <ul className={styles.shareUsers}>
                    {account.sharedWith.map((share) => (
                      <li key={share.name} className={styles.shareUser}>
                        <span className={styles.shareUserName}>
                          {share.name}
                        </span>
                        <ul className={styles.sharePerms}>
                          {Object.entries(PERMISSION_LABELS).map(
                            ([perm, label]) => {
                              const allowed = !!share.permissions[perm];
                              const key = `${account.id}-${share.name}-${perm}`;
                              const isToggling = togglingPerm === key;
                              return (
                                <li key={perm}>
                                  <button
                                    className={`${styles.permToggle} ${allowed ? styles.permAllowed : styles.permDenied}`}
                                    onClick={() =>
                                      handleTogglePermission(
                                        account.id,
                                        share.name,
                                        perm,
                                        allowed,
                                      )
                                    }
                                    disabled={isToggling}
                                    aria-pressed={allowed}
                                  >
                                    <span className={styles.permIcon}>
                                      {allowed ? "✓" : "✗"}
                                    </span>
                                    {label}
                                  </button>
                                </li>
                              );
                            },
                          )}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
