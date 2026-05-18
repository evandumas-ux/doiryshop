import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const PhotoLightbox = ({ isOpen, onClose, photos, currentIndex, onNavigate }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onNavigate) onNavigate(-1);
      if (e.key === 'ArrowRight' && onNavigate) onNavigate(1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  // Prevent scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!photos || photos.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-0 cursor-pointer"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[101]"
            title="Fermer (Échap)"
          >
            <X size={32} />
          </button>

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
                className="absolute left-4 md:left-10 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-[101]"
                title="Précédente (Flèche gauche)"
              >
                <ChevronLeft size={40} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
                className="absolute right-4 md:right-10 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-[101]"
                title="Suivante (Flèche droite)"
              >
                <ChevronRight size={40} />
              </button>
            </>
          )}

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 flex items-center justify-center w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[currentIndex]}
              alt={`Photo ${currentIndex + 1} sur ${photos.length}`}
              style={{
                maxWidth: '80vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
              className="shadow-2xl"
            />
            {photos.length > 1 && (
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                {currentIndex + 1} / {photos.length}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PhotoLightbox;
