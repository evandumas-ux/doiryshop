import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const ExitIntentPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  useEffect(() => {
    // Vérifier si le pop-up a déjà été affiché récemment (30 jours)
    const checkStorage = () => {
      const storedData = localStorage.getItem('doiry_newsletter_shown');
      if (storedData) {
        const { timestamp } = JSON.parse(storedData);
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - timestamp < thirtyDaysInMs) {
          return true; // Ne pas afficher
        }
      }
      return false;
    };

    if (checkStorage()) return;

    const handleMouseLeave = (e) => {
      // Déclencher si la souris sort par le haut (intention de fermer/changer d'onglet)
      if (e.clientY < 20) {
        setIsVisible(true);
        // Retirer l'écouteur après le premier déclenchement
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const closePopup = () => {
    setIsVisible(false);
    localStorage.setItem(
      'doiry_newsletter_shown',
      JSON.stringify({ timestamp: Date.now(), true: true })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit-intent' }),
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => closePopup(), 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Erreur inscription newsletter:', error);
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-lg bg-[#121212] rounded-2xl shadow-2xl overflow-hidden border border-[#333]"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Bouton de fermeture */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>

            {/* Contenu */}
            <div className="p-8 sm:p-12 text-center">
              <h2 className="text-3xl font-serif text-white mb-4 tracking-wide">
                Ne partez pas si vite...
              </h2>
              <p className="text-[#a0a0a0] mb-8 leading-relaxed font-light">
                Rejoignez le cercle Doiry Shop. Profitez de <span className="text-white font-medium">-10% sur votre première commande</span> et recevez nos inspirations autour du rituel des plantes.
              </p>

              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#1a2e1f] border border-[#2d4a36] text-[#8fbc9f] p-4 rounded-xl"
                >
                  <p className="font-medium">✨ Merci ! Vérifiez votre boîte mail.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-[#1a1a1a] text-white border border-[#333] rounded-xl focus:outline-none focus:border-[#831b2f] focus:ring-1 focus:ring-[#831b2f] transition-colors placeholder-gray-500"
                  />
                  {status === 'error' && (
                    <p className="text-red-400 text-sm">Une erreur est survenue, veuillez réessayer.</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full px-5 py-4 bg-[#831b2f] hover:bg-[#a8192b] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
                  >
                    {status === 'loading' ? 'Inscription...' : "S'inscrire"}
                  </button>
                </form>
              )}
              
              <p className="mt-6 text-xs text-gray-500">
                Vous pouvez vous désinscrire à tout moment. Nous prenons soin de vos données.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
