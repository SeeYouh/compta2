import { useEffect, useRef, useState } from "react";

import styles from "../sass/components/AccountTabs.module.scss";
import { useAccounts } from "../contexts/useAccounts";

const AccountTabs = () => {
  const { accounts, activeAccountId, setActiveAccount, createAccount } =
    useAccounts();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
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

  return (
    <nav className={styles.accountTabs} role="tablist" aria-label="Comptes">
      {accounts.map((account) => (
        <button
          key={account.id}
          type="button"
          role="tab"
          aria-selected={activeAccountId === account.id}
          className={`${styles.tab} ${
            activeAccountId === account.id ? styles.active : ""
          }`}
          onClick={() => setActiveAccount(account.id)}
        >
          {account.name}
        </button>
      ))}

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
    </nav>
  );
};

export default AccountTabs;
