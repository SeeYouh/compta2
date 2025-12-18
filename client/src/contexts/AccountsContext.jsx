import { useCallback, useEffect, useState } from "react";

import { AccountsContext } from "./createAccountsContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Récupère tous les comptes utilisateurs
 */
async function getAccounts() {
  const response = await fetch(`${API_URL}/api/accounts`);
  if (!response.ok) throw new Error("Erreur lors du chargement des comptes");
  return response.json();
}

/**
 * Crée un nouveau compte
 */
async function createAccount(name) {
  const response = await fetch(`${API_URL}/api/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Erreur lors de la création du compte");
  return response.json();
}

/**
 * Renomme un compte
 */
async function updateAccount(accountId, name) {
  const response = await fetch(`${API_URL}/api/accounts/${accountId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Erreur lors de la modification du compte");
  return response.json();
}

/**
 * Supprime un compte
 */
async function deleteAccount(accountId) {
  const response = await fetch(`${API_URL}/api/accounts/${accountId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erreur lors de la suppression du compte");
  return response.json();
}

export function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAccounts();
      setAccounts(data);

      // Définir le premier compte comme actif si aucun n'est sélectionné
      if (!activeAccountId && data.length > 0) {
        setActiveAccountId(data[0].id);
      }

      setError(null);
    } catch (err) {
      console.error("Erreur chargement comptes:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [activeAccountId]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  /**
   * Sélectionne un compte actif
   */
  const setActiveAccount = useCallback((accountId) => {
    setActiveAccountId(accountId);
  }, []);

  /**
   * Récupère le compte actif
   */
  const getActiveAccount = useCallback(() => {
    return accounts.find((acc) => acc.id === activeAccountId) || null;
  }, [accounts, activeAccountId]);

  /**
   * Crée un nouveau compte et recharge la liste
   */
  const handleCreateAccount = useCallback(
    async (name) => {
      try {
        const result = await createAccount(name);
        await loadAccounts();
        // Activer le nouveau compte
        setActiveAccountId(result.account.id);
        return result;
      } catch (err) {
        console.error("Erreur création compte:", err);
        throw err;
      }
    },
    [loadAccounts]
  );

  /**
   * Renomme un compte et recharge la liste
   */
  const handleUpdateAccount = useCallback(
    async (accountId, name) => {
      try {
        await updateAccount(accountId, name);
        await loadAccounts();
      } catch (err) {
        console.error("Erreur modification compte:", err);
        throw err;
      }
    },
    [loadAccounts]
  );

  /**
   * Supprime un compte et recharge la liste
   */
  const handleDeleteAccount = useCallback(
    async (accountId) => {
      try {
        await deleteAccount(accountId);
        await loadAccounts();

        // Si le compte supprimé était actif, activer le premier compte restant
        if (activeAccountId === accountId && accounts.length > 1) {
          const remainingAccounts = accounts.filter(
            (acc) => acc.id !== accountId
          );
          if (remainingAccounts.length > 0) {
            setActiveAccountId(remainingAccounts[0].id);
          }
        }
      } catch (err) {
        console.error("Erreur suppression compte:", err);
        throw err;
      }
    },
    [loadAccounts, activeAccountId, accounts]
  );

  /**
   * Force le rechargement des comptes
   */
  const refresh = useCallback(() => {
    loadAccounts();
  }, [loadAccounts]);

  const value = {
    accounts,
    activeAccountId,
    activeAccount: getActiveAccount(),
    loading,
    error,
    setActiveAccount,
    createAccount: handleCreateAccount,
    updateAccount: handleUpdateAccount,
    deleteAccount: handleDeleteAccount,
    refresh,
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
}
