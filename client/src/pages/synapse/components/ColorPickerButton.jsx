import { useState } from 'react';

import { useSynapseColorContext } from '../contexts/SynapseColorContext';
import SynapseColorPicker from './SynapseColorPicker';
import styles from './ColorPickerButton.module.scss';

export default function ColorPickerButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { userColor } = useSynapseColorContext();

  return (
    <div className={styles.container}>
      <button
        className={styles.colorButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Changer la couleur Synapse"
        style={{ backgroundColor: userColor }}
        aria-label="Sélecteur de couleur"
      />
      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.popoverContent}>
            <SynapseColorPicker />
          </div>
        </div>
      )}
    </div>
  );
}
