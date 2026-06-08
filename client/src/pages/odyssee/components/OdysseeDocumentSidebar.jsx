import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { darken } from "../utils/colorUtils";
import { DARKEN_BG, DARKEN_BORDER } from "../config/folderColors";
import IconDossierFull from "../assets/IconDossierFull";
import { MODE_RUBRIQUE, MODE_TEMPLATE } from "./OdysseeDocumentToggle";
import {
  CATALOGUE_FIELDS,
  CATALOGUE_GROUPS,
  PASSENGER_FIELDS,
  PASSENGER_GROUPS,
} from "../config/fieldDefinitions";
import { odysseeBlockService } from "../services/odysseeBlockService";
import { getSidebarData } from "../services/odysseeSidebarCacheService";
import FolderService from "../services/folderService";
import OdysseeProductService from "../../../services/odysseeProductService";
import OdysseeCategoryService from "../../../services/odysseeCategoryService";
import {
  passengersCategoryService,
  passengersItemService,
  passengersSidebarService,
} from "../services/passengersServices";
import { getInitials } from "../utils/stringUtils";
import { useSidebarIndicator } from "../hooks/useSidebarIndicator";
import SidebarTooltip from "./SidebarTooltip";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getItemDisplayName(item, sourceType) {
  const cfd = item.contentFilesData ?? {};
  if (sourceType === "passenger") {
    return (
      (cfd.aliasName?.activate ? cfd.aliasName.name : null) ||
      [cfd.firstName, cfd.lastName].filter(Boolean).join(" ") ||
      item.name ||
      "?"
    );
  }
  return (cfd.aliasName?.activate ? cfd.aliasName.name : cfd.productName) || item.name || "?";
}

function getItemImage(item) {
  return item.contentFilesData?.avatar || item.imageUrl || item.image || null;
}

// Stable fetch functions — module-level, never recreated
const fetchPassengerItems = (catId) => passengersItemService.getItemsByCategory(catId);
const fetchCatalogueItems = (catId) => OdysseeProductService.getProductsByCategory(catId);

// ─── Volet vertical ───────────────────────────────────────────────────────────

const SidebarPanel = ({ title, isOpen, onToggle, children }) => (
  <div className={`ody-sidebar-panel${isOpen ? " ody-sidebar-panel--open" : ""}`}>
    <button type="button" className="ody-sidebar-panel__header" onClick={onToggle}>
      <span className="ody-sidebar-panel__title">{title}</span>
    </button>
    {isOpen && <div className="ody-sidebar-panel__body">{children}</div>}
  </div>
);

// ─── Icône catégorie ──────────────────────────────────────────────────────────

