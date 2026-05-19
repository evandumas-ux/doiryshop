import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Désactiver le comportement par défaut de restauration du scroll du navigateur
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Si on a un hash (ex: #boutique), on laisse le scroll aller vers l'ancre
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
      // Sinon, on remonte tout en haut instantanément
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
