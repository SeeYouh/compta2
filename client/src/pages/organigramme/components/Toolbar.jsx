import "../styles/Toolbar.scss";

import { useCallback, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useReactFlow } from "@xyflow/react";

export default function Toolbar({ onAddNode, onSave }) {
  const navigate = useNavigate();
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [status, setStatus] = useState("idle");

  const handleSave = useCallback(async () => {
    if (status === "saving") return;
    setStatus("saving");
    try {
      await onSave();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      console.error("[Toolbar] Erreur sauvegarde", e);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3500);
    }
  }, [onSave, status]);

  return (
    <>
      <button
        className="toolbar-close"
        onClick={() => navigate("/dashboard")}
        aria-label="Retour aux applications"
        title="Retour aux applications"
      >
        ✕
      </button>
      {status !== "idle" && (
        <div className={`save-toast save-toast--${status}`}>
          {status === "saving" && (
            <>
              <div className="save-toast__bar" />
              <span>Sauvegarde en cours…</span>
            </>
          )}
          {status === "success" && (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2.5 7l3 3 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Sauvegardé</span>
            </>
          )}
          {status === "error" && (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 2v6M7 10v1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Erreur de sauvegarde</span>
            </>
          )}
        </div>
      )}

      <div className="toolbar">
        <button
          className="toolbar__btn"
          onClick={() => zoomOut({ duration: 200 })}
          title="Dézoomer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle
              cx="7"
              cy="7"
              r="5.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M4.5 7h5M11 11l2.5 2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          className="toolbar__btn"
          onClick={() => zoomIn({ duration: 200 })}
          title="Zoomer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle
              cx="7"
              cy="7"
              r="5.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M7 4.5v5M4.5 7h5M11 11l2.5 2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          className="toolbar__btn"
          onClick={() => fitView({ duration: 300 })}
          title="Ajuster la vue"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M1 5V2h3M12 1h3v3M15 11v3h-3M4 15H1v-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="toolbar__separator" />
        <button
          className="toolbar__btn"
          onClick={onAddNode}
          title="Ajouter un nœud"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 2v12M2 8h12"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="toolbar__separator" />
        <button
          className={`toolbar__btn ${status === "success" ? "toolbar__btn--saved" : ""} ${status === "error" ? "toolbar__btn--error" : ""}`}
          onClick={handleSave}
          disabled={status === "saving"}
          title="Sauvegarder"
        >
          {status === "success" ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8l3.5 3.5 6.5-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : status === "error" ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v6M8 11v1.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M13 1H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4l-2-3Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M11 1v4H5V1M5 9h6v5H5V9Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
