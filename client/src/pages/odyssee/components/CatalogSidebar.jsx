import {
  Fragment,
  useCallback,
  useRef,
} from 'react';

import { darken } from '../../../../utils/colorUtils';
import {
  DARKEN_BG,
  DARKEN_BORDER,
} from '../config/folderColors';
import { getInitials } from '../utils/stringUtils';
import IconDossierFull from '../assets/IconDossierFull';
import SidebarCategoryItem from './SidebarCategoryItem';
import SidebarFolderItem from './SidebarFolderItem';
import { useSidebarIndicator } from '../hooks/useSidebarIndicator';

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

  const indicator = useSidebarIndicator({
    sidebarRef,
    folders,
    selectedId: selectedCategoryId,
  });

  const {
    dragRef,
    ghostIndex,
    nestedGhost,
    dropTarget,
    isGhostRedundant,
    handleSidebarDragOver,
    handleSidebarDrop,
  } = dnd;

  const handleCategorySelect = useCallback(
    (catId) => {
      indicator.updateSelection(catId);
      onCategorySelect(catId);
    },
    [indicator, onCategorySelect],
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
      const color = folder.color;
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
      onMouseMove={indicator.handleMouseMove}
      onMouseLeave={indicator.handleMouseLeave}
      onDragOver={handleSidebarDragOver}
      onDrop={handleSidebarDrop}
    >
      <div
        className="catalog-sidebar__indicator"
        style={{
          top: indicator.indicatorY ?? 0,
          opacity: indicator.indicatorOpacity,
          backgroundColor: indicator.indicatorColor ?? undefined,
          transition:
            "top 0.2s ease, opacity 0.15s ease, background-color 0.2s ease",
        }}
        onTransitionEnd={indicator.handleIndicatorTransitionEnd}
      />
      {indicator.activeY !== null && (
        <div
          className="catalog-sidebar__indicator catalog-sidebar__indicator--active"
          style={{
            top: indicator.activeY,
            backgroundColor: indicator.activeColor ?? undefined,
          }}
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2.56 2.56"
          width="20"
          height="20"
          fill="currentColor"
        >
          <path d="M1.39,0s.09.01.14.02c1.04.21,1.39,1.54.58,2.23C1.41,2.87.26,2.51.04,1.6c-.02-.06-.02-.13-.04-.19,0-.08,0-.16,0-.24C.05.56.56.05,1.17,0h.23ZM1.36.61h-.17v.58h-.57v.17h.57v.58h.17v-.58h.59v-.17h-.59v-.58Z" />
        </svg>
      </div>
    </div>
  );
};

export default CatalogSidebar;
