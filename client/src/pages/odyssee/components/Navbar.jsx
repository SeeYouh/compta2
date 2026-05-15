import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            Odyssée
          </Link>
        </div>

        <div className="navbar-menu">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Accueil
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link">
                À propos
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/features" className="nav-link">
                Fonctionnalités
              </Link>
            </li>
          </ul>
        </div>

        <div className="navbar-auth">
          <Link to="/auth" className="auth-button">
            Se connecter / S'inscrire
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
