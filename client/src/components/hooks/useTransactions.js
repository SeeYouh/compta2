// import { useCallback, useEffect, useState } from "react";

// import {
//   createTransaction,
//   deleteTransaction,
//   getTransactions,
// } from "../utils/transactionsApi";

// export function useTransactions() {
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const refresh = useCallback(async () => {
//     setLoading(true);
//     try {
//       const data = await getTransactions();
//       setTransactions(data);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const add = useCallback(
//     async (payload) => {
//       await createTransaction(payload);
//       await refresh();
//     },
//     [refresh]
//   );

//   const remove = useCallback(
//     async (id) => {
//       await deleteTransaction(id);
//       await refresh();
//     },
//     [refresh]
//   );

//   useEffect(() => {
//     refresh();
//   }, [refresh]);

//   return { transactions, loading, refresh, add, remove };
// }

// components/hooks/useTransactions.js
import { useCallback, useEffect, useState } from "react";

import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../utils/transactionsApi";

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const add = useCallback(
    async (payload) => {
      await createTransaction(payload);
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (id) => {
      await deleteTransaction(id);
      await refresh();
    },
    [refresh]
  );

  // ⬅️ nouveau : mise à jour partielle d’une transaction
  const update = useCallback(
    async (id, patch) => {
      await updateTransaction(id, patch);
      await refresh();
    },
    [refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { transactions, loading, refresh, add, remove, update };
}
