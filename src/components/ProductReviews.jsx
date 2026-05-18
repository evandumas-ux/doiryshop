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
const StarIcon = ({ filled, half, size = 18, color = '#A8192B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`half-${size}-${Math.random().toString(36).slice(2)}`}>
        <stop offset="50%" stopColor={color} />
        <stop offset="50%" stopColor="transparent" />
      </linearGradient>
    </defs>
    {half ? (
      <>
        {/* Demi-étoile : moitié gauche pleine, droite vide */}
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <clipPath id="leftHalf"><rect x="0" y="0" width="12" height="24" /></clipPath>
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill={color} clipPath="url(#leftHalf)" />
      </>
    ) : (
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

// ── Affichage étoiles pour une note ──
export const StarRating = ({ rating, size = 18, color = '#A8192B' }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<StarIcon key={i} filled size={size} color={color} />);
    } else if (rating >= i - 0.5) {
      stars.push(<StarIcon key={i} half size={size} color={color} />);
    } else {
      stars.push(<StarIcon key={i} filled={false} size={size} color={color} />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

// ── Sélecteur d'étoiles interactif ──
const StarSelector = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            size={28}
            fill={(hover || value) >= star ? '#A8192B' : 'none'}
            color="#A8192B"
            strokeWidth={1.5}
          />
        </button>
      ))}
      {(hover || value) > 0 && (
        <span className="ml-2 text-sm text-text-muted">
          {['', 'Mauvais', 'Moyen', 'Bien', 'Très bien', 'Excellent'][hover || value]}
        </span>
      )}
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
      
      if (res.ok) {
        setSubmitMessage({ type: 'success', text: data.message });
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
    <div className="space-y-10">
      {/* ── En-tête : note moyenne + distribution ── */}
      {reviews.length > 0 && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Note moyenne */}
          <div className="flex flex-col items-center justify-center p-6 bg-surface rounded-2xl border border-surface-border">
            <span className="text-5xl font-serif font-bold text-text mb-2">
              {stats.moyenne.toFixed(1)}
            </span>
            <StarRating rating={stats.moyenne} size={22} />
            <span className="text-text-muted text-sm mt-2">
              {stats.total} avis client{stats.total !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Distribution */}
          <div className="flex flex-col justify-center gap-2 p-6 bg-surface rounded-2xl border border-surface-border">
            {[5, 4, 3, 2, 1].map(n => (
              <ProgressBar
                key={n}
                label={`${n} ★`}
                count={stats.distribution[n] || 0}
                total={stats.total}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Formulaire d'avis ── */}
      <div className="p-6 bg-surface rounded-2xl border border-surface-border">
        {canReview === 'not_logged' ? (
          <div className="text-center py-4">
            <User size={32} className="mx-auto mb-3 text-text-muted opacity-40" />
            <p className="text-text-light font-light">
              <a href="/login" className="text-primary font-medium hover:underline">Connectez-vous</a> pour laisser un avis
            </p>
          </div>
        ) : canReview === 'not_ordered' ? (
          <div className="text-center py-4">
            <MessageSquare size={32} className="mx-auto mb-3 text-text-muted opacity-40" />
            <p className="text-text-light font-light">
              Achetez ce produit pour laisser un avis
            </p>
          </div>
        ) : (
          <>
            <h3 className="font-serif text-lg text-text mb-4 flex items-center gap-2">
              <Star size={18} className="text-primary" />
              {isEditing ? 'Modifier votre avis' : 'Laisser un avis'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-2">Votre note</label>
                <StarSelector value={formNote} onChange={(val) => { setFormNote(val); setShowNoteError(false); }} />
                {showNoteError && (
                  <p className="text-primary text-xs mt-2 font-medium animate-pulse">
                    Merci de sélectionner une note avant de publier votre avis.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2">Votre commentaire (optionnel)</label>
                <textarea
                  value={formComment}
                  onChange={e => setFormComment(e.target.value)}
                  rows={3}
                  placeholder="Partagez votre expérience avec ce produit..."
                  className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2">Ajouter des photos (max 3)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const filtered = files
                      .filter((f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type))
                      .filter((f) => f.size <= 5 * 1024 * 1024)
                      .slice(0, 3);

                    photoPreviews.forEach((u) => URL.revokeObjectURL(u));
                    setFormPhotos(filtered);
                    setPhotoPreviews(filtered.map((f) => URL.createObjectURL(f)));
                  }}
                  className="w-full text-sm text-text-light"
                />
                {photoPreviews.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {photoPreviews.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => window.open(src, '_blank')}
                        className="border border-surface-border rounded-xl overflow-hidden w-16 h-16 bg-background"
                        title="Ouvrir"
                      >
                        <img src={src} alt={`preview ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-text-muted mt-2">JPG/PNG/WEBP · 5MB max par photo</p>
              </div>
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={formNote === 0 || submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                >
                  <Send size={16} />
                  {submitting ? 'Envoi...' : 'Publier mon avis'}
                </motion.button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setFormNote(0); setFormComment(''); }}
                    className="text-sm text-text-muted hover:text-text transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>

            <AnimatePresence>
              {submitMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                    submitMessage.type === 'success'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {submitMessage.text}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* ── Liste des avis ── */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-serif text-lg text-text">
            Avis clients ({reviews.length})
          </h3>
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-5 bg-surface rounded-2xl border border-surface-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {(review.auteur || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text text-sm">{review.auteur}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle2 size={10} /> Achat vérifié
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">
                      {new Date(review.date_creation).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.note} size={14} />
              </div>
              {review.commentaire && (
                <p className="text-text-light font-light text-sm leading-relaxed pl-[52px]">
                  {review.commentaire}
                </p>
              )}
              {Array.isArray(review.photos) && review.photos.length > 0 && (
                <div className="pl-[52px] mt-3">
                  <div className="flex gap-2 flex-wrap mb-2">
                    {review.photos.slice(0, 3).map((url, i) => (
                      <button 
                        key={url} 
                        onClick={() => openLightbox(review.photos.map(getPhotoUrl), i)}
                        className="block w-20 h-20 rounded-xl overflow-hidden border border-surface-border bg-background hover:border-primary transition-colors focus:outline-none"
                      >
                        <img src={getPhotoUrl(url)} alt={`photo avis ${i+1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => openLightbox(review.photos.map(getPhotoUrl), 0)}
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    Voir les photos ({review.photos.length})
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-surface rounded-2xl border border-surface-border p-6">
          <MessageSquare size={40} className="mx-auto mb-3 text-text-muted opacity-30" />
          <p className="text-text-light text-sm font-medium">Soyez le premier à laisser un avis</p>
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
