import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Ticket, Truck, Package, X, CheckCircle2, Plus, Minus } from 'lucide-react';
import { getLoyaltyPoints, redeemLoyaltyReward } from '../services/api';

const LEVEL_META = {
  inite: {
    label: 'Initié',
    next: 'chasseur',
    image: '/plume.png',
    threshold: 100,
  },
  initie: {
    label: 'Initié',
    next: 'chasseur',
    image: '/plume.png',
    threshold: 100,
  },
  chasseur: {
    label: 'Chasseur',
    next: 'aigle_royal',
    image: '/favicon.jpg',
    threshold: 300,
  },
  aigle_royal: {
    label: 'Aigle Royal',
    next: null,
    image: '/aigle-royal.png',
    threshold: null,
  },
};

const REWARDS = [
  { key: 'reduction_5', name: 'Réduction 5%', description: '5% sur votre prochaine commande', cost: 50, icon: Ticket },
  { key: 'reduction_10', name: 'Réduction 10%', description: '10% sur votre prochaine commande', cost: 100, icon: Sparkles },
  { key: 'livraison_gratuite', name: 'Livraison gratuite', description: 'Coupon frais de livraison offerts', cost: 75, icon: Truck },
  { key: 'pochon_offert', name: 'Pochon offert', description: 'Un pochon offert sur une commande', cost: 250, icon: Package },
];

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch {
    return '—';
  }
};

const LoyaltyCard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState('');
  const [couponResult, setCouponResult] = useState(null);

  const refresh = async () => {
    setError('');
    setLoading(true);
    try {
      const loyaltyData = await getLoyaltyPoints();
      setData(loyaltyData);
    } catch (err) {
      setError(err.message || 'Impossible de charger votre fidélité.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const level = useMemo(() => {
    if (!data?.niveau) return LEVEL_META.initie;
    return LEVEL_META[data.niveau] || LEVEL_META.initie;
  }, [data]);

  const progress = useMemo(() => {
    if (!data) return { pct: 0, remaining: 0, nextLabel: null };
    if (!level.next || !level.threshold) {
      return { pct: 100, remaining: 0, nextLabel: null };
    }
    const min = data.niveau === 'chasseur' ? 100 : 0;
    const currentInLevel = Math.max(0, (data.points_cumules_total || 0) - min);
    const span = level.threshold - min;
    const pct = Math.min(100, Math.round((currentInLevel / span) * 100));
    const remaining = Math.max(0, level.threshold - (data.points_cumules_total || 0));
    const nextLabel = LEVEL_META[level.next]?.label || null;
    return { pct, remaining, nextLabel };
  }, [data, level]);

  const handleRedeem = async (rewardKey) => {
    setCouponResult(null);
    setIsRedeeming(rewardKey);
    try {
      const result = await redeemLoyaltyReward(rewardKey);
      setCouponResult(result);
      await refresh();
    } catch (err) {
      setCouponResult({ error: err.message || 'Erreur lors de l’échange.' });
    } finally {
      setIsRedeeming('');
    }
  };

  if (loading) {
    return (
      <section className="bg-surface border border-surface-border rounded-3xl p-6 mb-6">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
      </section>
    );
  }

  return (
    <section className="bg-surface border border-surface-border rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted">Programme fidélité</p>
          <h3 className="font-serif text-2xl text-primary">Les Plumes</h3>
        </div>
        <motion.img
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          src={level.image}
          alt={level.label}
          className="w-16 h-16 object-contain"
        />
      </div>

      {error ? (
        <p className="mt-4 text-sm text-primary">{error}</p>
      ) : (
        <>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-text-light">Niveau actuel</p>
              <p className="text-xl font-serif text-primary">{level.label}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-light">Plumes disponibles</p>
              <p className="text-4xl leading-none font-bold text-text">{data?.points_actuels || 0}</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="w-full h-3 bg-background rounded-full overflow-hidden border border-surface-border">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress.pct}%` }} />
            </div>
            {progress.nextLabel ? (
              <p className="mt-2 text-sm text-text-light">
                Plus que <span className="text-primary font-semibold">{progress.remaining}</span> Plumes pour devenir <span className="font-semibold">{progress.nextLabel}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-emerald-400">Niveau maximum atteint.</p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              <Gift size={16} /> Échanger mes Plumes
            </button>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-text mb-3">Historique récent</h4>
            <div className="space-y-2">
              {(data?.transactions || []).slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between bg-background border border-surface-border rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {tx.points >= 0 ? <Plus size={14} className="text-emerald-400" /> : <Minus size={14} className="text-primary" />}
                    <div className="min-w-0">
                      <p className="text-sm text-text truncate">{tx.raison}</p>
                      <p className="text-xs text-text-muted">{formatDate(tx.date_creation)}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${tx.points >= 0 ? 'text-emerald-400' : 'text-primary'}`}>
                    {tx.points >= 0 ? '+' : ''}{tx.points}
                  </p>
                </div>
              ))}
              {(!data?.transactions || data.transactions.length === 0) && (
                <p className="text-sm text-text-muted">Aucune transaction pour le moment.</p>
              )}
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="relative w-full max-w-2xl bg-surface border border-surface-border rounded-3xl p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-serif text-2xl text-primary">Échanger mes Plumes</h4>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-background text-text-muted"><X size={18} /></button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {REWARDS.map((reward) => {
                  const enough = (data?.points_actuels || 0) >= reward.cost;
                  const missing = reward.cost - (data?.points_actuels || 0);
                  const Icon = reward.icon;
                  return (
                    <div key={reward.key} className={`border rounded-2xl p-4 ${enough ? 'border-primary/40 bg-background' : 'border-surface-border bg-background/50 opacity-70'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={16} className="text-primary" />
                        <p className="font-semibold text-text">{reward.name}</p>
                      </div>
                      <p className="text-sm text-text-light mb-3">{reward.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">{reward.cost} Plumes</span>
                        <button
                          disabled={!enough || isRedeeming === reward.key}
                          onClick={() => handleRedeem(reward.key)}
                          className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
                        >
                          {isRedeeming === reward.key ? 'Échange...' : 'Échanger'}
                        </button>
                      </div>
                      {!enough && <p className="text-xs text-text-muted mt-2">Il vous manque {missing} Plumes.</p>}
                    </div>
                  );
                })}
              </div>

              {couponResult && (
                <div className={`mt-4 rounded-2xl p-4 border ${couponResult.error ? 'border-primary/30 bg-primary/10' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
                  {couponResult.error ? (
                    <p className="text-sm text-primary">{couponResult.error}</p>
                  ) : (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-emerald-300">Échange réussi</p>
                        <p className="text-lg font-bold text-text mt-1">{couponResult.coupon_code}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LoyaltyCard;
