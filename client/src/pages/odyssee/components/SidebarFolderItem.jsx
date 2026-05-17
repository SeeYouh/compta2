import { Fragment } from "react";

import { darken } from "../utils/colorUtils";
import { DARKEN_BG, DARKEN_BORDER } from "../config/folderColors";
import IconDossierFull from "../assets/IconDossierFull";

const SidebarFolderItem = ({
  folder,
  item,
  categories,
  isDropOnFolder,
  nestedGhost,
  dnd,
  onTooltipEnter,
  onTooltipLeave,
  onToggle,
  onContextMenu,
  onCategoryContextMenu,
  onSelect,
  getInitials,
}) => {
  const {
    handleDragStart,
    handleDragEnd,
    handleFolderDragOver,
    handleFolderDrop,
    handleNestedDragOver,
    handleNestedDrop,
  } = dnd;

  const folderColor = folder.color || DEFAULT_FOLDER_COLOR;
  const folderBorderColor = darken(folderColor, DARKEN_BORDER);
  const folderBgColor = darken(folderColor, DARKEN_BG);

  return (
    <div
      className="catalog-sidebar__folder"
      style={{
        borderColor: isDropOnFolder ? folderColor : folderBorderColor,
        background: folderBgColor,
      }}
      onDragOver={(e) => handleFolderDragOver(e, item, item.index)}
      onDrop={(e) => handleFolderDrop(e, item)}
    >
      <div
        className="catalog-sidebar__icon catalog-sidebar__icon--folder"
        data-folder-id={item.id}
        draggable
        onDragStart={(e) =>
          handleDragStart(e, {
            type: "folder",
            id: item.id,
            fromFolderId: null,
          })
        }
        onDragEnd={handleDragEnd}
        onContextMenu={(e) => onContextMenu(e, item.id)}
        onMouseEnter={(e) => onTooltipEnter(e, "folder", item.id)}
        onMouseLeave={onTooltipLeave}
        onClick={() => onToggle(item.id)}
      >
        <IconDossierFull size={22} color={folderColor} />
      </div>

      {folder.isOpen && (
        <div className="catalog-sidebar__folder-children">
          {folder.categoryIds.map((catId, nestedIdx) => {
            const cat = categories.find((c) => c._id === catId);
            if (!cat) return null;
            return (
              <Fragment key={catId}>
                {nestedGhost?.folderId === item.id &&
                  nestedGhost.index === nestedIdx && (
                    <div className="catalog-sidebar__icon catalog-sidebar__icon--nested catalog-sidebar__icon--ghost" />
                  )}
                <div
                  className={`catalog-sidebar__icon catalog-sidebar__icon--nested${cat.active ? " active" : ""}`}
                  data-cat-id={catId}
                  style={
                    cat.image
                      ? { background: "transparent" }
                      : { background: darken(folderColor, DARKEN_BORDER) }
                  }
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, {
                      type: "category",
                      id: catId,
                      fromFolderId: item.id,
                    })
                  }
                  onDragOver={(e) =>
                    handleNestedDragOver(e, item, catId, nestedIdx)
                  }
                  onDrop={(e) => handleNestedDrop(e, item)}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={(e) => onTooltipEnter(e, "category", catId)}
                  onMouseLeave={onTooltipLeave}
                  onClick={() => onSelect(catId)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onCategoryContextMenu(e, catId);
                  }}
                >
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} />
                  ) : (
                    getInitials(cat.name)
                  )}
                </div>
              </Fragment>
            );
          })}
          {nestedGhost?.folderId === item.id &&
            nestedGhost.index === folder.categoryIds.length && (
              <div className="catalog-sidebar__icon catalog-sidebar__icon--nested catalog-sidebar__icon--ghost" />
            )}
        </div>
      )}
    </div>
  );
};

export default SidebarFolderItem;
