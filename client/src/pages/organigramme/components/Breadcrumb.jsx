import "../styles/Breadcrumb.scss";

import useStore from "../store/useStore.js";

export default function Breadcrumb() {
  const { breadcrumb, navigateTo } = useStore();

  if (breadcrumb.length <= 1) return null;

  return (
    <nav className="breadcrumb">
      {breadcrumb.map((item, index) => {
        const isLast = index === breadcrumb.length - 1;
        return (
          <span key={item.canvasId} className="breadcrumb__segment">
            {isLast ? (
              <span className="breadcrumb__current">{item.nodeLabel}</span>
            ) : (
              <button
                className="breadcrumb__link"
                onClick={() => navigateTo(item.canvasId)}
              >
                {item.nodeLabel}
              </button>
            )}
            {!isLast && <span className="breadcrumb__sep">›</span>}
          </span>
        );
      })}
    </nav>
  );
}
