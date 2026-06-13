import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Désactiver le comportement par défaut de restauration du scroll du navigateur
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (hash) {
      const id = hash.replace('#', '');
      // Petit délai pour s'assurer que le composant est bien rendu
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // On remonte tout en haut
      // Utilisation d'un petit timeout pour s'assurer que le nouveau composant est monté
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant' // On veut un saut immédiat pour éviter l'effet de scroll inverse
        });
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
