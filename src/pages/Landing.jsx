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
import PremiumStory from '../components/PremiumStory';
import ErrorBoundary from '../components/ErrorBoundary';

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
      <section id="boutique" className="pt-24 pb-48 flex items-center justify-center min-h-[600px]">
        <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section id="boutique" className="pt-32 pb-48 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-accent/5 rounded-full blur-[250px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-24">
          <span className="text-accent text-[11px] font-medium tracking-premium mb-6 block">Collection Exclusive</span>
          <h2 className="text-5xl md:text-6xl font-serif mb-8 text-text tracking-premium">Le Catalogue Doiry</h2>
          <p className="text-neutral-200 max-w-2xl mx-auto font-light text-lg leading-relaxed">Une sélection de rituels botaniques choisis avec une rigueur absolue pour accompagner vos moments de clarté.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center mb-20">
          <div className="flex items-center gap-10 p-2 overflow-x-auto scrollbar-hide max-w-full">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`relative py-3 text-[12px] font-serif tracking-premium transition-all duration-700 whitespace-nowrap ${
                  activeCategory === category.id 
                    ? 'text-text' 
                    : 'text-neutral-200 hover:text-text-light'
                }`}
              >
                {category.label}
                {activeCategory === category.id && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute -bottom-1 left-0 right-0 h-[1px] bg-accent"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                  />
                )}
              </button>
            ))}
          </div>
          <p className="text-neutral-200 text-[10px] mt-8 font-light italic tracking-premium">
            {`${filteredProducts.length} Rituel${filteredProducts.length > 1 ? 's' : ''} disponible${filteredProducts.length > 1 ? 's' : ''}`}
          </p>
        </motion.div>

        <motion.div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
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
    <section id="notre-histoire" className="py-48 bg-black/40 backdrop-blur-sm border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 studio-lighting pointer-events-none" />
      <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
        <span className="text-accent text-[11px] font-medium tracking-[0.5em] uppercase mb-12 block">Notre philosophie</span>
        <h2 className="text-4xl md:text-5xl font-serif text-text mb-12 tracking-tight leading-snug">
          La transition n'est pas une rupture, c'est une continuité.
        </h2>
        <div className="space-y-8 text-lg font-light text-text-light leading-relaxed max-w-2xl mx-auto">
          <p>
            Doiry est né d'un constat personnel devenu une évidence universelle : le besoin de préserver le geste tout en changeant l'intention.
          </p>
          <p>
            Chaque plante est sélectionnée avec une discipline rigide pour garantir une pureté totale et une expérience sensorielle sans compromis.
          </p>
        </div>
        <Link
          to="/about"
          className="inline-flex items-center gap-4 mt-20 text-accent hover:text-accent-light transition-all font-serif tracking-premium group"
        >
          Découvrir notre histoire <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>
    </section>
  );
};

const GammesSection = () => {
  return (
    <section id="gammes" className="bg-black relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-hieroglyphs opacity-5 pointer-events-none" />
      
      {/* Universe 01: Le Rituel */}
      <div className="flex flex-col lg:flex-row items-stretch min-h-[850px] border-b border-white/5 relative z-10">
        <div className="flex-1 p-16 lg:p-32 flex flex-col justify-center">
          <span className="text-accent text-[11px] font-medium tracking-[0.8em] mb-12 block uppercase opacity-60">Série 01</span>
          <h2 className="text-6xl md:text-8xl font-serif text-text mb-16 leading-[0.9] tracking-tighter">Le Rituel</h2>
          <p className="text-neutral-200 text-xl md:text-2xl font-light leading-relaxed mb-20 max-w-xl">
            Accompagner le geste, préserver le sens. Une gamme pensée pour la transition pure, centrée sur la clarté de la feuille de framboisier.
          </p>
          <ul className="space-y-10 max-w-md">
            {[
              "100% Botanique & Naturel",
              "Zéro Nicotine, Zéro Tabac",
              "Combustion lente & harmonieuse",
              "Gestuelle intacte, esprit libre"
            ].map((item, i) => (
              <li key={i} className="group cursor-default">
                <span className="text-sm font-serif text-neutral-200 tracking-premium block mb-5 group-hover:text-text transition-colors duration-500">{item}</span>
                <div className="h-px w-full bg-white/5 group-hover:bg-accent/30 transition-all duration-1000" />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 bg-neutral-900 relative overflow-hidden group border-l border-white/5">
           <img 
             src="/images/pack-5-open.png" 
             alt="Le Rituel" 
             className="w-full h-full object-cover opacity-60 brightness-[1.30] contrast-[1.02] transition-all duration-[3000ms] ease-out group-hover:scale-105 group-hover:opacity-90" 
           />
           <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent lg:block hidden" />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent lg:hidden" />
        </div>
      </div>

      {/* Universe 02: L'Apaisement */}
      <div className="flex flex-col lg:flex-row-reverse items-stretch min-h-[850px] relative z-10">
        <div className="flex-1 p-16 lg:p-32 flex flex-col justify-center">
          <span className="text-accent text-[11px] font-medium tracking-[0.8em] mb-12 block uppercase opacity-60 text-right">Série 02</span>
          <h2 className="text-6xl md:text-8xl font-serif text-text mb-16 leading-[0.9] tracking-tighter text-right">L'Apaisement</h2>
          <p className="text-neutral-200 text-xl md:text-2xl font-light leading-relaxed mb-20 max-w-xl ml-auto text-right">
            Ancrer le corps, calmer l'esprit. Des infusions et rituels profonds pour les moments de retour à soi et de sérénité absolue.
          </p>
          <ul className="space-y-10 max-w-md ml-auto text-right">
            {[
              "Mélanges de fleurs entières",
              "Séchage lent & artisanal",
              "Sérénité & Détente profonde",
              "Sans aucun agent de texture"
            ].map((item, i) => (
              <li key={i} className="group cursor-default">
                <span className="text-sm font-serif text-neutral-200 tracking-premium block mb-5 group-hover:text-text transition-colors duration-500">{item}</span>
                <div className="h-px w-full bg-white/5 group-hover:bg-accent/30 transition-all duration-1000" />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 bg-neutral-900 relative overflow-hidden group border-r border-white/5">
           <img 
             src="/images/vracthe.png" 
             alt="L'Apaisement" 
             className="w-full h-full object-cover opacity-60 brightness-[1.30] contrast-[1.02] transition-all duration-[3000ms] ease-out group-hover:scale-105 group-hover:opacity-90" 
           />
           <div className="absolute inset-0 bg-gradient-to-l from-black via-transparent to-transparent lg:block hidden" />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent lg:hidden" />
        </div>
      </div>
    </section>
  );
};

export const Landing = ({ cartItems, setCartItems, user, setUser, onLogout }) => {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    getProducts()
      .then((data) => setAllProducts(data))
      .catch(() => {});
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
        url="https://doiryshop.com/"
        type="website"
      />
      <Header onOpenCart={() => setIsCartOpen(true)} onOpenLogin={() => navigate('/login')} onLogout={onLogout} cartItemsCount={cartItemsCount} user={user} />
      <ErrorBoundary>
        <PremiumStory 
          product={allProducts.find(p => p.id === 11 || p.name.includes("L'Essentiel"))} 
          onAddToCart={handleAddToCart} 
        />
      </ErrorBoundary>
      <GammesSection />
      <Products onAddToCart={handleAddToCart} />
      <BrandStorySection />
      <FAQ />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} products={allProducts} onAddProduct={handleAddToCart} onRemove={handleRemoveFromCart} onUpdateQuantity={handleUpdateQuantity} onCheckout={handleCheckout} />
    </>
  );
};
