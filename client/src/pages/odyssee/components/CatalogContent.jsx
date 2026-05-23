import CatalogMain from './CatalogMain';
import CatalogSidebar from './CatalogSidebar';
import CategoryContextMenu from './CategoryContextMenu';
import CategoryForm from './CategoryForm';
import CategorySettings from './CategorySettings';
import ConfirmationModal from '../../../components/ConfirmationModal';
import FolderContextMenu from './FolderContextMenu';
import FolderSettingsModal from './FolderSettingsModal';
import IconLibrary from '../assets/IconLibrary';
import SidebarTooltip from './SidebarTooltip';

const CatalogContent = ({ engine, labels }) => {
  const {
    isLoading,
    categories,
    selectedCategory,
    sidebarItems,
    folders,
    productFolders,
    editFolderModal,
    setEditFolderModal,
    deleteFolderFlow,
    setDeleteFolderFlow,
    showCategoryModal,
    setShowCategoryModal,
    deleteModal,
    setDeleteModal,
    tooltip,
    contextMenu,
    setContextMenu,
    folderSettingsModal,
    setFolderSettingsModal,
    categoryContextMenu,
    setCategoryContextMenu,
    folderOpenStates,
    categorySettingsId,
    setCategorySettingsId,
    deleteCategoryFlow,
    setDeleteCategoryFlow,
    allProductFoldersClosed,
    dnd,
    handleEditItem,
    handleSelectItem,
    handleAddItem,
    confirmDeleteItem,
    handleCreateCategory,
    handleCategorySelect,
    handleOpenDeleteCategory,
    handleConfirmDeleteCategory,
    handleConfirmCategoryItem,
    toggleFolder,
    handleFolderContextMenu,
    handleToggleAllFolders,
    handleSaveFolderSettings,
    handleTooltipEnter,
    handleTooltipLeave,
    handleCategoryContextMenu,
    toggleAllProductFolders,
    toggleProductFolder,
    handleCreateItemFolder,
    handleSaveItemFolderEdit,
    handleConfirmDeleteFolder,
    handleConfirmFolderItem,
    handleMoveItemToFolder,
    handleGroupItems,
    handleReorderItemFolders,
  } = engine;

  return (
    <>
      {isLoading ? (
        <div className="catalog-no-library">
          <div className="loader-content">
            <div className="spinner" />
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div
          className="catalog-no-library"
          onClick={() => setShowCategoryModal(true)}
        >
          <IconLibrary
            colorBooks="var(--color-1)"
            colorPlus="var(--color-lightness)"
            height={120}
          />
        </div>
      ) : (
        <div className="catalog-container">
          <CatalogSidebar
            sidebarItems={sidebarItems}
            folders={folders}
            categories={categories}
            selectedCategoryId={selectedCategory}
            dnd={dnd}
            onCategorySelect={handleCategorySelect}
            onCategoryContextMenu={handleCategoryContextMenu}
            onToggleFolder={toggleFolder}
            onFolderContextMenu={handleFolderContextMenu}
            onAddCategory={() => setShowCategoryModal(true)}
            onTooltipEnter={handleTooltipEnter}
            onTooltipLeave={handleTooltipLeave}
          />
          <CatalogMain
            selectedCat={categories.find((c) => c._id === selectedCategory)}
            productFolders={productFolders}
            selectedProductId={engine.selectedFileData?._id}
            createLabel={labels?.createLabel}
            onAdd={() => handleAddItem(undefined)}
            onSelect={handleSelectItem}
            onEdit={handleEditItem}
            onDelete={(item) =>
              setDeleteModal({
                open: true,
                itemId: item._id,
                itemName: item.name,
              })
            }
            onCreateFolder={() => handleCreateItemFolder(selectedCategory)}
            onCreateProductInFolder={(folderId) => handleAddItem(folderId)}
            onRenameFolder={(folderId) => setEditFolderModal({ folderId })}
            onDeleteFolder={(folderId) => {
              const folder = productFolders.find((f) => f._id === folderId);
              const cat = categories.find((c) => c._id === selectedCategory);
              const items = (cat?.products || []).filter(
                (p) => String(p.folderId) === String(folderId),
              );
              setDeleteFolderFlow({
                phase: "confirm",
                folderId,
                folderName: folder?.name,
                items,
                confirmAll: false,
              });
            }}
            onMoveProductToFolder={handleMoveItemToFolder}
            onGroupProducts={handleGroupItems}
            onReorderFolders={handleReorderItemFolders}
            onCategoryContextMenu={handleCategoryContextMenu}
            folderOpenStates={folderOpenStates}
            onToggleFolder={toggleProductFolder}
            allFoldersClosed={allProductFoldersClosed}
            onToggleAllFolders={toggleAllProductFolders}
          />
        </div>
      )}

      {/* Modal de création de catégorie */}
      {showCategoryModal && (
        <CategoryForm
          onSubmit={handleCreateCategory}
          onCancel={() => setShowCategoryModal(false)}
        />
      )}

      {/* Suppression item */}
      <ConfirmationModal
        isOpen={deleteModal.open}
        title={`Supprimer le ${labels.item}`}
        message={`Êtes-vous sûr de vouloir supprimer "${deleteModal.itemName}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={confirmDeleteItem}
        onCancel={() =>
          setDeleteModal({ open: false, itemId: null, itemName: "" })
        }
      />

      <SidebarTooltip
        tooltip={tooltip}
        categories={categories}
        folders={folders}
      />

      {/* Menu contextuel dossier sidebar */}
      {contextMenu && (
        <FolderContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          allClosed={folders.every((f) => !f.isOpen)}
          onSettings={() => setFolderSettingsModal(contextMenu.folderId)}
          onToggleAll={handleToggleAllFolders}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Modal paramètres dossier sidebar */}
      {folderSettingsModal &&
        (() => {
          const folder = folders.find((f) => f._id === folderSettingsModal);
          if (!folder) return null;
          return (
            <FolderSettingsModal
              folder={folder}
              onSave={handleSaveFolderSettings}
              onCancel={() => setFolderSettingsModal(null)}
            />
          );
        })()}

      {/* Modal paramètres catégorie */}
      {categorySettingsId &&
        (() => {
          const cat = categories.find((c) => c._id === categorySettingsId);
          if (!cat) return null;
          return (
            <CategorySettings
              category={cat}
              onClose={() => setCategorySettingsId(null)}
            />
          );
        })()}

      {/* Menu contextuel catégorie */}
      {categoryContextMenu && (
        <CategoryContextMenu
          x={categoryContextMenu.x}
          y={categoryContextMenu.y}
          onSettings={() =>
            setCategorySettingsId(categoryContextMenu.categoryId)
          }
          onDelete={() =>
            handleOpenDeleteCategory(categoryContextMenu.categoryId)
          }
          onCreateFolder={() =>
            handleCreateItemFolder(categoryContextMenu.categoryId)
          }
          onCreateProduct={() => {
            handleAddItem(undefined);
            setCategoryContextMenu(null);
          }}
          allFoldersClosed={allProductFoldersClosed}
          onToggleAllFolders={toggleAllProductFolders}
          onClose={() => setCategoryContextMenu(null)}
        />
      )}

      {/* Modal édition dossier item */}
      {editFolderModal &&
        (() => {
          const folder = productFolders.find(
            (f) => f._id === editFolderModal.folderId,
          );
          if (!folder) return null;
          return (
            <FolderSettingsModal
              folder={folder}
              onSave={handleSaveItemFolderEdit}
              onCancel={() => setEditFolderModal(null)}
            />
          );
        })()}

      {/* Phase 1 : confirmation suppression dossier item */}
      {deleteFolderFlow?.phase === "confirm" && (
        <ConfirmationModal
          isOpen
          title="Supprimer le dossier"
          message={`Supprimer "${deleteFolderFlow.folderName}" ?`}
          confirmText="Supprimer"
          cancelText="Annuler"
          onConfirm={handleConfirmDeleteFolder}
          onCancel={() => setDeleteFolderFlow(null)}
          softDanger
          toggleLabel={
            deleteFolderFlow.items.length > 0
              ? "Cela supprimera son contenu"
              : null
          }
          toggleChecked={deleteFolderFlow.confirmAll}
          onToggleChange={(checked) =>
            setDeleteFolderFlow((prev) => ({ ...prev, confirmAll: checked }))
          }
        />
      )}

      {/* Phase 2 : confirmation item par item dans le dossier */}
      {deleteFolderFlow?.phase === "items" && (
        <ConfirmationModal
          isOpen
          title={`${labels.itemCapitalized} ${deleteFolderFlow.pendingIndex + 1} / ${deleteFolderFlow.items.length}`}
          message={`Supprimer "${deleteFolderFlow.items[deleteFolderFlow.pendingIndex]?.name || `ce ${labels.item}`}" ?`}
          confirmText="Supprimer"
          cancelText="Tout annuler"
          onConfirm={handleConfirmFolderItem}
          onCancel={() => setDeleteFolderFlow(null)}
        />
      )}

      {/* Phase 1 : confirmation suppression catégorie */}
      {deleteCategoryFlow?.phase === "confirm" && (
        <ConfirmationModal
          isOpen
          title="Supprimer la librairie"
          message={`Supprimer "${deleteCategoryFlow.categoryName}" ?`}
          confirmText="Supprimer"
          cancelText="Annuler"
          onConfirm={handleConfirmDeleteCategory}
          onCancel={() => setDeleteCategoryFlow(null)}
          softDanger
          toggleLabel={
            deleteCategoryFlow.items.length > 0
              ? "Cela supprimera son contenu"
              : null
          }
          toggleChecked={deleteCategoryFlow.confirmAll}
          onToggleChange={(checked) =>
            setDeleteCategoryFlow((prev) => ({ ...prev, confirmAll: checked }))
          }
        />
      )}

      {/* Phase 2 : confirmation item par item pour la catégorie */}
      {deleteCategoryFlow?.phase === "items" && (
        <ConfirmationModal
          isOpen
          title={`${labels.itemCapitalized} ${deleteCategoryFlow.pendingIndex + 1} / ${deleteCategoryFlow.items.length}`}
          message={`Supprimer "${deleteCategoryFlow.items[deleteCategoryFlow.pendingIndex]?.name || `ce ${labels.item}`}" ?`}
          confirmText="Supprimer"
          cancelText="Tout annuler"
          onConfirm={handleConfirmCategoryItem}
          onCancel={() => setDeleteCategoryFlow(null)}
        />
      )}
    </>
  );
};

export default CatalogContent;
