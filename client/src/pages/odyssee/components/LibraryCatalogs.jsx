import { useEffect, useState } from "react";

import ProductService from "../services/productService";

const LibraryCatalogs = ({ onSelectFile, availableHeight }) => {
  const [selectedFilesName, setSelectedFilesName] = useState("");
  const [productsByFolder, setProductsByFolder] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Charger les produits au montage du composant
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const result = await ProductService.getAllUserProducts();

        if (result.success) {
          setProductsByFolder(result.productsByFolder);
          setError("");
        } else {
          setError(result.error);
          console.error(
            "Erreur lors du chargement des produits:",
            result.error,
          );
        }
      } catch (err) {
        setError("Erreur de connexion");
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    // Charger seulement si l'utilisateur est authentifié
    if (ProductService.isAuthenticated()) {
      loadProducts();
    } else {
      setLoading(false);
      setError("Utilisateur non authentifié");
    }
  }, []);

  if (loading) {
    return (
      <div>
        <div className="container-library">
          <h2 className="title-library">Librairie 3</h2>
        </div>
        <div className="loading-message">
          <p>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="container-library">
          <h2 className="title-library">Librairie 3</h2>
        </div>
        <div className="error-message">
          <p>Erreur: {error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container-library">
        <h2 className="title-library">Librairie 3</h2>
      </div>
      <ul
        className="content-files"
        style={
          availableHeight
            ? { height: `${availableHeight}px`, overflowY: "scroll" }
            : {}
        }
      >
        {Object.entries(productsByFolder).map(
          ([folderName, products], folderIndex) => {
            // Afficher seulement les dossiers qui ont des produits
            if (!products || products.length === 0) {
              return null;
            }

            const folderDisplayName = `Dossier ${folderName.replace(
              "dossier",
              "",
            )}`;

            return (
              <li key={`folder-${folderName}-${folderIndex}`}>
                <h3>{folderDisplayName}</h3>
                <ul>
                  {products.map((product, productIndex) => {
                    const inputKey = `${folderName}-${product._id}`;

                    return (
                      <li key={`product-${product._id}-${productIndex}`}>
                        <h4>
                          {product.contentFilesData?.productName ||
                            product.name}
                        </h4>
                        <input
                          type="radio"
                          name="selectedProduct"
                          id={inputKey}
                          checked={inputKey === selectedFilesName}
                          onChange={() => {
                            setSelectedFilesName(inputKey);
                            // Passer les données du produit au parent
                            onSelectFile(product.contentFilesData || product);
                          }}
                        />
                        <div className="picture-files">
                          <label htmlFor={inputKey}>
                            {/* Afficher une image si disponible, sinon une icône par défaut */}
                            {product.img && product.img.length > 0 ? (
                              <img
                                src={product.img[0]}
                                alt={
                                  product.contentFilesData?.productName ||
                                  product.name
                                }
                              />
                            ) : (
                              <div className="default-product-icon">
                                <span>📦</span>
                                <p>
                                  {product.contentFilesData?.productName ||
                                    product.name}
                                </p>
                              </div>
                            )}
                          </label>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          },
        )}

        {/* Message si aucun produit */}
        {Object.values(productsByFolder).every(
          (products) => !products || products.length === 0,
        ) && (
          <li>
            <div className="no-products-message">
              <p>Aucun produit enregistré pour le moment.</p>
              <p>Créez votre premier produit en remplissant le formulaire !</p>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default LibraryCatalogs;
