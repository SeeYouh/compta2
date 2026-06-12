import { useCallback, useEffect, useState } from 'react';

import { authFetch } from '../../../components/utils/authFetch';
import { computeColorPalette, DEFAULT_COLOR } from '../../../utils/colorPalette';

export const useSynapseColor = () => {
  const [userColor, setUserColor] = useState(
    () => localStorage.getItem('synapseColor') || DEFAULT_COLOR,
  );
  const [palette, setPalette] = useState(() => computeColorPalette(userColor));
  const [loading, setLoading] = useState(true);

  // Charger la couleur depuis le serveur au montage
  useEffect(() => {
    const loadColor = async () => {
      try {
        const response = await authFetch('/api/synapse/settings/color/get');
        if (response.ok) {
          const data = await response.json();
          const color = data.userColor || DEFAULT_COLOR;
          setUserColor(color);
          localStorage.setItem('synapseColor', color);
          setPalette(computeColorPalette(color));
        }
      } catch (error) {
        console.error('Erreur chargement couleur Synapse:', error);
      } finally {
        setLoading(false);
      }
    };

    loadColor();
  }, []);

  const updateColor = useCallback(
    async (newColor) => {
      try {
        // Mettre à jour localement d'abord
        setUserColor(newColor);
        localStorage.setItem('synapseColor', newColor);
        setPalette(computeColorPalette(newColor));

        // Persister sur le serveur
        const response = await authFetch('/api/synapse/settings/color/update', {
          method: 'PATCH',
          body: JSON.stringify({ userColor: newColor }),
        });

        if (!response.ok) {
          throw new Error('Erreur mise à jour couleur');
        }
      } catch (error) {
        console.error('Erreur mise à jour couleur Synapse:', error);
        // Rollback local si erreur serveur
        const savedColor = localStorage.getItem('synapseColor') || DEFAULT_COLOR;
        setUserColor(savedColor);
        setPalette(computeColorPalette(savedColor));
      }
    },
    [],
  );

  return {
    userColor,
    palette,
    loading,
    updateColor,
  };
};
