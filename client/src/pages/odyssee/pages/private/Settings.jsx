import {
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import ConfirmationModal from '../../../../components/ConfirmationModal';
import TrashCard from '../../components/TrashCard';
import TrashService from '../../../../services/trashService';
import { useOdysseeColor } from '../../contexts/OdysseeColorContext.jsx';

const Settings = () => {
  const { colors } = useOdysseeColor();
  const [products, setProducts] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    const result = await TrashService.getTrash();
    if (result.success) {
      setProducts(result.products);
      setFolders(result.folders);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRestoreProduct = async (id) => {
    await TrashService.restoreProduct(id);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const handleDeleteProduct = async (id) => {
    await TrashService.permanentDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const handleRestoreFolder = async (id) => {
    await TrashService.restoreFolder(id);
    setFolders((prev) => prev.filter((f) => f._id !== id));
  };

  const handleDeleteFolder = async (id) => {
    await TrashService.permanentDeleteFolder(id);
    setFolders((prev) => prev.filter((f) => f._id !== id));
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "product")
      await handleDeleteProduct(pendingDelete.id);
    else await handleDeleteFolder(pendingDelete.id);
    setPendingDelete(null);
  };

  const isEmpty = products.length === 0 && folders.length === 0;

  return (
    <div style={{ padding: "24px" }}>
      <Link to="/odyssee" style={{ fontSize: 13, opacity: 0.6 }}>
        ← Retour
      </Link>
      <h2
        style={{
          marginTop: 16,
          marginBottom: 24,
          color: colors.lightness,
          fontSize: 18,
        }}
      >
        Corbeille
      </h2>

      {loading ? null : isEmpty ? (
        <div className="trash-empty">La corbeille est vide</div>
      ) : (
        <>
          {folders.length > 0 && (
            <div className="trash-section">
              <div className="trash-section__title">Dossiers</div>
              <div className="trash-grid">
                {folders.map((folder) => (
                  <TrashCard
                    key={folder._id}
                    item={folder}
                    type="folder"
                    products={folder.products || []}
                    onRestore={() => handleRestoreFolder(folder._id)}
                    onDelete={() =>
                      setPendingDelete({
                        type: "folder",
                        id: folder._id,
                        name: folder.name,
                        productCount: folder.products?.length || 0,
                      })
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {products.length > 0 && (
            <div
              className="trash-section"
              style={{ marginTop: folders.length > 0 ? 24 : 0 }}
            >
              <div className="trash-section__title">Produits</div>
              <div className="trash-grid">
                {products.map((product) => (
                  <TrashCard
                    key={product._id}
                    item={product}
                    type="product"
                    onRestore={() => handleRestoreProduct(product._id)}
                    onDelete={() =>
                      setPendingDelete({
                        type: "product",
                        id: product._id,
                        name: product.name,
                      })
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {pendingDelete && (
        <ConfirmationModal
          isOpen
          title="Suppression définitive"
          message={
            <>
              Supprimer définitivement &ldquo;{pendingDelete.name}&rdquo; ?
              {pendingDelete.productCount > 0 && (
                <>
                  <br />
                  Ce dossier contient {pendingDelete.productCount} produit
                  {pendingDelete.productCount > 1 ? "s" : ""} qui ser
                  {pendingDelete.productCount > 1 ? "ont" : "a"} aussi supprimé
                  {pendingDelete.productCount > 1 ? "s" : ""}.
                </>
              )}
              <br />
              <span>Cette action est irréversible.</span>
            </>
          }
          confirmText="Supprimer"
          cancelText="Annuler"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
          softDanger
        />
      )}
    </div>
  );
};

export default Settings;
