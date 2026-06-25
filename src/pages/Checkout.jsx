import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Heart, CheckCircle2, X, AlertCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLogto } from '@logto/react';
import { createOrder, getUserProfile, getLoyaltyPoints, verifyCoupon, getShippingOptions } from '../services/api';
import PaymentBadges from '../components/PaymentBadges';
import SEO from '../components/SEO';
import RelayPicker from '../components/RelayPicker';
import ReassuranceLayer from '../components/ReassuranceLayer';
import { buildOrderReference, buildRevolutMeUrl } from '../utils/revolutPayment';
const { div: MotionDiv } = motion;
const normalizeRole = (role) => (role === 'client' || !role ? 'retail' : role);

const Checkout = ({ cartItems, setCartItems, user }) => {
  const { signIn, isAuthenticated } = useLogto();
  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * parseInt(item.quantity)), 0);
  const isB2BUser = normalizeRole(user?.role) === 'b2b';
  const hasB2BMinTotal = subtotal >= 150;
  const hasB2BMinQtyPerItem = cartItems.every((item) => Number(item.quantity) >= 5);
  const b2bCheckoutValid = !isB2BUser || (hasB2BMinTotal && hasB2BMinQtyPerItem);

  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [selectedRelay, setSelectedRelay] = useState(null);
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
      // PrÃ©-remplir l'email
      setFormData(prev => ({ ...prev, email: user.email || '' }));

      // RÃ©cupÃ©rer le profil complet pour l'adresse
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
          console.error("Erreur lors de la rÃ©cupÃ©ration du profil pour le checkout", err);
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

    if (!formData.fname?.trim()) errors.fname = 'Veuillez saisir votre prÃ©nom';
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
      signIn(import.meta.env.VITE_LOGTO_CALLBACK_URL || `${window.location.origin}/callback`);
      return;
    }

    // Validate form (sets red borders and scrolls if invalid)
    const isFormValid = validateForm();

    if (!isFormValid || loadingShipping || shippingOptions.length === 0 || !selectedShipping || !b2bCheckoutValid) {
      setShowIncompleteError(true);
      return;
    }

    // Validation spÃ©cifique Mondial Relay
    if (selectedShipping.id === 'MONDIAL_RELAY' && !selectedRelay) {
      alert("Veuillez sÃ©lectionner un point relais sur la carte avant de continuer.");
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
        create_account: formData.createAccount,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        shipping_method: selectedShipping.id,
        shipping_price: deliveryCost,
        selectedShipping,
        relay_info: selectedRelay,
        orderTotal
      };

      console.log('[CHECKOUT] clic bouton');
      console.log('[CHECKOUT] orderData =', orderData);

      // 1. CrÃ©er la commande en attente dans la BDD
      const orderResponse = await createOrder(orderData);
      const orderId = orderResponse.orderId;
      const reference = orderResponse.reference || buildOrderReference(orderId);
      console.log('[CHECKOUT] orderId crÃ©Ã© =', orderId);

      // 2. Nettoyer le panier local
      setCartItems([]);
      localStorage.removeItem('cartItems');

      // 3. Rediriger directement vers Revolut dans le meme onglet
      const directRevolutLink = buildRevolutMeUrl({ amount: total, orderId, reference });
      window.location.href = directRevolutLink;

    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      let errorMsg = error.message || 'Veuillez rÃ©essayer.';
      if (error.message === 'Failed to fetch') {
        errorMsg = "Erreur de connexion au serveur. VÃ©rifiez que le backend est lancÃ©.";
      }
      alert("âŒ Erreur : " + errorMsg);
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
      setPromoError(err.message || 'Code invalide ou expirÃ©');
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
        <h2 className="text-3xl font-serif mb-4 text-text">Commande confirmÃ©e ! ðŸŽ‰</h2>
        <p className="text-text-light mb-2 max-w-md">Merci pour votre achat. Votre commande a Ã©tÃ© enregistrÃ©e avec succÃ¨s.</p>
        <p className="text-text-muted text-sm mb-8">Vous allez Ãªtre redirigÃ© vers l'accueil...</p>
        <Link to="/" className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">
          Retour Ã  la boutique
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-serif mb-4 text-text">Votre panier est vide</h2>
        <p className="text-text-light mb-8 max-w-md">Retournez Ã  la boutique pour dÃ©couvrir nos produits.</p>
        <Link to="/" className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">
          Retour Ã  la boutique
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
            <img src="/favicon.jpg" alt="Doiry Shop" className="h-10 w-auto rounded-lg" />
            <span className="font-display text-lg font-bold tracking-widest text-primary hidden sm:block">DOIRY SHOP</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12" noValidate>
          {/* Formulaire - Partie 1: CoordonnÃ©es & Livraison */}
          <div className="lg:col-span-7 order-2 lg:order-1 space-y-10">
            <div className="mb-8 flex items-center justify-between text-sm font-medium text-text-muted">
              <span className="text-primary font-bold">1. CoordonnÃ©es & Livraison</span>
              <span className="flex-1 h-px bg-surface-border mx-4"></span>
              <span>2. Paiement sÃ©curisÃ©</span>
            </div>

            {birthdayBonus.active && (
              <section className="bg-primary/10 border border-primary/30 p-5 rounded-2xl">
                <p className="text-primary font-semibold text-sm">Joyeux anniversaire ! -25% appliquÃ© automatiquement sur votre commande.</p>
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
                  <Link to="/login" className="text-xs text-primary hover:underline font-medium">DÃ©jÃ  client ? Se connecter</Link>
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
                    <input type="text" name="fname" placeholder="PrÃ©nom" value={formData.fname} onChange={handleChange} required
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
                  <input type="tel" name="telephone" placeholder="TÃ©lÃ©phone (Optionnel) - Ex: 06 12 34 56 78" value={formData.telephone} onChange={handleChange}
                    className="w-full px-4 py-3 min-h-[48px] bg-background border border-surface-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text placeholder:text-text-muted"
                  />
                </div>

                <div>
                  <input type="text" name="address" placeholder="Adresse complÃ¨te" value={formData.address} onChange={handleChange} required
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
                  <span className="text-sm font-medium text-text-light group-hover:text-accent transition-colors">CrÃ©er un compte pour ma prochaine commande (Optionnel)</span>
                </label>
              </div>
            </section>

            <section className="bg-surface p-6 md:p-8 rounded-3xl border border-surface-border">
              <h2 className="font-serif text-2xl mb-6 text-text">MÃ©thode de livraison</h2>

              {loadingShipping ? (
                <p className="text-sm text-text-light flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Calcul des frais de livraison...
                </p>
              ) : shippingError ? (
                <p className="text-sm text-primary">{shippingError}</p>
              ) : shippingOptions.length > 0 ? (
                <div className="space-y-4">
                  {shippingOptions.map((option) => (
                    <div 
                      key={option.id}
                      onClick={() => {
                        setSelectedShipping(option);
                        if (option.id !== 'MONDIAL_RELAY') setSelectedRelay(null);
                      }}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all ${selectedShipping?.id === option.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-surface-border hover:border-text-muted'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedShipping?.id === option.id ? 'border-primary' : 'border-surface-border'}`}>
                            {selectedShipping?.id === option.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <div>
                            <div className="font-bold text-text">{option.label}</div>
                            <div className="text-xs text-text-muted">{option.description} â€¢ {option.delay}</div>
                          </div>
                        </div>
                        <div className="font-bold text-accent">
                          {option.price === 0 ? <span className="text-emerald-500">GRATUIT</span> : `${option.price.toFixed(2)} â‚¬`}
                        </div>
                      </div>

                      {option.id === 'MONDIAL_RELAY' && selectedShipping?.id === 'MONDIAL_RELAY' && (
                        <div className="mt-4 pt-4 border-t border-surface-border/50">
                          {selectedRelay ? (
                            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-primary/20 shadow-sm">
                              <MapPin size={18} className="text-primary shrink-0 mt-1" />
                              <div className="text-sm">
                                <div className="font-bold text-[#1a1a1a]">{selectedRelay.name}</div>
                                <div className="text-[#333333]">{selectedRelay.address}</div>
                                <div className="text-[#666666] text-xs">{selectedRelay.zip} {selectedRelay.city}</div>
                                <button 
                                  type="button" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRelay(null);
                                  }}
                                  className="mt-2 text-primary font-medium hover:underline text-xs"
                                >
                                  Modifier le point relais
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-primary font-medium flex items-center gap-2 py-2">
                              <MapPin size={16} />
                              Veuillez sÃ©lectionner votre point relais sur la carte ci-dessous
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">Veuillez renseigner vos coordonnÃ©es pour calculer la livraison</p>
              )}
            </section>
          </div>

          {/* RÃ©capitulatif */}
          <div className="lg:col-span-5 relative order-1 lg:order-2">
            <div className="sticky top-28 space-y-6">

              <div className="bg-surface p-6 md:p-8 rounded-3xl border border-surface-border">
                <h3 className="font-serif text-xl mb-6 text-accent">RÃ©capitulatif</h3>
                <div className="space-y-4 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="relative">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl bg-background border border-surface-border" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white border border-surface-border rounded-full flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-text">{item.name}</h4>
                        <p className="text-sm text-text-light">{item.price} â‚¬</p>
                      </div>
                      <div className="font-medium text-accent">{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)} â‚¬</div>
                    </div>
                  ))}
                </div>

                {/* Code promo section */}
                <div className="mb-6 pt-4 border-t border-surface-border">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-emerald-400 font-medium text-sm">Code {appliedCoupon.code} appliquÃ©</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">- {discountAmount.toFixed(2)} â‚¬</span>
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
                    <span>{parseFloat(subtotal).toFixed(2)} â‚¬</span>
                  </div>
                  <div className="flex justify-between text-text-light">
                    <span>Livraison {selectedShipping?.id === 'MONDIAL_RELAY' ? 'en point relais' : 'Ã  domicile'}</span>
                    <span>
                      {loadingShipping ? (
                        'Calcul en cours...'
                      ) : selectedShipping ? (
                        selectedShipping.price === 0 ? (
                          <span style={{ color: '#4ade80' }}>Offerte</span>
                        ) : (
                          <span>{Number(selectedShipping.price).toFixed(2)} â‚¬</span>
                        )
                      ) : (
                        <span>-</span>
                      )}
                    </span>
                  </div>
                  {birthdayBonus.active && (
                    <div className="flex justify-between text-primary font-medium">
                      <span>RÃ©duction membre anniversaire (-25%)</span>
                      <span>- {birthdayDiscount.toFixed(2)} â‚¬</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>RÃ©duction ({appliedCoupon.code})</span>
                      <span>- {discountAmount.toFixed(2)} â‚¬</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xl font-serif font-bold pt-4 border-t border-surface-border text-accent">
                    <span>Total TTC</span>
                    <span>{parseFloat(total).toFixed(2)} â‚¬</span>
                  </div>
                </div>

                <div className="pt-5 mt-6 border-t border-surface-border">
                  <PaymentBadges size="sm" className="justify-center text-text-muted" />
                </div>
              </div>

              {/* Badges de rÃ©assurance */}
              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-surface rounded-full text-primary shadow-sm"><Lock size={20} /></div>
                  <div>
                    <h4 className="font-medium text-sm text-text">Paiement chiffrÃ© et protÃ©gÃ©</h4>
                    <p className="text-xs text-text-muted mt-1">DonnÃ©es chiffrÃ©es (SSL 256-bits). Vos coordonnÃ©es bancaires ne sont jamais stockÃ©es.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-surface rounded-full text-accent shadow-sm"><ShieldCheck size={20} /></div>
                  <div>
                    <h4 className="font-medium text-sm text-text">Sans nicotine</h4>
                    <p className="text-xs text-text-muted mt-1">Plantes sÃ©lectionnÃ©es avec soin et informations produit claires.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-surface rounded-full text-primary shadow-sm"><Heart size={20} /></div>
                  <div>
                    <h4 className="font-medium text-sm text-text">QualitÃ© artisanale contrÃ´lÃ©e</h4>
                    <p className="text-xs text-text-muted mt-1">Disponible 7j/7 pour vous accompagner dans votre dÃ©marche de bien-Ãªtre.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Widget Mondial Relay Full Width */}
          {selectedShipping?.id === 'MONDIAL_RELAY' && !selectedRelay && (
            <div className="lg:col-span-12 order-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <RelayPicker 
                zip={formData.zip} 
                country={formData.countryCode} 
                onSelect={setSelectedRelay} 
              />
            </div>
          )}

          {/* Bouton de validation final */}
          <div className="lg:col-span-7 order-4 space-y-6">
            {isB2BUser && !b2bCheckoutValid && (
              <div className="p-3 bg-[#3b0d14] border border-[#fca5a5] rounded-xl text-[#ffe4e6] text-sm font-semibold text-center">
                Compte Professionnel : minimum de commande de 150€ TTC.
              </div>
            )}
            {showIncompleteError && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm flex items-center justify-center gap-2 font-medium">
                <AlertCircle size={18} />
                Veuillez remplir tous les champs obligatoires
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !b2bCheckoutValid}
              className={`w-full bg-[#5C141F] text-white py-5 rounded-2xl font-serif text-xl hover:bg-[#721924] transition-all transform shadow-lg flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${(!isValid || shippingOptions.length === 0 || !selectedShipping || (selectedShipping.id === 'MONDIAL_RELAY' && !selectedRelay)) && !isSubmitting ? 'opacity-70' : 'hover:-translate-y-1'}`}
              onClick={() => {
                if (!isValid || shippingOptions.length === 0 || !selectedShipping || !b2bCheckoutValid) {
                  setShowIncompleteError(true);
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <MotionDiv animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
                  GÃ©nÃ©ration en cours...
                </>
              ) : (
                <>Continuer vers le paiement</>
              )}
            </button>
            <ReassuranceLayer className="justify-center items-center" />
            <p className="text-center text-xs text-text-muted mt-3">
              En passant commande, vous acceptez nos <Link to="/cgv" className="underline hover:text-primary transition-colors">CGV</Link> et notre <Link to="/politique-remboursement" className="underline hover:text-primary transition-colors">politique de remboursement</Link>.
            </p>
          </div>
        </form>
      </main>

      {/* Footer minimal (checkout only) */}
      <footer className="border-t border-surface-border py-6 px-6 text-center text-xs text-text-muted">
        <span>Â© Doiry Shop â€” </span>
        <Link to="/mentions-legales" className="hover:text-primary transition-colors">
          Mentions lÃ©gales
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

