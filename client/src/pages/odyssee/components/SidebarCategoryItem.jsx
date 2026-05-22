const SidebarCategoryItem = ({
  cat,
  item,
  index,
  isDropOnCat,
  dnd,
  onTooltipEnter,
  onTooltipLeave,
  onSelect,
  onContextMenu,
  getInitials,
  iconStyle,
}) => {
  const {
    handleDragStart,
    handleDragEnd,
    handleCategoryDragOver,
    handleCategoryDrop,
  } = dnd;

  return (
    <div
      className={`catalog-sidebar__icon${cat.active ? " active" : ""}${isDropOnCat ? " drop-target" : ""}`}
      data-cat-id={cat._id}
      style={iconStyle}
      draggable
      onDragStart={(e) =>
        handleDragStart(e, {
          type: "category",
          id: item.id,
          fromFolderId: null,
        })
      }
      onDragOver={(e) => handleCategoryDragOver(e, item, index)}
      onDrop={(e) => handleCategoryDrop(e, item)}
      onDragEnd={handleDragEnd}
      onMouseEnter={
        onTooltipEnter
          ? (e) => onTooltipEnter(e, "category", item.id)
          : undefined
      }
      onMouseLeave={onTooltipLeave}
      onClick={() => onSelect(item.id)}
      onContextMenu={
        onContextMenu
          ? (e) => {
              e.preventDefault();
              onContextMenu(e, item.id);
            }
          : undefined
      }
    >
      {cat.image ? (
        <img src={cat.image} alt={cat.name} />
      ) : (
        getInitials(cat.name)
      )}
    </div>
  );
};

export default SidebarCategoryItem;
