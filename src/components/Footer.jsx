import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
      const response = await subscribeNewsletter(emailValue);
      setCode(response.code || 'BIENVENUE10');
      setStatus('success');
      setEmail('');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (err) {
      console.error('Erreur inscription :', err);
      setStatus('error');
      setEmailError(true);
      setEmailErrorMessage("Une erreur est survenue lors de l'inscription.");
    }
  };

  return (
    <>
      <section className="bg-[#0A0A0A] border-t border-white/5 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_auto] gap-12 items-center">
          <div className="max-w-2xl">
            <p className="text-[#8b0000] text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Newsletter</p>
            <h2 className="text-4xl font-serif text-white mb-4 leading-tight">Rejoins la communauté Doiry</h2>
            <p className="text-neutral-500 font-light text-lg">Recettes, rituels calmes et offres douces, directement par email.</p>
          </div>
          <form onSubmit={handleSubscribe} className="w-full lg:w-[450px]">
            <div className="relative group">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => { setEmail(event.target.value); setEmailError(false); }}
                placeholder="Ton adresse email"
                className={`w-full px-0 py-4 bg-transparent border-b text-white placeholder:text-neutral-700 focus:outline-none transition-colors duration-500 ${emailError ? 'border-[#8b0000]' : 'border-neutral-800 focus:border-white'}`}
              />
              <button 
                type="submit" 
                disabled={status === 'loading'} 
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[#8b0000] hover:text-white transition-all duration-500 disabled:opacity-50 group-hover:translate-x-1"
                aria-label="S'inscrire"
              >
                {status === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={20} />
                )}
              </button>
            </div>
            {emailError && <p className="text-[#8b0000] text-[10px] uppercase tracking-widest mt-3 font-bold">{emailErrorMessage}</p>}
            <p className="text-[10px] text-neutral-600 mt-6 leading-relaxed font-light uppercase tracking-tighter">
              En vous inscrivant, vous acceptez de recevoir nos actualités. Voir notre <Link to="/politique-confidentialite" className="text-neutral-400 hover:text-white transition-colors">politique de confidentialité</Link>.
            </p>
          </form>
        </div>
        {showToast && status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 bg-black/80 backdrop-blur-xl text-white px-8 py-5 rounded-2xl shadow-2xl border border-white/10 max-w-sm z-50"
          >
            <p className="font-bold uppercase text-[10px] tracking-[0.2em] mb-2 text-[#8b0000]">✓ Inscription validée</p>
            <p className="text-neutral-400 text-xs leading-relaxed">Merci, votre code promo arrive par email : <span className="text-white font-bold tracking-widest ml-1">{code}</span></p>
          </motion.div>
        )}
      </section>

      <footer className="bg-[#050505] border-t border-white/5 py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-flex flex-col gap-6 group mb-8">
                <img
                  src="/favicon.jpg"
                  alt="Doiry Shop"
                  className="h-20 w-auto object-contain rounded-lg shadow-2xl shadow-black/40"
                />
                <span className="text-2xl font-serif tracking-[0.3em] uppercase text-white font-light">Doiry <br/> Shop</span>
              </Link>
              <div className="flex items-center gap-6 mt-4">
                <a 
                  href="https://instagram.com/doiryshop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-600 hover:text-white transition-colors duration-500"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={20} />
                </a>
                <a 
                  href="https://tiktok.com/@doiryshop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-600 hover:text-white transition-colors duration-500"
                  aria-label="TikTok"
                >
                  <TikTokIcon size={20} />
                </a>
              </div>
            </div>

            {/* Navigation Columns */}
            <div className="flex flex-col gap-10">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-neutral-600">Aide & Contact</h4>
              <ul className="flex flex-col gap-5">
                <li>
                  <Link to="/arret-tabac" className="text-sm font-light text-neutral-400 hover:text-[#8b0000] transition-colors duration-500">
                    Arrêt du tabac
                  </Link>
                </li>
                <li>
                  <a href="mailto:contact@doiryshop.com" className="text-sm font-light text-neutral-400 hover:text-[#8b0000] transition-colors duration-500">
                    Nous contacter
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-10 lg:col-span-2">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-neutral-600">Informations Légales</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
                <Link to="/mentions-legales" className="text-sm font-light text-neutral-400 hover:text-[#8b0000] transition-colors duration-500">
                  Mentions légales
                </Link>
                <Link to="/cgv" className="text-sm font-light text-neutral-400 hover:text-[#8b0000] transition-colors duration-500">
                  CGV
                </Link>
                <Link to="/politique-confidentialite" className="text-sm font-light text-neutral-400 hover:text-[#8b0000] transition-colors duration-500">
                  Confidentialité
                </Link>
                <Link to="/politique-remboursement" className="text-sm font-light text-neutral-400 hover:text-[#8b0000] transition-colors duration-500">
                  Remboursement
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 pt-16 border-t border-white/5">
            <div className="opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
              <PaymentBadges />
            </div>
            <div className="text-center lg:text-right space-y-4">
               <p className="text-[11px] text-neutral-500 uppercase tracking-widest leading-relaxed max-w-2xl ml-auto font-light">
                 Vente réservée aux personnes majeures de plus de 18 ans. Ce produit est une alternative végétale naturelle, sans tabac ni nicotine.
               </p>
               <p className="text-[10px] text-neutral-600 uppercase tracking-widest">© 2026 Doiry Shop — Tous droits réservés</p>
            </div>
          </div>

          <div className="mt-20 space-y-4 text-center border-t border-white/5 pt-12">
            <p className="text-[10px] text-neutral-700 uppercase tracking-[0.2em] font-light">
              Plantes sélectionnées avec soin — Responsable : Dumas Evan — "Ce n'est pas une promesse. C'est une continuité."
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
