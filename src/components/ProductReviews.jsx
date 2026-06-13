import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, User, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useLogto } from '@logto/react';
import PhotoLightbox from './PhotoLightbox';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getPhotoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const path = url.startsWith('/uploads') ? url : `/uploads/reviews/${url}`;
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${path}`;
};

// ── Composant étoile individuelle ──
const StarIcon = ({ filled, half, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      fill={filled ? '#D1D5DB' : 'none'}
      stroke={filled ? '#D1D5DB' : '#404040'}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Affichage étoiles pour une note ──
export const StarRating = ({ rating, size = 16 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(<StarIcon key={i} filled={rating >= i} size={size} />);
  }
  return <div className="flex items-center gap-1">{stars}</div>;
};

// ── Sélecteur d'étoiles interactif ──
const StarSelector = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="p-1 transition-all hover:scale-110"
        >
          <Star
            size={24}
            fill={(hover || value) >= star ? '#D1D5DB' : 'none'}
            stroke={(hover || value) >= star ? '#D1D5DB' : '#404040'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
};

// ── Barre de progression ──
const ProgressBar = ({ label, count, total, color = 'bg-primary' }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-text-muted w-16 text-right shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-surface-light rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-text-muted w-8 text-xs">{count}</span>
    </div>
  );
};

// ── Composant principal ProductReviews ──
const ProductReviews = ({ productId, user }) => {
  const { getIdToken } = useLogto();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, moyenne: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(null); // null = loading, 'yes' | 'not_logged' | 'not_ordered' | 'already_reviewed'
  const [existingReview, setExistingReview] = useState(null);
  const [formNote, setFormNote] = useState(0);
  const [showNoteError, setShowNoteError] = useState(false);
  const [formComment, setFormComment] = useState('');
  const [formPhotos, setFormPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (photos, index) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction) => {
    setLightboxIndex((prev) => {
      let next = prev + direction;
      if (next < 0) next = lightboxPhotos.length - 1;
      if (next >= lightboxPhotos.length) next = 0;
      return next;
    });
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/products/${productId}/reviews`, { credentials: 'include' });
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || { total: 0, moyenne: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
    } catch (err) {
      console.error('Erreur fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (!user) {
      setCanReview('not_logged');
      return;
    }
    // Simple approach: try to post and see what happens
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note: 0 }),
          credentials: 'include'
        });
        const data = await res.json();
        
        if (res.status === 403 && data.error?.includes('achet')) {
          setCanReview('not_ordered');
        } else {
          // User passed auth + order check → can review
          setCanReview('yes');
        }
      } catch (err) {
        setCanReview('not_ordered');
      }
    };
    check();
  }, [user, productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[REVIEWS] Submitting review...', { productId, formNote, formComment, photosCount: formPhotos.length });

    if (formNote === 0) {
      setShowNoteError(true);
      return;
    }
    setShowNoteError(false);
    
    setSubmitting(true);
    setSubmitMessage(null);
    
    try {
      const form = new FormData();
      form.append('note', String(formNote));
      form.append('commentaire', formComment || '');
      formPhotos.slice(0, 3).forEach((file) => form.append('photos', file));

      const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
        method: 'POST',
        body: form,
        credentials: 'include'
      });
      
      const data = await res.json();
      console.log('[REVIEWS] Response received:', res.status, data);
      
      if (res.ok) {
        setSubmitMessage({ type: 'success', text: data.message || 'Avis publié avec succès !' });
        setFormNote(0);
        setFormComment('');
        setFormPhotos([]);
        photoPreviews.forEach((u) => URL.revokeObjectURL(u));
        setPhotoPreviews([]);
        setIsEditing(false);
        // Refresh reviews
        setTimeout(() => fetchReviews(), 500);
      } else {
        setSubmitMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setSubmitMessage({ type: 'error', text: 'Erreur lors de l\'envoi de l\'avis.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 border-t border-neutral-900">
      {/* ── Editorial Header ── */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-16 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif text-white tracking-wide mb-4">
            Avis & Témoignages
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-400 tracking-[0.2em] uppercase">
              {stats.moyenne.toFixed(1)} / 5 — Basé sur {stats.total} avis
            </span>
            <StarRating rating={stats.moyenne} size={14} />
          </div>
        </div>

        {canReview === 'yes' && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold uppercase tracking-[0.3em] py-4 px-8 border border-white/10 rounded-full hover:bg-white/5 transition-all"
          >
            Écrire un avis
          </button>
        )}
      </div>

      {/* ── Formulaire d'avis (Collapsible) ── */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-24"
          >
            <div className="bg-neutral-900/30 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 md:p-12">
              <h3 className="font-serif text-2xl text-white mb-8">Votre Expérience</h3>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-4 font-bold">Note globale</label>
                      <StarSelector value={formNote} onChange={(val) => { setFormNote(val); setShowNoteError(false); }} />
                      {showNoteError && (
                        <p className="text-red-500 text-[10px] mt-4 uppercase tracking-widest font-bold">Sélectionnez une note</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-4 font-bold">Photos (Max 3)</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []).slice(0, 3);
                          setFormPhotos(files);
                          setPhotoPreviews(files.map(f => URL.createObjectURL(f)));
                        }}
                        className="text-[10px] text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-white/5 file:text-white hover:file:bg-white/10"
                      />
                      <div className="flex gap-4 mt-6">
                        {photoPreviews.map((src, i) => (
                          <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-white/5">
                            <img src={src} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-4 font-bold">Votre témoignage</label>
                      <textarea
                        value={formComment}
                        onChange={e => setFormComment(e.target.value)}
                        rows={5}
                        placeholder="Décrivez votre ressenti..."
                        className="w-full bg-transparent border-b border-neutral-800 py-2 text-white placeholder:text-neutral-700 focus:outline-none focus:border-accent transition-colors resize-none font-light"
                      />
                    </div>
                    <div className="flex flex-col gap-6 pt-4">
                      <div className="flex items-center gap-6">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-white text-black px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Envoi en cours...' : 'Publier le témoignage'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
                        >
                          Annuler
                        </button>
                      </div>

                      <AnimatePresence mode="wait">
                        {submitMessage && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className={`text-[10px] font-bold uppercase tracking-widest p-4 rounded-xl border ${
                              submitMessage.type === 'success'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >
                            {submitMessage.text}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Liste des avis ── */}
      {reviews.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-x-20 gap-y-16">
          {reviews.map((review, idx) => (
            <div key={review.id} className="group border-b border-neutral-900 pb-16 last:border-0">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-serif text-white tracking-wide">
                    {review.auteur}
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-600 uppercase">
                    ACHAT VÉRIFIÉ
                  </span>
                </div>
                <StarRating rating={review.note} size={12} />
              </div>
              
              <p className="text-neutral-400 font-light leading-relaxed text-[15px] mb-8">
                {review.commentaire}
              </p>

              {review.photos?.length > 0 && (
                <div className="flex gap-3 mb-4">
                  {review.photos.map((photo, pIdx) => (
                    <button 
                      key={pIdx}
                      onClick={() => openLightbox(review.photos.map(getPhotoUrl), pIdx)}
                      className="w-20 h-24 rounded-xl overflow-hidden border border-white/5 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <img src={getPhotoUrl(photo)} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-neutral-600 tracking-widest uppercase">
                {new Date(review.date_creation).toLocaleDateString('fr-FR', {
                  month: 'long', year: 'numeric'
                })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border-y border-neutral-900">
          <p className="text-neutral-600 font-serif italic text-xl">
            Aucun témoignage pour le moment.
          </p>
        </div>
      )}

      <PhotoLightbox 
        isOpen={lightboxOpen} 
        onClose={() => setLightboxOpen(false)} 
        photos={lightboxPhotos} 
        currentIndex={lightboxIndex} 
        onNavigate={navigateLightbox} 
      />
    </div>
  );
};

export default ProductReviews;
