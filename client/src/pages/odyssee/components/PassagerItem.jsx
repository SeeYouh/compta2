import { useEffect, useRef, useState } from "react";

import CountryPicker from "./CountryPicker";
import { DEFAULT_FOLDER_COLOR } from "../config/folderColors";
import { getInitials } from "../utils/stringUtils";
import IconAddPaper from "../../../assets/IconAddPaper";
import IconGenreF from "../../../assets/Icon-GenreF.svg";
import IconGenreM from "../../../assets/Icon-GenreM.svg";
import LexicalEditor from "./LexicalEditor";
import { lighten } from "../utils/colorUtils";
import NameColorModal from "./NameColorModal";
import { passengersItemService } from "../services/passengersServices";
import SidebarCategoryItem from "./SidebarCategoryItem";
import { useInfoSuppDnd } from "../hooks/useInfoSuppDnd";

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

function newInfoSuppBlock(order) {
  return {
    id: `is-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "Nouveau bloc",
    color: DEFAULT_FOLDER_COLOR,
    content: "",
    order,
  };
}

const PassagerItem = ({
  contentFilesData,
  categoryId,
  onProductCreated,
  editMode = false,
}) => {
  const productId = contentFilesData._id || null;
  const folderId = contentFilesData.folderId || null;

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
  const [alias, setAlias] = useState(
    savedDraft?.alias ?? contentFilesData.alias ?? "",
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
  const [infoSupp, setInfoSupp] = useState(
    savedDraft?.infoSupp ?? contentFilesData.infoSupp ?? [],
  );
  const [activeInfoSuppId, setActiveInfoSuppId] = useState(
    (savedDraft?.infoSupp ?? contentFilesData.infoSupp)?.[0]?.id || null,
  );
  const [blockSettingsOpen, setBlockSettingsOpen] = useState(false);

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
          alias,
          gender,
          birthDate,
          contact: { phone, email, socialNetworks },
          address: { country, postalCode, city, address, addressComplement },
          infoSupp,
        }),
      );
    } catch {}
  }, [
    isDirty,
    firstName,
    lastName,
    alias,
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
    infoSupp,
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
    const block = newInfoSuppBlock(infoSupp.length);
    setInfoSupp((prev) => [...prev, block]);
    setActiveInfoSuppId(block.id);
    markDirty();
  };

  const removeInfoSuppBlock = (id) => {
    setInfoSupp((prev) => {
      const next = prev.filter((b) => b.id !== id);
      if (activeInfoSuppId === id) {
        setActiveInfoSuppId(next[0]?.id || null);
      }
      return next;
    });
    markDirty();
  };

  const updateInfoSuppField = (id, field, value) => {
    setInfoSupp((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    );
    markDirty();
  };

  const activeBlock = infoSupp.find((b) => b.id === activeInfoSuppId) || null;

  // ─── D&D Info Supp ────────────────────────────────────────────────────────
  const dnd = useInfoSuppDnd({ infoSupp, setInfoSupp });

  // ─── Soumission ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("alias", alias);
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
    formData.append("infoSupp", JSON.stringify(infoSupp));

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
    <form className="passager-item" onSubmit={handleSubmit} method="POST">
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
            maxLength={60}
            readOnly={readOnly}
          />
          <input
            type="text"
            className="passager-item__nav-input passager-item__nav-input--alias"
            value={alias}
            onChange={(e) => {
              setAlias(e.target.value);
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
            className="passager-item__is-sidebar"
            onDragOver={dnd.handleSidebarDragOver}
            onDrop={dnd.handleSidebarDrop}
          >
            {infoSupp.map((block, index) => (
              <SidebarCategoryItem
                key={block.id}
                cat={{
                  _id: block.id,
                  name: block.title,
                  image: null,
                  active: block.id === activeInfoSuppId,
                }}
                item={{ id: block.id }}
                index={index}
                isDropOnCat={false}
                dnd={dnd}
                onSelect={() => setActiveInfoSuppId(block.id)}
                getInitials={getInitials}
                iconStyle={{ background: block.color }}
              />
            ))}
            {dnd.ghostIndex === infoSupp.length && (
              <div className="catalog-sidebar__icon--ghost" />
            )}
            {!readOnly && (
              <button
                type="button"
                className="passager-item__is-add-btn"
                onClick={addInfoSuppBlock}
                title="Ajouter un bloc"
              >
                <IconAddPaper size={36} />
              </button>
            )}
          </div>

          <div className="passager-item__is-editor">
            {activeBlock ? (
              <>
                <div
                  className="passager-item__is-editor-header"
                  style={{
                    borderLeftColor: activeBlock.color,
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
                      onClick={() => setBlockSettingsOpen(true)}
                      title="Paramètres du bloc"
                    />
                  )}
                </div>
                {blockSettingsOpen && (
                  <NameColorModal
                    title="Paramètres du bloc"
                    nameLabel="Nom du bloc"
                    namePlaceholder="Titre du bloc"
                    initialName={activeBlock.title}
                    initialColor={activeBlock.color}
                    onSave={({ name, color }) => {
                      updateInfoSuppField(activeBlock.id, "title", name);
                      updateInfoSuppField(activeBlock.id, "color", color);
                      setBlockSettingsOpen(false);
                    }}
                    onCancel={() => setBlockSettingsOpen(false)}
                  />
                )}
                <LexicalEditor
                  key={activeBlock.id}
                  content={activeBlock.content}
                  onChange={(html) =>
                    updateInfoSuppField(activeBlock.id, "content", html)
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
  );
};

export default PassagerItem;
