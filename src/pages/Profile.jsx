import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Package, LogOut, CheckCircle2, Clock, Edit3, Save, X, Phone, Calendar, Mail, ChevronRight, Copy } from 'lucide-react';
import { useLogto } from '@logto/react';
import { getUserProfile, updateUserProfile, getMyOrders, getReferralCode, getLoyaltyPoints } from '../services/api';
import LoyaltyCard from '../components/LoyaltyCard';
import SEO from '../components/SEO';

const Profile = ({ user, setUser, onLogout, isInitializing }) => {
  console.log('Profile mounted', { user, isInitializing });
  const navigate = useNavigate();
  const { getIdTokenClaims } = useLogto();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSection, setEditingSection] = useState(null); // 'info' ou 'address'
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // Attendre que l'initialisation auth soit terminÃ©e avant de dÃ©cider
    if (isInitializing) return;
    
    if (!user) {
      navigate('/login?redirect=/profil');
      return;
    }

    const fetchData = async () => {
      try {
        // 1. RÃ©cupÃ©rer les claims Logto (email, nom)
        let logtoEmail = user?.email || '';
        let logtoName = user?.name || '';
        try {
          const claims = await getIdTokenClaims();
          console.log('[Profile] Claims Logto:', claims);
          if (claims?.email) logtoEmail = claims.email;
          if (claims?.name) logtoName = claims.name;
        } catch(e) {
          console.warn('[Profile] getIdTokenClaims() a Ã©chouÃ©:', e);
        }

        // 2. RÃ©cupÃ©rer le profil depuis le backend
        let profileData = {};
        try {
          profileData = await getUserProfile();
          console.log('[Profile] DonnÃ©es profil backend:', profileData);
        } catch(e) {
          console.warn('[Profile] getUserProfile() a Ã©chouÃ©:', e);
        }

        // 3. Fusionner : backend prioritaire, mais fallback sur Logto pour email/nom
        const mergedProfile = {
          ...profileData,
          email: profileData?.email || logtoEmail,
          name: profileData?.name || logtoName,
          prenom: profileData?.prenom || logtoName.split(' ')[0] || '',
          nom: profileData?.nom || logtoName.split(' ').slice(1).join(' ') || '',
        };
        console.log('[Profile] Profil final fusionnÃ©:', mergedProfile);
        setProfile(mergedProfile);
        
        // 4. RÃ©cupÃ©rer les commandes
        const ordersData = await getMyOrders(user?.id);
        setOrders((ordersData.orders || []).slice(0, 5));

        // 5. RÃ©cupÃ©rer code parrainage + compteur filleuls
        const [codeData, loyaltyData] = await Promise.all([
          getReferralCode(),
          getLoyaltyPoints(),
        ]);
        setReferralCode(codeData?.code || codeData || '');
        setReferralCount(loyaltyData?.filleuls_count || 0);
      } catch (err) {
        console.error('[Profile] Erreur chargement donnÃ©es espace client:', err);
        setError('Impossible de charger les donnÃ©es de votre profil. Veuillez rÃ©essayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, isInitializing]);

  const startEditing = (section) => {
    setEditingSection(section);
    setSaveMessage('');
    if (section === 'info') {
      setFormData({
        prenom: profile?.prenom || '',
        nom: profile?.nom || '',
        telephone: profile?.telephone || '',
        date_naissance: profile?.date_naissance || '',
      });
    } else if (section === 'address') {
      setFormData({
        adresse: profile?.adresse || '',
        complement_adresse: profile?.complement_adresse || '',
        code_postal: profile?.code_postal || '',
        ville: profile?.ville || '',
      });
    }
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setFormData({});
    setSaveMessage('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const updateData = { ...profile, ...formData };
      if (updateData.date_naissance) {
        const ageDifMs = Date.now() - new Date(updateData.date_naissance).getTime();
        const ageDate = new Date(ageDifMs);
        updateData.age = Math.abs(ageDate.getUTCFullYear() - 1970);
      }
      updateData.profil_complete = true;

      await updateUserProfile(updateData);
      
      setProfile(prev => ({ ...prev, ...formData }));
      setEditingSection(null);
      setSaveMessage('Modifications enregistrÃ©es !');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setSaveMessage('Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async (e) => {
    if (e) e.preventDefault();
    await onLogout(e);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      console.log('[DeleteAccount] confirmed, calling DELETE /api/auth/delete-account');
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      });

      const text = await response.text();
      let payload = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = { raw: text };
      }

      console.log('[DeleteAccount] response', response.status, payload);

      if (!response.ok) {
        const message = payload?.error || payload?.message || `Erreur serveur (${response.status})`;
        throw new Error(message);
      }

      // Clear any local auth state immediately
      if (typeof setUser === 'function') setUser(null);
      try {
        // Optional: also run the regular logout flow (Logto + cleanup)
        if (typeof onLogout === 'function') await onLogout();
      } catch (e) {
        // ignore logout errors after deletion
      }

      navigate('/');
    } catch (err) {
      console.error('[DeleteAccount] error', err);
      setSaveMessage(err?.message || 'Erreur lors de la suppression du compte.');
    }
  };

  const handleCopyReferralLink = async () => {
    if (!referralCode) return;
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setSaveMessage('Impossible de copier le lien.');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'payÃ©': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'en attente': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'expÃ©diÃ©e': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-surface border-b border-surface-border py-4 px-6 sticky top-0 z-10">
          <Link to="/" className="text-text-light flex items-center gap-2 max-w-6xl mx-auto hover:text-primary transition-colors"><ArrowLeft size={20} /> Retour Ã  la boutique</Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-surface border-b border-surface-border py-4 px-6 sticky top-0 z-10">
          <Link to="/" className="text-text-light flex items-center gap-2 max-w-6xl mx-auto hover:text-primary transition-colors"><ArrowLeft size={20} /> Retour Ã  la boutique</Link>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
           <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
             <X size={32} className="text-primary" />
           </div>
           <h2 className="text-xl font-serif text-text mb-2">Une erreur est survenue</h2>
           <p className="text-text-light mb-6 max-w-md">{error}</p>
           <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">
             RÃ©essayer
           </button>
        </div>
      </div>
    );
  }

  const initials = (() => {
    try {
      if (profile?.prenom && profile?.nom) {
        return `${profile.prenom[0]}${profile.nom[0]}`.toUpperCase();
      }
      return user?.name?.[0]?.toUpperCase() || 'U';
    } catch (e) {
      return 'U';
    }
  })();

  try {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEO
          title="Mon profil | Doiry Shop"
          description="AccÃ©dez Ã  votre profil Doiry Shop, vos informations et vos commandes."
          url="https://doiryshop.com/profil"
          robots="noindex, nofollow"
        />
        {/* Header */}
        <header className="bg-surface border-b border-surface-border py-4 px-6 z-10 sticky top-0">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-text-light hover:text-primary transition-colors flex items-center gap-2">
              <ArrowLeft size={18} /> <span className="font-medium hidden sm:inline">Retour Ã  la boutique</span>
            </Link>
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.jpg" alt="DOIRY SHOP" className="h-10 w-auto rounded-lg" />
              <span className="font-display font-bold tracking-widest text-primary hidden sm:block">DOIRY SHOP</span>
            </Link>
            <div className="w-[100px]"></div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
          
          {/* Header Profile */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-10"
          >
            <div className="w-24 h-24 rounded-full shadow-lg shadow-primary/20 border-4 border-surface bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-3xl font-serif">
              {initials}
            </div>
            <div className="text-center md:text-left mb-2">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h1 className="text-3xl font-serif text-text">{profile?.prenom || user?.name || 'Client'}</h1>
                {profile?.profil_complete && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 size={12} /> Client vÃ©rifiÃ©
                  </span>
                )}
              </div>
              <p className="text-text-light mt-1">{profile?.email || user?.email}</p>
            </div>
          </motion.div>

          {/* Message de sauvegarde */}
          <AnimatePresence>
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl text-sm font-medium text-center border ${saveMessage.includes('Erreur') ? 'bg-primary/10 text-primary border-primary/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
              >
                {saveMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <LoyaltyCard />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Colonne gauche */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Informations personnelles */}
              <motion.section 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-surface p-6 rounded-3xl border border-surface-border"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif text-lg text-text flex items-center gap-2"><User size={18} className="text-primary"/> Informations personnelles</h3>
                  {editingSection !== 'info' ? (
                    <button onClick={() => startEditing('info')} className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                      <Edit3 size={12} /> Modifier
                    </button>
                  ) : (
                    <button onClick={cancelEditing} className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-primary">
                      <X size={12} /> Annuler
                    </button>
                  )}
                </div>

                {editingSection === 'info' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="PrÃ©nom" value={formData.prenom || ''} onChange={e => setFormData({...formData, prenom: e.target.value})}
                        className="px-3 py-2.5 min-h-[48px] bg-background border border-surface-border rounded-xl text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                      <input type="text" placeholder="Nom" value={formData.nom || ''} onChange={e => setFormData({...formData, nom: e.target.value})}
                        className="px-3 py-2.5 min-h-[48px] bg-background border border-surface-border rounded-xl text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                    <input type="tel" placeholder="TÃ©lÃ©phone" value={formData.telephone || ''} onChange={e => setFormData({...formData, telephone: e.target.value})}
                      className="w-full px-3 py-2.5 bg-background border border-surface-border rounded-xl text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    <input type="date" value={formData.date_naissance || ''} onChange={e => setFormData({...formData, date_naissance: e.target.value})}
                      className="w-full px-3 py-2.5 bg-background border border-surface-border rounded-xl text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    <button onClick={handleSave} disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
                      <Save size={14} /> {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-text">
                    <div className="flex justify-between border-b border-surface-border pb-2.5">
                      <span className="text-text-light flex items-center gap-2"><User size={13} /> Nom complet</span>
                      <span className="font-medium text-right">{profile?.prenom || ''} {profile?.nom || ''}</span>
                    </div>
                    <div className="flex justify-between border-b border-surface-border pb-2.5">
                      <span className="text-text-light flex items-center gap-2"><Mail size={13} /> Email</span>
                      <span className="font-medium text-right break-words max-w-[150px]">{profile?.email || ''}</span>
                    </div>
                    <div className="flex justify-between border-b border-surface-border pb-2.5">
                      <span className="text-text-light flex items-center gap-2"><Phone size={13} /> TÃ©lÃ©phone</span>
                      <span className="font-medium text-right">{profile?.telephone || 'â€”'}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-text-light flex items-center gap-2"><Calendar size={13} /> Naissance</span>
                      <span className="font-medium text-right">{profile?.date_naissance ? new Date(profile.date_naissance).toLocaleDateString('fr-FR') : 'â€”'}</span>
                    </div>
                  </div>
                )}
              </motion.section>

              {/* Adresse de livraison */}
              <motion.section 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-surface p-6 rounded-3xl border border-surface-border"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif text-lg text-text flex items-center gap-2"><MapPin size={18} className="text-primary"/> Adresse de livraison</h3>
                  {editingSection !== 'address' ? (
                    <button onClick={() => startEditing('address')} className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                      <Edit3 size={12} /> Modifier
                    </button>
                  ) : (
                    <button onClick={cancelEditing} className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-primary">
                      <X size={12} /> Annuler
                    </button>
                  )}
                </div>

                {editingSection === 'address' ? (
                  <div className="space-y-3">
                    <input type="text" placeholder="Adresse" value={formData.adresse || ''} onChange={e => setFormData({...formData, adresse: e.target.value})}
                      className="w-full px-3 py-2.5 bg-background border border-surface-border rounded-xl text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    <input type="text" placeholder="ComplÃ©ment d'adresse" value={formData.complement_adresse || ''} onChange={e => setFormData({...formData, complement_adresse: e.target.value})}
                      className="w-full px-3 py-2.5 bg-background border border-surface-border rounded-xl text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    <div className="grid grid-cols-3 gap-3">
                      <input type="text" placeholder="Code postal" value={formData.code_postal || ''} onChange={e => setFormData({...formData, code_postal: e.target.value})}
                        className="px-3 py-2.5 bg-background border border-surface-border rounded-xl text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                      <input type="text" placeholder="Ville" value={formData.ville || ''} onChange={e => setFormData({...formData, ville: e.target.value})}
                        className="col-span-2 px-3 py-2.5 bg-background border border-surface-border rounded-xl text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>
                    <button onClick={handleSave} disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
                      <Save size={14} /> {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                    </button>
                  </div>
                ) : (
                  <address className="not-italic text-sm text-text space-y-1.5">
                    <p className="font-medium">{profile?.prenom || ''} {profile?.nom || ''}</p>
                    <p>{profile?.adresse || <span className="text-text-muted italic">Non renseignÃ©e</span>}</p>
                    {profile?.complement_adresse && <p>{profile.complement_adresse}</p>}
                    <p>{profile?.code_postal || ''} {profile?.ville || ''}</p>
                    <p className="text-text-muted">{profile?.pays || 'France'}</p>
                  </address>
                )}
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                className="bg-surface p-6 rounded-3xl border border-surface-border"
              >
                <h3 className="font-serif text-lg text-text mb-4">Parrainez vos amis</h3>
                <p className="text-sm text-text-light mb-3">Votre code de parrainage</p>
                <div className="bg-background border border-primary/30 rounded-2xl px-4 py-3 text-center mb-3">
                  <p className="text-2xl font-bold tracking-widest text-primary">{referralCode || 'â€”'}</p>
                </div>
                <button
                  onClick={handleCopyReferralLink}
                  disabled={!referralCode}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-60"
                >
                  <Copy size={14} /> Copier le lien
                </button>
                {copySuccess && (
                  <p className="text-sm text-emerald-400 mt-2 text-center">Lien copiÃ© !</p>
                )}
                <p className="text-sm text-text-light mt-3 text-center">{referralCount} ami(s) parrainÃ©(s)</p>
                <p className="text-sm text-text-muted mt-3 text-center">
                  Parrainez un ami et gagnez 50 Plumes. <br />
                  Votre ami reÃ§oit âˆ’5% sur sa premiÃ¨re commande.
                </p>
              </motion.section>

              {/* DÃ©connexion */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-sm font-medium"
                >
                  <LogOut size={16} /> Se dÃ©connecter
                </button>
              </motion.div>

              {/* Suppression du compte */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                >
                  Supprimer mon compte
                </button>
              </motion.div>
            </div>

            {/* Colonne droite â€” Commandes */}
            <div className="lg:col-span-2">
              <motion.section 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-surface p-6 rounded-3xl border border-surface-border h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-xl text-text flex items-center gap-2"><Package size={20} className="text-primary"/> Mes commandes rÃ©centes</h3>
                  {Array.isArray(orders) && orders.length > 0 && (
                    <Link to="/mes-commandes" className="text-xs font-medium text-accent hover:underline flex items-center gap-1">
                      Tout voir <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
                
                {!Array.isArray(orders) || orders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-surface-border">
                      <Package size={24} className="text-text-muted" />
                    </div>
                    <p className="text-text-light mb-2">Vous n'avez pas encore passÃ© de commande.</p>
                    <Link to="/" className="inline-block mt-2 text-primary font-medium hover:underline">DÃ©couvrir nos produits</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order?.id || Math.random()} className="border border-surface-border rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center hover:border-accent/20 transition-all bg-background/50">
                        <div>
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="font-mono font-semibold text-text">#{order?.id}</span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusColor(order?.statut_paiement)}`}>
                              {order?.statut_paiement}
                            </span>
                          </div>
                          <p className="text-xs text-text-light flex items-center gap-1.5">
                            <Clock size={12} /> {order?.date_creation ? new Date(order.date_creation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'â€”'}
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            {Array.isArray(order?.produits) ? order.produits.map(p => p?.name).filter(Boolean).join(', ') : ''}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                          <span className="font-bold text-accent text-lg">{Number(order?.total || 0).toFixed(2)} â‚¬</span>
                          <span className="text-xs text-text-light">{Array.isArray(order?.produits) ? order.produits.length : 0} article(s)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            </div>

          </div>
        </main>
      </div>
    );
  } catch (e) {
    console.error('[Profile] Crash lors du rendu:', e);
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-serif text-text mb-2">Une erreur d'affichage est survenue</h2>
        <p className="text-text-light mb-4">DÃ©solÃ© pour ce dÃ©sagrÃ©ment.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-white rounded-xl">RÃ©essayer</button>
      </div>
    );
  }
};

export default Profile;
