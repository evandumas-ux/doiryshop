import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import SEO from '../components/SEO';
import { getProducts, getWholesalePricing } from '../services/api';
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';
import ProductCard from '../components/ProductCard';

const { div: MotionDiv } = motion;

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

export default function Boutique({ setCartItems, cartItems = [], user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wholesalePrices, setWholesalePrices] = useState({});
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

  useEffect(() => {
    if (user?.role !== 'b2b') return;

    getWholesalePricing()
      .then((prices) => setWholesalePrices(prices || {}))
      .catch(() => {});
  }, [user?.role]);

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

      <main className="max-w-7xl mx-auto px-8 py-24 pt-48">
        <div className="text-center mb-24">
          <span className="text-accent text-[11px] font-medium tracking-premium mb-6 block">Collection Exclusive</span>
          <h1 className="text-5xl md:text-6xl font-serif text-text mb-8 tracking-premium">Le Catalogue Doiry</h1>
          <p className="text-text-muted max-w-2xl mx-auto font-light text-lg leading-relaxed">
            Une sélection de rituels botaniques choisis avec une rigueur absolue pour accompagner vos moments de clarté.
          </p>
        </div>

        <div className="flex flex-col items-center mb-20">
          <div className="flex items-center gap-10 p-2 overflow-x-auto scrollbar-hide max-w-full">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`relative py-3 text-[12px] font-serif tracking-premium transition-all duration-700 whitespace-nowrap ${
                  activeCategory === category.id ? 'text-text' : 'text-text-muted hover:text-text-light'
                }`}
              >
                {category.label}
                {activeCategory === category.id && (
                  <MotionDiv
                    layoutId="activeFilterBoutique"
                    className="absolute -bottom-1 left-0 right-0 h-[1px] bg-accent"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                  />
                )}
              </button>
            ))}
          </div>
          <p className="text-text-muted text-[10px] mt-8 font-light italic tracking-premium">
            {`${filteredProducts.length} Rituel${filteredProducts.length > 1 ? 's' : ''} disponible${filteredProducts.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <MotionDiv className="grid md:grid-cols-2 lg:grid-cols-3 gap-16 max-w-7xl mx-auto">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} user={user} wholesalePrices={wholesalePrices} />
              ))}
            </AnimatePresence>
          </MotionDiv>
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


