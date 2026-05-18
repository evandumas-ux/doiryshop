import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import UseCasePills from './UseCasePills';

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
  if (safeSlug === 'elixir-nocturne-infusion-vrac' || safeSlug.includes('elixir-nocturne')) emotionalBadge = "PROFIL APAISANT";
  else if (safeSlug === 'coffret-transition-kit-roulage') emotionalBadge = "ASSEMBLÉ À LA MAIN";
  else if (tags.includes('pre-roules') || safeSlug.includes('pre-roules')) emotionalBadge = "PRÊT À L'EMPLOI";
  else if (safeSlug === 'coffret-serenite-kit-detente') emotionalBadge = "IDÉAL CADEAU";

  const firstImage = (product.images && product.images.length > 0) ? product.images[0] : (product.image_url || '/placeholders/product-default.png');

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    onAddToCart(product, { keepDrawerClosed: true });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="group bg-surface rounded-[28px] overflow-hidden border border-surface-border hover:border-accent/20 transition-all duration-500 relative flex flex-col">
      {product.is_best_value && (
        <span className="absolute top-4 right-4 bg-primary text-white px-3 py-1.5 rounded text-[10px] font-bold tracking-widest z-10">
          SÉLECTION PREMIUM
        </span>
      )}
      {emotionalBadge && !product.is_best_value && (
        <span className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border border-surface-border text-text-light px-3 py-1.5 rounded text-[10px] font-bold tracking-widest z-10 uppercase">
          {emotionalBadge}
        </span>
      )}
      <Link to={`/produit/${product.id}`} className="block cursor-pointer">
        <div className="aspect-[4/3] bg-background overflow-hidden relative">
          <img src={firstImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/70 via-transparent to-transparent" />
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-background border border-surface-border text-text-light">
              {displayCategory}
            </span>
            {stockMessage && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-background border border-surface-border text-text-light">
                {stockMessage}
              </span>
            )}
          </div>
          <div className="flex justify-between gap-4 items-start mb-4">
            <div>
              <h3 className="text-2xl font-serif mb-1 text-text">{product.name}</h3>
              {product.tagline && <p className="text-sm text-accent font-medium tracking-widest uppercase">{product.tagline}</p>}
              {product.tagline_subtitle && <p className="text-sm text-text-muted italic mt-1 leading-snug">{product.tagline_subtitle}</p>}
            </div>
            <div className="text-right shrink-0">
              <div className="product-price-current !text-xl !font-serif !text-accent after:!hidden">{formatPrice(product.price)}</div>
              {product.price_per_unit && product.unit_label && (
                <p className="text-[11px] text-text-muted mt-1">
                  soit {formatPrice(product.price_per_unit)} / {product.unit_label === 'pre-roule' ? 'pré-roulé' : product.unit_label}
                </p>
              )}
            </div>
          </div>

          {product.competitor_price && Number(product.competitor_price) > Number(product.price) && (
            <div className="competitor-block mb-4 p-3 rounded-xl border border-surface-border bg-surface-light text-xs">
              <div className="flex justify-between text-text-muted mb-1">
                <span>{product.competitor_label || 'Moyenne observée ailleurs :'}</span>
                <span className="line-through">{formatPrice(product.competitor_price)}</span>
              </div>
              <div className="flex justify-between text-green-400 font-medium">
                <span>{product.savings_label || 'Économie estimée :'}</span>
                <span className="savings">{formatPrice(Number(product.competitor_price) - Number(product.price))} (-{Math.round((1 - product.price/product.competitor_price) * 100)}%)</span>
              </div>
            </div>
          )}

          <UseCasePills useCases={product.use_cases} limit={2} className="mb-4" />

          <p className="text-text-light font-light leading-relaxed">{product.short_description || product.description}</p>
        </div>
      </Link>

      <div className="px-6 pb-6 mt-auto">
        <button
          onClick={handleAddClick}
          disabled={product.stock <= 0}
          className={`w-full py-4 rounded-xl font-medium transition-all ${
            product.stock <= 0
              ? 'bg-surface-light text-text-muted border border-surface-border cursor-not-allowed'
              : added
                ? 'bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/20'
                : 'bg-[#8b1a1a] text-white hover:bg-[#6e1515] shadow-md shadow-[#8b1a1a]/20'
          }`}
        >
          {product.stock <= 0 ? 'Rupture de stock' : added ? '✓ Ajouté !' : 'Ajouter au panier'}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
