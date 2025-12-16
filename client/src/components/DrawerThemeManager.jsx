import { useEffect, useState } from "react";

import ConfirmationModal from "./ConfirmationModal";
import { saveThemes } from "./utils/themesApi";

export default function DrawerThemeManager({
  isOpen,
  onClose,
  themes,
  onSave,
}) {
  const [localThemes, setLocalThemes] = useState(themes || {});
  const [expandedThemeId, setExpandedThemeId] = useState(null);
  const [editingThemeId, setEditingThemeId] = useState(null);
  const [editingSubThemeId, setEditingSubThemeId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [isAddingTheme, setIsAddingTheme] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [addingSubThemeToId, setAddingSubThemeToId] = useState(null);
  const [newSubThemeName, setNewSubThemeName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    if (themes) {
      setLocalThemes(themes);
    }
  }, [themes]);

  // Gestion fermeture avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Génération d'ID et slug
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const generateThemeId = (themesObj) => {
    const existingIds = Object.keys(themesObj);
    let maxNum = 0;
    existingIds.forEach((id) => {
      const match = id.match(/^theme-(\d+)$/);
      if (match) {
        maxNum = Math.max(maxNum, parseInt(match[1], 10));
      }
    });
    return `theme-${maxNum + 1}`;
  };

  const generateSubThemeId = (subThemesObj) => {
    const existingIds = Object.keys(subThemesObj);
    let maxNum = 0;
    existingIds.forEach((id) => {
      const match = id.match(/^subtheme-\d+-(\d+)$/);
      if (match) {
        maxNum = Math.max(maxNum, parseInt(match[1], 10));
      }
    });
    return `subtheme-${Date.now()}-${maxNum + 1}`;
  };

  // Ajout d'un nouveau thème
  const handleAddTheme = async () => {
    if (!newThemeName.trim()) return;

    const newId = generateThemeId(localThemes);
    const slug = generateSlug(newThemeName);

    const updatedThemes = {
      ...localThemes,
      [newId]: {
        id: newId,
        name: newThemeName.trim(),
        slug: slug,
        subThemes: {},
      },
    };

    setLocalThemes(updatedThemes);
    setNewThemeName("");
    setIsAddingTheme(false);

    // Sauvegarde immédiate
    try {
      await saveThemes(updatedThemes);
      onSave(updatedThemes);
      setSaveMessage({ type: "success", text: "Thème ajouté" });
      setTimeout(() => setSaveMessage(null), 2000);
    } catch {
      setSaveMessage({ type: "error", text: "Erreur de sauvegarde" });
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  // Édition d'un thème
  const startEditTheme = (themeId, currentName) => {
    setEditingThemeId(themeId);
    setEditingValue(currentName);
  };

  const saveEditTheme = async () => {
    if (!editingValue.trim() || !editingThemeId) return;

    const updatedThemes = {
      ...localThemes,
      [editingThemeId]: {
        ...localThemes[editingThemeId],
        name: editingValue.trim(),
        slug: generateSlug(editingValue),
      },
    };

    setLocalThemes(updatedThemes);
    setEditingThemeId(null);
    setEditingValue("");

    // Sauvegarde immédiate
    try {
      await saveThemes(updatedThemes);
      onSave(updatedThemes);
      setSaveMessage({ type: "success", text: "Thème modifié" });
      setTimeout(() => setSaveMessage(null), 2000);
    } catch {
      setSaveMessage({ type: "error", text: "Erreur de sauvegarde" });
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  // Suppression d'un thème
  const handleDeleteTheme = (themeId) => {
    setDeleteConfirm({
      type: "theme",
      id: themeId,
      name: localThemes[themeId].name,
    });
  };

  const confirmDelete = async () => {
    let updatedThemes;

    if (deleteConfirm.type === "theme") {
      const { [deleteConfirm.id]: _removed, ...remainingThemes } = localThemes;
      updatedThemes = remainingThemes;
      setLocalThemes(remainingThemes);
    } else if (deleteConfirm.type === "subtheme") {
      const { [deleteConfirm.subId]: _removed, ...remainingSubThemes } =
        localThemes[deleteConfirm.themeId].subThemes;

      updatedThemes = {
        ...localThemes,
        [deleteConfirm.themeId]: {
          ...localThemes[deleteConfirm.themeId],
          subThemes: remainingSubThemes,
        },
      };
      setLocalThemes(updatedThemes);
    }
    setDeleteConfirm(null);

    // Sauvegarde immédiate
    try {
      await saveThemes(updatedThemes);
      onSave(updatedThemes);
      setSaveMessage({ type: "success", text: "Suppression réussie" });
      setTimeout(() => setSaveMessage(null), 2000);
    } catch {
      setSaveMessage({ type: "error", text: "Erreur de sauvegarde" });
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  // Ajout d'un sous-thème
  const handleAddSubTheme = async (themeId) => {
    if (!newSubThemeName.trim()) return;

    const theme = localThemes[themeId];
    const newId = generateSubThemeId(theme.subThemes);
    const slug = generateSlug(newSubThemeName);

    const updatedThemes = {
      ...localThemes,
      [themeId]: {
        ...theme,
        subThemes: {
          ...theme.subThemes,
          [newId]: {
            id: newId,
            name: newSubThemeName.trim(),
            slug: slug,
          },
        },
      },
    };

    setLocalThemes(updatedThemes);
    setNewSubThemeName("");
    setAddingSubThemeToId(null);

    // Sauvegarde immédiate
    try {
      await saveThemes(updatedThemes);
      onSave(updatedThemes);
      setSaveMessage({ type: "success", text: "Sous-thème ajouté" });
      setTimeout(() => setSaveMessage(null), 2000);
    } catch {
      setSaveMessage({ type: "error", text: "Erreur de sauvegarde" });
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  // Édition d'un sous-thème
  const startEditSubTheme = (themeId, subThemeId, currentName) => {
    setEditingSubThemeId(`${themeId}-${subThemeId}`);
    setEditingValue(currentName);
  };

  const saveEditSubTheme = async (themeId, subThemeId) => {
    if (!editingValue.trim()) return;

    const updatedThemes = {
      ...localThemes,
      [themeId]: {
        ...localThemes[themeId],
        subThemes: {
          ...localThemes[themeId].subThemes,
          [subThemeId]: {
            ...localThemes[themeId].subThemes[subThemeId],
            name: editingValue.trim(),
            slug: generateSlug(editingValue),
          },
        },
      },
    };

    setLocalThemes(updatedThemes);
    setEditingSubThemeId(null);
    setEditingValue("");

    // Sauvegarde immédiate
    try {
      await saveThemes(updatedThemes);
      onSave(updatedThemes);
      setSaveMessage({ type: "success", text: "Sous-thème modifié" });
      setTimeout(() => setSaveMessage(null), 2000);
    } catch {
      setSaveMessage({ type: "error", text: "Erreur de sauvegarde" });
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  // Suppression d'un sous-thème
  const handleDeleteSubTheme = (themeId, subThemeId) => {
    setDeleteConfirm({
      type: "subtheme",
      themeId,
      subId: subThemeId,
      name: localThemes[themeId].subThemes[subThemeId].name,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={onClose} />

      {/* Drawer */}
      <div
        className={`drawer-theme-manager ${
          isOpen ? "drawer-theme-manager--open" : ""
        }`}
      >
        {/* Header */}
        <div className="drawer-theme-manager__header">
          <h2>Gérer les thèmes</h2>
          <div className="drawer-theme-manager__header-actions">
            <button className="btn btn--close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Message de sauvegarde */}
        {saveMessage && (
          <div
            className={`drawer-theme-manager__message drawer-theme-manager__message--${saveMessage.type}`}
          >
            {saveMessage.text}
          </div>
        )}

        {/* Contenu scrollable */}
        <div className="drawer-theme-manager__content">
          {/* Bouton Ajouter thème */}
          <div className="drawer-theme-manager__add-section">
            {!isAddingTheme ? (
              <button
                className="btn btn--add-theme"
                onClick={() => setIsAddingTheme(true)}
              >
                + Nouveau thème
              </button>
            ) : (
              <div className="drawer-theme-manager__add-form">
                <input
                  type="text"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="Nom du thème"
                  className="drawer-theme-manager__input"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTheme();
                    if (e.key === "Escape") {
                      setIsAddingTheme(false);
                      setNewThemeName("");
                    }
                  }}
                />
                <div className="drawer-theme-manager__add-form-actions">
                  <button className="btn btn--confirm" onClick={handleAddTheme}>
                    ✓
                  </button>
                  <button
                    className="btn btn--cancel"
                    onClick={() => {
                      setIsAddingTheme(false);
                      setNewThemeName("");
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Liste des thèmes (Cards) */}
          <div className="drawer-theme-manager__themes">
            {localThemes &&
              Object.values(localThemes).map((theme) => {
                const isExpanded = expandedThemeId === theme.id;

                return (
                  <div
                    key={theme.id}
                    className={`theme-card ${
                      isExpanded
                        ? "theme-card--expanded"
                        : "theme-card--collapsed"
                    }`}
                  >
                    {/* Nom du thème */}
                    <div className="theme-card__header">
                      {editingThemeId === theme.id ? (
                        <div className="theme-card__edit-container">
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="theme-card__input"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEditTheme();
                              if (e.key === "Escape") {
                                setEditingThemeId(null);
                                setEditingValue("");
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            className="btn btn--confirm"
                            onClick={(e) => {
                              e.stopPropagation();
                              saveEditTheme();
                            }}
                            title="Valider"
                          >
                            ✓
                          </button>
                          <button
                            className="btn btn--cancel"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingThemeId(null);
                              setEditingValue("");
                            }}
                            title="Annuler"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <h3
                          className="theme-card__title"
                          onClick={() =>
                            setExpandedThemeId(isExpanded ? null : theme.id)
                          }
                        >
                          {theme.name}
                        </h3>
                      )}

                      {isExpanded && (
                        <div className="theme-card__actions">
                          <button
                            className="theme-card__action theme-card__action--edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditTheme(theme.id, theme.name);
                            }}
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            className="theme-card__action theme-card__action--delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTheme(theme.id);
                            }}
                            title="Supprimer"
                          >
                            ╳
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Liste des sous-thèmes (visible seulement si étendu) */}
                    {isExpanded && (
                      <div className="theme-card__subthemes">
                        {Object.values(theme.subThemes).map((subTheme) => (
                          <div key={subTheme.id} className="subtheme-pill">
                            {editingSubThemeId ===
                            `${theme.id}-${subTheme.id}` ? (
                              <>
                                <input
                                  type="text"
                                  value={editingValue}
                                  onChange={(e) =>
                                    setEditingValue(e.target.value)
                                  }
                                  className="subtheme-pill__input"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      saveEditSubTheme(theme.id, subTheme.id);
                                    if (e.key === "Escape") {
                                      setEditingSubThemeId(null);
                                      setEditingValue("");
                                    }
                                  }}
                                />
                                <div className="subtheme-pill__actions">
                                  <button
                                    className="btn btn--confirm"
                                    onClick={() =>
                                      saveEditSubTheme(theme.id, subTheme.id)
                                    }
                                    title="Valider"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    className="btn btn--cancel"
                                    onClick={() => {
                                      setEditingSubThemeId(null);
                                      setEditingValue("");
                                    }}
                                    title="Annuler"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="subtheme-pill__name">
                                  {subTheme.name}
                                </span>
                                <div className="subtheme-pill__actions">
                                  <button
                                    className="subtheme-pill__action subtheme-pill__action--edit"
                                    onClick={() =>
                                      startEditSubTheme(
                                        theme.id,
                                        subTheme.id,
                                        subTheme.name
                                      )
                                    }
                                    title="Modifier"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="subtheme-pill__action subtheme-pill__action--delete"
                                    onClick={() =>
                                      handleDeleteSubTheme(
                                        theme.id,
                                        subTheme.id
                                      )
                                    }
                                    title="Supprimer"
                                  >
                                    ╳
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}

                        {/* Formulaire ajout sous-thème */}
                        {addingSubThemeToId === theme.id ? (
                          <div className="subtheme-pill subtheme-pill--adding">
                            <input
                              type="text"
                              value={newSubThemeName}
                              onChange={(e) =>
                                setNewSubThemeName(e.target.value)
                              }
                              placeholder="Nouveau sous-thème"
                              className="subtheme-pill__input"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleAddSubTheme(theme.id);
                                if (e.key === "Escape") {
                                  setAddingSubThemeToId(null);
                                  setNewSubThemeName("");
                                }
                              }}
                            />
                            <div className="subtheme-pill__actions">
                              <button
                                className="btn btn--confirm"
                                onClick={() => handleAddSubTheme(theme.id)}
                              >
                                ✓
                              </button>
                              <button
                                className="btn btn--cancel"
                                onClick={() => {
                                  setAddingSubThemeToId(null);
                                  setNewSubThemeName("");
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="theme-card__add-subtheme"
                            onClick={() => setAddingSubThemeToId(theme.id)}
                          >
                            + Ajouter sous-thème
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Modal de confirmation suppression */}
      {deleteConfirm && (
        <ConfirmationModal
          message={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm.name}" ?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </>
  );
}
