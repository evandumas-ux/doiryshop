import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const AgeVerification = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ageVerified = localStorage.getItem('age_verified');
    if (ageVerified === null) {
      setIsVisible(true);
    }
  }, []);

  const handleAdult = () => {
    localStorage.setItem('age_verified', 'true');
    setIsVisible(false);
  };

  const handleMinor = () => {
    window.location.href = 'https://www.google.fr';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-sm flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-lg bg-surface border border-primary/30 rounded-2xl p-6 md:p-8 text-center shadow-2xl shadow-black/50"
          >
            <img
              src="/favicon.jpg"
              alt="Doiry Shop"
              className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-xl mx-auto mb-5"
            />

            <h2 className="text-3xl font-serif text-text mb-4">Confirmation d'age</h2>
            <p className="text-text-light leading-relaxed mb-7">
              Ce site propose des produits reserves aux personnes majeures. Vous devez avoir 18 ans ou plus pour
              acceder a ce site.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAdult}
                className="flex-1 px-5 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
              >
                J'ai 18 ans ou plus
              </button>
              <button
                onClick={handleMinor}
                className="flex-1 px-5 py-3 rounded-xl bg-surface-light text-text-light border border-surface-border font-medium hover:bg-surface transition-colors"
              >
                Je suis mineur
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgeVerification;
