import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleForgotPassword déclenché avec :", email); // LOG DE SÉCURITÉ
    setIsLoading(true);

    try {
      const response = await fetch('https://doiryshop-api.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Erreur réseau formulaire mdp oublié :", error);
    } finally {
      setIsLoading(false); // S'assurer que le spinner s'arrête
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden font-sans">
      <SEO
        title="Mot de passe oublié - Doiry Shop"
        description="Réinitialisez votre mot de passe Doiry Shop"
        url="https://doiryshop.com/mot-de-passe-oublie"
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
              <img src="/favicon.jpg" alt="DOIRY SHOP" className="w-20 h-20 object-contain rounded-lg" />
              <span className="font-display text-2xl font-bold tracking-widest text-primary">DOIRY SHOP</span>
            </Link>
            <h1 className="text-2xl font-serif font-bold text-text mt-4">Mot de passe oublié</h1>
            <p className="text-text-muted text-sm mt-2">Nous allons vous envoyer un lien de réinitialisation</p>
          </div>

          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-accent/10 border border-accent/20 rounded-2xl text-center"
            >
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text font-medium">
                Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.
              </p>
              <Link 
                to="/login" 
                className="inline-block mt-6 text-[14px] text-accent font-semibold hover:underline"
              >
                Retour à la connexion
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-medium text-text-light mb-1.5">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text placeholder:text-text-muted" 
                  placeholder="vous@email.com" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-2 bg-primary text-white h-12 rounded-[12px] font-medium text-[15px] hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : "Envoyer le lien de réinitialisation"}
              </button>

              <p className="text-center text-[13px] mt-6 text-text-muted">
                <Link to="/login" className="text-accent font-medium hover:underline">
                  Retour à la connexion
                </Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
