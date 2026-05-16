const SidebarTooltip = ({ tooltip, categories, folders }) => {
  if (!tooltip) return null;

  if (tooltip.type === "category") {
    const cat = categories.find((c) => c._id === tooltip.id);
    if (!cat) return null;
    return (
      <div className="sidebar-tooltip" style={{ top: tooltip.top }}>
        <span className="sidebar-tooltip__name">{cat.name}</span>
      </div>
    );
  }

  if (tooltip.type === "folder") {
    const folder = folders.find((f) => f._id === tooltip.id);
    if (!folder) return null;

    if (folder.name) {
      return (
        <div className="sidebar-tooltip" style={{ top: tooltip.top }}>
          <span className="sidebar-tooltip__name">{folder.name}</span>
        </div>
      );
    }

    const catNames = folder.categoryIds
      .map((id) => categories.find((c) => c._id === id)?.name)
      .filter(Boolean);
    return (
      <div className="sidebar-tooltip" style={{ top: tooltip.top }}>
        <ul className="sidebar-tooltip__list">
          {catNames.slice(0, 5).map((n, i) => (
            <li key={i}>{n}</li>
          ))}
          {catNames.length > 5 && <li>…</li>}
        </ul>
      </div>
    );
  }

  return null;
};

export default SidebarTooltip;
