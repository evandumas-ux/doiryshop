import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle2, AlertCircle, Truck, ChevronDown, ShoppingBag } from 'lucide-react';
import { useLogto } from '@logto/react';
import { downloadOrderInvoice, getMyOrders } from '../services/api';

const MyOrders = ({ user, isInitializing }) => {
  const navigate = useNavigate();
  const { getIdToken } = useLogto();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);

  useEffect(() => {
    // Attendre que l'initialisation auth soit terminée
    if (isInitializing) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await getMyOrders(user?.id);
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Erreur chargement commandes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate, isInitializing]);

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'payé': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle2, label: 'Payée' };
      case 'en attente': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: Clock, label: 'En attente' };
      case 'expédiée': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: Truck, label: 'Expédiée' };
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', icon: AlertCircle, label: status };
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      setDownloadingInvoiceId(orderId);
      const blob = await downloadOrderInvoice(orderId);
      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `facture-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileUrl);
    } catch (err) {
      console.error('Erreur téléchargement facture:', err);
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-surface border-b border-surface-border py-4 px-6 sticky top-0 z-10">
          <Link to="/" className="text-text-light flex items-center gap-2 max-w-6xl mx-auto hover:text-primary transition-colors"><ArrowLeft size={20} /> Retour</Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-surface-border py-4 px-6 z-10 sticky top-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/profil" className="text-text-light hover:text-primary transition-colors flex items-center gap-2">
            <ArrowLeft size={18} /> <span className="font-medium hidden sm:inline">Mon profil</span>
          </Link>
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.jpg" alt="DOIRY SHOP" className="h-10 w-auto rounded-lg" />
            <span className="font-display font-bold tracking-widest text-primary hidden sm:block">DOIRY SHOP</span>
          </Link>
          <div className="w-[100px]"></div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif text-text flex items-center gap-3">
            <Package size={28} className="text-primary" /> Mes commandes
          </h1>
          <p className="text-text-light mt-2">Historique complet de vos achats</p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-surface rounded-3xl border border-surface-border"
          >
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 border border-surface-border">
              <ShoppingBag size={32} className="text-text-muted" />
            </div>
            <h3 className="text-xl font-serif text-text mb-2">Aucune commande</h3>
            <p className="text-text-light mb-6">Vous n'avez pas encore passé de commande.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">
              Découvrir nos produits
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = getStatusConfig(order.statut_paiement);
              const StatusIcon = status.icon;
              const produits = Array.isArray(order.produits) ? order.produits : [];
              const isExpanded = expandedOrder === order.id;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-surface rounded-2xl border border-surface-border overflow-hidden hover:border-accent/20 transition-colors"
                >
                  {/* En-tête commande */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-background border border-surface-border flex items-center justify-center shrink-0">
                        <Package size={20} className="text-accent" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono font-semibold text-text">Commande #{order.id}</span>
                          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium ${status.bg} ${status.text} ${status.border}`}>
                            <StatusIcon size={11} /> {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-text-light flex items-center gap-1.5">
                          <Clock size={11} /> {new Date(order.date_creation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-bold text-accent text-lg block">{Number(order.total).toFixed(2)} €</span>
                        <span className="text-xs text-text-muted">{produits.length} article(s)</span>
                      </div>
                      <ChevronDown size={18} className={`text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Détail commande */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-surface-border"
                    >
                      <div className="p-5 space-y-3">
                        {produits.map((p, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 bg-background rounded-xl">
                            {p.image && (
                              <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded-lg bg-surface border border-surface-border" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-text text-sm truncate">{p.name || `Produit ${i + 1}`}</p>
                              <p className="text-xs text-text-muted">Quantité : {p.quantity || 1}</p>
                            </div>
                            <span className="font-medium text-accent text-sm shrink-0">
                              {((p.price || 0) * (p.quantity || 1)).toFixed(2)} €
                            </span>
                          </div>
                        ))}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(order.id)}
                            disabled={downloadingInvoiceId === order.id}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#8b263e]/40 text-[#d8c4ca] hover:bg-[#8b263e]/15 transition-colors text-sm font-medium disabled:opacity-60"
                          >
                            {downloadingInvoiceId === order.id ? 'Téléchargement...' : 'Télécharger ma facture (PDF)'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Lien retour */}
        <div className="mt-10 text-center">
          <Link to="/" className="text-sm text-text-light hover:text-accent transition-colors">
            ← Retour à la boutique
          </Link>
        </div>
      </main>
    </div>
  );
};

export default MyOrders;
