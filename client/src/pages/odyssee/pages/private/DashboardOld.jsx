import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import AuthService from "../../services/authService";
import { categoryLibrary } from "../../utils/variable";
import Gear from "../../assets/gear";
import { IconAvatar } from "../../assets/Icon-Avatar";
import PaperProduct from "../../components/PaperProduct";

const Dashboard = () => {
  const navigate = useNavigate();
  const [width, setWidth] = useState(400);
  const [availableHeight, setAvailableHeight] = useState(null);
  const [selectedCategoryLibrary, setSelectedCategoryLibrary] = useState(
    categoryLibrary[2].name
  );
  const [selectedFileData, setSelectedFileData] = useState(null);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [menuTimeoutId, setMenuTimeoutId] = useState(null);

  const categorySelected = categoryLibrary[0];

  const checkCategorySelected = (radioId) => {
    setSelectedCategoryLibrary((selected) =>
      selected === radioId ? categorySelected : radioId
    );
  };

  const selectedLibrary = categoryLibrary.find(
    (item) => item.name === selectedCategoryLibrary
  );

  const onMouseEnter = () => {
    setDataTimeRotateGear((prev) => ({
      ...prev,
      timeRotateGear: prev.timeRotateGear / 3,
    }));
  };

  const onMouseLeave = () => {
    setDataTimeRotateGear((prev) => ({
      ...prev,
      timeRotateGear: prev.timeRotateGear * 3,
    }));
  };

  const [dataTimeRotateGear, setDataTimeRotateGear] = useState({
    timeRotateGear: 5,
    numberTeethGear: 7,
    numberTeethGear2: 9,
    numberTeethGear3: 10,
  });

  // Fonction de déconnexion
  const handleLogout = () => {
    AuthService.logout();
    navigate("/");
  };

  // Fonctions pour gérer le menu avec délai
  const handleMenuEnter = () => {
    if (menuTimeoutId) {
      clearTimeout(menuTimeoutId);
      setMenuTimeoutId(null);
    }
    setShowProfileMenu(true);
  };

  const handleMenuLeave = () => {
    const timeoutId = setTimeout(() => {
      setShowProfileMenu(false);
    }, 300); // Délai de 300ms avant de fermer le menu
    setMenuTimeoutId(timeoutId);
  };

  useEffect(() => {
    const updateAvailableHeight = () => {
      const container = document.querySelector(".container-profil");
      const navBar = document.querySelector(".library-navBar");
      const titleLibrary = document.querySelector(".title-library");

      if (container && navBar && titleLibrary) {
        const totalHeight = window.innerHeight;
        const containerHeight = container.getBoundingClientRect().height;
        const navBarHeight = navBar.getBoundingClientRect().height;
        const titleHeight = titleLibrary.getBoundingClientRect().height;
        const remaining =
          totalHeight - containerHeight - navBarHeight - titleHeight;

        setAvailableHeight(remaining);
      }
    };

    updateAvailableHeight();
    window.addEventListener("resize", updateAvailableHeight);
    return () => window.removeEventListener("resize", updateAvailableHeight);
  }, []);

  useEffect(() => {
    setSelectedFileData(null);
  }, [selectedCategoryLibrary]);

  useEffect(() => {
    // Récupérer les informations de l'utilisateur connecté
    const fetchUserInfo = async () => {
      const result = await AuthService.verifyAuth();
      if (result.success) {
        setUser(result.data.user);
      }
    };
    fetchUserInfo();

    // Cleanup du timeout au démontage du composant
    return () => {
      if (menuTimeoutId) {
        clearTimeout(menuTimeoutId);
      }
    };
  }, [menuTimeoutId]);

  return (
    <div className="flex full-vh flex-1" style={{ position: "relative" }}>
      <div className="left-menu" style={{ width }}>
        <section className="container-profil">
          <div className="flex">
            <Link
              to="/settings"
              className="container-svg"
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              <Gear
                setDataTimeRotateGear={setDataTimeRotateGear}
                dataTimeRotateGear={dataTimeRotateGear}
              />
            </Link>
            {/* Avatar avec menu déroulant */}
            <div
              style={{
                position: "relative",
                display: "inline-block",
              }}
              onMouseEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
            >
              <div style={{ cursor: "pointer", position: "relative" }}>
                {IconAvatar}
                {/* Petite flèche pour indiquer le menu */}
                <span
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    right: "-2px",
                    fontSize: "10px",
                    color: "#666",
                  }}
                >
                  ▼
                </span>
              </div>

              {/* Menu déroulant */}
              {showProfileMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: "0",
                    backgroundColor: "white",
                    border: "1px solid #e9ecef",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    minWidth: "180px",
                    zIndex: 1000,
                    padding: "8px 0",
                    marginTop: "2px", // Réduire l'espace pour éviter la déconnexion
                  }}
                >
                  {/* Option Panel Admin (uniquement pour les admins) */}
                  {user?.role === "admin" && (
                    <Link
                      to="/sys/panel"
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        color: "#333",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#f8f9fa";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      👥 Panel Admin
                    </Link>
                  )}

                  {/* Option Déconnexion */}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "12px 16px",
                      color: "#dc3545",
                      backgroundColor: "transparent",
                      border: "none",
                      textAlign: "left",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    ⏻ Déconnexion
                  </button>
                </div>
              )}
            </div>
            <p className="svgBtn">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          {/* <div className="container-profil_status-profil">
            <p>Découverte</p>
          </div> */}
        </section>
        <section>
          <ul className="library-navBar">
            {categoryLibrary.map((item, index) => {
              const itemWidth = width * (item.width / 100);
              return (
                <li
                  key={"cat" + item.name + index}
                  style={{ width: `${itemWidth}px` }}
                >
                  <input
                    type="radio"
                    name="categoryLibrary"
                    id={item.name}
                    checked={item.name === selectedCategoryLibrary}
                    onChange={() => checkCategorySelected(item.name)}
                  />
                  <label htmlFor={item.name}>{item.name}</label>
                </li>
              );
            })}
          </ul>
          {selectedLibrary?.linkLibrary?.({
            onSelectFile: setSelectedFileData,
            availableHeight,
          })}
        </section>
      </div>
      {selectedFileData && <PaperProduct contentFilesData={selectedFileData} />}
    </div>
  );
};

export default Dashboard;
