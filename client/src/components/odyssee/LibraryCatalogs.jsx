import { useEffect, useState } from "react";

import OdysseeProductService from "../../services/odysseeProductService";

const LibraryCatalogs = ({ onSelectFile, availableHeight }) => {
  const [selectedKey, setSelectedKey] = useState("");
  const [productsByFolder, setProductsByFolder] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const result = await OdysseeProductService.getAllUserProducts();

      if (result.success) {
        setProductsByFolder(result.productsByFolder);
        setError("");
      } else {
        setError(result.error || "Erreur lors du chargement des produits");
      }
      setLoading(false);
    };

    if (OdysseeProductService.isAuthenticated()) {
      loadProducts();
    } else {
      setLoading(false);
      setError("Utilisateur non authentifié");
    }
  }, []);

  if (loading) {
    return (
      <div className="container-library">
        <p className="loading-message">Chargement des produits…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-library">
        <p className="error-message">Erreur : {error}</p>
      </div>
    );
  }

  return (
    <ul
      className="content-files"
      style={
        availableHeight
          ? { height: `${availableHeight}px`, overflowY: "auto" }
          : {}
      }
    >
      {Object.entries(productsByFolder).map(([folderName, products]) => {
        if (!products || products.length === 0) return null;

        const folderLabel = `Dossier ${folderName.replace("dossier", "")}`;

        return (
          <li key={folderName}>
            <h3>{folderLabel}</h3>
            <ul>
              {products.map((product) => {
                const inputKey = `${folderName}-${product._id}`;
                return (
                  <li key={product._id}>
                    <input
                      type="radio"
                      name="selectedProduct"
                      id={inputKey}
                      checked={inputKey === selectedKey}
                      onChange={() => {
                        setSelectedKey(inputKey);
                        onSelectFile({
                          ...(product.contentFilesData || product),
                          _folder: folderName,
                        });
                      }}
                    />
                    <div className="picture-files">
                      <label htmlFor={inputKey}>
                        {product.img?.length > 0 ? (
                          <img
                            src={product.img[0]}
                            alt={
                              product.contentFilesData?.productName ??
                              product.name
                            }
                          />
                        ) : (
                          <div className="default-product-icon">
                            <span>📦</span>
                            <p>
                              {product.contentFilesData?.productName ??
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
      })}
    </ul>
  );
};

export default LibraryCatalogs;
