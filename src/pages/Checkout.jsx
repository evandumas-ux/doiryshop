import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Heart, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLogto } from '@logto/react';
import { createOrder, getUserProfile, getLoyaltyPoints, verifyCoupon, getShippingOptions } from '../services/api';
import PaymentBadges from '../components/PaymentBadges';
import SEO from '../components/SEO';
import { buildOrderReference, buildRevolutMeUrl } from '../utils/revolutPayment';
const MotionDiv = motion.div;
const Checkout = ({ cartItems, setCartItems, user }) => {
  const { isAuthenticated, signIn } = useLogto();
  const redirectToAuth = () => signIn(import.meta.env.VITE_LOGTO_CALLBACK_URL || `${window.location.origin}/callback`);
  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * parseInt(item.quantity)), 0);

  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [birthdayBonus, setBirthdayBonus] = useState({ active: false, expiration: null });


  const cartTotal = subtotal;

  const deliveryCost = Number(selectedShipping?.price ?? 0);
  const cartTotalBase = subtotal > 0 ? subtotal + deliveryCost : 0;
  const birthdayDiscount = birthdayBonus.active ? cartTotalBase * 0.25 : 0;
  const couponBaseTotal = Math.max(0, cartTotalBase - birthdayDiscount);
  const discountAmount = appliedCoupon
    ? (['pourcentage', 'percentage'].includes(appliedCoupon.type)
      ? (couponBaseTotal * appliedCoupon.discount) / 100
      : appliedCoupon.discount)
    : 0;
  const total = Math.max(0, couponBaseTotal - discountAmount);

  const [formData, setFormData] = useState({
    email: '', fname: '', lname: '', telephone: '', address: '', zip: '', city: '', countryCode: 'FR', createAccount: false
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess] = useState(false);
  const [showIncompleteError, setShowIncompleteError] = useState(false);

  useEffect(() => {
    if (user) {
      // Pré-remplir l'email
      setFormData(prev => ({ ...prev, email: user.email || '' }));

      // Récupérer le profil complet pour l'adresse
      const fetchProfile = async () => {
        try {
          const profile = await getUserProfile();
          if (profile) {
            setFormData(prev => ({
              ...prev,
              fname: profile.prenom || profile.name?.split(' ')[0] || prev.fname,
              lname: profile.nom || profile.name?.split(' ').slice(1).join(' ') || prev.lname,
              telephone: profile.telephone || prev.telephone,
              address: profile.adresse || prev.address,
              zip: profile.code_postal || prev.zip,
              city: profile.ville || prev.city,
              countryCode: profile.pays === 'France'
                ? 'FR'
                : (profile.pays || prev.countryCode || 'FR').slice(0, 2).toUpperCase()
            }));
          }

          const loyalty = await getLoyaltyPoints();
          setBirthdayBonus({
            active: !!loyalty?.anniversaire_actif,
            expiration: loyalty?.anniversaire_expiration || null
          });
        } catch (err) {
          console.error("Erreur lors de la récupération du profil pour le checkout", err);
        }
      };
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (cartItems.length > 0) {
      console.log("[Checkout] Fetching shipping options for cartItems:", cartItems.length);
      setLoadingShipping(true);
      setShippingError('');
      
      const payloadItems = cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        weight_g: item.weight || 50,
        thickness_mm: item.thickness_mm || 10,
        length_cm: item.length_cm || 20,
        width_cm: item.width_cm || 15
      }));
      
      getShippingOptions(subtotal, payloadItems)
        .then(res => {
          console.log("[Checkout] Shipping options received:", res);
          if (res.options && res.options.length > 0) {
            setShippingOptions(res.options);
            setSelectedShipping(prev => {
              if (prev && res.options.find(opt => opt.id === prev.id)) {
                return prev;
              }
              return res.options[0] || null;
            });
          } else {
             setShippingOptions([]);
             setSelectedShipping(null);
          }
        })
        .catch(err => {
          console.error("[Checkout] Erreur shipping options:", err);
          setShippingError('Impossible de calculer les frais de port');
          setShippingOptions([]);
          setSelectedShipping(null);
        })
        .finally(() => {
          setLoadingShipping(false);
        });
    } else {
      setShippingOptions([]);
      setSelectedShipping(null);
    }
  }, [cartItems, subtotal]);

  const isValid = formData.email && formData.fname && formData.lname && formData.address && formData.zip && formData.city;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setShowIncompleteError(false);
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fname?.trim()) errors.fname = 'Veuillez saisir votre prénom';
    if (!formData.lname?.trim()) errors.lname = 'Veuillez saisir votre nom';
    if (!formData.email?.trim()) errors.email = 'Veuillez saisir un email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Veuillez saisir un email valide';
    if (!formData.address?.trim()) errors.address = 'Veuillez saisir votre adresse';
    if (!formData.zip?.trim()) errors.zip = 'Veuillez saisir votre code postal';
    if (!formData.city?.trim()) errors.city = 'Veuillez saisir votre ville';

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Scroll to the first error field
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus({ preventScroll: true });
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || isAuthenticated === false) {
      redirectToAuth();
      return;
    }

    // Validate form (sets red borders and scrolls if invalid)
    const isFormValid = validateForm();

    if (!isFormValid || loadingShipping || shippingOptions.length === 0 || !selectedShipping) {
      setShowIncompleteError(true);
      return;
    }

    setShowIncompleteError(false);
    setIsSubmitting(true);

    try {
      const orderTotal = cartTotal + (selectedShipping?.price ?? 0);
      const orderData = {
        produits: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          weight: item.weight || 50
        })),
        total: total,
        statut_paiement: 'en_attente',
        adresse_livraison: {
          email: formData.email,
          fname: formData.fname,
          lname: formData.lname,
          telephone: formData.telephone,
          address: formData.address,
          zip: formData.zip,
          city: formData.city
        },
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        shipping_method: selectedShipping.id,
        shipping_price: deliveryCost,
        selectedShipping,
        orderTotal
      };

      console.log('[CHECKOUT] clic bouton');
      console.log('[CHECKOUT] orderData =', orderData);

      // 1. Créer la commande en attente dans la BDD (génère aussi le RIB en backend)
      const orderResponse = await createOrder(orderData);
      const orderId = orderResponse.orderId;
      const reference = orderResponse.reference || buildOrderReference(orderId);
      console.log('[CHECKOUT] orderId créé =', orderId);

      // 2. Nettoyer le panier local
      setCartItems([]);
      localStorage.removeItem('cartItems');

      // 3. Rediriger directement vers Revolut dans le meme onglet
      const directRevolutLink = buildRevolutMeUrl({ amount: total, orderId, reference });
      window.location.href = directRevolutLink;

    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      let errorMsg = error.message || 'Veuillez réessayer.';
      if (error.message === 'Failed to fetch') {
        errorMsg = "Erreur de connexion au serveur. Vérifiez que le backend est lancé.";
      }
      alert("❌ Erreur : " + errorMsg);
      setIsSubmitting(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    setPromoError('');
    try {
      const res = await verifyCoupon(promoCode, couponBaseTotal);
      if (res && res.valid) {
        setAppliedCoupon({
          code: res.code,
          discount: res.discount,
          valeur: res.valeur,
          type: res.type
        });
        setPromoCode('');
      }
    } catch (err) {
      setPromoError(err.message || 'Code invalide ou expiré');
      setAppliedCoupon(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedCoupon(null);
    setPromoError('');
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <MotionDiv
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
        </MotionDiv>
        <h2 className="text-3xl font-serif mb-4 text-text">Commande confirmée ! 🎉</h2>
        <p className="text-text-light mb-2 max-w-md">Merci pour votre achat. Votre commande a été enregistrée avec succès.</p>
        <p className="text-text-muted text-sm mb-8">Vous allez être redirigé vers l'accueil...</p>
        <Link to="/" className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-serif mb-4 text-text">Votre panier est vide</h2>
        <p className="text-text-light mb-8 max-w-md">Retournez à la boutique pour découvrir nos produits.</p>
        <Link to="/" className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Commande | Doiry Shop"
        description="Finalisez votre commande sur Doiry Shop"
        url="https://doiryshop.com/checkout"
        robots="noindex, nofollow"
      />
      {/* Header */}
      <header className="w-full bg-surface border-b border-surface-border py-5 px-6 z-10 sticky top-0">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo.jpg" alt="Doiry Shop" className="h-10 w-auto rounded-lg" />
            <span className="font-display text-lg font-bold tracking-widest text-primary hidden sm:block">DOIRY SHOP</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Formulaire */}
        <div className="lg:col-span-7 order-last lg:order-first">
          <div className="mb-8 flex items-center justify-between text-sm font-medium text-text-muted">
            <span className="text-primary font-bold">1. Coordonnées & Livraison</span>
            <span className="flex-1 h-px bg-surface-border mx-4"></span>
            <span>2. Paiement sécurisé</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10" noValidate>
            {birthdayBonus.active && (
              <section className="bg-primary/10 border border-primary/30 p-5 rounded-2xl">
                <p className="text-primary font-semibold text-sm">Joyeux anniversaire ! -25% appliqué automatiquement sur votre commande.</p>
                {birthdayBonus.expiration && (
                  <p className="text-text-light text-xs mt-1">
                    Offre valable jusqu&apos;au {new Date(birthdayBonus.expiration).toLocaleString('fr-FR')}
                  </p>
                )}
              </section>
            )}

            <section className="bg-surface p-6 md:p-8 rounded-3xl border border-surface-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl text-text">Livraison</h2>
                {!user && (
                  <Link to="/login" className="text-xs text-primary hover:underline font-medium">Déjà client ? Se connecter</Link>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <input type="email" name="email" placeholder="Adresse email" value={formData.email} onChange={handleChange} required
                      className={`w-full px-4 py-3 min-h-[48px] bg-background border rounded-xl focus:outline-none focus:ring-1 transition-all text-text placeholder:text-text-muted ${fieldErrors.email ? 'border-primary' : 'border-surface-border focus:border-primary focus:ring-primary'
                        }`}
                    />
                    {formData.email.includes('@') && !fieldErrors.email && <CheckCircle2 className="absolute right-4 top-3.5 text-green-500 w-5 h-5" />}
                  </div>
                  {fieldErrors.email && <p className="text-primary text-xs mt-1 font-medium">{fieldErrors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input type="text" name="fname" placeholder="Prénom" value={formData.fname} onChange={handleChange} required
                      className={`w-full px-4 py-3 min-h-[48px] bg-background border rounded-xl focus:outline-none focus:ring-1 transition-all text-text placeholder:text-text-muted ${fieldErrors.fname ? 'border-primary' : 'border-surface-border focus:border-primary focus:ring-primary'
                        }`} />
                    {fieldErrors.fname && <p className="text-primary text-xs mt-1 font-medium">{fieldErrors.fname}</p>}
                  </div>
                  <div>
                    <input type="text" name="lname" placeholder="Nom" value={formData.lname} onChange={handleChange} required
                      className={`w-full px-4 py-3 min-h-[48px] bg-background border rounded-xl focus:outline-none focus:ring-1 transition-all text-text placeholder:text-text-muted ${fieldErrors.lname ? 'border-primary' : 'border-surface-border focus:border-primary focus:ring-primary'
                        }`} />
                    {fieldErrors.lname && <p className="text-primary text-xs mt-1 font-medium">{fieldErrors.lname}</p>}
                  </div>
                </div>

                <div>
                  <input type="tel" name="telephone" placeholder="Téléphone (Optionnel) - Ex: 06 12 34 56 78" value={formData.telephone} onChange={handleChange}
                    className="w-full px-4 py-3 min-h-[48px] bg-background border border-surface-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text placeholder:text-text-muted"
                  />
                </div>

                <div>
                  <input type="text" name="address" placeholder="Adresse complète" value={formData.address} onChange={handleChange} required
                    className={`w-full px-4 py-3 min-h-[48px] bg-background border rounded-xl focus:outline-none focus:ring-1 transition-all text-text placeholder:text-text-muted ${fieldErrors.address ? 'border-primary' : 'border-surface-border focus:border-primary focus:ring-primary'
                      }`} />
                  {fieldErrors.address && <p className="text-primary text-xs mt-1 font-medium">{fieldErrors.address}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <input type="text" name="zip" placeholder="Code Postal" value={formData.zip} onChange={handleChange} required
                      className={`w-full px-4 py-3 bg-background border rounded-xl focus:outline-none focus:ring-1 transition-all col-span-1 text-text placeholder:text-text-muted ${fieldErrors.zip ? 'border-primary' : 'border-surface-border focus:border-primary focus:ring-primary'
                        }`} />
                    {fieldErrors.zip && <p className="text-primary text-xs mt-1 font-medium">{fieldErrors.zip}</p>}
                  </div>
                  <div className="col-span-2">
                    <input type="text" name="city" placeholder="Ville" value={formData.city} onChange={handleChange} required
                      className={`w-full px-4 py-3 bg-background border rounded-xl focus:outline-none focus:ring-1 transition-all text-text placeholder:text-text-muted ${fieldErrors.city ? 'border-primary' : 'border-surface-border focus:border-primary focus:ring-primary'
                        }`} />
                    {fieldErrors.city && <p className="text-primary text-xs mt-1 font-medium">{fieldErrors.city}</p>}
                  </div>
                </div>

                <label className="flex items-center gap-3 mt-4 cursor-pointer group">
                  <input type="checkbox" name="createAccount" checked={formData.createAccount} onChange={handleChange} className="w-5 h-5 rounded border-surface-border text-primary focus:ring-primary accent-primary bg-background" />
                  <span className="text-sm font-medium text-text-light group-hover:text-accent transition-colors">Créer un compte pour ma prochaine commande (Optionnel)</span>
                </label>
              </div>
            </section>

            <section className="bg-surface p-6 md:p-8 rounded-3xl border border-surface-border">
              <h2 className="font-serif text-2xl mb-6 text-text">Mode d'envoi</h2>

              {loadingShipping && (
                <p className="text-sm text-text-light mt-4">Chargement des options de livraison...</p>
              )}
              {shippingError && (
                <p className="text-sm text-primary mt-4">{shippingError}</p>
              )}

              {shippingOptions.length > 0 && !loadingShipping && (
                <div className="space-y-3 mt-4">
                  {shippingOptions.map(opt => (
                    <label key={opt.id} className={`block border rounded-xl p-4 cursor-pointer transition-all ${selectedShipping?.id === opt.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-background border-surface-border'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" value={opt.id}
                               checked={selectedShipping?.id === opt.id}
                               onChange={() => setSelectedShipping(opt)}
                               className="w-5 h-5 text-primary accent-primary" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <strong>{opt.label}</strong>
                            <span className="font-bold">
                              {opt.free
                                ? (<><span className="text-accent">GRATUIT</span><small className="line-through ml-2 text-text-muted">{opt.originalPrice.toFixed(2)} €</small></>)
                                : (<span>{opt.price.toFixed(2)} €</span>)}
                            </span>
                          </div>
                          <p className="text-sm text-text-light">{opt.description}</p>
                          <span className="text-xs text-text-muted">{opt.delay}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </section>

            {showIncompleteError && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm flex items-center justify-center gap-2 font-medium">
                <AlertCircle size={18} />
                Veuillez remplir tous les champs obligatoires
              </div>
            )}
            <button
              type={user ? "submit" : "button"}
              disabled={isSubmitting}
              className={`w-full bg-[#5C141F] text-white py-5 rounded-2xl font-serif text-xl hover:bg-[#721924] transition-all transform shadow-lg flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${(!isValid || shippingOptions.length === 0 || !selectedShipping) && !isSubmitting && user ? 'opacity-70' : 'hover:-translate-y-1'}`}
              onClick={(e) => {
                if (!user || isAuthenticated === false) {
                  e.preventDefault();
                  redirectToAuth();
                  return;
                }
                if (!isValid || shippingOptions.length === 0 || !selectedShipping) {
                  setShowIncompleteError(true);
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <MotionDiv animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
                  Génération en cours...
                </>
              ) : (
                <>{user ? "VALIDER ET PAYER VIA REVOLUT" : "SE CONNECTER POUR COMMANDER"}</>
              )}
            </button>
            <p className="text-center text-xs text-text-muted mt-3">
              En passant commande, vous acceptez nos <Link to="/cgv" className="underline hover:text-primary transition-colors">CGV</Link> et notre <Link to="/politique-remboursement" className="underline hover:text-primary transition-colors">politique de remboursement</Link>.
            </p>
          </form>
        </div>

        {/* Récapitulatif */}
        <div className="lg:col-span-5 relative order-first lg:order-last">
          <div className="sticky top-28 space-y-6">

            <div className="bg-surface p-6 md:p-8 rounded-3xl border border-surface-border">
              <h3 className="font-serif text-xl mb-6 text-accent">Récapitulatif</h3>
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl bg-background border border-surface-border" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white border border-surface-border rounded-full flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-text">{item.name}</h4>
                      <p className="text-sm text-text-light">{item.price} €</p>
                    </div>
                    <div className="font-medium text-accent">{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)} €</div>
                  </div>
                ))}
              </div>

              {/* Code promo section */}
              <div className="mb-6 pt-4 border-t border-surface-border">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-emerald-400 font-medium text-sm">Code {appliedCoupon.code} appliqué</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold">- {discountAmount.toFixed(2)} €</span>
                      <button type="button" onClick={handleRemovePromo} className="text-emerald-500 hover:text-emerald-300 p-1">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Code promo"
                        className="flex-1 px-4 h-11 bg-background border border-surface-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm text-text placeholder:text-text-muted uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={!promoCode.trim() || isApplyingPromo}
                        className="px-4 h-11 bg-surface-light border border-surface-border text-text hover:bg-surface-border transition-colors rounded-xl font-medium text-sm disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                      >
                        {isApplyingPromo ? <div className="w-4 h-4 border-2 border-text/30 border-t-text rounded-full animate-spin" /> : "Appliquer"}
                      </button>
                    </div>
                    {promoError && <p className="text-primary text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} /> {promoError}</p>}
                  </div>
                )}
              </div>

              <div className="border-t border-surface-border pt-4 space-y-3 mt-6">
                <div className="flex justify-between text-text-light">
                  <span>Sous-total</span>
                  <span>{parseFloat(subtotal).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-text-light">
                  <span>Frais de livraison</span>
                  <span>
                    {loadingShipping ? (
                      'Calcul en cours⬦'
                    ) : selectedShipping ? (
                      selectedShipping.price === 0 ? (
                        <span style={{ color: '#4ade80' }}>Offerte</span>
                      ) : (
                        <span>{Number(selectedShipping.price).toFixed(2)} €</span>
                      )
                    ) : (
                      <span></span>
                    )}
                  </span>
                </div>
                {birthdayBonus.active && (
                  <div className="flex justify-between text-primary font-medium">
                    <span>Réduction membre anniversaire (-25%)</span>
                    <span>- {birthdayDiscount.toFixed(2)} €</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Réduction ({appliedCoupon.code})</span>
                    <span>- {discountAmount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xl font-serif font-bold pt-4 border-t border-surface-border text-accent">
                  <span>Total TTC</span>
                  <span>{parseFloat(total).toFixed(2)} €</span>
                </div>
              </div>

              <div className="pt-5 mt-6 border-t border-surface-border">
                <PaymentBadges size="sm" className="justify-center text-text-muted" />
              </div>
            </div>

            {/* Badges de réassurance */}
            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-surface rounded-full text-primary shadow-sm"><Lock size={20} /></div>
                <div>
                  <h4 className="font-medium text-sm text-text">Paiement chiffré et protégé</h4>
                  <p className="text-xs text-text-muted mt-1">Données chiffrées (SSL 256-bits). Vos coordonnées bancaires ne sont jamais stockées.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-surface rounded-full text-accent shadow-sm"><ShieldCheck size={20} /></div>
                <div>
                  <h4 className="font-medium text-sm text-text">Sans nicotine</h4>
                  <p className="text-xs text-text-muted mt-1">Plantes sélectionnées avec soin et informations produit claires.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-surface rounded-full text-primary shadow-sm"><Heart size={20} /></div>
                <div>
                  <h4 className="font-medium text-sm text-text">Qualité artisanale contrôlée</h4>
                  <p className="text-xs text-text-muted mt-1">Disponible 7j/7 pour vous accompagner dans votre démarche de bien-être.</p>
                </div>
              </div>
            </div>

            {/* Micro Témoignage */}
            <div className="p-5 border border-surface-border rounded-2xl bg-surface/50 relative">
              <span className="text-4xl text-accent/20 font-serif absolute top-2 left-3">"</span>
              <p className="text-sm font-light italic relative z-10 text-text-light">
                Le colis est arrivé très vite et de manière hyper discrète. La qualité est au rendez-vous. Merci !
                <br /><strong className="text-text mt-2 block not-italic font-medium"> Thomas V. (Achat vérifié)</strong>
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Footer minimal (checkout only) */}
      <footer className="border-t border-surface-border py-6 px-6 text-center text-xs text-text-muted">
        <span>© Doiry Shop — </span>
        <Link to="/mentions-legales" className="hover:text-primary transition-colors">
          Mentions légales
        </Link>
        <span> | </span>
        <Link to="/cgv" className="hover:text-primary transition-colors">
          CGV
        </Link>
        <span> | </span>
        <Link to="/politique-remboursement" className="hover:text-primary transition-colors">
          Politique de remboursement
        </Link>
      </footer>
    </div>
  );
};

export default Checkout;
