import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ShoppingCart, Leaf, ShieldCheck, CheckCircle2,
  Package, Minus, Plus, Lock, ChevronRight, Zap, Clock, Wind, Gift
} from 'lucide-react';
import ProductReviews, { StarRating } from '../components/ProductReviews';
import SEO from '../components/SEO';
import PaymentBadges from '../components/PaymentBadges';
import UseCasePills from '../components/UseCasePills';
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';
import ReassuranceLayer from '../components/ReassuranceLayer';
import PhotoLightbox from '../components/PhotoLightbox';

const Navbar = Header;
const MotionDiv = motion.div;
const MotionImg = motion.img;
const MotionButton = motion.button;
const MotionSpan = motion.span;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (!tags) return [];
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
};

const getStockMessage = (stock) => {
  if (Number(stock) > 0 && Number(stock) < 10) return `Plus que ${stock} en stock`;
  return null;
};

const formatCoffretDescription = (description) => {
  if (!description || !description.includes('⬢')) {
    return <p>{description}</p>;
  }

  const normalized = String(description).replace(/\r\n/g, '\n');
  const sections = normalized
    .split('✨ ')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
      const title = lines[0] || '';
      const body = lines.slice(1).join(' ');
      const bullets = body
        .split('⬢')
        .map((item) => item.trim())
        .filter(Boolean);
      return { title, bullets };
    })
    .filter((section) => section.title || section.bullets.length > 0);

  if (!sections.length) {
    return (
      <div className="space-y-2">
        {normalized.split('⬢').map((item, index) => {
          const line = item.trim();
          if (!line) return null;
          return <p key={`${line}-${index}`}>⬢ {line}</p>;
        })}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          {section.title && <p className="font-medium text-text">{`✨  ${section.title}`}</p>}
          <div className="space-y-1.5">
            {section.bullets.map((bullet, bulletIndex) => (
              <p key={`${bullet}-${bulletIndex}`}>⬢ {bullet}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ProductGallery = ({ images: rawImages, productName }) => {
  const images = (rawImages || []).filter(img => typeof img === 'string' && img.trim() !== '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-red-950/20 to-transparent pointer-events-none" />
        <img src="/placeholders/product-default.png" alt={productName} className="relative z-10 w-4/5 h-4/5 object-contain" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-4 lg:gap-6">
        {images.length > 1 && (
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-hide py-1 md:max-h-[500px] shrink-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setCurrentIndex(idx)}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-20 md:w-20 md:h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 shrink-0 ${
                  currentIndex === idx 
                    ? 'border-accent shadow-lg scale-105 z-10' 
                    : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-contain bg-neutral-900/50 p-1" />
              </button>
            ))}
          </div>
        )}

        <div 
          className="flex-1 relative aspect-[4/5] bg-neutral-950 rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 flex items-center justify-center group cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-white/5 to-transparent pointer-events-none transition-opacity duration-700 group-hover:opacity-20" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full flex items-center justify-center p-8 lg:p-12"
            >
              <img
                src={images[currentIndex]}
                alt={productName}
                className="w-full h-full object-contain select-none drop-shadow-2xl"
              />
            </motion.div>
          </AnimatePresence>

          {images.length > 1 && (
            <div className="absolute inset-x-4 bottom-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="flex gap-2 bg-black/40 backdrop-blur-md rounded-full p-1.5 border border-white/10">
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev === 0 ? images.length -1 : prev - 1); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white"
                >
                  <ChevronRight size={18} className="rotate-180" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev === images.length -1 ? 0 : prev + 1); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <span className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] uppercase tracking-widest text-white/70 font-bold">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          )}
        </div>
      </div>

      <PhotoLightbox 
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        photos={images}
        currentIndex={currentIndex}
        onNavigate={(direction) => {
          if (direction === -1) {
            setCurrentIndex(prev => prev === 0 ? images.length -1 : prev - 1);
          } else {
            setCurrentIndex(prev => prev === images.length -1 ? 0 : prev + 1);
          }
        }}
      />
    </>
  );
};

const BotanicalAccordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-900 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left group"
      >
        <span className={`text-sm uppercase tracking-[0.2em] font-medium transition-colors duration-300 ${isOpen ? 'text-accent' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
          {title}
        </span>
        <Plus 
          size={18} 
          className={`text-neutral-600 transition-transform duration-500 ease-out ${isOpen ? 'rotate-45 text-accent' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-neutral-400 font-light leading-relaxed text-[15px]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductDetail = ({ cartItems, setCartItems, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviewStats, setReviewStats] = useState({ total: 0, moyenne: 0 });
  const [suggestions, setSuggestions] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) setProduct(data.product);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`${API_URL}/products/${id}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setReviewStats(data.stats);
      })
      .catch(() => {});

    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products)) setSuggestions(data.products);
      })
      .catch(() => {});
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image_url: product.image_url, image: product.image_url, quantity }];
    });
    setAdded(true);
    setIsCartOpen(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const productTags = useMemo(() => parseTags(product?.tags), [product]);
  const isTea = useMemo(() => productTags.includes('tisanes') || product?.categorie === 'tisanes', [productTags, product]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <p className="text-neutral-400 font-light italic">L&apos;élixir recherché est introuvable.</p>
      <Link to="/" className="text-accent hover:underline uppercase tracking-widest text-xs font-bold">Retour à la boutique</Link>
    </div>
  );

  const discountAmount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;

  return (
    <>
      <Navbar 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenLogin={() => navigate('/login')} 
        onLogout={() => {}} 
        cartItemsCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)} 
        user={user} 
      />
      
      <main className="min-h-screen bg-background pt-32 pb-24">
        <SEO title={`${product.name} | Doiry Shop`} description={product.description} image={product.image_url} />

        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            {/* Left Column: Sticky Gallery */}
            <div className="lg:sticky lg:top-32 space-y-8">
              <ProductGallery images={product.images?.length > 0 ? product.images : [product.image_url]} productName={product.name} />
              
              <div className="hidden lg:grid grid-cols-2 gap-6 opacity-40">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-accent" />
                  <span className="text-[10px] uppercase tracking-widest text-white">Sécurité Totale</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-accent" />
                  <span className="text-[10px] uppercase tracking-widest text-white">Colis Discret</span>
                </div>
              </div>
            </div>

            {/* Right Column: Information & Purchase */}
            <div className="flex flex-col">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold py-1 px-3 border border-white/10 rounded-full text-neutral-500 inline-block">
                  {product.categorie === 'vrac' ? 'Botanique en Vrac' : product.categorie === 'pre-roules' ? 'Pré-Roulés Premium' : 'Tisanes & Rituels'}
                </span>
              </div>

              {/* Title & Reviews */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-[1.1] tracking-wide">
                {product.name}
              </h1>

              {reviewStats.total > 0 && (
                <div className="flex items-center gap-3 mb-8">
                  <StarRating rating={reviewStats.moyenne} size={14} />
                  <span className="text-xs text-neutral-500 uppercase tracking-widest">
                    {reviewStats.moyenne.toFixed(1)} / 5 — {reviewStats.total} avis clients
                  </span>
                </div>
              )}

              {/* Pricing Section (CRO Optimized) */}
              <div className="mb-10 space-y-1">
                <div className="flex items-center gap-4">
                  <span className="text-5xl md:text-6xl font-serif text-accent tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                  {product.old_price && (
                    <div className="flex items-center gap-3">
                      <span className="text-xl text-neutral-600 line-through decoration-neutral-700">
                        {formatPrice(product.old_price)}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 bg-accent/10 text-accent rounded uppercase tracking-wider">
                        -{discountAmount}%
                      </span>
                    </div>
                  )}
                </div>
                {product.price_per_unit && (
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">
                    soit {formatPrice(product.price_per_unit)} / {product.unit_label || 'unité'}
                  </p>
                )}
              </div>

              {/* Action Block */}
              <div className="space-y-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="flex items-center h-14 border border-white/10 rounded-2xl bg-neutral-900/50 backdrop-blur-sm px-2">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center font-serif text-lg text-white">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <MotionButton 
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`flex-1 h-14 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl shadow-accent/5 flex items-center justify-center gap-3 ${
                      added ? 'bg-emerald-500 text-neutral-950' : product.stock > 0 ? 'bg-accent text-neutral-950 hover:brightness-110 hover:shadow-accent/20' : 'bg-neutral-900 text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {added ? (
                        <MotionSpan key="added" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                          <CheckCircle2 size={18} /> Ajouté au Panier
                        </MotionSpan>
                      ) : (
                        <MotionSpan key="add" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                          <ShoppingCart size={18} /> Ajouter au Panier
                        </MotionSpan>
                      )}
                    </AnimatePresence>
                  </MotionButton>
                </div>

                <ReassuranceLayer className="justify-start gap-8" />
              </div>

              {/* Accordions Section */}
              <div className="border-t border-neutral-900 pt-2">
                <BotanicalAccordion title="Description de l'Élixir" defaultOpen={true}>
                  <div className="space-y-4">
                    <p className="text-lg text-neutral-200 font-serif leading-relaxed italic">
                      &quot;{product.tagline || 'Un moment suspendu, entre force et douceur.'}&quot;
                    </p>
                    <p>{product.short_description || product.description}</p>
                    <UseCasePills useCases={parseTags(product.use_cases)} />
                  </div>
                </BotanicalAccordion>

                <BotanicalAccordion title="Le Rituel de Consommation">
                  <div className="space-y-4">
                    <p>Pour apprécier pleinement les nuances de cet assemblage, nous recommandons une approche lente et attentive.</p>
                    <ul className="space-y-3">
                      <li className="flex gap-4 items-start">
                        <span className="text-accent font-serif text-xl leading-none">01</span>
                        <p>Préparez votre environnement : une lumière douce et un moment pour vous.</p>
                      </li>
                      <li className="flex gap-4 items-start">
                        <span className="text-accent font-serif text-xl leading-none">02</span>
                        <p>{product.mode_utilisation || 'Utilisez une petite quantité pour commencer et appréciez la combustion douce.'}</p>
                      </li>
                      <li className="flex gap-4 items-start">
                        <span className="text-accent font-serif text-xl leading-none">03</span>
                        <p>Refermez soigneusement le pochon pour préserver les huiles essentielles des plantes.</p>
                      </li>
                    </ul>
                  </div>
                </BotanicalAccordion>

                <BotanicalAccordion title="Composition & Origine">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-white text-xs uppercase tracking-widest mb-3 font-bold">Ingrédients</h4>
                      <p className="text-sm font-light leading-relaxed">
                        {product.name.includes("L'Essentiel") || productTags.includes('pre-roules') 
                          ? "100% Feuilles de framboisier (Rubus idaeus). Sélectionnées pour leur finesse et leur séchage optimal."
                          : isTea 
                            ? "Camomille matricaire et feuilles de framboisier. Un mélange équilibré pour un rituel apaisant."
                            : (product.composition_details || "Plantes sèches sélectionnées (Framboisier, Molène, Guimauve) — Sans tabac, sans nicotine, sans additifs.")
                        }
                      </p>
                    </div>
                    <div>
                      <h4 className="text-white text-xs uppercase tracking-widest mb-3 font-bold">Engagement</h4>
                      <p className="text-sm font-light leading-relaxed">
                        Récolte responsable et assemblage à la main. Garanti sans nicotine, sans tabac et sans aucun ajout chimique ou arôme artificiel.
                      </p>
                    </div>
                  </div>
                </BotanicalAccordion>

                <BotanicalAccordion title="Livraison & Retours">
                  <div className="space-y-4 text-sm">
                    <p>Expédition via <strong>Mondial Relay</strong> uniquement. Votre colis est déposé sous 24h ouvrées dans un emballage neutre et discret.</p>
                    <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <Clock size={18} className="text-accent shrink-0" />
                      <p className="text-xs">France : 3-5 jours ouvrés en Point Relais. <br/> Europe : 5-7 jours ouvrés.</p>
                    </div>
                    <p className="text-xs opacity-50 italic">Pour des raisons d'hygiène et de sécurité, les retours ne sont acceptés que si le sceau de garantie est intact.</p>
                  </div>
                </BotanicalAccordion>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions Section */}
        {suggestions.length > 0 && (
          <section className="mt-32 max-w-7xl mx-auto px-6 lg:px-12">
            <div className="mb-12">
              <span className="text-accent text-[10px] uppercase tracking-[0.4em] font-bold mb-4 block">Découverte</span>
              <h2 className="text-3xl font-serif text-white tracking-wide">Complétez votre rituel</h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestions.filter(s => s.id !== product.id).slice(0, 4).map((item) => (
                <Link key={item.id} to={`/produit/${item.id}`} className="group space-y-4">
                  <div className="aspect-[4/5] bg-neutral-900 rounded-2xl overflow-hidden border border-white/5 relative">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div>
                    <h3 className="text-white font-serif text-lg group-hover:text-accent transition-colors">{item.name}</h3>
                    <p className="text-accent text-sm mt-1">{formatPrice(item.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Cart Drawer & Reviews Integration */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems} 
        products={suggestions} 
        onAddProduct={(p) => {
           setCartItems(prev => {
             const ex = prev.find(i => i.id === p.id);
             if (ex) return prev.map(i => i.id === p.id ? {...i, quantity: i.quantity + 1} : i);
             return [...prev, { ...p, quantity: 1, image: p.image_url }];
           });
        }} 
        onRemove={(id) => setCartItems(prev => prev.filter(item => item.id !== id))} 
        onUpdateQuantity={(id, delta) => {
          setCartItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            const nq = item.quantity + delta;
            return nq > 0 ? {...item, quantity: nq} : null;
          }).filter(Boolean));
        }}
        onCheckout={() => navigate('/checkout')} 
      />
    </>
  );
};

export default ProductDetail;