const CatIcon = ({ cat, isSelected, nested = false, onClick, onMouseEnter, onMouseLeave }) => {
  const img = cat.imageUrl || cat.image;
  return (
    <div
      data-cat-id={cat._id}
      className={[
        "ody-sidebar-cat-icon",
        nested ? "ody-sidebar-cat-icon--nested" : "",
        isSelected ? "ody-sidebar-cat-icon--selected" : "",
      ].filter(Boolean).join(" ")}
      style={cat.color ? { borderColor: cat.color } : {}}
      title={cat.name}
      onClick={() => onClick(cat._id)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {img ? <img src={img} alt={cat.name} /> : getInitials(cat.name)}
    </div>
  );
};

// ─── Colonne catégories (gauche) — avec indicateur + tooltip ─────────────────

const CategoryStrip = ({ sidebarData, selectedCatId, openFolders, onSelectCat, onToggleFolder }) => {
  const stripRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const foldersForHook = useMemo(
    () => (sidebarData?.folders ?? []).map((f) => ({ ...f, isOpen: openFolders.has(f._id) })),
    [sidebarData, openFolders],
  );

  const getItemColor = useCallback(
    (catId) => sidebarData?.categories?.find((c) => c._id === catId)?.color ?? null,
    [sidebarData],
  );

  const indicator = useSidebarIndicator({
    sidebarRef: stripRef,
    folders: foldersForHook,
    selectedId: selectedCatId,
    getItemColor,
  });

  const showTooltip = (e, type, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ type, id, top: rect.top + rect.height / 2, left: rect.right + 5 });
  };

  const hideTooltip = () => setTooltip(null);

  const handleCatClick = (catId) => {
    indicator.updateSelection(catId);
    onSelectCat(catId);
  };

  const { layout, folders, categories } = sidebarData ?? {};

  return (
    <>
      <div
        ref={stripRef}
        className="ody-sidebar-panel__cat-strip"
        onMouseMove={indicator.handleMouseMove}
        onMouseLeave={() => { indicator.handleMouseLeave(); hideTooltip(); }}
      >
        {/* Barre hover animée */}
        <div
          className="catalog-sidebar__indicator"
          style={{
            top: indicator.indicatorY ?? 0,
            opacity: indicator.indicatorOpacity,
            backgroundColor: indicator.indicatorColor ?? undefined,
            transition: "top 0.2s ease, opacity 0.15s ease, background-color 0.2s ease",
          }}
          onTransitionEnd={indicator.handleIndicatorTransitionEnd}
        />
        {/* Barre sélection active */}
        {indicator.activeY !== null && (
          <div
            className="catalog-sidebar__indicator catalog-sidebar__indicator--active"
            style={{
              top: indicator.activeY,
              backgroundColor: indicator.activeColor ?? undefined,
            }}
          />
        )}

        {!sidebarData && <span className="ody-sidebar-cat-items__info">…</span>}

        {layout?.map((item) => {
          if (item.type === "folder") {
            const folder = folders?.find((f) => f._id === item.id);
            if (!folder) return null;
            const isOpen = openFolders.has(item.id);

            return (
              <div
                key={item.id}
                className="ody-sidebar-folder"
                style={{
                  borderColor: darken(folder.color, DARKEN_BORDER),
                  background: darken(folder.color, DARKEN_BG),
                }}
              >
                <div
                  className="ody-sidebar-folder__icon"
                  data-folder-id={folder._id}
                  onClick={() => onToggleFolder(item.id)}
                  onMouseEnter={(e) => showTooltip(e, "folder", folder._id)}
                  onMouseLeave={hideTooltip}
                >
                  <IconDossierFull size={20} color={folder.color} />
                </div>
                {isOpen && (
                  <div className="ody-sidebar-folder__children">
                    {folder.categoryIds?.map((catId) => {
                      const cat = categories?.find((c) => c._id === catId);
                      if (!cat) return null;
                      return (
                        <CatIcon
                          key={catId}
                          cat={cat}
                          isSelected={selectedCatId === catId}
                          nested
                          onClick={handleCatClick}
                          onMouseEnter={(e) => showTooltip(e, "category", cat._id)}
                          onMouseLeave={hideTooltip}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const cat = categories?.find((c) => c._id === item.id);
          if (!cat) return null;
          return (
            <CatIcon
              key={item.id}
              cat={cat}
              isSelected={selectedCatId === cat._id}
              onClick={handleCatClick}
              onMouseEnter={(e) => showTooltip(e, "category", cat._id)}
              onMouseLeave={hideTooltip}
            />
          );
        })}
      </div>

      <SidebarTooltip
        tooltip={tooltip}
        categories={categories ?? []}
        folders={folders ?? []}
      />
    </>
  );
};

// ─── Icône item (glissable vers le canvas) ────────────────────────────────────

const ItemIcon = ({ item, sourceType, isBound, onMouseEnter, onMouseLeave }) => {
  const displayName = getItemDisplayName(item, sourceType);
  const img = getItemImage(item);

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "application/odyssee-block",
      JSON.stringify({ type: "binding", sourceType, sourceId: item._id, displayName }),
    );
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`ody-sidebar-item-icon${isBound ? " ody-sidebar-item-icon--bound" : ""}`}
      style={item.color ? { borderColor: item.color } : {}}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {img ? <img src={img} alt={displayName} /> : getInitials(displayName)}
    </div>
  );
};

// ─── Colonne items (droite) — fetche depuis la DB au clic ────────────────────

const ItemStrip = ({ catId, fetchFn, sourceType, boundId }) => {
  const [state, setState] = useState({ loading: true, items: [] });
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    setState({ loading: true, items: [] });
    fetchFn(catId).then((result) => {
      setState({
        loading: false,
        items: result.success ? result.products || [] : [],
      });
    });
  }, [catId, fetchFn]);

  const showTooltip = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      type: "text",
      text: getItemDisplayName(item, sourceType),
      top: rect.top + rect.height / 2,
      left: rect.right + 5,
    });
  };

  return (
    <>
      <div className="ody-sidebar-panel__item-strip">
        {state.loading && <span className="ody-sidebar-cat-items__info">…</span>}
        {!state.loading && state.items.length === 0 && (
          <span className="ody-sidebar-cat-items__info">Vide</span>
        )}
        {state.items.map((item) => (
          <ItemIcon
            key={item._id}
            item={item}
            sourceType={sourceType}
            isBound={boundId === item._id}
            onMouseEnter={(e) => showTooltip(e, item)}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </div>
      <SidebarTooltip tooltip={tooltip} categories={[]} folders={[]} />
    </>
  );
};

// ─── Chips de champs (MODE_RUBRIQUE) ─────────────────────────────────────────

const FieldChip = ({ field, sourceType, onMouseEnter, onMouseLeave }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "application/odyssee-field",
      JSON.stringify({ type: "field", fieldId: field.id, sourceType }),
    );
  };
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="ody-sidebar-field-chip"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {field.label}
    </div>
  );
};

