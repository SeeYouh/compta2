// src/components/AppShell.jsx
import React from "react";

import { motion } from "framer-motion";

const MotionDiv = motion.div;

export default function AppShell({ sidebar, headerRight, children }) {
  return (
    <div className="app">
      <header className="app__header">
        <strong>Compte courant</strong>
        <span className="text-dim">· Dernière MAJ il y a 2 min</span>
        <div style={{ marginLeft: "auto" }}>{headerRight}</div>
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
