// src/components/AppShell.jsx
import React from "react";

import { motion } from "framer-motion";

import { APP_LABELS } from "./utils";
import { useAccounts } from "../contexts/useAccounts";

const MotionDiv = motion.div;

export default function AppShell({
  sidebar,
  headerRight,
  accountTabs,
  children,
  lastUpdateText,
}) {
  const { activeAccount } = useAccounts();
  const title = activeAccount?.name || APP_LABELS.appTitle;

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-left">
          <strong>{title}</strong>
          {lastUpdateText && (
            <span className="text-dim">
              · {APP_LABELS.lastUpdatePrefix} {lastUpdateText}
            </span>
          )}
        </div>
        {accountTabs && <div className="app__header-tabs">{accountTabs}</div>}
        <div className="app__header-right">{headerRight}</div>
      </header>

      {sidebar && <aside className="app__sidebar">{sidebar}</aside>}

      <main className="app__main">
        <MotionDiv
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {children}
        </MotionDiv>
      </main>
    </div>
  );
}
