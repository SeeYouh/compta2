import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import CategoryContextMenu from "./CategoryContextMenu";
import ColorPicker from "../../../components/ColorPicker";
import { computeColorPalette } from "../utils/colorPalette.js";
import CountryPicker from "./CountryPicker";
import { FOLDER_PALETTE } from "../config/folderColors";
import { getInitials } from "../utils/stringUtils";
import IconAddPaper from "../../../assets/IconAddPaper";
import IconGenreF from "../../../assets/Icon-GenreF.svg";
import IconGenreM from "../../../assets/Icon-GenreM.svg";
import LexicalEditor from "./LexicalEditor";
import { lighten } from "../utils/colorUtils";
import NameColorModal from "./NameColorModal";
import { passengersItemService } from "../services/passengersServices";
import SidebarCategoryItem from "./SidebarCategoryItem";
import SidebarFolderItem from "./SidebarFolderItem";
import { useColorPreferences } from "../../../components/hooks/useColorPreferences";
import { useOdysseeColor } from "../contexts/OdysseeColorContext.jsx";
import { useSidebarDnd } from "../hooks/useSidebarDnd";
import { useSidebarIndicator } from "../hooks/useSidebarIndicator";

function buildPassagerStyles(c, id) {
  return `
    [data-passager="${id}"] .passager-item__navbar {
      background-color: ${c.base};
    }
    [data-passager="${id}"] .passager-item__nav-input {
      border-bottom-color: color-mix(in srgb, ${c.lightness} 40%, transparent);
      color: ${c.darkest};
    }
    [data-passager="${id}"] .passager-item__nav-input::placeholder {
      color: color-mix(in srgb, ${c.darkest} 45%, transparent);
    }
    [data-passager="${id}"] .passager-item__nav-input:focus {
      border-bottom-color: ${c.lightness};
    }
    [data-passager="${id}"] .passager-item__nav-input--alias {
      color: color-mix(in srgb, ${c.darkest} 75%, transparent);
    }
    [data-passager="${id}"] .passager-item__navbar input[type="submit"] {
      background-color: ${c.darker};
      color: ${c.lightness};
      border-color: color-mix(in srgb, ${c.lightness} 35%, transparent);
    }
    [data-passager="${id}"] .passager-item__navbar input[type="submit"]:hover:not(:disabled) {
      background-color: ${c.darkest};
    }
    [data-passager="${id}"] .passager-item__gender-btn {
      border-color: color-mix(in srgb, ${c.darkest} 40%, transparent);
      color: ${c.darkest};
    }
    [data-passager="${id}"] .passager-item__gender-btn:hover:not(:disabled) {
      background: color-mix(in srgb, ${c.darkest} 12%, transparent);
    }
    [data-passager="${id}"] .passager-item__gender-btn--active {
      background: ${c.darkest};
      border-color: ${c.darkest};
      color: ${c.light};
    }
    [data-passager="${id}"] .passager-item__container {
      color: ${c.darkest};
    }
    [data-passager="${id}"] .passager-item__container h3 {
      color: ${c.darkest};
      border-bottom-color: ${c.dark};
    }
    [data-passager="${id}"] .passager-item__bloc--avatar .paper-product__upload-label {
      border-color: ${c.dark};
      color: ${c.darkest};
    }
    [data-passager="${id}"] .passager-item__bloc--avatar .paper-product__upload-label:hover:not(:disabled) {
      border-color: ${c.base};
    }
    [data-passager="${id}"] .passager-item__label {
      color: ${c.darker};
    }
    [data-passager="${id}"] .passager-item__input {
      border-color: ${c.dark};
      background: ${c.lightness};
      color: ${c.darkest};
    }
    [data-passager="${id}"] .passager-item__input::placeholder {
      color: ${c.dark};
    }
    [data-passager="${id}"] .passager-item__input:focus {
      border-color: ${c.base};
    }
    [data-passager="${id}"] .passager-item__remove-btn {
      border-color: ${c.danger};
      color: ${c.danger};
    }
    [data-passager="${id}"] .passager-item__remove-btn:hover {
      background: color-mix(in srgb, ${c.danger} 15%, transparent);
    }
    [data-passager="${id}"] .passager-item__add-btn {
      border-color: ${c.base};
      color: ${c.base};
    }
    [data-passager="${id}"] .passager-item__add-btn:hover {
      background: color-mix(in srgb, ${c.base} 10%, transparent);
    }
    [data-passager="${id}"] .passager-item__info-supp {
      color: ${c.darkest};
    }
    [data-passager="${id}"] .passager-item__is-header {
      border-bottom-color: ${c.base};
    }
    [data-passager="${id}"] .passager-item__is-sidebar {
      border-right-color: ${c.base};
    }
    [data-passager="${id}"] .passager-item__is-sidebar-title {
      color: ${c.base};
    }
    [data-passager="${id}"] .passager-item__is-add-btn {
      border-color: ${c.base};
    }
    [data-passager="${id}"] .passager-item__is-add-btn:hover {
      background: color-mix(in srgb, ${c.base} 10%, transparent);
    }
    [data-passager="${id}"] .passager-item__is-editor {
      border-color: ${c.base};
    }
    [data-passager="${id}"] .passager-item__is-editor-header {
      border-bottom-color: ${c.dark};
    }
    [data-passager="${id}"] .passager-item__is-block-title {
      color: ${c.darkest};
    }
    [data-passager="${id}"] .passager-item__is-empty {
      color: ${c.dark};
    }
  `;
}

