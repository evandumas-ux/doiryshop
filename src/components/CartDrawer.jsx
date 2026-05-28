import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2 } from 'lucide-react';

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
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-background-light h-full shadow-2xl flex flex-col border-l border-surface-border">
            <div className="p-6 border-b border-surface-border flex justify-between items-center bg-surface">
              <h2 className="text-2xl font-serif text-accent">Votre panier</h2>
              <button onClick={onClose} className="p-2 text-text-light hover:bg-surface-light rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-text-light space-y-4">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p>Votre panier est vide.</p>
                  <button onClick={onClose} className="text-primary font-medium hover:underline">Découvrir nos produits</button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-surface rounded-2xl border border-surface-border">
                    <img src={item.image_url || item.image || '/product_pack.png'} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-surface-light" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-serif font-medium text-text">{item.name}</h4>
                          <p className="text-sm text-accent">{formatPrice(item.price)}</p>
                        </div>
                        <button onClick={() => onRemove(item.id)} className="text-text-muted hover:text-primary transition-colors"><Trash2 size={18} /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-background border border-surface-border rounded-lg">
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="px-3 py-1 text-text hover:text-primary transition-colors">-</button>
                          <span className="text-sm font-medium w-4 text-center text-text">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)} className="px-3 py-1 text-text hover:text-primary transition-colors">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 bg-surface border-t border-surface-border">
                <div className="space-y-1 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-light">Sous-total</span>
                    <span className="text-text-light font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-light">Livraison à domicile</span>
                    <span className="text-text-light font-medium">{shippingCost === 0 ? 'Offerte' : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 mt-2 border-t border-surface-border">
                    <span className="text-text font-semibold">Total TTC</span>
                    <span className="text-2xl font-serif font-bold text-accent">{formatPrice(subtotal + shippingCost)}</span>
                  </div>
                </div>
                <div className="mb-4">
                  {subtotal >= freeShippingThreshold ? (
                    <div className="text-emerald-400 text-sm font-medium text-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-2">
                      ✓ Livraison offerte
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-text-light text-sm font-medium text-center bg-background border border-surface-border rounded-xl py-2">
                        Plus que <span className="text-accent font-bold">{formatPrice(remaining)}</span> pour la livraison offerte !
                      </div>
                      {crossSellProduct && (
                        <div className="flex items-center gap-3 bg-surface-light border border-accent/20 rounded-xl p-3 shadow-sm">
                          <img 
                            src={crossSellProduct.images?.[0] || crossSellProduct.image_url || '/product_pack.png'} 
                            alt={crossSellProduct.name} 
                            className="w-[50px] h-[50px] object-cover rounded-lg shrink-0 border border-surface-border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text font-medium leading-tight line-clamp-3">
                              {crossSellProduct.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-accent font-semibold text-sm">{formatPrice(crossSellProduct.price)}</span>
                              <span className="text-[10px] text-text-muted mt-0.5">→ livraison offerte avec ce produit</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onAddProduct(crossSellProduct, { keepDrawerOpen: true })}
                            className="w-10 h-10 shrink-0 rounded-full bg-accent/10 text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm"
                          >
                            <span className="text-xl leading-none -mt-0.5">+</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={onCheckout} className="w-full py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all transform hover:-translate-y-1 shadow-lg shadow-primary/20">
                  Passer la commande
                </button>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center text-primary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <span className="text-[10px] text-text-muted leading-tight uppercase tracking-wider font-semibold">Paiement 100% sécurisé</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center text-accent">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[10px] text-text-muted leading-tight uppercase tracking-wider font-semibold">Expédition sous 24h</span>
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
