import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden font-sans">
      <SEO
        title="Mot de passe oubliÃ© - Doiry Shop"
        description="RÃ©initialisez votre mot de passe Doiry Shop"
        url="https://doiryshop.com/reset-password"
        robots="noindex, nofollow"
      />
      {/* Hieroglyphic background texture */}
      <div className="absolute inset-0 bg-[url('/bg_texture.png')] bg-cover bg-center opacity-[0.03] pointer-events-none" />
      
      {/* Atmospheric glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[200px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[150px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[440px] px-6"
      >
        <div className="bg-surface/90 backdrop-blur-xl border border-surface-border shadow-2xl shadow-black/30 rounded-[24px] p-6 sm:p-10">
          
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.jpg" alt="DOIRY SHOP" className="w-20 h-20 object-contain rounded-xl" />
              <span className="font-display text-2xl font-bold tracking-widest text-primary">DOIRY SHOP</span>
            </Link>
            <h1 className="text-2xl font-serif font-bold text-text mt-4">Mot de passe oubliÃ©</h1>
          </div>

          <div className="mb-6 p-4 bg-primary/10 text-primary rounded-xl text-[13px] font-medium text-center border border-primary/20">
            FonctionnalitÃ© bientÃ´t disponible.
          </div>

          <form className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1.5">Email</label>
              <input 
                type="email" 
                disabled
                className="w-full px-4 h-12 bg-surface border border-surface-border rounded-[12px] text-[15px] text-text-muted cursor-not-allowed opacity-60" 
                placeholder="vous@email.com" 
              />
            </div>

            <button 
              type="button" 
              disabled
              className="w-full mt-2 bg-primary text-white h-12 rounded-[12px] font-medium text-[15px] opacity-50 cursor-not-allowed"
            >
              Envoyer le lien
            </button>
          </form>

          <p className="text-center text-[13px] mt-8 text-text-muted">
            <Link to="/login" className="text-accent font-medium hover:underline">
              Retour Ã  la connexion
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
