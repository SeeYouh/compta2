import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MotionSpan = motion.span;

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.getAttribute("data-theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Changer de thème"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <MotionSpan
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            ☀️
          </MotionSpan>
        ) : (
          <MotionSpan
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            🌙
          </MotionSpan>
        )}
      </AnimatePresence>
    </button>
  );
}
