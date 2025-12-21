import { useEffect, useRef } from 'react';

/**
 * Génère une valeur aléatoire dans une fourchette
 */
const randomInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Génère un border-radius aléatoire organique
 */
const generateRandomBorderRadius = () => {
  const values = Array.from({ length: 8 }, () => randomInRange(28, 72));
  return `${values[0]}% ${values[1]}% ${values[2]}% ${values[3]}% / ${values[4]}% ${values[5]}% ${values[6]}% ${values[7]}%`;
};

/**
 * Composant d'arrière-plan animé avec formes organiques aléatoires
 */
function AnimatedBackground() {
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);

  useEffect(() => {
    let intervalId1, intervalId2;

    /**
     * Anime un blob avec des transitions fluides entre formes aléatoires
     */
    const animateBlob = (element, transitionDuration) => {
      if (!element) return;

      // Initialiser avec une forme aléatoire
      element.style.borderRadius = generateRandomBorderRadius();

      // Créer une nouvelle forme toutes les transitionDuration millisecondes
      const interval = setInterval(() => {
        const newBorderRadius = generateRandomBorderRadius();
        element.style.borderRadius = newBorderRadius;
      }, transitionDuration);

      return interval;
    };

    // Initialiser les animations avec des durées différentes (nombres premiers)
    // Les blobs changeront de forme toutes les 23 et 29 secondes
    intervalId1 = animateBlob(blob1Ref.current, 23000); // 23 secondes
    intervalId2 = animateBlob(blob2Ref.current, 29000); // 29 secondes

    // Cleanup
    return () => {
      if (intervalId1) clearInterval(intervalId1);
      if (intervalId2) clearInterval(intervalId2);
    };
  }, []);

  return (
    <>
      <div
        ref={blob1Ref}
        className="animated-blob animated-blob--1"
        style={{
          position: 'absolute',
          width: 'calc(1200px * 1.4)',
          height: 'calc(1200px * 0.8)',
          top: '50%',
          left: '50%',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'border-radius 23s ease-in-out',
        }}
      />
      <div
        ref={blob2Ref}
        className="animated-blob animated-blob--2"
        style={{
          position: 'absolute',
          width: 'calc(1200px * 1.2)',
          height: 'calc(1200px * 1.1)',
          top: '50%',
          left: '50%',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'border-radius 29s ease-in-out',
        }}
      />
    </>
  );
}

export default AnimatedBackground;
