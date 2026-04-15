import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import AccountTabMenu from "./AccountTabMenu";
import ConfirmationModal from "./ConfirmationModal";
import styles from "../sass/components/AccountTabs.module.scss";
import { useAccounts } from "../contexts/useAccounts";

const AccountTabs = () => {
  const navigate = useNavigate();
  const {
    accounts,
    activeAccountId,
    setActiveAccount,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAccounts();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [hoveredAccountId, setHoveredAccountId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    account: null,
  });
  const inputRef = useRef(null);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Le nom est requis");
      return;
    }

    try {
      await createAccount(newName.trim());
      setNewName("");
      setError("");
      setIsCreating(false);
    } catch (err) {
      setError(err.message || "Erreur lors de la création");
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setNewName("");
    setError("");
  };

  const handleRename = async (accountId, newName) => {
    try {
      await updateAccount(accountId, newName);
      setHoveredAccountId(null);
    } catch (err) {
      console.error("Erreur renommage:", err);
    }
  };

  const handleDelete = async (accountId) => {
    setDeleteConfirm({ isOpen: false, account: null });
    try {
      await deleteAccount(accountId);
      setHoveredAccountId(null);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const handleDeleteRequest = (account) => {
    setDeleteConfirm({ isOpen: true, account });
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, account: null });
  };

  const handleColorChange = async (accountId, color) => {
    try {
      await updateAccount(accountId, undefined, color);
    } catch (err) {
      console.error("Erreur changement couleur:", err);
    }
  };

  return (
    <nav className={styles.accountTabs} role="tablist" aria-label="Comptes">
      {accounts.map((account) => {
        const isShared = account.sharedWith?.length > 0;
        return (
          <div
            key={account.id}
            className={styles.tabWrapper}
            onMouseEnter={() => setHoveredAccountId(account.id)}
            onMouseLeave={() => setHoveredAccountId(null)}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeAccountId === account.id}
              className={`${styles.tab} ${
                activeAccountId === account.id ? styles.active : ""
              }`}
              style={{
                borderColor: account.color || undefined,
              }}
              onClick={() => setActiveAccount(account.id)}
            >
              {account.name}
            </button>

            {isShared && (
              <span className={styles.sharedBadge} title="Compte partagé">
                👥
              </span>
            )}

            <AccountTabMenu
              account={account}
              isVisible={hoveredAccountId === account.id}
              onRename={(name) => handleRename(account.id, name)}
              onDeleteRequest={() => handleDeleteRequest(account)}
              onColorChange={(color) => handleColorChange(account.id, color)}
              onShare={(id) => navigate(`/account-sharing/${id}`)}
              onClose={() => setHoveredAccountId(null)}
            />
          </div>
        );
      })}

      {isCreating ? (
        <form onSubmit={handleSubmit} className={styles.createForm}>
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleCancel}
            onKeyDown={(e) => {
              if (e.key === "Escape") handleCancel();
            }}
            placeholder="Nom du compte"
            className={styles.input}
          />
          {error && <span className={styles.errorText}>{error}</span>}
        </form>
      ) : (
        <button
          type="button"
          className={`${styles.tab} ${styles.addButton}`}
          onClick={() => setIsCreating(true)}
          title="Créer un nouveau compte"
        >
          +
        </button>
      )}

      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onConfirm={() => handleDelete(deleteConfirm.account?.id)}
        onCancel={handleCancelDelete}
        title="Supprimer le compte"
        message={
          deleteConfirm.account
            ? `Êtes-vous sûr de vouloir supprimer le compte "${deleteConfirm.account.name}" ?\n\nToutes les transactions liées seront également supprimées.`
            : ""
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        requireTextConfirmation={true}
        confirmationText={deleteConfirm.account?.name || ""}
        confirmationPlaceholder="Nom du compte"
      />
    </nav>
  );
};

export default AccountTabs;
