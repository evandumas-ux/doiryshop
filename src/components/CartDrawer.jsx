import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, CheckCircle2, Plus, ShieldCheck, Truck, Lock } from 'lucide-react';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export const CartDrawer = ({ isOpen, onClose, cartItems, products, onAddProduct, onRemove, onUpdateQuantity, onCheckout }) => {
  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * parseInt(item.quantity)), 0);
  const freeShippingThreshold = 45;

  const totalWeight = cartItems.reduce((acc, item) => acc + (Number(item.weight || item.weight_g || 50) * parseInt(item.quantity)), 0);

  let shippingCost = 0;
  if (subtotal < freeShippingThreshold && cartItems.length > 0) {
    if (totalWeight <= 250) {
      shippingCost = 3.50;
    } else if (totalWeight <= 500) {
      shippingCost = 4.90;
    } else {
      shippingCost = 6.90; // Fallback
    }
  }

  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const crossSellProduct = remaining > 0
    ? products
        .filter(
          (product) =>
            Number(product.stock) > 0 &&
            !cartItems.some((item) => item.id === product.id) &&
            Number(product.price) >= remaining
        )
        .sort((a, b) => Number(a.price) - Number(b.price))[0]
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
            className="relative w-full max-w-md glass-premium h-full shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-serif text-accent tracking-wide">Votre Panier</h2>
              <button onClick={onClose} className="p-2 text-text-light hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-text-light space-y-4">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p className="font-light italic">Votre panier est vide.</p>
                  <button onClick={onClose} className="text-accent font-medium hover:underline tracking-premium text-[11px]">Découvrir nos produits</button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-white/20 transition-all group">
                    <div className="relative overflow-hidden rounded-xl bg-surface-light w-20 h-20 shrink-0">
                      <img src={item.image_url || item.image || '/product_pack.png'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <h4 className="font-serif font-medium text-text truncate pr-2">{item.name}</h4>
                          <p className="text-sm text-accent font-semibold">{formatPrice(item.price)}</p>
                        </div>
                        <button onClick={() => onRemove(item.id)} className="text-text-muted hover:text-primary transition-colors p-1"><Trash2 size={16} /></button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="px-3 py-1 text-text-light hover:text-white hover:bg-white/5 transition-colors">-</button>
                          <span className="text-xs font-bold w-6 text-center text-text">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)} className="px-3 py-1 text-text-light hover:text-white hover:bg-white/5 transition-colors">+</button>
                        </div>
                        <p className="text-xs font-medium text-text-muted">{formatPrice(parseFloat(item.price) * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 bg-white/5 backdrop-blur-2xl border-t border-white/10 space-y-6">
                <div className="space-y-3">
                  {subtotal >= freeShippingThreshold ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-400 text-[11px] font-bold tracking-premium bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-3 animate-pulse">
                      <CheckCircle2 size={14} /> Livraison Offerte Débloquée
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                          className="absolute top-0 left-0 h-full bg-accent shadow-[0_0_15px_rgba(201,168,76,0.6)]"
                        />
                      </div>
                      <p className="text-center text-[10px] text-text-light tracking-premium">
                        Plus que <span className="text-accent font-bold">{formatPrice(remaining)}</span> pour la <span className="font-bold">Livraison Offerte</span>
                      </p>
                      {crossSellProduct && (
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 shadow-sm group cursor-pointer hover:bg-white/10 transition-colors" onClick={() => onAddProduct(crossSellProduct, { keepDrawerOpen: true })}>
                          <img 
                            src={crossSellProduct.images?.[0] || crossSellProduct.image_url || '/product_pack.png'} 
                            alt={crossSellProduct.name} 
                            className="w-12 h-12 object-cover rounded-lg shrink-0 border border-white/10"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] text-text-muted tracking-premium font-bold mb-0.5">Compléter Mon Rituel</p>
                            <p className="text-xs text-text font-medium truncate">{crossSellProduct.name}</p>
                            <p className="text-xs text-accent font-bold mt-0.5">{formatPrice(crossSellProduct.price)}</p>
                          </div>
                          <div className="w-8 h-8 shrink-0 rounded-full bg-accent/20 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                            <Plus size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] tracking-premium text-text-muted">
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] tracking-premium text-text-muted">
                    <span>Livraison Estimée</span>
                    <span>{shippingCost === 0 ? <span className="text-emerald-400">Offerte</span> : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/10">
                    <span className="text-sm font-bold tracking-premium text-text">Total TTC</span>
                    <span className="text-2xl font-serif font-bold text-accent">{formatPrice(subtotal + shippingCost)}</span>
                  </div>
                </div>

                <button 
                  onClick={onCheckout} 
                  className="w-full py-4 bg-accent text-white rounded-xl font-bold tracking-premium text-[11px] hover:bg-accent-light transition-all transform hover:-translate-y-1 shadow-xl shadow-accent/20 active:scale-95"
                >
                  Valider Mon Panier
                </button>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col items-center text-center gap-1.5 opacity-60">
                    <ShieldCheck size={14} className="text-text-muted" />
                    <span className="text-[9px] text-text-muted leading-tight tracking-premium font-medium">Paiement 100% Sécurisé</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5 opacity-60">
                    <Truck size={14} className="text-text-muted" />
                    <span className="text-[9px] text-text-muted leading-tight tracking-premium font-medium">Livraison Discrète</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
