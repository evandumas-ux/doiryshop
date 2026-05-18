import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, ShieldCheck, Hand, Menu, X, ArrowRight, ShoppingCart, 
  CheckCircle2, MoonStar, Filter
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts, subscribeNewsletter } from '../services/api';
import SEO from '../components/SEO';
import UseCasePills from '../components/UseCasePills';
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';
import ProductCard from '../components/ProductCard';
import FAQ from '../components/FAQ';

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (!tags) return [];
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
};

const isMatchingCategory = (product, category) => {
  if (category === 'all') return true;
  const tags = parseTags(product.tags);
  if (category === 'substitut') return tags.includes('substitut');
  return product.categorie === category || tags.includes(category);
};

const Hero = () => (
  <section id="hero" className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh] items-center bg-black">
    {/* Gauche : Logo plein écran vertical */}
    <div className="bg-black relative flex items-center justify-center min-h-[50vh] md:min-h-[80vh] h-full overflow-hidden">
      <img
        src="/logo.jpg"
        alt="Doiryshop"
        className="w-full h-[45vh] md:h-[60vh] object-cover object-center animate-fade-in animate-float"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)'
        }}
      />
    </div>

    {/* Droite : Texte hero */}
    <div className="flex flex-col justify-center gap-6 px-5 py-10 md:px-[80px] md:py-[60px] text-center md:text-left items-center md:items-start bg-black h-full">
      <h1 className="text-[2rem] md:text-[3rem] font-serif text-white leading-[1.1] text-center md:text-left animate-fade-slide-up">
        RETROUVEZ LE CALME.<br />
        NATURELLEMENT.
      </h1>

      <p className="text-[1.1rem] text-[#ccc] leading-[1.6] max-w-[420px] animate-fade-slide-up delay-200">
        Plantes séchées artisanales et rituels sans nicotine pour ralentir sereinement.
      </p>

      <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 mt-2 w-full md:w-auto justify-center md:justify-start animate-fade-slide-up delay-400">
        <a href="#boutique" className="bg-primary text-white px-8 py-4 rounded-full text-base font-medium transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2 group btn-primary-glow">
          Découvrir nos produits <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </a>
        <a href="#gammes" className="text-white font-medium hover:text-accent transition-colors px-6 py-4 border border-surface-border rounded-full w-full sm:w-auto text-center btn-secondary-glow">
          Voir nos gammes
        </a>
      </div>
    </div>
  </section>
);

