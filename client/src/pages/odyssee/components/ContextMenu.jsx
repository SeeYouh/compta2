import {
  useEffect,
  useRef,
} from 'react';

const ContextMenu = ({ x, y, onClose, children }) => {
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
    <div ref={menuRef} className="ctx-menu" style={{ top: y, left: x }}>
      {children}
    </div>
  );
};

export default ContextMenu;
