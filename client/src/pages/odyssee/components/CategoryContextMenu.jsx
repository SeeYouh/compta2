import {
  useEffect,
  useRef,
} from 'react';

import IconTrash from '../assets/IconTrash';

const CategoryContextMenu = ({ x, y, onSettings, onDelete, onClose }) => {
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
    <div
      ref={menuRef}
      className="category-ctx-menu"
      style={{ top: y, left: x }}
    >
      <button
        className="category-ctx-menu__item"
        onClick={() => {
          onSettings();
          onClose();
        }}
      >
        Paramètres
      </button>
      <div className="category-ctx-menu__separator" />
      <div className="category-ctx-menu__actions">
        <button
          className="category-ctx-menu__action category-ctx-menu__action--danger"
          onClick={() => {
            onDelete();
            onClose();
          }}
          title="Supprimer"
        >
          <IconTrash size={18} />
        </button>
      </div>
    </div>
  );
};

export default CategoryContextMenu;
