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
const Navbar = Header;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const ProductGallery = ({ images: rawImages, productName }) => {
  const images = (rawImages || []).filter(img => typeof img === 'string' && img.trim() !== '');
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-surface rounded-3xl overflow-hidden shadow-xl border border-surface-border relative">
        <img src="/placeholders/product-default.png" alt={productName} className="w-full h-full object-cover" />
      </div>
    );
  }

  const handlePrev = () => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square bg-surface rounded-3xl overflow-hidden shadow-xl border border-surface-border relative group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${productName} - Vue ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {images.length > 1 && (
          <>
            <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105 z-10">
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105 z-10">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                currentIndex === idx ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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

const hasActiveDiscount = (product) =>
  Number(product?.reference_market_price || 0) > Number(product?.price || 0);

const formatCoffretDescription = (description) => {
  if (!description || !description.includes('•')) {
    return <p>{description}</p>;
  }

  const normalized = String(description).replace(/\r\n/g, '\n');
  const sections = normalized
    .split('✦')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
      const title = lines[0] || '';
      const body = lines.slice(1).join(' ');
      const bullets = body
        .split('•')
        .map((item) => item.trim())
        .filter(Boolean);
      return { title, bullets };
    })
    .filter((section) => section.title || section.bullets.length > 0);

  if (!sections.length) {
    return (
      <div className="space-y-2">
        {normalized.split('•').map((item, index) => {
          const line = item.trim();
          if (!line) return null;
          return <p key={`${line}-${index}`}>• {line}</p>;
        })}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          {section.title && <p className="font-medium text-text">{`✦ ${section.title}`}</p>}
          <div className="space-y-1.5">
            {section.bullets.map((bullet, bulletIndex) => (
              <p key={`${bullet}-${bulletIndex}`}>• {bullet}</p>
            ))}
          </div>
        </div>
      ))}
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
  const [activeTab, setActiveTab] = useState('description');
  const [reviewStats, setReviewStats] = useState({ total: 0, moyenne: 0 });
  const [suggestions, setSuggestions] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    window.scrollTo(0, 0);
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

  useEffect(() => {
    if (!product) return;
    if (import.meta.env.DEV) {
      console.log('[ProductDetail] product.use_cases:', product.use_cases);
    }
  }, [product]);

  const tags = useMemo(() => parseTags(product?.tags), [product]);
  const safeSlug = product?.slug || '';
  
  let emotionalBadge = null;
  if (safeSlug === 'elixir-nocturne-infusion-vrac' || safeSlug.includes('elixir-nocturne')) emotionalBadge = "PROFIL APAISANT";
  else if (safeSlug === 'coffret-transition-kit-roulage') emotionalBadge = "ASSEMBLÉ À LA MAIN";
  else if (tags.includes('pre-roules') || safeSlug.includes('pre-roules')) emotionalBadge = "PRÊT À L'EMPLOI";
  else if (safeSlug === 'coffret-serenite-kit-detente') emotionalBadge = "IDÉAL CADEAU";

  const isSubstitut = tags.includes('substitut');
  const isTea = tags.includes('tisanes');
  const stockMessage = product ? getStockMessage(product.stock) : null;
  const isDiscounted = hasActiveDiscount(product);
  const isCoffretDescription = /coffret transition|coffret sérénité/i.test(product?.name || '');
  const ritualSuggestions = useMemo(() => {
    if (!product) return [];
    const productTags = parseTags(product.tags);
    return suggestions
      .filter((item) => item.id !== product.id && Number(item.stock) > 0)
      .map((item) => {
        const itemTags = parseTags(item.tags);
        let score = 0;
        if (item.categorie === product.categorie) score += 3;
        score += itemTags.filter((tag) => productTags.includes(tag)).length;
        if (product.categorie === 'tisanes' && ['kits', 'vrac'].includes(item.categorie)) score += 1;
        if (product.categorie !== 'tisanes' && item.categorie === 'tisanes') score += 1;
        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || Number(a.price) - Number(b.price))
      .slice(0, 3);
  }, [product, suggestions]);

  const handleAddToCart = () => {
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

  const handleAddSuggestedProduct = (suggestedProduct) => {
    if (!suggestedProduct || Number(suggestedProduct.stock) <= 0) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === suggestedProduct.id);
      if (existing) {
        return prev.map((item) =>
          item.id === suggestedProduct.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: suggestedProduct.id,
          name: suggestedProduct.name,
          price: suggestedProduct.price,
          image_url: suggestedProduct.image_url,
          image: suggestedProduct.image_url,
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => navigate('/checkout'), 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-text-muted text-sm">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-text-light text-lg">Produit introuvable.</p>
        <Link to="/" className="text-primary hover:underline">Retour a l'accueil</Link>
      </div>
    );
  }

  const productUrl = `https://doiryshop.fr/produit/${product.id}`;
  const productDescription = product.description || `Découvrez ${product.name} sur Doiry Shop.`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: productDescription,
    image: product.image_url,
    offers: {
      '@type': 'Offer',
      price: Number(product.price).toFixed(2),
      priceCurrency: 'EUR',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  if (reviewStats.total > 0) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(reviewStats.moyenne),
      reviewCount: String(reviewStats.total),
    };
  }

  const tabContent = {
    description: (
      <div className="text-text-light font-light leading-relaxed space-y-4">
        {isCoffretDescription ? formatCoffretDescription(product.description) : <p>{product.description}</p>}
        <p>
          Doiryshop compose chaque référence pour offrir une lecture claire du produit, une utilisation simple et
          un rendu soigné, sans surcharge inutile.
        </p>
      </div>
    ),
    composition: (
      <div className="text-text-light font-light leading-relaxed space-y-4">
        {product.composition && <p>{product.composition}</p>}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-surface rounded-xl border border-surface-border">
            <h4 className="font-serif text-text font-medium mb-2 flex items-center gap-2">
              <Leaf size={16} className="text-green-400" /> Composition
            </h4>
            <p className="text-sm">{isSubstitut ? 'Base végétale pensée pour le roulage, avec une composition courte et lisible.' : 'Mélange de plantes sélectionnées avec soin pour une infusion simple et nette.'}</p>
          </div>
          <div className="p-4 bg-surface rounded-xl border border-surface-border">
            <h4 className="font-serif text-text font-medium mb-2 flex items-center gap-2">
              <Package size={16} className="text-accent" /> Conditionnement
            </h4>
            <p className="text-sm">{product.unit_label ? `${product.unit_label} - ${product.weight_grams || 0}g` : 'Conditionnement artisanal et propre.'}</p>
          </div>
        </div>
        <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/10">
          <p className="text-sm text-green-400 font-medium">Sans nicotine - composition transparente - atelier soigne</p>
        </div>
      </div>
    ),
    utilisation: (
      <div className="text-text-light font-light leading-relaxed space-y-4">
        {product.mode_utilisation && <p>{product.mode_utilisation}</p>}
        <div className="space-y-3">
          {(isTea
            ? [
                { step: '1', text: "Faites chauffer l'eau sans la porter à ébullition trop forte." },
                { step: '2', text: 'Dosez selon la recommandation indiquée sur le produit.' },
                { step: '3', text: 'Laissez infuser le temps conseillé, puis prenez le temps de ralentir.' },
                { step: '4', text: 'Conservez le sachet ou le pochon dans un endroit sec.' },
              ]
            : [
                { step: '1', text: "Utilisez votre base ou votre pré-roulé au moment qui vous convient." },
                { step: '2', text: 'Avancez doucement pour garder un geste simple et confortable.' },
                { step: '3', text: 'Refermez proprement le conditionnement après usage.' },
                { step: '4', text: "Conservez le produit à l'abri de l'humidité et de la lumière." },
              ]).map((item) => (
            <div key={item.step} className="flex gap-4 items-start p-3 rounded-xl hover:bg-surface/50 transition-colors">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-serif font-bold text-sm flex items-center justify-center shrink-0">
                {item.step}
              </span>
              <p className="text-sm pt-1">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-4">
          <p className="text-sm text-primary font-medium">Produit réservé aux personnes majeures (+18 ans).</p>
        </div>
      </div>
    ),
  };

  return (
    <>
      <Navbar 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenLogin={() => navigate('/login')} 
        onLogout={() => {}} 
        cartItemsCount={cartItemsCount} 
        user={user} 
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen bg-background pt-24 pb-20 sm:pb-20">
        <SEO title={`${product.name} | Doiry Shop`} description={productDescription} image={product.image_url} url={productUrl} type="product">
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </SEO>

        <div className="max-w-7xl mx-auto px-6 mb-8">
          <nav className="flex items-center gap-2 text-xs text-text-muted">
            <Link to="/" className="hover:text-accent transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            <a href="/#boutique" className="hover:text-accent transition-colors">Produits</a>
            <ChevronRight size={12} />
            <span className="text-text-light">{product.name}</span>
          </nav>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-5 lg:gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="relative">
              {product.is_best_value && (
                <div className="absolute top-4 left-4 bg-[#8B7355] text-white text-xs font-bold px-4 py-1.5 rounded-md z-10 shadow-lg">
                  Meilleur choix
                </div>
              )}
              {emotionalBadge && !product.is_best_value && (
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border border-surface-border text-text-light px-3 py-1.5 rounded text-[10px] font-bold tracking-widest z-10 uppercase shadow-lg">
                  {emotionalBadge}
                </div>
              )}
                <ProductGallery images={product.images && product.images.length > 0 ? product.images : (product.image_url ? [product.image_url] : [])} productName={product.name} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }} className="flex flex-col">
              {stockMessage && (
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-background border border-surface-border text-text-light">
                    {stockMessage}
                  </span>
                </div>
              )}

              {product.tagline && (
                <span className="text-accent text-sm font-semibold uppercase tracking-[0.2em] mb-2">
                  {product.tagline}
                </span>
              )}

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-text mb-2 leading-tight">{product.name}</h1>
              {product.tagline_subtitle && (
                <p className="text-sm text-text-muted italic mb-4">{product.tagline_subtitle}</p>
              )}

              {reviewStats.total > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={reviewStats.moyenne} size={16} />
                  <span className="text-sm text-text-muted">
                    {reviewStats.moyenne.toFixed(1)} · {reviewStats.total} avis
                  </span>
                </div>
              )}

              <div className="product-price-container">
                <div className="flex items-baseline gap-4">
                  <span className="product-price-current">{formatPrice(product.price)}</span>
                  {product.stock > 0 ? (
                    <span className="text-sm text-text-muted">{stockMessage || 'En stock'}</span>
                  ) : (
                    <span className="text-sm text-red-400 font-medium">Rupture de stock</span>
                  )}
                </div>
                {product.price_per_unit && product.unit_label && (
                  <p className="text-xs text-text-muted mt-[-0.25rem]">
                    soit {formatPrice(product.price_per_unit)} / {product.unit_label === 'pre-roule' ? 'pré-roulé' : product.unit_label}
                  </p>
                )}
              </div>

              {product.competitor_label && (
                (() => {
                  if (!product.competitor_price) {
                    return (
                      <div className="mb-6 p-5 rounded-2xl border border-surface-border bg-surface/30 backdrop-blur-sm">
                         <p className="text-sm text-[#e8e8e8] font-medium leading-relaxed">{product.competitor_label}</p>
                      </div>
                    );
                  }
                  
                  const compPrice = Number(product.competitor_price);
                  const pPrice = Number(product.price);
                  const pPriceUnit = Number(product.price_per_unit);

                  const hasGlobalComparison = product.competitor_price && compPrice > pPrice;
                  const hasUnitComparison = !hasGlobalComparison && product.price_per_unit && product.competitor_price && compPrice > pPriceUnit;

                  let savingsAmount = 0;
                  let isCheaper = false;

                  if (hasGlobalComparison) {
                    savingsAmount = compPrice - pPrice;
                    isCheaper = true;
                  } else if (hasUnitComparison) {
                    savingsAmount = compPrice - pPriceUnit;
                    isCheaper = true;
                  }
                  
                  if (!isCheaper) return null;

                  return (
                    <div className="mb-6 p-5 rounded-2xl border border-surface-border bg-surface/30 backdrop-blur-sm">
                      <div className="product-price-competitor-container">
                        <span className="product-price-competitor-label">Moyenne observée ailleurs :</span>
                        <span className="product-price-competitor">{formatPrice(product.competitor_price)}</span>
                      </div>
                      
                      <div className="mt-3 flex flex-col gap-2">
                        <div className="product-price-savings">
                          Économie estimée : {formatPrice(savingsAmount)} (-{Math.round((savingsAmount / product.competitor_price) * 100)}%)
                        </div>
                        <p className="price-comparison-note">
                          * {product.competitor_label} (comparaison indicative)
                        </p>
                      </div>
                    </div>
                  );
                })()
              )}

              <div className="flex flex-col gap-5 mb-6 mt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-surface-border rounded-xl overflow-hidden bg-surface">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-3 text-text hover:bg-surface-light hover:text-accent transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="px-6 py-3 font-medium text-lg min-w-[56px] text-center text-text font-serif">{quantity}</span>
                    <button onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))} className="px-4 py-3 text-text hover:bg-surface-light hover:text-accent transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddToCart} disabled={product.stock <= 0} className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-medium text-lg transition-all duration-300 shadow-lg ${
                    added ? 'bg-[#8b1a1a] text-white shadow-[#8b1a1a]/25' : product.stock > 0 ? 'bg-[#8b1a1a] text-white hover:bg-[#6e1515] shadow-[#8b1a1a]/25' : 'bg-surface text-text-muted cursor-not-allowed shadow-none'
                  }`}>
                    <AnimatePresence mode="wait">
                      {added ? (
                        <motion.span key="added" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                          <CheckCircle2 size={20} /> Ajouté !
                        </motion.span>
                      ) : (
                        <motion.span key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                          <ShoppingCart size={20} /> Ajouter au panier
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <button onClick={handleBuyNow} disabled={product.stock <= 0} className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-medium text-lg bg-primary text-white hover:bg-primary-dark transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed">
                    <Zap size={18} /> Commander maintenant
                  </button>
                </div>
              </div>

              <div className="text-text-light font-light leading-relaxed text-base mb-6">
                <UseCasePills useCases={product.use_cases} className="mb-4" />
                {isCoffretDescription ? formatCoffretDescription(product.short_description || product.description) : (product.short_description || product.description)}
              </div>
              
              {product.categorie === 'pre-roules' && (
                <p className="text-xs text-text-muted mb-8 -mt-4 italic">
                  Ce produit ne contient ni tabac ni nicotine. Vente réservée aux personnes majeures.
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                  { icon: <ShieldCheck size={18} />, label: 'Sans nicotine' },
                  { icon: <Package size={18} />, label: 'Expédition sous 24h' },
                  { icon: <Lock size={18} />, label: 'Paiement sécurisé' },
                  { icon: isTea ? <Gift size={18} /> : <Wind size={18} />, label: isTea ? 'Coffrets soignés' : 'Rituel discret' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center text-center gap-2 p-4 bg-surface/50 rounded-xl border border-surface-border">
                    <span className="text-accent">{item.icon}</span>
                    <span className="text-[11px] text-text-muted leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex border-b border-surface-border mb-8 gap-1 overflow-x-auto scrollbar-hide">
              {[
                { key: 'description', label: 'Description' },
                { key: 'composition', label: 'Composition' },
                { key: 'utilisation', label: 'Utilisation' },
                ...(reviewStats.total > 0 ? [{ key: 'reviews', label: `Avis clients (${reviewStats.total})` }] : []),
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`relative px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.key ? 'text-accent' : 'text-text-muted hover:text-text-light'}`}>
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className={activeTab === 'reviews' ? '' : 'max-w-3xl'}>
                {activeTab === 'reviews' ? <ProductReviews productId={id} user={user} /> : tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </section>

        {ritualSuggestions.length > 0 && (
          <section className="py-14 bg-background">
            <div className="max-w-7xl mx-auto px-6">
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
                <p className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-2">Suggestion</p>
                <h2 className="text-2xl md:text-3xl font-serif text-text">Complétez votre rituel</h2>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ritualSuggestions.map((item) => {
                  const image =
                    item?.images && item.images.length > 0
                      ? item.images[0]
                      : (item.image_url || '/placeholders/product-default.png');
                  const outOfStock = Number(item.stock) <= 0;

                  return (
                    <Link
                      key={item.id}
                      to={`/produit/${item.id}`}
                      className="group bg-surface border border-surface-border rounded-2xl overflow-hidden hover:border-accent/30 transition-colors"
                    >
                      <div className="flex gap-4 p-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-background border border-surface-border shrink-0">
                          <img src={image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-between">
                          <div className="min-w-0">
                            <h3 className="font-serif text-text text-lg leading-snug truncate">{item.name}</h3>
                            <p className="text-text-muted text-sm mt-1">
                              {item.short_description || item.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-3 mt-3">
                            <p className="text-accent font-serif text-lg">{formatPrice(item.price)}</p>
                            <button
                              type="button"
                              disabled={outOfStock}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddSuggestedProduct(item);
                              }}
                              className={`h-9 px-3 rounded-xl text-sm font-medium transition-colors ${
                                outOfStock
                                  ? 'bg-surface-light text-text-muted border border-surface-border cursor-not-allowed'
                                  : 'bg-[#8b1a1a] text-white hover:bg-[#6e1515]'
                              }`}
                            >
                              Ajouter au panier
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="mt-24 py-20 bg-background-light relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <span className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4 block">
                {isTea ? 'Le moment calme' : 'Le geste autrement'}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-text mb-4">
                {isTea ? "Une routine d'infusion simple à installer" : 'Une base végétale pensée pour la transition'}
              </h2>
              <p className="text-text-light font-light max-w-2xl mx-auto text-lg">
                {isTea
                  ? "Des compositions courtes, un usage lisible et des formats qui s'adaptent facilement aux soirs chargés comme aux pauses lentes."
                  : "Des références faites pour conserver le rituel tout en simplifiant la composition et en gardant un repère clair : sans nicotine."}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Leaf className="w-8 h-8 text-primary" />,
                  title: isTea ? 'Mélanges lisibles' : 'Feuilles de framboisier',
                  description: isTea ? 'Des plantes identifiées clairement, sans narration floue.' : 'Une base végétale douce, sélectionnée pour accompagner le geste.',
                },
                {
                  icon: <ShieldCheck className="w-8 h-8 text-accent" />,
                  title: 'Sans nicotine',
                  description: "Un point de repère simple pour différencier la gamme et garder une lecture claire du produit.",
                },
                {
                  icon: <Clock className="w-8 h-8 text-primary" />,
                  title: isTea ? 'Rituel du soir' : 'Format quotidien',
                  description: isTea ? 'Des formats vrac ou infusettes faciles à intégrer à une routine calme.' : 'Des formats vrac, pré-roulés et coffrets adaptés aux usages du quotidien.',
                },
                {
                  icon: isTea ? <Gift className="w-8 h-8 text-accent" /> : <Wind className="w-8 h-8 text-accent" />,
                  title: isTea ? 'Prêt à offrir' : 'Composition plus simple',
                  description: isTea ? 'Boites, pochons et coffrets soignes pour soi ou pour offrir.' : 'Moins de surcharge, plus de lisibilite, dans un conditionnement propre.',
                },
              ].map((item) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface p-8 rounded-2xl border border-surface-border text-center hover:border-accent/20 transition-all duration-500">
                  <div className="inline-flex p-4 bg-primary/10 rounded-full mb-5">{item.icon}</div>
                  <h3 className="text-xl font-serif font-semibold mb-3 text-text">{item.title}</h3>
                  <p className="text-text-light font-light leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-text-light font-light mb-6">
              Vous avez des questions ? Écrivez-nous à <strong className="text-accent">contact@doiryshop.fr</strong>
            </p>
            <Link to="/" className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-light transition-colors">
              <ArrowLeft size={16} /> Voir tous nos produits
            </Link>
          </div>
        </section>
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-surface-border p-4 flex items-center gap-3 sm:hidden">
        <div className="flex-1">
          <p className="font-serif font-medium text-accent text-lg">{formatPrice(product.price)}</p>
          <p className="text-[11px] text-text-muted">{product.stock > 0 ? 'En stock' : 'Rupture'}</p>
        </div>
        <button onClick={handleAddToCart} disabled={product.stock <= 0} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-all ${
          added ? 'bg-[#8b1a1a] text-white' : product.stock > 0 ? 'bg-[#8b1a1a] text-white hover:bg-[#6e1515] shadow-lg shadow-[#8b1a1a]/25' : 'bg-surface text-text-muted cursor-not-allowed'
        }`}>
          {added ? <><CheckCircle2 size={18} /> Ajouté !</> : <><ShoppingCart size={18} /> Ajouter au panier</>}
        </button>
      </div>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems} 
        products={suggestions} 
        onAddProduct={handleAddSuggestedProduct} 
        onRemove={(id) => setCartItems(prev => prev.filter(item => item.id !== id))} 
        onUpdateQuantity={(id, change) => {
          setCartItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            const nextQ = item.quantity + change;
            return nextQ > 0 ? { ...item, quantity: nextQ } : null;
          }).filter(Boolean));
        }} 
        onCheckout={() => navigate('/checkout')} 
      />
    </>
  );
};

export default ProductDetail;
