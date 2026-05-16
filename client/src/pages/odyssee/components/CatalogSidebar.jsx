import { Fragment } from 'react';

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
  dnd,
  onCategorySelect,
  onCategoryContextMenu,
  onToggleFolder,
  onFolderContextMenu,
  onAddCategory,
  onTooltipEnter,
  onTooltipLeave,
}) => {
  const {
    dragRef,
    ghostIndex,
    nestedGhost,
    dropTarget,
    isGhostRedundant,
    handleSidebarDragOver,
    handleSidebarDrop,
  } = dnd;

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
      className="catalog-sidebar"
      onDragOver={handleSidebarDragOver}
      onDrop={handleSidebarDrop}
    >
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
                onSelect={onCategorySelect}
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
              onSelect={onCategorySelect}
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
        +
      </div>
    </div>
  );
};

export default CatalogSidebar;
