import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import ColorPicker from './ColorPicker';
import { useClickOutside } from './hooks/useClickOutside';
import styles from '../sass/components/AppColorPickerButton.module.scss';

/**
 * Bouton circulaire affichant la couleur courante de l'app.
 * Au clic, ouvre le ColorPicker dans un portail pour échapper aux overflow:hidden.
 *
 * @param {object} props
 * @param {string}   props.color    - Couleur hex courante
 * @param {Function} props.onChange - Callback appelé avec la nouvelle couleur hex
 */
export default function AppColorPickerButton({ color, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const popoverRef = useRef(null);

  useClickOutside(popoverRef, (e) => {
    if (btnRef.current?.contains(e.target)) return;
    setIsOpen(false);
  });

  const handleOpen = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const pickerWidth = 460;
    const left = Math.min(
      rect.left,
      window.innerWidth - pickerWidth - 8,
    );
    setPosition({ top: rect.bottom + 8, left: Math.max(8, left) });
    setIsOpen((v) => !v);
  }, []);

  return (
    <>
      <button
        ref={btnRef}
        className={styles.btn}
        style={{ backgroundColor: color }}
        onClick={handleOpen}
        title="Changer la couleur"
        aria-label="Sélecteur de couleur"
      />
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className={styles.popover}
            style={{ top: position.top, left: position.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <ColorPicker value={color} onChange={onChange} />
          </div>,
          document.body,
        )}
    </>
  );
}
