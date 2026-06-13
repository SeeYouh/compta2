import { useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { IconAvatar } from "../assets/IconAvatar";
import { IconMaison } from "../assets/IconMaison";
import styles from "../sass/components/UserMenu.module.scss";
import ThemeToggle from "./ThemeToggle";
import { useClickOutside } from "./hooks/useClickOutside";

export default function UserMenu({ align = "right", menuItems = [], leftActions }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || "Utilisateur";

  useClickOutside(menuRef, () => setIsOpen(false));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button
        className={styles.avatar}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu utilisateur"
      >
        {IconAvatar}
      </button>

      {isOpen && (
        <div
          className={`${styles.dropdown} ${align === "left" ? styles.dropdownLeft : ""}`}
        >
          <div className={styles.userInfo}>
            <div className={styles.userName}>{userName}</div>
          </div>
          <hr className={styles.divider} />
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={styles.menuButton}
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ))}
          {menuItems.length > 0 && <hr className={styles.divider} />}
          <div className={styles.actionBar}>
            <div className={styles.actionBarLeft}>
              <ThemeToggle />
              {leftActions}
            </div>
            <div className={styles.actionBarRight}>
              <button
                className={styles.iconBtn}
                onClick={() => {
                  navigate("/");
                  setIsOpen(false);
                }}
                aria-label="Accueil"
                title="Accueil"
              >
                <IconMaison size={18} />
              </button>
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
        </div>
      )}
    </div>
  );
}