const SOCIAL_NETWORKS = [
  "Facebook",
  "Instagram",
  "X / Twitter",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "WhatsApp",
  "Snapchat",
  "Autre",
];

function newInfoSuppBlockId() {
  return `is-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function newInfoSuppFolderId() {
  return `isf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const PassagerItem = ({
  contentFilesData,
  categoryId,
  onProductCreated,
  editMode = false,
}) => {
  const productId = contentFilesData._id || null;
  const folderId = contentFilesData.folderId || null;
  const entityId = productId || "new-passager";

  const { colors: themeColors } = useOdysseeColor();
  const { getDefault } = useColorPreferences();
  const [color, setColor] = useState(contentFilesData.color || "");
  const [previewColor, setPreviewColor] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const activeColor = previewColor || color;
  const colors = useMemo(
    () => (activeColor ? computeColorPalette(activeColor) : themeColors),
    [activeColor, themeColors],
  );

  // ─── Draft local ──────────────────────────────────────────────────────────
  const draftKey = productId
    ? `odyssee-draft-passager-${productId}`
    : `odyssee-draft-passager-new-${categoryId}`;
  const savedDraft = (() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (typeof raw !== "string") return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        return null;
      return parsed;
    } catch {
      return null;
    }
  })();

  // ─── Champs principaux ────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState(
    savedDraft?.firstName ?? contentFilesData.firstName ?? "",
  );
  const [lastName, setLastName] = useState(
    savedDraft?.lastName ?? contentFilesData.lastName ?? "",
  );
  const [aliasName, setAliasName] = useState(
    savedDraft?.aliasName ?? contentFilesData.aliasName?.name ?? "",
  );
  const [gender, setGender] = useState(
    savedDraft?.gender ?? contentFilesData.gender ?? "NC",
  );
  const [birthDate, setBirthDate] = useState(
    savedDraft?.birthDate ||
      (contentFilesData.birthDate
        ? new Date(contentFilesData.birthDate).toISOString().split("T")[0]
        : ""),
  );

  // ─── Avatar ───────────────────────────────────────────────────────────────
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    contentFilesData.avatar || null,
  );
  const fileInputRef = useRef(null);

  // ─── Contact ──────────────────────────────────────────────────────────────
  const [phone, setPhone] = useState(
    savedDraft?.contact?.phone ?? contentFilesData.contact?.phone ?? "",
  );
  const [email, setEmail] = useState(
    savedDraft?.contact?.email ?? contentFilesData.contact?.email ?? "",
  );
  const [socialNetworks, setSocialNetworks] = useState(
    savedDraft?.contact?.socialNetworks ??
      contentFilesData.contact?.socialNetworks ??
      [],
  );

  // ─── Adresse ─────────────────────────────────────────────────────────────
  const [country, setCountry] = useState(
    savedDraft?.address?.country ?? contentFilesData.address?.country ?? "FR",
  );
  const [postalCode, setPostalCode] = useState(
    savedDraft?.address?.postalCode ??
      contentFilesData.address?.postalCode ??
      "",
  );
  const [city, setCity] = useState(
    savedDraft?.address?.city ?? contentFilesData.address?.city ?? "",
  );
  const [address, setAddress] = useState(
    savedDraft?.address?.address ?? contentFilesData.address?.address ?? "",
  );
  const [addressComplement, setAddressComplement] = useState(
    savedDraft?.address?.addressComplement ??
      contentFilesData.address?.addressComplement ??
      "",
  );

  // ─── Info Supp ────────────────────────────────────────────────────────────
  const [infoSuppBlocks, setInfoSuppBlocks] = useState(() => {
    const srcBlocks = savedDraft?.infoSuppBlocks ?? null;
    if (srcBlocks) return srcBlocks;
    const blocks = {};
    (contentFilesData.infoSupp || [])
      .filter((i) => i.type !== "folder")
      .forEach((b) => {
        blocks[b.id] = {
          id: b.id,
          title: b.title ?? "Nouveau bloc",
          color: b.color,
          content: b.content ?? "",
        };
      });
    return blocks;
  });

  const [infoSuppLayout, setInfoSuppLayout] = useState(() => {
    if (savedDraft?.infoSuppLayout) return savedDraft.infoSuppLayout;
    if (contentFilesData.infoSuppLayout?.length > 0)
      return contentFilesData.infoSuppLayout;
    // Migration depuis l'ancien format plat
    const childIds = new Set();
    (contentFilesData.infoSupp || [])
      .filter((i) => i.type === "folder")
      .forEach((f) => (f.categoryIds || []).forEach((id) => childIds.add(id)));
    return (contentFilesData.infoSupp || [])
      .filter((item) => !childIds.has(item.id))
      .map((item) => ({
        type: item.type === "folder" ? "folder" : "category",
        id: item.id,
      }));
  });

  const [infoSuppFolders, setInfoSuppFolders] = useState(() => {
    if (savedDraft?.infoSuppFolders) return savedDraft.infoSuppFolders;
    if (contentFilesData.infoSuppFolders?.length > 0)
      return contentFilesData.infoSuppFolders;
    // Migration depuis l'ancien format plat
    return (contentFilesData.infoSupp || [])
      .filter((i) => i.type === "folder")
      .map((f) => ({
        _id: f.id,
        name: f.title ?? "Nouveau dossier",
        color: f.color,
        categoryIds: f.categoryIds ?? [],
        isOpen: f.isOpen ?? true,
      }));
  });

  const [activeInfoSuppId, setActiveInfoSuppId] = useState(() => {
    if (savedDraft?.activeInfoSuppId) return savedDraft.activeInfoSuppId;
    return (
      (contentFilesData.infoSupp || []).find((i) => i.type !== "folder")?.id ||
      null
    );
  });
  const [settingsItemId, setSettingsItemId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // ─── État formulaire ──────────────────────────────────────────────────────
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const markDirty = () => setIsDirty(true);

  // ─── Sauvegarde locale ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDirty) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          firstName,
          lastName,
          aliasName,
          gender,
          birthDate,
          contact: { phone, email, socialNetworks },
          address: { country, postalCode, city, address, addressComplement },
          infoSuppBlocks,
          infoSuppLayout,
          infoSuppFolders,
          activeInfoSuppId,
        }),
      );
    } catch (e) {
      console.warn(
        "[PassagerItem] Impossible de sauvegarder le brouillon local :",
        e,
      );
    }
  }, [
    isDirty,
    firstName,
    lastName,
    aliasName,
    gender,
    birthDate,
    phone,
    email,
    socialNetworks,
    country,
    postalCode,
    city,
    address,
    addressComplement,
    infoSuppBlocks,
    infoSuppLayout,
    infoSuppFolders,
    activeInfoSuppId,
    draftKey,
  ]);

  // ─── Avatar ───────────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const MAX = 2 * 1024 * 1024;
    if (file.size > MAX) {
      setSaveStatus({ type: "error", message: "Image trop lourde. Max 2 Mo." });
      e.target.value = "";
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
    markDirty();
  };

  // ─── Réseaux sociaux ──────────────────────────────────────────────────────
  const addSocialNetwork = () => {
    setSocialNetworks((prev) => [
      ...prev,
      { network: SOCIAL_NETWORKS[0], value: "" },
    ]);
    markDirty();
  };

  const updateSocialNetwork = (index, field, value) => {
    setSocialNetworks((prev) =>
      prev.map((sn, i) => (i === index ? { ...sn, [field]: value } : sn)),
    );
    markDirty();
  };

  const removeSocialNetwork = (index) => {
    setSocialNetworks((prev) => prev.filter((_, i) => i !== index));
    markDirty();
  };

  // ─── Info Supp ────────────────────────────────────────────────────────────
  const addInfoSuppBlock = () => {
    const id = newInfoSuppBlockId();
    setInfoSuppBlocks((prev) => ({
      ...prev,
      [id]: {
        id,
        title: "Nouveau bloc",
        color: getDefault("odyssee-infosupp-block") ?? FOLDER_PALETTE[0],
        content: "",
      },
    }));
    setInfoSuppLayout((prev) => [...prev, { type: "category", id }]);
    setActiveInfoSuppId(id);
    markDirty();
  };

  const addInfoSuppFolder = async () => {
    const _id = newInfoSuppFolderId();
    const folder = {
      _id,
      name: "Nouveau dossier",
      color: getDefault("odyssee-infosupp-folder") ?? FOLDER_PALETTE[0],
      categoryIds: [],
      isOpen: true,
    };
    setInfoSuppFolders((prev) => [...prev, folder]);
    setInfoSuppLayout((prev) => [...prev, { type: "folder", id: _id }]);
    setSettingsItemId(_id);
    markDirty();
    if (productId) {
      passengersItemService.createInfoSuppFolder(productId, folder);
    }
  };

  const toggleAllInfoSuppFolders = () => {
    const allClosed = infoSuppFolders.every((f) => !f.isOpen);
    setInfoSuppFolders((prev) =>
      prev.map((f) => ({ ...f, isOpen: allClosed })),
    );
    markDirty();
  };

  const removeInfoSuppBlock = (id) => {
    setInfoSuppLayout((prev) => prev.filter((i) => i.id !== id));
    setInfoSuppFolders((prev) =>
      prev.map((f) => ({
        ...f,
        categoryIds: (f.categoryIds || []).filter((cid) => cid !== id),
      })),
    );
    setInfoSuppBlocks((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (activeInfoSuppId === id) {
      setActiveInfoSuppId(
        Object.keys(infoSuppBlocks).find((k) => k !== id) || null,
      );
    }
    markDirty();
  };

  const toggleFolder = (folderId) => {
    setInfoSuppFolders((prev) =>
      prev.map((f) => (f._id === folderId ? { ...f, isOpen: !f.isOpen } : f)),
    );
    markDirty();
  };

  const activeBlock = activeInfoSuppId
    ? (infoSuppBlocks[activeInfoSuppId] ?? null)
    : null;

  const settingsItem = settingsItemId
    ? (() => {
        const folder = infoSuppFolders.find((f) => f._id === settingsItemId);
        if (folder)
          return {
            id: folder._id,
            type: "folder",
            title: folder.name,
            color: folder.color,
          };
        const block = infoSuppBlocks[settingsItemId];
        if (block)
          return {
            id: block.id,
            type: "block",
            title: block.title,
            color: block.color,
          };
        return null;
      })()
    : null;

  // ─── D&D Info Supp ────────────────────────────────────────────────────────
  const folderService = useMemo(
    () => ({
      createFolder: async (categoryIds) => {
        const _id = newInfoSuppFolderId();
        if (!productId) {
          return {
            success: true,
            folder: {
              _id,
              name: "Nouveau dossier",
              color: getDefault("odyssee-infosupp-folder") ?? FOLDER_PALETTE[0],
              categoryIds,
              isOpen: true,
            },
          };
        }
        return passengersItemService.createInfoSuppFolder(productId, {
          _id,
          categoryIds,
          name: "Nouveau dossier",
          color: getDefault("odyssee-infosupp-folder") ?? FOLDER_PALETTE[0],
        });
      },
      updateFolder: async (id, updates) => {
        if (!productId) return { success: true };
        return passengersItemService.updateInfoSuppFolder(
          productId,
          id,
          updates,
        );
      },
      deleteFolder: async (id) => {
        if (!productId) return { success: true };
        return passengersItemService.deleteInfoSuppFolder(productId, id);
      },
      updateLayout: async (items) => {
        if (!productId) return { success: true };
        return passengersItemService.updateInfoSuppLayout(productId, items);
      },
    }),
    [productId],
  );

  const dnd = useSidebarDnd({
    sidebarItems: infoSuppLayout,
    setSidebarItems: setInfoSuppLayout,
    folders: infoSuppFolders,
    setFolders: setInfoSuppFolders,
    folderService,
  });

  // ─── Indicateur sidebar Info Supp ─────────────────────────────────────────
  const isSidebarRef = useRef(null);
  const indicator = useSidebarIndicator({
    sidebarRef: isSidebarRef,
    folders: infoSuppFolders,
    selectedId: activeInfoSuppId,
    getItemColor: (id) => infoSuppBlocks[id]?.color ?? null,
  });

  // ─── Soumission ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("aliasName", aliasName);
    formData.append("gender", gender);
    formData.append("birthDate", birthDate || "");
    formData.append("categoryId", categoryId);
    if (folderId) formData.append("folderId", folderId);

    formData.append(
      "contact",
      JSON.stringify({ phone, email, socialNetworks }),
    );
    formData.append(
      "address",
      JSON.stringify({ country, postalCode, city, address, addressComplement }),
    );
    formData.append("infoSupp", JSON.stringify(Object.values(infoSuppBlocks)));
    formData.append("infoSuppLayout", JSON.stringify(infoSuppLayout));
    formData.append("infoSuppFolders", JSON.stringify(infoSuppFolders));
    formData.append("color", color);

    if (avatarFile) formData.append("image", avatarFile);

    try {
      const result =
        productId && editMode
          ? await passengersItemService.updateItemForm(productId, formData)
          : await passengersItemService.createItem(formData);

      if (result.success) {
        setSaveStatus({
          type: "success",
          message:
            productId && editMode
              ? "Passager mis à jour !"
              : "Passager créé avec succès !",
        });
        setIsDirty(false);
        localStorage.removeItem(draftKey);
        setTimeout(() => setSaveStatus(null), 3000);
        if (onProductCreated) onProductCreated(result.product);
      } else {
        setSaveStatus({ type: "error", message: "Erreur : " + result.error });
      }
    } catch {
      setSaveStatus({
        type: "error",
        message: "Erreur de connexion au serveur",
      });
    }
  };

  const readOnly = !!productId && !editMode;

  return (
    <>
      <style>{buildPassagerStyles(colors, entityId)}</style>
      <form
        className="passager-item"
        data-passager={entityId}
        onSubmit={handleSubmit}
        method="POST"
      >
        {/* ─── NavBar ──────────────────────────────────────────────────── */}
        <div className="passager-item__navbar">
          <div className="passager-item__navbar-fields">
            <input
              type="text"
              className="passager-item__nav-input"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                markDirty();
              }}
              placeholder="Prénom"
              autoComplete="given-name"
              maxLength={60}
              readOnly={readOnly}
            />
            <input
              type="text"
              className="passager-item__nav-input passager-item__nav-input--bold"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                markDirty();
              }}
              placeholder="Nom"
              autoComplete="family-name"
              maxLength={60}
              readOnly={readOnly}
            />
            <input
              type="text"
              className="passager-item__nav-input passager-item__nav-input--alias"
              value={aliasName}
              onChange={(e) => {
                setAliasName(e.target.value);
                markDirty();
              }}
              placeholder="Alias"
              maxLength={40}
              readOnly={readOnly}
            />

            <div className="passager-item__gender">
              <button
                type="button"
                className={`passager-item__gender-btn${gender === "F" ? " passager-item__gender-btn--active" : ""}`}
                onClick={() => {
                  setGender("F");
                  markDirty();
                }}
                disabled={readOnly}
                title="Féminin"
              >
                <img src={IconGenreF} alt="Féminin" />
              </button>
              <button
                type="button"
                className={`passager-item__gender-btn${gender === "M" ? " passager-item__gender-btn--active" : ""}`}
                onClick={() => {
                  setGender("M");
                  markDirty();
                }}
                disabled={readOnly}
                title="Masculin"
              >
                <img src={IconGenreM} alt="Masculin" />
              </button>
              <button
                type="button"
                className={`passager-item__gender-btn${gender === "NC" ? " passager-item__gender-btn--active" : ""}`}
                onClick={() => {
                  setGender("NC");
                  markDirty();
                }}
                disabled={readOnly}
                title="Non communiqué"
              >
                NC
              </button>
            </div>

            <input
              type="date"
              className="passager-item__nav-input passager-item__nav-input--date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                markDirty();
              }}
              readOnly={readOnly}
            />
          </div>

          {!readOnly && (
            <input
              type="submit"
              value={productId && editMode ? "Mettre à jour" : "Enregistrer"}
              disabled={!isDirty}
            />
          )}

          <div className="passager-item__color-wrap">
            <div
              className="passager-item__color-btn"
              style={{ background: colors.base }}
              onClick={() => !readOnly && setShowColorPicker((v) => !v)}
              title="Couleur du passager"
            />
            {showColorPicker && (
              <div className="passager-item__color-picker-wrap">
                <ColorPicker
                  value={color || themeColors.base}
                  onChange={(hex) => {
                    setColor(hex);
                    markDirty();
                  }}
                  onPreview={(hex) => setPreviewColor(hex)}
                  onClose={() => {
                    setShowColorPicker(false);
                    setPreviewColor(null);
                  }}
                  contextKey={`passager-item-${productId || "new"}`}
                  showHistory
                  showDefaultButtons={!!productId}
                />
              </div>
            )}
          </div>
        </div>

        {saveStatus && (
          <div
            className={`paper-product__status paper-product__status--${saveStatus.type}`}
          >
            {saveStatus.message}
          </div>
        )}

        {/* ─── Blocs côte à côte ───────────────────────────────────────── */}
        <div className="passager-item__container">
          {/* Avatar */}
          <div className="bloc passager-item__bloc--avatar">
            <button
              type="button"
              className="paper-product__upload-label passager-item__avatar-trigger"
              onClick={() => !readOnly && fileInputRef.current?.click()}
              disabled={readOnly}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="passager-item__avatar-img"
                />
              ) : (
                "+ Avatar"
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="paper-product__file-input"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Contact */}
          <div className="bloc">
            <h3>Contact</h3>

            <div className="passager-item__field">
              <label className="passager-item__label">Téléphone</label>
              <input
                type="tel"
                className="passager-item__input"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  markDirty();
                }}
                placeholder="+33 6 00 00 00 00"
                readOnly={readOnly}
              />
            </div>

            <div className="passager-item__field">
              <label className="passager-item__label">Email</label>
              <input
                type="email"
                className="passager-item__input"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  markDirty();
                }}
                placeholder="exemple@mail.com"
                readOnly={readOnly}
              />
            </div>

            {socialNetworks.map((sn, i) => (
              <div key={i} className="passager-item__social-row">
                <select
                  className="passager-item__input passager-item__input--network"
                  value={sn.network}
                  onChange={(e) =>
                    updateSocialNetwork(i, "network", e.target.value)
                  }
                  disabled={readOnly}
                >
                  {SOCIAL_NETWORKS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="passager-item__input"
                  value={sn.value}
                  onChange={(e) =>
                    updateSocialNetwork(i, "value", e.target.value)
                  }
                  placeholder="Identifiant / URL"
                  readOnly={readOnly}
                />
                {!readOnly && (
                  <button
                    type="button"
                    className="passager-item__remove-btn"
                    onClick={() => removeSocialNetwork(i)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            {!readOnly && (
              <button
                type="button"
                className="passager-item__add-btn"
                onClick={addSocialNetwork}
              >
                + Réseau social
              </button>
            )}
          </div>

          {/* Adresse */}
          <div className="bloc">
            <h3>Adresse</h3>

            <div className="passager-item__field">
              <label className="passager-item__label">Pays</label>
              <CountryPicker
                value={country}
                onChange={(code) => {
                  setCountry(code);
                  markDirty();
                }}
              />
            </div>

            <div className="passager-item__field passager-item__field--row">
              <div className="passager-item__field-group">
                <label className="passager-item__label">Code postal</label>
                <input
                  type="text"
                  className="passager-item__input passager-item__input--postal"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    markDirty();
                  }}
                  placeholder="75001"
                  maxLength={10}
                  readOnly={readOnly}
                />
              </div>
              <div className="passager-item__field-group passager-item__field-group--grow">
                <label className="passager-item__label">Ville</label>
                <input
                  type="text"
                  className="passager-item__input"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    markDirty();
                  }}
                  placeholder="Paris"
                  readOnly={readOnly}
                />
              </div>
            </div>

            <div className="passager-item__field">
              <label className="passager-item__label">Adresse</label>
              <input
                type="text"
                className="passager-item__input"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  markDirty();
                }}
                placeholder="1 rue de la Paix"
                readOnly={readOnly}
              />
            </div>

            <div className="passager-item__field">
              <label className="passager-item__label">Complément</label>
              <input
                type="text"
                className="passager-item__input"
                value={addressComplement}
                onChange={(e) => {
                  setAddressComplement(e.target.value);
                  markDirty();
                }}
                placeholder="Apt. 42, Bât. B…"
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>

        {/* ─── Info Supp — pleine largeur ──────────────────────────────── */}
        <section className="passager-item__info-supp">
          <div className="passager-item__is-header">
            <span className="passager-item__is-sidebar-title">Info Supp</span>
          </div>
          <div className="passager-item__is-body">
            <div
              ref={isSidebarRef}
              className="passager-item__is-sidebar"
              onMouseMove={indicator.handleMouseMove}
              onMouseLeave={indicator.handleMouseLeave}
              onDragOver={dnd.handleSidebarDragOver}
              onDrop={dnd.handleSidebarDrop}
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
              {infoSuppLayout.map((item, index) => (
                <Fragment key={item.id}>
                  {!dnd.isGhostRedundant(index) && dnd.ghostIndex === index && (
                    <div className="catalog-sidebar__icon catalog-sidebar__icon--ghost" />
                  )}
                  {item.type === "folder"
                    ? (() => {
                        const folder = infoSuppFolders.find(
                          (f) => f._id === item.id,
                        );
                        if (!folder) return null;
                        return (
                          <SidebarFolderItem
                            folder={folder}
                            item={{ id: item.id, index }}
                            categories={(folder.categoryIds || [])
                              .map((catId) => {
                                const block = infoSuppBlocks[catId];
                                return block
                                  ? {
                                      _id: catId,
                                      name: block.title,
                                      image: null,
                                      active: catId === activeInfoSuppId,
                                    }
                                  : null;
                              })
                              .filter(Boolean)}
                            isDropOnFolder={
                              dnd.dropTarget?.action === "on" &&
                              dnd.dropTarget?.id === item.id
                            }
                            nestedGhost={dnd.nestedGhost}
                            dnd={dnd}
                            onTooltipEnter={undefined}
                            onTooltipLeave={undefined}
                            onToggle={toggleFolder}
                            onContextMenu={(e, fid) => {
                              e.preventDefault();
                              setContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                itemId: fid,
                                itemType: "folder",
                              });
                            }}
                            onCategoryContextMenu={(e, blockId) => {
                              e.preventDefault();
                              setContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                itemId: blockId,
                                itemType: "block",
                              });
                            }}
                            onSelect={(blockId) => {
                              setActiveInfoSuppId(blockId);
                              indicator.updateSelection(blockId);
                            }}
                            getInitials={getInitials}
                          />
                        );
                      })()
                    : (() => {
                        const block = infoSuppBlocks[item.id];
                        return (
                          <SidebarCategoryItem
                            cat={{
                              _id: item.id,
                              name: block?.title,
                              image: null,
                              active: item.id === activeInfoSuppId,
                            }}
                            item={{ id: item.id }}
                            index={index}
                            isDropOnCat={
                              dnd.dropTarget?.action === "on" &&
                              dnd.dropTarget?.id === item.id
                            }
                            dnd={dnd}
                            onSelect={() => {
                              setActiveInfoSuppId(item.id);
                              indicator.updateSelection(item.id);
                            }}
                            onContextMenu={(e, blockId) => {
                              e.preventDefault();
                              setContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                itemId: blockId,
                                itemType: "block",
                              });
                            }}
                            getInitials={getInitials}
                            iconStyle={{ background: block?.color }}
                          />
                        );
                      })()}
                </Fragment>
              ))}
              {dnd.ghostIndex === infoSuppLayout.length && (
                <div className="catalog-sidebar__icon catalog-sidebar__icon--ghost" />
              )}
              {!readOnly && (
                <button
                  type="button"
                  className="passager-item__is-add-btn"
                  onClick={addInfoSuppBlock}
                  title="Ajouter un bloc"
                >
                  <IconAddPaper size={22} />
                </button>
              )}
            </div>

            <div
              className="passager-item__is-editor"
              style={
                activeBlock ? { borderColor: activeBlock.color } : undefined
              }
            >
              {activeBlock ? (
                <>
                  <div
                    className="passager-item__is-editor-header"
                    style={{
                      background: lighten(activeBlock.color, 69),
                    }}
                  >
                    <span className="passager-item__is-block-title">
                      {activeBlock.title || "Sans titre"}
                    </span>
                    {!readOnly && (
                      <button
                        type="button"
                        className="passager-item__is-color-btn"
                        style={{ backgroundColor: activeBlock.color }}
                        onClick={() => setSettingsItemId(activeBlock.id)}
                        title="Paramètres du bloc"
                      />
                    )}
                  </div>
                  {contextMenu && !readOnly && (
                    <CategoryContextMenu
                      x={contextMenu.x}
                      y={contextMenu.y}
                      onSettings={() => {
                        setSettingsItemId(contextMenu.itemId);
                        setContextMenu(null);
                      }}
                      onDelete={() => {
                        removeInfoSuppBlock(contextMenu.itemId);
                        setContextMenu(null);
                      }}
                      onCreateFolder={addInfoSuppFolder}
                      createFolderLabel="Créer un dossier"
                      onCreateProduct={addInfoSuppBlock}
                      createProductLabel="Créer un bloc"
                      onToggleAllFolders={
                        infoSuppFolders.length > 0
                          ? toggleAllInfoSuppFolders
                          : undefined
                      }
                      allFoldersClosed={infoSuppFolders.every((f) => !f.isOpen)}
                      onClose={() => setContextMenu(null)}
                    />
                  )}
                  {settingsItem && (
                    <NameColorModal
                      title={
                        settingsItem.type === "folder"
                          ? "Paramètres du dossier"
                          : "Paramètres du bloc"
                      }
                      nameLabel="Nom"
                      namePlaceholder="Titre"
                      initialName={settingsItem.title || ""}
                      initialColor={settingsItem.color}
                      contextKey={
                        settingsItem.type === "folder"
                          ? "odyssee-infosupp-folder"
                          : "odyssee-infosupp-block"
                      }
                      onSave={({ name, color }) => {
                        if (settingsItem.type === "folder") {
                          setInfoSuppFolders((prev) =>
                            prev.map((f) =>
                              f._id === settingsItem.id
                                ? { ...f, name, color }
                                : f,
                            ),
                          );
                          if (productId) {
                            passengersItemService.updateInfoSuppFolder(
                              productId,
                              settingsItem.id,
                              { name, color },
                            );
                          }
                        } else {
                          setInfoSuppBlocks((prev) => ({
                            ...prev,
                            [settingsItem.id]: {
                              ...prev[settingsItem.id],
                              title: name,
                              color,
                            },
                          }));
                        }
                        setSettingsItemId(null);
                        markDirty();
                      }}
                      onCancel={() => setSettingsItemId(null)}
                    />
                  )}
                  <LexicalEditor
                    key={activeBlock.id}
                    content={activeBlock.content}
                    onChange={(html) =>
                      setInfoSuppBlocks((prev) => ({
                        ...prev,
                        [activeBlock.id]: {
                          ...prev[activeBlock.id],
                          content: html,
                        },
                      }))
                    }
                  />
                </>
              ) : (
                <div className="passager-item__is-empty">
                  {readOnly
                    ? "Aucune information supplémentaire."
                    : "Ajoutez un bloc pour commencer."}
                </div>
              )}
            </div>
          </div>
        </section>
      </form>
    </>
  );
};

export default PassagerItem;
