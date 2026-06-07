const CACHE_KEY = {
  passengers: "ody_sidebar_cache_passengers",
  catalogue: "ody_sidebar_cache_catalogue",
};

const DIRTY_KEY = {
  passengers: "ody_sidebar_dirty_passengers",
  catalogue: "ody_sidebar_dirty_catalogue",
};

export function markDirty(type) {
  const key = DIRTY_KEY[type];
  if (key) localStorage.setItem(key, "1");
}

function read(type) {
  try {
    const raw = localStorage.getItem(CACHE_KEY[type]);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(type, data) {
  try {
    localStorage.setItem(CACHE_KEY[type], JSON.stringify(data));
  } catch {
    // localStorage plein — on continue sans cache
  }
}

/**
 * Retourne les données sidebar (layout + folders + categories) depuis le cache
 * ou depuis l'API si le cache est absent ou marqué dirty.
 *
 * @param {"passengers"|"catalogue"} type
 * @param {() => Promise<{layout, folders, categories}|null>} fetchFn
 */
export async function getSidebarData(type, fetchFn) {
  const cached = read(type);
  const dirty = !!localStorage.getItem(DIRTY_KEY[type]);

  if (cached && !dirty) return cached;

  const data = await fetchFn();
  if (!data) return cached ?? null;

  save(type, data);
  localStorage.removeItem(DIRTY_KEY[type]);
  return data;
}