// Icônes de groupes de champs avec indicateur animé + tooltip
const FieldGroupStrip = ({ groups, selectedGroupId, onSelectGroup }) => {
  const stripRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const getItemColor = useCallback(
    (groupId) => groups.find((g) => g.id === groupId)?.color ?? null,
    [groups],
  );

  const indicator = useSidebarIndicator({
    sidebarRef: stripRef,
    folders: [],
    selectedId: selectedGroupId,
    getItemColor,
  });

  const showTooltip = (e, group) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ type: "text", text: group.label, top: rect.top + rect.height / 2, left: rect.right + 5 });
  };

  const handleClick = (groupId) => {
    indicator.updateSelection(groupId);
    onSelectGroup(groupId);
  };

  return (
    <>
      <div
        ref={stripRef}
        className="ody-sidebar-panel__cat-strip"
        onMouseMove={indicator.handleMouseMove}
        onMouseLeave={() => { indicator.handleMouseLeave(); setTooltip(null); }}
      >
        <div
          className="catalog-sidebar__indicator"
          style={{
            top: indicator.indicatorY ?? 0,
            opacity: indicator.indicatorOpacity,
            backgroundColor: indicator.indicatorColor ?? undefined,
            transition: "top 0.2s ease, opacity 0.15s ease, background-color 0.2s ease",
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

        {groups.map((group) => (
          <div
            key={group.id}
            data-cat-id={group.id}
            className={[
              "ody-sidebar-cat-icon",
              selectedGroupId === group.id ? "ody-sidebar-cat-icon--selected" : "",
            ].filter(Boolean).join(" ")}
            style={{ borderColor: group.color }}
            onClick={() => handleClick(group.id)}
            onMouseEnter={(e) => showTooltip(e, group)}
            onMouseLeave={() => setTooltip(null)}
          >
            {group.initials}
          </div>
        ))}
      </div>
      <SidebarTooltip tooltip={tooltip} categories={[]} folders={[]} />
    </>
  );
};

// Chips des champs du groupe sélectionné avec tooltip
const FieldGroupItems = ({ fields, sourceType }) => {
  const [tooltip, setTooltip] = useState(null);

  const showTooltip = (e, field) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ type: "text", text: field.label, top: rect.top + rect.height / 2, left: rect.right + 5 });
  };

  return (
    <>
      <div className="ody-sidebar-panel__item-strip">
        {fields.map((field) => (
          <FieldChip
            key={field.id}
            field={field}
            sourceType={sourceType}
            onMouseEnter={(e) => showTooltip(e, field)}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </div>
      <SidebarTooltip tooltip={tooltip} categories={[]} folders={[]} />
    </>
  );
};

// ─── Carte bloc (volet "Rubriques") ───────────────────────────────────────────

const BlockCard = ({ block }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "application/odyssee-block",
      JSON.stringify({
        type: "block-def",
        blockId: block._id,
        name: block.name,
        sourceType: block.sourceType,
        columns: block.columns,
        rows: block.rows,
        defaultColSpan: 1,
        defaultRowSpan: 1,
      }),
    );
  };

  return (
    <div draggable onDragStart={handleDragStart} className="ody-sidebar-block-card">
      {block.name}
      <div className="ody-sidebar-block-card__meta">
        {block.fieldPlacements?.length ?? 0} champs · {block.columns}×{block.rows}
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const OdysseeDocumentSidebar = ({
  mode,
  selectedBlockPlacement,
  bindings,
}) => {
  const [openPanel, setOpenPanel] = useState("passagers");
  const [passengerSidebar, setPassengerSidebar] = useState(null);
  const [catalogueSidebar, setCatalogueSidebar] = useState(null);
  const [openFolders, setOpenFolders] = useState(new Set());
  const [selectedPassengerCat, setSelectedPassengerCat] = useState(null);
  const [selectedCatalogueCat, setSelectedCatalogueCat] = useState(null);
  const [selectedPassengerGroup, setSelectedPassengerGroup] = useState(null);
  const [selectedCatalogueGroup, setSelectedCatalogueGroup] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [blocksLoading, setBlocksLoading] = useState(false);

  const togglePanel = (key) => setOpenPanel((p) => (p === key ? null : key));

  const toggleFolder = (folderId) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      next.has(folderId) ? next.delete(folderId) : next.add(folderId);
      return next;
    });
  };

  // Chargement des sidebars (cache localStorage → API si dirty)
  useEffect(() => {
    getSidebarData("passengers", async () => {
      const [sb, cats] = await Promise.all([
        passengersSidebarService.getSidebar(),
        passengersCategoryService.getUserCategories(),
      ]);
      if (!sb.success || !cats.success) return null;
      return { layout: sb.layout, folders: sb.folders, categories: cats.categories };
    }).then((data) => { if (data) setPassengerSidebar(data); });

    getSidebarData("catalogue", async () => {
      const [sb, cats] = await Promise.all([
        FolderService.getSidebar(),
        OdysseeCategoryService.getUserCategories(),
      ]);
      if (!sb.success || !cats.success) return null;
      return { layout: sb.layout, folders: sb.folders, categories: cats.categories };
    }).then((data) => { if (data) setCatalogueSidebar(data); });
  }, []);

  // Rubriques disponibles — recharge quand le panneau s'ouvre ou que le mode change
  useEffect(() => {
    if (openPanel !== "create") return;
    if (mode !== MODE_TEMPLATE && mode !== MODE_RUBRIQUE) return;
    setBlocksLoading(true);
    odysseeBlockService.getAllBlocks().then((r) => {
      if (r.success) setBlocks(r.blocks);
      setBlocksLoading(false);
    });
  }, [mode, openPanel]);

  // Ouvre le bon volet quand un bloc canvas est sélectionné
  useEffect(() => {
    if (!selectedBlockPlacement) return;
    setOpenPanel(
      selectedBlockPlacement.sourceType === "passenger" ? "passagers" : "catalogue",
    );
  }, [selectedBlockPlacement]);

  const currentBinding = selectedBlockPlacement
    ? bindings.find(
        (b) =>
          b.pageIndex === selectedBlockPlacement.pageIndex &&
          b.blockPlacementIndex === selectedBlockPlacement.blockIndex,
      )
    : null;
  const activeBoundId = currentBinding?.sourceId ?? null;

  return (
    <div className="ody-doc-sidebar">
      {/* ── Passagers ───────────────────────────────────────────────────── */}
      <SidebarPanel
        title="Passagers"
        isOpen={openPanel === "passagers"}
        onToggle={() => togglePanel("passagers")}
      >
        {mode === MODE_RUBRIQUE ? (
          <>
            <FieldGroupStrip
              groups={PASSENGER_GROUPS}
              selectedGroupId={selectedPassengerGroup}
              onSelectGroup={setSelectedPassengerGroup}
            />
            {selectedPassengerGroup && (
              <FieldGroupItems
                fields={PASSENGER_FIELDS.filter((f) => f.group === selectedPassengerGroup)}
                sourceType="passenger"
              />
            )}
          </>
        ) : (
          <>
            <CategoryStrip
              sidebarData={passengerSidebar}
              selectedCatId={selectedPassengerCat}
              openFolders={openFolders}
              onSelectCat={setSelectedPassengerCat}
              onToggleFolder={toggleFolder}
            />
            {selectedPassengerCat && (
              <ItemStrip
                key={selectedPassengerCat}
                catId={selectedPassengerCat}
                fetchFn={fetchPassengerItems}
                sourceType="passenger"
                boundId={activeBoundId}
              />
            )}
          </>
        )}
      </SidebarPanel>

      {/* ── Catalogue ───────────────────────────────────────────────────── */}
      <SidebarPanel
        title="Catalogue"
        isOpen={openPanel === "catalogue"}
        onToggle={() => togglePanel("catalogue")}
      >
        {mode === MODE_RUBRIQUE ? (
          <>
            <FieldGroupStrip
              groups={CATALOGUE_GROUPS}
              selectedGroupId={selectedCatalogueGroup}
              onSelectGroup={setSelectedCatalogueGroup}
            />
            {selectedCatalogueGroup && (
              <FieldGroupItems
                fields={CATALOGUE_FIELDS.filter((f) => f.group === selectedCatalogueGroup)}
                sourceType="catalogue"
              />
            )}
          </>
        ) : (
          <>
            <CategoryStrip
              sidebarData={catalogueSidebar}
              selectedCatId={selectedCatalogueCat}
              openFolders={openFolders}
              onSelectCat={setSelectedCatalogueCat}
              onToggleFolder={toggleFolder}
            />
            {selectedCatalogueCat && (
              <ItemStrip
                key={selectedCatalogueCat}
                catId={selectedCatalogueCat}
                fetchFn={fetchCatalogueItems}
                sourceType="product"
                boundId={activeBoundId}
              />
            )}
          </>
        )}
      </SidebarPanel>

      {/* ── Rubriques (modes template et rubrique) ─────────────────────── */}
      {(mode === MODE_TEMPLATE || mode === MODE_RUBRIQUE) && (
        <SidebarPanel
          title="Rubriques"
          isOpen={openPanel === "create"}
          onToggle={() => togglePanel("create")}
        >
          <div className="ody-sidebar-panel__block-list">
            {blocksLoading && <div className="ody-sidebar-msg">Chargement…</div>}
            {!blocksLoading && blocks.length === 0 && (
              <div className="ody-sidebar-msg">Aucune rubrique définie.</div>
            )}
            {blocks.map((b) => (
              <BlockCard key={b._id} block={b} />
            ))}
          </div>
        </SidebarPanel>
      )}
    </div>
  );
};

export default OdysseeDocumentSidebar;
