import { useState } from "react";

/**
 * Ajoute ici autant de phrases que tu veux.
 * Une phrase sera tirée au sort à chaque montage du composant.
 */
const EMPTY_MESSAGES = [
  "Personne n'est monté à bord. Pas même le chat du capitaine.",
  "Cette librairie a été inspectée. Vide certifié.",
  "Attention au départ. Attention… rien.",
  "Les articles sont en salle d'embarquement. Terminal 404.",
  "Ici commence la mer. Après, on verra.",
  "Gilets de sauvetage sous le siège. Articles : à créer.",
  "En cas de turbulences, veuillez attacher votre ceinture et créer un article.",
  "Le personnel naviguant vous souhaite un agréable néant.",
  "Prochain arrêt : votre premier article.",
  "Ce contenu est vide depuis le début des temps. Ou depuis hier. C'est flou.",
  "Aucun article à bord. Les dauphins non plus d'ailleurs.",
  "Vitesse de croisière : zéro. Contenu : idem.",
  "Cette librairie navigue à vue.",
  "Nous survolons actuellement une zone sans articles.",
  "La bouteille à la mer n'a rien dedans non plus.",
  "Aucun article. L'équipage hausse les épaules.",
  "Vous êtes à bord. Les articles ont préféré rester à quai.",
  "Cette librairie accepte les articles. Elle ne les invente pas.",
  "Brouillard dense. Visibilité : un article serait utile.",
  "Le radar ne détecte rien. Le radar est pourtant neuf.",
  "Ni icebergs ni articles. Navigation sereine.",
  "Consigne de sécurité : en cas de librairie vide, créer un article.",
  "Les mouettes ont regardé. Elles sont reparties.",
  "Cap sur le premier article. Le cap, c'est vous qui le donnez.",
  "Soute vide. Pont vide. Bar du bateau : à vérifier.",
  "Longitude : inconnue. Latitude : inconnue. Articles : aucun.",
  "Le port est là. Les marchands ne sont pas encore levés.",
  "Ici on n'a pas encore décidé ce qu'on allait mettre.",
  "Bulletin météo : ciel dégagé, vent nul, aucun article en vue.",
  "Ici, même les mouettes font escale ailleurs.",
  "La cargaison est en route. Enfin, on suppose.",
  "Le commandant consulte ses cartes. Les cartes sont vides elles aussi.",
  "Aucun article signalé dans un rayon de 3000 nautiques.",
  "L'ancre est jetée. Il n'y a rien à retenir mais bon.",
  "Le voyage commence ici. Les articles, un peu plus tard.",
  "La boussole tourne. Les articles, eux, ne se manifestent pas.",
  "Fond de cale inspecté. Résultat : néant et quelques coquillages.",
  "Cette librairie flotte mais ne transporte rien.",
  "Pavillon hissé. Marchandises : introuvables.",
  "Le matelot de quart n'a rien à signaler. Absolument rien.",
  "Le sextant pointe vers un premier article à créer.",
  "Cet espace est en attente d'escale.",
  "Cette librairie est ouverte 24h/24. Elle attend votre premier article depuis le début.",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function EmptyLibraryMessage() {
  const [message] = useState(() => pickRandom(EMPTY_MESSAGES));

  return (
    <div className="catalog-empty">
      <div className="catalog-empty__icon">📦</div>
      <div className="catalog-empty__title">{message}</div>
      <div className="catalog-empty__hint">
        Cliquez sur le bouton + pour créer votre premier produit
      </div>
    </div>
  );
}
