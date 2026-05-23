import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Gère la barre indicateur animée de la sidebar (curseur + item actif).
 * Compatible avec CatalogSidebar (dossiers avec _id) et PassagerItem (dossiers avec id).
 *
 * @param {Object} params
 * @param {React.RefObject} params.sidebarRef - ref sur le conteneur sidebar
 * @param {Array}  params.folders            - liste des dossiers ({ _id|id, categoryIds, color, isOpen })
 * @param {string} params.selectedId         - id de l'item actuellement sélectionné
 */
export const useSidebarIndicator = ({
  sidebarRef,
  folders = [],
  selectedId,
  getItemColor = null,
}) => {
  const transitionPhaseRef = useRef("idle"); // "idle" | "entering" | "tracking" | "leaving"
  const [indicatorY, setIndicatorY] = useState(null);
  const [indicatorOpacity, setIndicatorOpacity] = useState(0);
  const [indicatorColor, setIndicatorColor] = useState(null);
  const [activeY, setActiveY] = useState(null);
  const [activeColor, setActiveColor] = useState(null);

  const folderId = (f) => f._id ?? f.id;

  const findFolderByCatId = useCallback(
    (catId) => folders.find((f) => f.categoryIds?.includes(catId)),
    [folders],
  );

  const findFolderByFolderId = useCallback(
    (id) => folders.find((f) => folderId(f) === id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [folders],
  );

  // Positionner la barre active sur l'item sélectionné (chargement + changement de sélection)
  useEffect(() => {
    if (!sidebarRef.current || !selectedId) {
      setActiveY(null);
      setActiveColor(null);
      return;
    }
    const folder = findFolderByCatId(selectedId);

    let el = sidebarRef.current.querySelector(`[data-cat-id="${selectedId}"]`);
    if (!el && folder) {
      el = sidebarRef.current.querySelector(
        `[data-folder-id="${folderId(folder)}"]`,
      );
    }
    if (!el) return;

    const y = el.offsetTop + el.offsetHeight / 2;
    setActiveY(y);
    setActiveColor(folder?.color ?? getItemColor?.(selectedId) ?? null);
    if (transitionPhaseRef.current === "idle") setIndicatorY(y);
  }, [selectedId, folders, sidebarRef, findFolderByCatId, getItemColor]);

  const handleMouseMove = useCallback(
    (e) => {
      if (!sidebarRef.current) return;
      const mouseY = e.clientY;

      const icons = sidebarRef.current.querySelectorAll(
        "[data-cat-id], .catalog-sidebar__add, [data-folder-id]",
      );
      if (icons.length === 0) return;

      let snapY = null;
      let snapCatId = null;
      let snapFolderId = null;
      let minDist = Infinity;

      for (const icon of icons) {
        if (icon.dataset.folderId) {
          const f = findFolderByFolderId(icon.dataset.folderId);
          if (f?.isOpen) continue;
        }
        const r = icon.getBoundingClientRect();
        const centerY = r.top + r.height / 2;
        const dist = Math.abs(mouseY - centerY);
        if (dist < minDist) {
          minDist = dist;
          snapY = icon.offsetTop + icon.offsetHeight / 2;
          snapCatId = icon.dataset.catId ?? null;
          snapFolderId = icon.dataset.folderId ?? null;
        }
      }

      if (snapY === null) return;

      const folder = snapCatId
        ? findFolderByCatId(snapCatId)
        : snapFolderId
          ? findFolderByFolderId(snapFolderId)
          : null;
      setIndicatorColor(
        folder?.color ?? (snapCatId ? getItemColor?.(snapCatId) : null) ?? null,
      );

      if (transitionPhaseRef.current === "idle") {
        transitionPhaseRef.current = "entering";
        setIndicatorOpacity(1);
      }
      setIndicatorY(snapY);
    },
    [sidebarRef, findFolderByCatId, findFolderByFolderId],
  );

  const handleMouseLeave = useCallback(() => {
    const phase = transitionPhaseRef.current;
    if (phase === "idle") return;

    transitionPhaseRef.current = "leaving";
    setIndicatorColor(activeColor);
    if (activeY !== null) {
      setIndicatorY(activeY);
    } else {
      transitionPhaseRef.current = "idle";
      setIndicatorOpacity(0);
    }
  }, [activeY, activeColor]);

  const handleIndicatorTransitionEnd = useCallback((e) => {
    if (e.propertyName !== "top") return;

    if (transitionPhaseRef.current === "entering") {
      transitionPhaseRef.current = "tracking";
    } else if (transitionPhaseRef.current === "leaving") {
      transitionPhaseRef.current = "idle";
      setIndicatorOpacity(0);
    }
  }, []);

  // Appelé quand l'utilisateur clique sur un item pour mettre à jour la barre active
  const updateSelection = useCallback(
    (catId) => {
      if (!sidebarRef.current) return;
      const el = sidebarRef.current.querySelector(`[data-cat-id="${catId}"]`);
      if (el) {
        const y = el.offsetTop + el.offsetHeight / 2;
        setActiveY(y);
        if (transitionPhaseRef.current === "idle") setIndicatorY(y);
      }
      const folder = findFolderByCatId(catId);
      setActiveColor(folder?.color ?? getItemColor?.(catId) ?? null);
    },
    [sidebarRef, findFolderByCatId, getItemColor],
  );

  return {
    indicatorY,
    indicatorOpacity,
    indicatorColor,
    activeY,
    activeColor,
    handleMouseMove,
    handleMouseLeave,
    handleIndicatorTransitionEnd,
    updateSelection,
  };
};
