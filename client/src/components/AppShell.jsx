// src/components/AppShell.jsx
import React from "react";

import { motion } from "framer-motion";

import { APP_LABELS } from "./utils";

const MotionDiv = motion.div;

export default function AppShell({
  sidebar,
  headerRight,
  children,
  lastUpdateText,
}) {
  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-left">
          <strong>{APP_LABELS.appTitle}</strong>
          {lastUpdateText && (
            <span className="text-dim">
              · {APP_LABELS.lastUpdatePrefix} {lastUpdateText}
            </span>
          )}
        </div>
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
