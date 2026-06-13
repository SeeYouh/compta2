import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import ColorPicker from '../../../components/ColorPicker';
import { usePortalColorContext } from '../contexts/PortalColorContext';
import styles from './PortalColorPickerButton.module.scss';

export default function PortalColorPickerButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { userColor, updateColor } = usePortalColorContext();
  const buttonRef = useRef(null);

  const getPopoverStyle = () => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    };
  };

  return (
    <div className={styles.container} ref={buttonRef}>
      <button
        className={styles.colorButton}
        onClick={() => setIsOpen((v) => !v)}
        title="Couleur du portail"
        style={{ backgroundColor: userColor }}
        aria-label="Sélecteur de couleur du portail"
      />
      {isOpen &&
        createPortal(
          <>
            <div
              className={styles.backdrop}
              onClick={() => setIsOpen(false)}
            />
            <div className={styles.popover} style={getPopoverStyle()} onClick={(e) => e.stopPropagation()}>
              <ColorPicker
                value={userColor}
                onChange={(color) => {
                  updateColor(color);
                  setIsOpen(false);
                }}
                onClose={() => setIsOpen(false)}
                contextKey="portal-primary"
                showHistory
                showDefaultButtons
              />
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
