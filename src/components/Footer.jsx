import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, Mail } from 'lucide-react';
import { subscribeNewsletter } from '../services/api';
import PaymentBadges from './PaymentBadges';

const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} 
    viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
);

const InstagramIcon = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [code, setCode] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');

  const handleSubscribe = async (event) => {
    event.preventDefault();
    const emailValue = email.trim();
    console.log("handleSubscribe triggered avec:", emailValue);
    if (!emailValue) {
      setEmailError(true);
      setEmailErrorMessage('Veuillez saisir votre email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError(true);
      setEmailErrorMessage('Veuillez saisir un email valide');
      return;
    }
    setEmailError(false);
    setEmailErrorMessage('');
    setStatus('loading');
    try {
      const res = await subscribeNewsletter(email, 'footer');
      setCode(res.code || 'BIENVENUE10');
      setStatus('success');
      setEmail('');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <>
      <section className="bg-background-light border-t border-surface-border pt-8 pb-14">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <p className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-3">Newsletter</p>
            <h2 className="text-3xl font-serif text-text mb-2">Rejoins la communauté Doiry</h2>
            <p className="text-text-light">Recettes, rituels calmes et offres douces, directement par email.</p>
          </div>
          <form onSubmit={handleSubscribe} className="w-full md:w-[420px]">
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => { setEmail(event.target.value); setEmailError(false); }}
                placeholder="Ton email"
                className={`min-w-0 flex-1 px-4 h-12 bg-surface border rounded-xl focus:outline-none focus:border-primary text-text placeholder:text-text-muted transition-colors ${emailError ? 'border-primary' : 'border-surface-border'}`}
              />
              <button type="submit" disabled={status === 'loading'} className="h-12 px-5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 inline-flex items-center gap-2" onClick={() => alert('Button clicked successfully!')}>
                <Mail size={17} /> OK
                {/* V2 TEST COUCOU */}
              </button>
            </div>
            {emailError && <p className="text-primary text-xs mt-2 font-medium">{emailErrorMessage}</p>}
            <p className="text-[10px] text-text-muted mt-3 leading-relaxed">
              En vous inscrivant, vous acceptez de recevoir nos actualités. Voir notre <Link to="/politique-confidentialite" className="underline hover:text-accent transition-colors">politique de confidentialité</Link>.
            </p>
          </form>
        </div>
        {showToast && status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-lg shadow-emerald-500/30 border border-emerald-400/30 max-w-sm z-50"
          >
            <p className="font-medium mb-1">🎉 Merci, vous êtes bien inscrit(e) !</p>
            <p className="text-emerald-100 text-sm">Ton code promo arrive par email : <strong>{code}</strong></p>
          </motion.div>
        )}
      </section>
      <footer className="bg-surface border-t border-surface-border py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/bg_texture.png')] bg-cover bg-center opacity-[0.02] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        <Link to="/" className="flex flex-col items-center justify-center gap-3 mb-8 group">
          <img
            src="/logo.jpg"
            alt="Doiry Shop"
            className="h-14 w-auto rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-md"
          />
          <span className="text-2xl font-serif tracking-wider text-primary">Doiry Shop</span>
        </Link>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-8">
          <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <ShieldAlert size={16} />
            <span className="font-medium">Vente réservée aux majeurs de 18 ans. Ces produits ne sont pas des produits du tabac. Aucune nicotine.</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-light bg-background px-4 py-2 rounded-full border border-surface-border">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>Sans nicotine - plantes sélectionnées avec soin</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
          <Link
            to="/arret-tabac"
            className="text-sm font-medium text-text-light hover:text-primary transition-colors"
          >
            Arrêt du tabac
          </Link>
          <Link
            to="/mentions-legales"
            className="text-sm font-medium text-text-light hover:text-primary transition-colors"
          >
            Mentions légales
          </Link>
          <Link to="/cgv" className="text-sm font-medium text-text-light hover:text-primary transition-colors">
            CGV
          </Link>
          <Link
            to="/politique-confidentialite"
            className="text-sm font-medium text-text-light hover:text-primary transition-colors"
          >
            Politique de confidentialité
          </Link>
          <Link
            to="/politique-remboursement"
            className="text-sm font-medium text-text-light hover:text-primary transition-colors"
          >
            Politique de remboursement
          </Link>
        </div>

        <div className="flex items-center gap-6 mb-8">
          <a 
            href="https://instagram.com/doiryshop" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-background border border-surface-border flex items-center justify-center text-text-light hover:text-primary hover:border-primary transition-all shadow-sm"
            aria-label="Instagram"
          >
            <InstagramIcon size={20} />
          </a>
          <a 
            href="https://tiktok.com/@doiryshop" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-background border border-surface-border flex items-center justify-center text-text-light hover:text-primary hover:border-primary transition-all shadow-sm"
            aria-label="TikTok"
          >
            <TikTokIcon size={20} />
          </a>
        </div>

        <div className="mb-8">
          <PaymentBadges />
        </div>

        <div className="w-full max-w-2xl border-t border-surface-border pt-8 text-xs text-text-muted">
          <p>Copyright 2026 Doiry Shop</p>
          <p className="mt-2">Plantes séchées et infusions naturelles, fabriqués avec soin. Responsable de la publication : DUMAS Evan</p>
          <p className="mt-5 text-[11px] text-[#666]">Ce n'est pas une promesse. C'est une continuité. — Doiryshop</p>
        </div>
      </div>
      </footer>
    </>
  );
};

export default Footer;
