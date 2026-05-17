import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { darken } from '../utils/colorUtils';
import {
  DARKEN_BG,
  DARKEN_BORDER,
  DEFAULT_FOLDER_COLOR,
} from '../config/folderColors';
import IconDossierFull from '../assets/IconDossierFull';
import SidebarCategoryItem from './SidebarCategoryItem';
import SidebarFolderItem from './SidebarFolderItem';

const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] || "")
    .join("")
    .slice(0, 3);

const CatalogSidebar = ({
  sidebarItems,
  folders,
  categories,
  selectedCategoryId,
  dnd,
  onCategorySelect,
  onCategoryContextMenu,
  onToggleFolder,
  onFolderContextMenu,
  onAddCategory,
  onTooltipEnter,
  onTooltipLeave,
}) => {
  const sidebarRef = useRef(null);
  const transitionPhaseRef = useRef("idle"); // "idle" | "entering" | "tracking" | "leaving"
  const [indicatorY, setIndicatorY] = useState(null);
  const [indicatorOpacity, setIndicatorOpacity] = useState(0);
  const [indicatorColor, setIndicatorColor] = useState(null);
  const [activeY, setActiveY] = useState(null);
  const [activeColor, setActiveColor] = useState(null);

  const {
    dragRef,
    ghostIndex,
    nestedGhost,
    dropTarget,
    isGhostRedundant,
    handleSidebarDragOver,
    handleSidebarDrop,
  } = dnd;

  // Positionner la barre active sur l'item sélectionné (chargement + changement de sélection)
  useEffect(() => {
    if (!sidebarRef.current || !selectedCategoryId) {
      setActiveY(null);
      setActiveColor(null);
      return;
    }
    const folder = folders.find((f) =>
      f.categoryIds?.includes(selectedCategoryId),
    );

    // Chercher d'abord la catégorie dans le DOM (dossier ouvert)
    let el = sidebarRef.current.querySelector(
      `[data-cat-id="${selectedCategoryId}"]`,
    );

    // Si non trouvée (dossier fermé), se rabattre sur l'icône du dossier parent
    if (!el && folder) {
      el = sidebarRef.current.querySelector(`[data-folder-id="${folder._id}"]`);
    }

    if (!el) return;
    const y = el.offsetTop + el.offsetHeight / 2;
    setActiveY(y);
    setActiveColor(folder?.color ?? null);
    // Repositionner la barre curseur si elle n'est pas visible
    if (transitionPhaseRef.current === "idle") setIndicatorY(y);
  }, [selectedCategoryId, folders]);

  const handleMouseMove = useCallback(
    (e) => {
      if (!sidebarRef.current) return;
      const mouseY = e.clientY;

      // Trouver l'icône catégorie, dossier fermé (ou le bouton +) dont le centre Y est le plus proche du curseur
      // Les dossiers ouverts sont exclus : leurs catégories nestées servent de snap points
      const icons = sidebarRef.current.querySelectorAll(
        "[data-cat-id], .catalog-sidebar__add, [data-folder-id]",
      );
      if (icons.length === 0) return;

      let snapY = null;
      let snapCatId = null;
      let snapFolderId = null;
      let minDist = Infinity;
      for (const icon of icons) {
        // Ignorer les icônes de dossiers ouverts (leurs catégories nestées sont dans le DOM)
        if (icon.dataset.folderId) {
          const f = folders.find((f) => f._id === icon.dataset.folderId);
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
        ? folders.find((f) => f.categoryIds?.includes(snapCatId))
        : snapFolderId
          ? folders.find((f) => f._id === snapFolderId)
          : null;
      setIndicatorColor(folder?.color ?? null);

      if (transitionPhaseRef.current === "idle") {
        // Transition "top" active : la barre part de indicatorY (= activeY) vers la catégorie
        transitionPhaseRef.current = "entering";
        setIndicatorOpacity(1);
      }
      setIndicatorY(snapY);
    },
    [folders],
  );

  const handleMouseLeave = useCallback(() => {
    const phase = transitionPhaseRef.current;
    if (phase === "idle") return;

    transitionPhaseRef.current = "leaving";
    setIndicatorColor(activeColor); // Retourner vers la couleur de la catégorie active
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

  const handleCategorySelect = useCallback(
    (catId) => {
      if (sidebarRef.current) {
        const el = sidebarRef.current.querySelector(`[data-cat-id="${catId}"]`);
        if (el) {
          const y = el.offsetTop + el.offsetHeight / 2;
          setActiveY(y);
          if (transitionPhaseRef.current === "idle") setIndicatorY(y);
        }
      }
      const folder = folders.find((f) => f.categoryIds?.includes(catId));
      setActiveColor(folder?.color ?? null);
      onCategorySelect(catId);
    },
    [onCategorySelect, folders],
  );

  const renderGhost = () => {
    const drag = dragRef.current;
    if (!drag) return null;

    if (drag.type === "category") {
      const cat = categories.find((c) => c._id === drag.id);
      if (!cat) return null;
      return (
        <div
          key="ghost"
          className="catalog-sidebar__icon catalog-sidebar__icon--ghost"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {cat.image ? (
            <img src={cat.image} alt={cat.name} />
          ) : (
            getInitials(cat.name)
          )}
        </div>
      );
    }

    if (drag.type === "folder") {
      const folder = folders.find((f) => f._id === drag.id);
      if (!folder) return null;
      const color = folder.color || DEFAULT_FOLDER_COLOR;
      return (
        <div
          key="ghost"
          className="catalog-sidebar__folder catalog-sidebar__folder--ghost"
          style={{
            borderColor: darken(color, DARKEN_BORDER),
            background: darken(color, DARKEN_BG),
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="catalog-sidebar__icon catalog-sidebar__icon--folder">
            <IconDossierFull size={22} color={color} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={sidebarRef}
      className="catalog-sidebar"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onDragOver={handleSidebarDragOver}
      onDrop={handleSidebarDrop}
    >
      <div
        className="catalog-sidebar__indicator"
        style={{
          top: indicatorY ?? 0,
          opacity: indicatorOpacity,
          backgroundColor: indicatorColor ?? undefined,
          transition:
            "top 0.2s ease, opacity 0.15s ease, background-color 0.2s ease",
        }}
        onTransitionEnd={handleIndicatorTransitionEnd}
      />
      {activeY !== null && (
        <div
          className="catalog-sidebar__indicator catalog-sidebar__indicator--active"
          style={{ top: activeY, backgroundColor: activeColor ?? undefined }}
        />
      )}
      {sidebarItems.map((item, index) => {
        if (item.type === "folder") {
          const folder = folders.find((f) => f._id === item.id);
          if (!folder) return null;
          const isDropOnFolder =
            dropTarget?.action === "on" && dropTarget?.id === item.id;

          return (
            <Fragment key={item.id}>
              {ghostIndex === index &&
                !isGhostRedundant(index) &&
                renderGhost()}
              <SidebarFolderItem
                folder={folder}
                item={{ ...item, index }}
                categories={categories}
                isDropOnFolder={isDropOnFolder}
                nestedGhost={nestedGhost}
                dnd={dnd}
                onTooltipEnter={onTooltipEnter}
                onTooltipLeave={onTooltipLeave}
                onToggle={onToggleFolder}
                onContextMenu={onFolderContextMenu}
                onCategoryContextMenu={onCategoryContextMenu}
                onSelect={handleCategorySelect}
                getInitials={getInitials}
              />
            </Fragment>
          );
        }

        const cat = categories.find((c) => c._id === item.id);
        if (!cat) return null;
        const isDropOnCat =
          dropTarget?.action === "on" && dropTarget?.id === item.id;

        return (
          <Fragment key={item.id}>
            {ghostIndex === index && !isGhostRedundant(index) && renderGhost()}
            <SidebarCategoryItem
              cat={cat}
              item={item}
              index={index}
              isDropOnCat={isDropOnCat}
              dnd={dnd}
              onTooltipEnter={onTooltipEnter}
              onTooltipLeave={onTooltipLeave}
              onSelect={handleCategorySelect}
              onContextMenu={onCategoryContextMenu}
              getInitials={getInitials}
            />
          </Fragment>
        );
      })}

      {ghostIndex === sidebarItems.length &&
        !isGhostRedundant(sidebarItems.length) &&
        renderGhost()}

      <div className="catalog-sidebar__add" onClick={onAddCategory}>
        <span className="catalog-sidebar__add-circle">+</span>
      </div>
    </div>
  );
};

export default CatalogSidebar;
