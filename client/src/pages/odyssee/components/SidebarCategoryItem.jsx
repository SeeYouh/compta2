const SidebarCategoryItem = ({
  cat,
  item,
  index,
  isDropOnCat,
  dnd,
  onTooltipEnter,
  onTooltipLeave,
  onSelect,
  getInitials,
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
      onMouseEnter={(e) => onTooltipEnter(e, "category", item.id)}
      onMouseLeave={onTooltipLeave}
      onClick={() => onSelect(item.id)}
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
