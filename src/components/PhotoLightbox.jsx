import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const lightboxContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 99999 }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute inset-0 cursor-pointer"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 0 }}
          />

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors pointer-events-auto"
            style={{ zIndex: 100 }}
            title="Fermer (Échap)"
          >
            <X size={32} />
          </button>

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
                className="absolute left-4 md:left-10 text-white/70 hover:text-white p-4 rounded-full hover:bg-white/10 transition-colors pointer-events-auto"
                style={{ zIndex: 100 }}
                title="Précédente (Flèche gauche)"
              >
                <ChevronLeft size={48} strokeWidth={1.5} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
                className="absolute right-4 md:right-10 text-white/70 hover:text-white p-4 rounded-full hover:bg-white/10 transition-colors pointer-events-auto"
                style={{ zIndex: 100 }}
                title="Suivante (Flèche droite)"
              >
                <ChevronRight size={48} strokeWidth={1.5} />
              </button>
            </>
          )}

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative flex items-center justify-center w-full h-full pointer-events-none"
            style={{ zIndex: 10 }}
          >
            <img
              src={photos[currentIndex]}
              alt={`Photo ${currentIndex + 1} sur ${photos.length}`}
              style={{
                maxWidth: '85vw',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '12px',
                pointerEvents: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
              className="shadow-2xl drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] select-none"
            />
            {photos.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium tracking-[0.2em]">
                {currentIndex + 1} / {photos.length}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(lightboxContent, document.body) : null;
};

export default PhotoLightbox;
