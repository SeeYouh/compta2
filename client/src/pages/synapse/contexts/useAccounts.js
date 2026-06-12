import { useContext } from "react";

import { AccountsContext } from "./createAccountsContext";

export function useAccounts() {
  const context = useContext(AccountsContext);

  if (context === undefined) {
    throw new Error("useAccounts doit être utilisé dans AccountsProvider");
  }

  return context;
}
