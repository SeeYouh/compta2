import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  getColorPreferences,
  setDefaultColor,
} from '../utils/colorPreferencesApi.js';

// ── Singleton module-level — partagé entre toutes les instances du hook ────────
let _cache = null;
let _loading = false;
const _listeners = new Set();

function _notify(data) {
  _cache = data;
  _loading = false;
  _listeners.forEach((fn) => fn(data));
}

// ──────────────────────────────────────────────────────────────────────────────

/**
 * Charge les préférences couleur de l'utilisateur depuis le serveur (une seule
 * requête partagée entre toutes les instances via le cache module-level).
 *
 * Retourne :
 *   getDefault(contextKey) → string | null
 *     Couleur par défaut sauvegardée pour ce contexte, ou null si aucune.
 *
 *   saveDefault(contextKey, color) → Promise<void>
 *     Persiste la couleur par défaut pour ce contexte (DB + cache local).
 */
export const useColorPreferences = () => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    _listeners.add(listener);

    if (!_cache && !_loading) {
      _loading = true;
      getColorPreferences()
        .then(_notify)
        .catch(() => _notify({ history: [], variables: {}, defaults: {} }));
    }

    return () => _listeners.delete(listener);
  }, []);

  const getDefault = useCallback(
    (contextKey) => _cache?.defaults?.[contextKey] ?? null,
    [],
  );

  const saveDefault = useCallback(async (contextKey, color) => {
    await setDefaultColor(contextKey, color);
    _notify({
      ..._cache,
      defaults: { ..._cache?.defaults, [contextKey]: color },
    });
  }, []);

  return { getDefault, saveDefault, ready: !!_cache };
};
