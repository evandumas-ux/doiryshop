import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 250);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleRefuse = () => {
    localStorage.setItem('cookie_consent', 'refused');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          className="fixed bottom-0 left-0 right-0 z-[220] p-4 md:p-6"
        >
          <div className="max-w-5xl mx-auto bg-background/80 backdrop-blur-md rounded-2xl border border-surface-border shadow-2xl shadow-black/40 overflow-hidden">
            <div className="p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="flex-1">
                <p className="text-sm md:text-base text-white leading-relaxed">
                  Nous utilisons des cookies pour ameliorer votre experience et assurer le bon fonctionnement du site.{' '}
                  <Link to="/politique-confidentialite" className="text-accent hover:underline">
                    En savoir plus
                  </Link>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <button
                  onClick={handleRefuse}
                  className="px-5 py-2.5 text-sm font-medium text-text-light bg-surface/70 border border-surface-border rounded-xl hover:bg-surface transition-colors"
                >
                  Refuser
                </button>
                <button
                  onClick={handleAccept}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
                >
                  Tout accepter
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
