import {
  useEffect,
  useState,
} from 'react';

import { APP_LABELS } from './utils';

const ScrollButton = () => {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // Considérer qu'on est en bas si on est à moins de 100px du bas
      const atBottom = scrollTop + windowHeight >= documentHeight - 100;
      setIsAtBottom(atBottom);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Vérifier la position initiale

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    if (isAtBottom) {
      // Aller en haut
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      // Aller en bas
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className="btnScroll"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={
        isAtBottom ? APP_LABELS.scrollToTop : APP_LABELS.scrollToBottom
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="25px"
        height="25px"
        fill="currentColor"
      >
        {isAtBottom ? (
          // Flèche vers le haut
          <path d="M12 4l-8 8h5v8h6v-8h5z" />
        ) : (
          // Flèche vers le bas
          <path d="M12 20l8-8h-5V4H9v8H4z" />
        )}
      </svg>
    </div>
  );
};

export default ScrollButton;
