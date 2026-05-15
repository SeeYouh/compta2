const MainContent = () => {
  return (
    <main className="main-content">
      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">Bienvenue dans Odyssée</h1>
          <p className="hero-subtitle">
            Votre plateforme de gestion complète et intuitive
          </p>
          <div className="hero-actions">
            <a href="/auth" className="cta-button primary">
              Commencer maintenant
            </a>
            <a href="/features" className="cta-button secondary">
              Découvrir les fonctionnalités
            </a>
          </div>
        </div>
      </section>

      <section className="features-preview">
        <div className="container">
          <h2>Pourquoi choisir Odyssée ?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Simplicité</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation.
              </p>
            </div>
            <div className="feature-card">
              <h3>Performance</h3>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia.
              </p>
            </div>
            <div className="feature-card">
              <h3>Sécurité</h3>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <h2>À propos d'Odyssée</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.
          </p>
          <p>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum. Sed ut perspiciatis
            unde omnis iste natus error sit voluptatem accusantium doloremque
            laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
            veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
        </div>
      </section>
    </main>
  );
};

export default MainContent;
