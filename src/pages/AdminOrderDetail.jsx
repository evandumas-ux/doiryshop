import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLogto } from '@logto/react';
import { getAdminOrderById, updateAdminOrderNote, updateAdminOrderTracking } from '../services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MapPin, Truck, Package, Clock, MessageSquare, CheckCircle2, Save, ExternalLink, FileText } from 'lucide-react';

const SHIPPING_LABELS = {
  'LETTRE_VERTE_SUIVIE': 'Lettre Verte Suivie',
  'COLISSIMO': 'Colissimo Domicile'
};

const StatusBadge = ({ status }) => {
  const configs = {
    'payé': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2 },
    'en attente': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    'expédié': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Truck },
  };
  const cfg = configs[status?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: Package };
  const StatusIcon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <StatusIcon size={14} />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Inconnu'}
    </span>
  );
};

const AdminOrderDetail = () => {
  const { id } = useParams();
  const { getIdToken } = useLogto();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Notes
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteMessage, setNoteMessage] = useState(null);

  // Tracking
  const [trackingNumber, setTrackingNumber] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);
  const [trackingMessage, setTrackingMessage] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getAdminOrderById(id);
        setOrder(data);
        setNote(data?.admin_note || '');
        setTrackingNumber(data?.tracking_number || '');
      } catch (err) {
        console.error('Erreur chargement commande:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleSaveNote = async () => {
    try {
      setSavingNote(true);
      setNoteMessage(null);
      await updateAdminOrderNote(id, note);
      setNoteMessage({ type: 'success', text: 'Note sauvegardée.' });
      setTimeout(() => setNoteMessage(null), 3000);
    } catch (err) {
      setNoteMessage({ type: 'error', text: 'Erreur: ' + err.message });
    } finally {
      setSavingNote(false);
    }
  };

  const handleSaveTracking = async () => {
    try {
      setSavingTracking(true);
      setTrackingMessage(null);
      await updateAdminOrderTracking(id, trackingNumber);
      setTrackingMessage({ type: 'success', text: 'Suivi enregistré.' });
      setOrder({ ...order, tracking_number: trackingNumber });
      setTimeout(() => setTrackingMessage(null), 3000);
    } catch (err) {
      setTrackingMessage({ type: 'error', text: 'Erreur: ' + err.message });
    } finally {
      setSavingTracking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-500 mb-6">{error || 'Commande introuvable'}</p>
          <Link to="/admin/dashboard" className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors inline-block">
            Retour au Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const produits = Array.isArray(order?.produits) ? order?.produits : [];
  const adresse = typeof order?.adresse_livraison === 'object' && order?.adresse_livraison ? order?.adresse_livraison : {};
  const dateCreation = new Date(order?.date_creation || Date.now());
  
  // Calcul du sous-total (sans livraison)
  const sousTotal = produits.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.quantity || 1)), 0);
  const fraisLivraison = Number(order?.shipping_price || 0);
  const isLivraisonGratuite = fraisLivraison === 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">Commande #{order?.id}</h1>
                <StatusBadge status={order?.statut_paiement} />
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <Clock size={14} />
                {dateCreation.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} à {dateCreation.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-sm text-gray-500 mr-2">Total Payé:</span>
              <span className="text-xl font-bold text-gray-900">{Number(order?.total || 0).toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLONNE GAUCHE (2/3) : Détails de la commande */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Produits */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                <Package className="text-primary" size={20} />
                <h2 className="text-lg font-bold text-gray-900">Produits commandés ({produits.reduce((acc, p) => acc + (p.quantity || 1), 0)})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {produits.map((p, i) => (
                  <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded-xl bg-gray-50" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300">
                          <Package size={24} />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{p.name || `Produit #${p.id || i+1}`}</p>
                        <p className="text-sm text-gray-500">Réf: {p.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 sm:text-right">
                      <div>
                        <p className="text-sm text-gray-500">Prix unitaire</p>
                        <p className="font-medium text-gray-900">{Number(p.price || 0).toFixed(2)} €</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Quantité</p>
                        <p className="font-medium text-gray-900">× {p.quantity || 1}</p>
                      </div>
                      <div className="min-w-[80px]">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-bold text-primary-dark">{((p.price || 0) * (p.quantity || 1)).toFixed(2)} €</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 bg-gray-50/50 flex flex-col items-end gap-2 border-t border-gray-100">
                <div className="flex justify-between w-full sm:w-64 text-sm text-gray-600">
                  <span>Sous-total</span>
                  <span>{sousTotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between w-full sm:w-64 text-sm text-gray-600">
                  <span>Livraison ({order?.shipping_method || 'Standard'})</span>
                  <span>{isLivraisonGratuite ? 'Gratuite' : `${fraisLivraison.toFixed(2)} €`}</span>
                </div>
                {/* Calcul d'une éventuelle réduction si order.total est inférieur à sousTotal + livraison */}
                {Number(order?.total || 0) < (sousTotal + fraisLivraison - 0.01) && (
                  <div className="flex justify-between w-full sm:w-64 text-sm text-green-600">
                    <span>Réduction / Code promo</span>
                    <span>-{((sousTotal + fraisLivraison) - Number(order?.total || 0)).toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between w-full sm:w-64 text-lg font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
                  <span>Total Payé</span>
                  <span>{Number(order?.total || 0).toFixed(2)} €</span>
                </div>
              </div>
            </motion.div>

            {/* Note Interne */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-primary" size={20} />
                  <h2 className="text-lg font-bold text-gray-900">Note interne (Admin)</h2>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-500 mb-4">
                  Cette note n'est visible que par les administrateurs. Utilisez-la pour le suivi, les réclamations ou les instructions de préparation.
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ajouter une note concernant cette commande..."
                  className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none mb-4"
                />
                <div className="flex items-center justify-between">
                  <div>
                    {noteMessage && (
                      <span className={`text-sm ${noteMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {noteMessage.text}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {savingNote ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={18} /> Sauvegarder
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

          </div>

          {/* COLONNE DROITE (1/3) : Infos Client & Livraison */}
          <div className="space-y-6">
            
            {/* Client */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                <User className="text-primary" size={20} />
                <h2 className="text-lg font-bold text-gray-900">Informations client</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg">
                    {(order?.client_name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{order?.client_prenom} {order?.client_nom || order?.client_name}</p>
                    <p className="text-sm text-gray-500">Client ID: #{order?.user_id}</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Email</span>
                    <a href={`mailto:${order?.client_email}`} className="font-medium text-primary hover:underline">{order?.client_email}</a>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Téléphone</span>
                    <span className="font-medium text-gray-900">{order?.client_telephone || 'Non renseigné'}</span>
                  </div>
                  {order?.client_created_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Membre depuis</span>
                      <span className="font-medium text-gray-900">{new Date(order?.client_created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Expédition & Adresse */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                <MapPin className="text-primary" size={20} />
                <h2 className="text-lg font-bold text-gray-900">Expédition</h2>
              </div>
              <div className="p-5 space-y-6">
                
                {/* Méthode */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className="text-gray-500" size={18} />
                    <span className="font-semibold text-gray-900">
                      {SHIPPING_LABELS[order?.shipping_method] || order?.shipping_method || 'Standard'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Prix de livraison facturé :</span>
                    <span className="font-medium">{isLivraisonGratuite ? 'Gratuit' : `${fraisLivraison.toFixed(2)} €`}</span>
                  </div>

                  {/* Manual Tracking Management */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold mb-3">Gestion Expédition (La Poste)</h4>
                    
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="N° de suivi (ex: 6A...)"
                          className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                        />
                        <button 
                          onClick={handleSaveTracking}
                          disabled={savingTracking}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          {savingTracking ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'OK'}
                        </button>
                      </div>
                      
                      {trackingMessage && (
                        <div className={`p-2 rounded text-xs font-medium ${trackingMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {trackingMessage.text}
                        </div>
                      )}

                      {order?.tracking_number && (
                        <a 
                          href={`https://www.laposte.fr/outils/suivre-vos-envois?code=${order.tracking_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={16} /> Suivre sur La Poste
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adresse pour expédition manuelle */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Adresse d'expédition</h3>
                  </div>
                  {adresse && Object.keys(adresse).length > 0 ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-800 font-medium">
                        <p>{adresse.fname || adresse.firstName || adresse.prenom || 'Non renseigné'} {adresse.lname || adresse.lastName || adresse.nom || 'Non renseigné'}</p>
                        <p>{adresse.address || adresse.street1 || adresse.rue || 'Non renseigné'}</p>
                        {adresse.addressComplement && <p>{adresse.addressComplement}</p>}
                        <p>{adresse.zip || adresse.postalCode || adresse.codePostal || 'Non renseigné'} {adresse.city || adresse.ville || 'Non renseigné'}</p>
                        <p className="text-gray-500 font-normal">{adresse.country || 'FR'}</p>
                        <div className="mt-3 pt-3 border-t border-gray-200 text-gray-600">
                          <p>Tél : {adresse.telephone || adresse.phone || 'Non renseigné'}</p>
                          <p>Email : {adresse.email || 'Non renseigné'}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => {
                            const addressText = `${adresse.fname || adresse.firstName || adresse.prenom || ''} ${adresse.lname || adresse.lastName || adresse.nom || ''}\n${adresse.address || adresse.street1 || adresse.rue || ''}\n${adresse.addressComplement ? adresse.addressComplement + '\n' : ''}${adresse.zip || adresse.postalCode || adresse.codePostal || ''} ${adresse.city || adresse.ville || ''}\n${adresse.country || 'FR'}`;
                            navigator.clipboard.writeText(addressText.trim());
                            alert('Adresse copiée !');
                          }}
                          className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <FileText size={16} /> Copier l'adresse
                        </button>
                        <button 
                          onClick={() => {
                            const allText = `COMMANDE #${order.id}\nMéthode: ${order.shipping_method || 'Standard'}\nClient: ${adresse.fname || adresse.firstName || adresse.prenom || 'Non renseigné'} ${adresse.lname || adresse.lastName || adresse.nom || 'Non renseigné'}\nEmail: ${adresse.email || 'Non renseigné'}\nTéléphone: ${adresse.telephone || adresse.phone || 'Non renseigné'}\nAdresse: ${adresse.address || adresse.street1 || adresse.rue || 'Non renseigné'}\nCode postal: ${adresse.zip || adresse.postalCode || adresse.codePostal || 'Non renseigné'}\nVille: ${adresse.city || adresse.ville || 'Non renseigné'}\nPays: ${adresse.country || 'FR'}`;
                            navigator.clipboard.writeText(allText);
                            alert('Toutes les infos ont été copiées !');
                          }}
                          className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={16} /> Copier toutes les infos client
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Aucune adresse fournie dans la commande</p>
                  )}
                </div>

              </div>
            </motion.div>

            {/* Point Relais (Si applicable) */}
            {(order?.relay_selection_mode || order?.shipping_relay_data || order?.relay_info) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white rounded-2xl shadow-sm border border-primary/20 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                  <MapPin className="text-primary" size={20} />
                  <h2 className="text-lg font-bold text-gray-900">Information Point Relais</h2>
                </div>
                <div className="p-5">
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-sm text-gray-800">
                    {order?.relay_info ? (() => {
                      const ri = typeof order.relay_info === 'string' ? JSON.parse(order.relay_info) : order.relay_info;
                      return (
                        <>
                          <p className="font-bold text-base mb-1 text-primary-dark">Mondial Relay Sélectionné :</p>
                          <p className="font-bold">{ri.name} ({ri.id})</p>
                          <p>{ri.address}</p>
                          <p>{ri.zip} {ri.city}</p>
                          <p className="text-xs text-gray-500 mt-2 uppercase">Pays: {ri.country}</p>
                        </>
                      );
                    })() : order?.relay_selection_mode === 'closest' ? (
                      <div>
                        <p className="font-bold text-base mb-1 text-primary-dark">Point relais le plus proche de l'adresse client</p>
                        <p className="text-gray-600 mt-2 italic">Vous devez choisir le relais le plus proche de : {adresse.zip} {adresse.city}</p>
                      </div>
                    ) : order?.relay_selection_mode === 'manual' ? (
                      <div>
                        <p className="font-bold text-base mb-1 text-primary-dark">Adresse fournie manuellement :</p>
                        <p className="whitespace-pre-wrap mt-2">{order.relay_address_text}</p>
                      </div>
                    ) : order?.shipping_relay_data ? (
                      <>
                        <p className="font-bold text-base mb-1">{order.shipping_relay_data.name}</p>
                        <p>{order.shipping_relay_data.address}</p>
                        <p>{order.shipping_relay_data.zip} {order.shipping_relay_data.city}</p>
                      </>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Infos Colis (Estimation) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                <Package className="text-primary" size={20} />
                <h2 className="text-lg font-bold text-gray-900">Dimensions du Colis</h2>
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-500 mb-4 italic leading-relaxed">
                  Valeurs estimées automatiquement d'après les produits de la commande (inclut +100g d'emballage et un gabarit minimum).
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">Poids</span>
                    <span className="font-bold text-gray-900 text-lg">{order?.estimated_weight_g ? (order.estimated_weight_g / 1000).toFixed(2) : '0.15'} kg</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">L × l × h</span>
                    <span className="font-bold text-gray-900 text-lg">
                      {order?.estimated_length_cm || 15}×{order?.estimated_width_cm || 10}×{order?.estimated_height_cm || 5} <span className="text-sm font-normal text-gray-500">cm</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminOrderDetail;
