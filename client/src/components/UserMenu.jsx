import { useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import styles from "../sass/components/UserMenu.module.scss";
import ThemeToggle from "./ThemeToggle";
import { useClickOutside } from "./hooks/useClickOutside";

export default function UserMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || "Utilisateur";
  const userInitial = userName.charAt(0).toUpperCase();

  useClickOutside(menuRef, () => setIsOpen(false));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNavigateToSettings = () => {
    navigate("/settings");
    setIsOpen(false);
  };

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button
        className={styles.avatar}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu utilisateur"
      >
        {userInitial}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{userName}</div>
          </div>
          <hr className={styles.divider} />
          <div className={styles.actionBar}>
            <div className={styles.actionBarLeft}>
              <ThemeToggle />
              <button
                className={styles.iconBtn}
                onClick={handleNavigateToSettings}
                aria-label="Paramètres"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>
            <button
              className={styles.iconBtnDanger}
              onClick={handleLogout}
              aria-label="Déconnexion"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
