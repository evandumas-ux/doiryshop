import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import SEO from '../components/SEO';
import { getProducts } from '../services/api';
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';
import ProductCard from '../components/ProductCard';

const isMatchingCategory = (product, category) => {
  if (category === 'all') return true;
  const parseTags = (tags) => {
    if (Array.isArray(tags)) return tags;
    if (!tags) return [];
    try { return JSON.parse(tags); } catch { return []; }
  };
  const tags = parseTags(product.tags);
  if (category === 'substitut') return tags.includes('substitut');
  return product.categorie === category || tags.includes(category);
};

export default function Boutique({ setCartItems, cartItems = [], user, setUser, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const cartItemsCount = (cartItems || []).reduce((acc, item) => acc + item.quantity, 0);

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
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((product) => isMatchingCategory(product, activeCategory)),
    [products, activeCategory]
  );

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

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Boutique | Doiry Shop"
        description="Découvrez tous les produits Doiry Shop."
        url="https://doiryshop.com/boutique"
      />

      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => navigate('/login')}
        onLogout={onLogout}
        cartItemsCount={cartItemsCount}
        user={user}
      />

      <main className="max-w-7xl mx-auto px-6 py-12 pt-32">
        <div className="text-center mb-16">
          <span className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4 block">Catalogue</span>
          <h1 className="text-4xl md:text-5xl font-serif text-text mb-4">Nos produits</h1>
          <p className="text-text-light font-light max-w-2xl mx-auto text-lg leading-relaxed">
            Une sélection concise, lisible et faite pour accompagner un changement d'habitude sans bruit inutile.
          </p>
        </div>

        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl border border-surface-border overflow-x-auto scrollbar-hide max-w-full">
            <div className="px-4 py-2 flex items-center gap-2 text-text-muted border-r border-surface-border mr-2 shrink-0">
              <Filter size={16} />
              <span className="text-xs font-semibold tracking-wider uppercase">Filtrer</span>
            </div>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${activeCategory === category.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:text-text hover:bg-surface-light'
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          <p className="text-text-muted text-xs mt-4 font-light italic">
            {`${filteredProducts.length} produit${filteredProducts.length > 1 ? 's' : ''} affiché${filteredProducts.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        products={products}
        onAddProduct={handleAddToCart}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={() => { setIsCartOpen(false); navigate('/checkout'); }}
      />
    </div>
  );
}


