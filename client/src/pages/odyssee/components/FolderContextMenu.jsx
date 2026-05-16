import { useEffect, useRef } from "react";

const FolderContextMenu = ({
  x,
  y,
  allClosed,
  onSettings,
  onToggleAll,
  onClose,
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div ref={menuRef} className="folder-ctx-menu" style={{ top: y, left: x }}>
      <button
        className="folder-ctx-menu__item"
        onClick={() => {
          onSettings();
          onClose();
        }}
      >
        Paramètres du dossier
      </button>
      <button
        className="folder-ctx-menu__item"
        onClick={() => {
          onToggleAll();
          onClose();
        }}
      >
        {allClosed ? "Ouvrir tous les dossiers" : "Fermer tous les dossiers"}
      </button>
    </div>
  );
};

export default FolderContextMenu;
