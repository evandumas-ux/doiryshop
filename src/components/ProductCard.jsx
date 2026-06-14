import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

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

const ProductCard = ({ product, onAddToCart }) => {
  const [added, setAdded] = useState(false);
  const tags = parseTags(product.tags);
  const stockMessage = getStockMessage(product.stock);
  const safeSlug = product.slug || '';

  const categoryMap = {
    'pre-roules': 'Pré-roulés',
    'vrac': 'En Vrac',
    'tisanes': 'Tisanes',
    'kits': 'Kits',
    'substitut': 'Substituts'
  };
  const displayCategory = categoryMap[product.categorie] || product.categorie;

  let emotionalBadge = null;
  if (safeSlug === 'elixir-nocturne-infusion-vrac' || safeSlug.includes('elixir-nocturne')) emotionalBadge = "Profil Apaisant";
  else if (safeSlug === 'coffret-transition-kit-roulage') emotionalBadge = "Assemblé À La Main";
  else if (tags.includes('pre-roules') || safeSlug.includes('pre-roules')) emotionalBadge = "Prêt À L'Emploi";
  else if (safeSlug === 'coffret-serenite-kit-detente') emotionalBadge = "Idéal Cadeau";

  const firstImage = (product.images && product.images.length > 0) ? product.images[0] : (product.image_url || '/placeholders/product-default.png');

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    onAddToCart(product, { keepDrawerClosed: true });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const compPrice = Number(product.competitor_price);
  const pPrice = Number(product.price);
  const pPriceUnit = Number(product.price_per_unit);

  const hasGlobalComparison = product.competitor_price && compPrice > pPrice;
  const hasUnitComparison = !hasGlobalComparison && product.price_per_unit && product.competitor_price && compPrice > pPriceUnit;

  let saving = 0;
  let percent = 0;
  let showComparison = false;

  if (hasGlobalComparison) {
    saving = compPrice - pPrice;
    percent = Math.round((saving / compPrice) * 100);
    showComparison = true;
  } else if (hasUnitComparison) {
    saving = compPrice - pPriceUnit;
    percent = Math.round((saving / compPrice) * 100);
    showComparison = true;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }} 
      className="group bg-neutral-900/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-accent/30 transition-all duration-700 relative flex flex-col hover:scale-[1.01] hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
    >
      {product.is_best_value && (
        <span className="absolute top-8 right-8 bg-accent text-background px-5 py-2 rounded-full text-[10px] font-bold tracking-premium z-10 shadow-xl">
          Sélection Premium
        </span>
      )}
      {emotionalBadge && !product.is_best_value && (
        <span className="absolute top-8 right-8 bg-white/5 backdrop-blur-xl border border-white/10 text-text-light px-5 py-2 rounded-full text-[10px] font-medium tracking-premium z-10">
          {emotionalBadge}
        </span>
      )}
      
      <Link to={`/produit/${product.id}`} className="block cursor-pointer flex-1 flex flex-col">
        <div className="aspect-[4/3] overflow-hidden relative">
          <img 
            src={firstImage} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out opacity-90 group-hover:opacity-100" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
        </div>
        
        <div className="px-12 pb-6 flex-1 flex flex-col">
          <div className="flex flex-wrap gap-3 -mt-5 relative z-10 mb-10">
            <span className="text-[10px] tracking-premium px-5 py-2 rounded-full bg-background/80 backdrop-blur-md border border-white/5 text-neutral-200 font-medium">
              {displayCategory}
            </span>
            {stockMessage && (
              <span className="text-[10px] tracking-premium px-5 py-2 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 text-primary-light font-bold">
                {stockMessage}
              </span>
            )}
          </div>

          <div className="pb-10 border-b border-white/5 mb-10">
            <h3 className="text-2xl md:text-3xl font-serif text-text leading-tight tracking-premium">{product.name}</h3>
            {product.tagline && <p className="text-[11px] text-accent/80 font-medium tracking-premium mt-4">{product.tagline}</p>}
          </div>

          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-baseline gap-6">
              <div className="text-3xl md:text-4xl font-serif text-text tracking-premium whitespace-nowrap flex items-baseline gap-1">
                <span>{Number(product.price || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-2xl text-text/80">€</span>
              </div>
              {showComparison && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-4 whitespace-nowrap">
                    <span className="text-base text-neutral-200 line-through tracking-premium font-light flex items-baseline gap-1">
                      <span>{Number(product.competitor_price || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span>€</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold tracking-premium">-{percent}%</span>
                  </div>
                  <span className="text-[7px] md:text-[8px] text-neutral-500 uppercase tracking-[0.2em] leading-none mt-1 whitespace-nowrap">Moyenne concurrents</span>
                </div>
              )}
            </div>
            {product.price_per_unit && product.unit_label && (
              <p className="text-[10px] text-neutral-200 tracking-premium font-light italic whitespace-nowrap">
                {Number(product.price_per_unit || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / {product.unit_label === 'pre-roule' ? 'unité' : product.unit_label}
              </p>
            )}
          </div>

          <p className="text-text-light font-light leading-relaxed text-base line-clamp-2 h-12 mb-10">{product.short_description || product.description}</p>
        </div>
      </Link>

      <div className="px-12 pb-12 mt-auto">
        <button
          onClick={handleAddClick}
          disabled={product.stock <= 0}
          className={`w-full py-6 rounded-2xl text-[11px] tracking-premium font-bold transition-all duration-700 group/btn relative overflow-hidden ${
            product.stock <= 0
              ? 'bg-white/5 text-neutral-200 border border-white/5 cursor-not-allowed'
              : added
                ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/20'
                : 'bg-text text-background hover:bg-accent hover:text-background hover:shadow-2xl hover:shadow-accent/20'
          }`}
        >
          <span className="relative z-10 flex items-center justify-center gap-4">
            {product.stock <= 0 ? 'En Rupture' : added ? '✓ Produit Ajouté' : (
              <>
                <ShoppingCart size={16} />
                Ajouter au Panier
              </>
            )}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