const WhyDoiryshop = () => {
  const items = [
    {
      icon: <Leaf className="w-8 h-8 text-primary" />,
      title: '100% plantes naturelles',
      description: 'Aucune nicotine, aucun additif. Juste des plantes sélectionnées avec soin.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: 'Cultivé en France et en Europe',
      description: 'Des plantes tracées, sans pesticides, récoltées dans le respect de la terre.',
    },
    {
      icon: <Hand className="w-8 h-8 text-primary" />,
      title: 'Fabriqué à la main',
      description: 'Chaque pochon, chaque sachet assemblé avec soin dans notre atelier.',
    },
  ];

  return (
    <section id="pourquoi" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/bg_texture.png')] bg-cover bg-center opacity-[0.02] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4 block">Pourquoi Doiryshop</span>
          <h2 className="text-4xl font-serif mb-4 text-text">Un comptoir de plantes pour les rituels d'aujourd'hui</h2>
          <p className="text-text-light max-w-2xl mx-auto font-light">Des produits composés simplement, présentés clairement, et préparés avec la même attention du champ à l'atelier.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.12 }} className="flex flex-col items-center text-center p-8 rounded-2xl bg-surface border border-surface-border hover:border-accent/20 transition-all duration-500">
              <div className="p-4 bg-primary/10 rounded-full mb-6">{item.icon}</div>
              <h3 className="text-xl font-serif font-semibold mb-4 text-text">{item.title}</h3>
              <p className="text-text-light font-light leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Ranges = () => (
  <section id="gammes" className="pt-24 pb-12 bg-background-light relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('/bg_texture.png')] bg-cover bg-center opacity-[0.02] pointer-events-none" />
    <div className="max-w-6xl mx-auto px-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
        <span className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4 block">Nos gammes</span>
        <h2 className="text-4xl font-serif mb-4 text-text">Deux univers, un même tempo plus doux</h2>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-surface-border rounded-[28px] p-8">
          <div className="inline-flex items-center gap-2 text-accent text-sm uppercase tracking-[0.22em] mb-4">
            <Filter size={16} />
            Le Rituel
          </div>
          <h3 className="text-3xl font-serif text-text mb-3">Plantes séchées et infusions naturelles</h3>
          <p className="text-text-light font-light leading-relaxed mb-6">
            Pour celles et ceux qui aiment le geste, veulent ralentir et garder une routine plus simple, sans nicotine.
          </p>
          <ul className="space-y-3 text-sm text-text-light">
            <li className="flex gap-3"><CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" /> Base pure en vrac pour rouler à votre rythme</li>
            <li className="flex gap-3"><CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" /> Pré-roulés prêts à l'emploi pour les pauses rapides</li>
            <li className="flex gap-3"><CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" /> Coffret complet pour entamer la transition</li>
          </ul>
        </div>

        <div className="bg-surface border border-surface-border rounded-[28px] p-8">
          <div className="inline-flex items-center gap-2 text-accent text-sm uppercase tracking-[0.22em] mb-4">
            <MoonStar size={16} />
            L'Apaisement
          </div>
          <h3 className="text-3xl font-serif text-text mb-3">Tisanes et infusions du soir</h3>
          <p className="text-text-light font-light leading-relaxed mb-6">
            Des mélanges de plantes pour accompagner les fins de journée, les routines calmes et les cadeaux bien choisis.
          </p>
          <ul className="space-y-3 text-sm text-text-light">
            <li className="flex gap-3"><CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" /> Infusion en vrac pour doser librement</li>
            <li className="flex gap-3"><CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" /> Infusettes pratiques pour la maison ou le bureau</li>
            <li className="flex gap-3"><CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" /> Coffret sérénité prêt à offrir</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const Products = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'pre-roules', label: 'Pré-roulés' },
    { id: 'vrac', label: 'En vrac' },
    { id: 'kits', label: 'Kits & coffrets' },
    { id: 'tisanes', label: 'Tisanes & infusions' },
    { id: 'substitut', label: 'Sans nicotine' },
  ];

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((product) => isMatchingCategory(product, activeCategory)),
    [products, activeCategory]
  );

  if (loading) {
    return (
      <section id="boutique" className="pt-12 pb-24 bg-background-light flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section id="boutique" className="pt-12 pb-24 bg-background-light relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4 block">Boutique</span>
          <h2 className="text-4xl font-serif mb-4 text-text">Nos produits</h2>
          <p className="text-text-light max-w-2xl mx-auto font-light">Une sélection concise, lisible et faite pour accompagner un changement d'habitude sans bruit inutile.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-surface-border overflow-x-auto scrollbar-hide max-w-full">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeCategory === category.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:text-text hover:bg-surface-light'
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          <p className="text-text-muted text-xs mt-3 font-light">
            {`${filteredProducts.length} produit${filteredProducts.length > 1 ? 's' : ''} trouvé${filteredProducts.length > 1 ? 's' : ''}`}
          </p>
        </motion.div>

        <motion.div layout className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

const BrandStorySection = () => {
  return (
    <section className="py-20 bg-[#111]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-text-light leading-8">
          Peu à peu, ce qui était personnel est devenu évident.
          <br />
          Si cela pouvait exister pour eux, cela pouvait exister pour d'autres.
          <br />
          Doiryshop est né de cette transition.
          <br />
          Ce n'est pas une promesse. C'est une continuité.
        </p>
        <Link
          to="/about"
          className="inline-block mt-8 text-accent hover:text-accent-light transition-colors underline underline-offset-4"
        >
          Notre histoire complète
        </Link>
      </div>
    </section>
  );
};

export const Landing = ({ cartItems, setCartItems, user, setUser, onLogout }) => {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitEmail, setExitEmail] = useState('');
  const [exitStatus, setExitStatus] = useState('idle');

  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    getProducts()
      .then((data) => setAllProducts(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (document.cookie.includes('doiry_exit_popup_seen=true')) return;

    const handleMouseLeave = (event) => {
      if (event.clientY <= 0 && !document.cookie.includes('doiry_exit_popup_seen=true')) {
        setShowExitPopup(true);
        document.cookie = 'doiry_exit_popup_seen=true; max-age=2592000; path=/; SameSite=Lax';
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  const handleAddToCart = (product, options = {}) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { ...product, image: product.image_url, quantity: 1 }];
    });
    if (!options.keepDrawerClosed) setIsCartOpen(true);
  };

  const handleExitSubmit = async (event) => {
    event.preventDefault();
    if (!exitEmail.trim()) return;
    setExitStatus('loading');
    try {
      await subscribeNewsletter(exitEmail, 'exit_intent');
      setExitStatus('success');
    } catch {
      setExitStatus('error');
    }
  };

  const handleRemoveFromCart = (productId) => setCartItems((prev) => prev.filter((item) => item.id !== productId));

  const handleUpdateQuantity = (productId, change) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== productId) return item;
          const nextQuantity = item.quantity + change;
          return nextQuantity > 0 ? { ...item, quantity: nextQuantity } : null;
        })
        .filter(Boolean)
    );
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <SEO
        title="Plantes séchées artisanales et infusions apaisantes | Doiry Shop"
        description="Découvrez nos plantes séchées artisanales et infusions apaisantes. Feuilles de framboisier, pré-roulés, tisanes et coffrets artisanaux."
        url="https://doiryshop.fr/"
        type="website"
      />
      <Header onOpenCart={() => setIsCartOpen(true)} onOpenLogin={() => navigate('/login')} onLogout={onLogout} cartItemsCount={cartItemsCount} user={user} />
      <Hero />
      <WhyDoiryshop />
      <Products onAddToCart={handleAddToCart} />
      <Ranges />
      <BrandStorySection />
      <FAQ />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} products={allProducts} onAddProduct={handleAddToCart} onRemove={handleRemoveFromCart} onUpdateQuantity={handleUpdateQuantity} onCheckout={handleCheckout} />
      <AnimatePresence>
        {showExitPopup && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExitPopup(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.2 }} className="relative w-full max-w-md bg-surface border border-surface-border rounded-2xl p-6 shadow-2xl">
              <button onClick={() => setShowExitPopup(false)} className="absolute right-4 top-4 text-text-muted hover:text-text">
                <X size={20} />
              </button>
              <h2 className="text-3xl font-serif text-text mb-2">Avant de partir...</h2>
              <p className="text-accent font-medium mb-5">-10% sur ta première commande</p>
              {exitStatus === 'success' ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                  <p className="text-text-light mb-1">Ton code :</p>
                  <p className="text-2xl font-serif text-emerald-400">BIENVENUE10</p>
                </div>
              ) : (
                <form onSubmit={handleExitSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={exitEmail}
                    onChange={(event) => setExitEmail(event.target.value)}
                    placeholder="Ton email"
                    required
                    className="w-full px-4 h-12 bg-background border border-surface-border rounded-xl focus:outline-none focus:border-primary text-text placeholder:text-text-muted"
                  />
                  <button type="submit" disabled={exitStatus === 'loading'} className="w-full h-12 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-60">
                    Obtenir mon code
                  </button>
                  {exitStatus === 'error' && <p className="text-primary text-sm">Impossible d'enregistrer cet email pour le moment.</p>}
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
