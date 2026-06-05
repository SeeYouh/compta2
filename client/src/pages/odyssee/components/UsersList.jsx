import { useEffect, useState } from "react";

import AuthService from "../services/authService";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async (page = 1, search = "") => {
    setLoading(true);
    setError("");

    try {
      const result = await AuthService.getAllUsers({
        page,
        limit: 10,
        search: search.trim() || undefined,
      });

      if (result.success) {
        setUsers(result.data.users || []);
        setPagination(result.data.pagination || {});
      } else {
        setError(result.error);
        setUsers([]);
      }
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("fr-FR");
  };

  const handleRefresh = () => {
    fetchUsers(currentPage, searchTerm);
  };

  return (
    <div className="users-list-container">
      <div className="users-header">
        <h2>🧑‍💻 Liste des Utilisateurs</h2>
        <button onClick={handleRefresh} className="refresh-btn">
          🔄 Actualiser
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Rechercher par email, prénom ou nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍 Rechercher
          </button>
        </form>
      </div>

      {/* Messages d'erreur */}
      {error && <div className="error-message">❌ {error}</div>}

      {/* Statistiques */}
      {pagination.total !== undefined && (
        <div className="stats">
          📊 Total : {pagination.total} utilisateur(s) • Page{" "}
          {pagination.page || 1} sur {pagination.pages || 1}
        </div>
      )}

      {/* Chargement */}
      {loading && (
        <div className="loading">⏳ Chargement des utilisateurs...</div>
      )}

      {/* Liste des utilisateurs */}
      {!loading && users.length > 0 && (
        <div className="users-grid">
          {users.map((user) => (
            <div key={user._id} className="user-card">
              <div className="user-header">
                <div className="user-avatar">
                  {user.firstName
                    ? user.firstName.charAt(0).toUpperCase()
                    : "👤"}
                </div>
                <div className="user-info">
                  <h3 className="user-name">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || user.lastName || "Utilisateur"}
                  </h3>
                  <p className="user-email">{user.email}</p>
                </div>
                <div className="user-status">
                  <span
                    className={`status-badge ${
                      user.isActive ? "active" : "inactive"
                    }`}
                  >
                    {user.isActive ? "✅ Actif" : "❌ Inactif"}
                  </span>
                </div>
              </div>

              <div className="user-details">
                <div className="detail-row">
                  <span className="detail-label">🎭 Rôle :</span>
                  <span className="detail-value">{user.role || "user"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📅 Inscrit le :</span>
                  <span className="detail-value">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🕐 Dernière connexion :</span>
                  <span className="detail-value">
                    {formatDate(user.lastLogin)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🆔 ID :</span>
                  <span className="detail-value user-id">{user._id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aucun utilisateur trouvé */}
      {!loading && users.length === 0 && !error && (
        <div className="no-users">😕 Aucun utilisateur trouvé.</div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="page-btn"
          >
            ⬅️ Précédent
          </button>

          <span className="page-info">
            Page {currentPage} sur {pagination.pages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.pages}
            className="page-btn"
          >
            Suivant ➡️
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersList;
