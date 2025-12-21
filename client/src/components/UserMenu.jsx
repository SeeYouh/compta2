import { useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import styles from "../sass/components/UserMenu.module.scss";
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
            <div className={styles.userEmail}>{user.email}</div>
          </div>
          <hr className={styles.divider} />
          <button className={styles.logoutButton} onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
