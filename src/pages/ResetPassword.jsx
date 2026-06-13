import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://doiryshop-api.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: password })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Votre mot de passe a été réinitialisé avec succès !");
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      console.error("Erreur réseau reset password :", err);
      setError("Impossible de joindre le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden font-sans">
      <SEO
        title="Nouveau mot de passe - Doiry Shop"
        description="Réinitialisez votre mot de passe Doiry Shop"
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
              <img src="/favicon.jpg" alt="DOIRY SHOP" className="w-20 h-20 object-contain rounded-lg" />
              <span className="font-display text-2xl font-bold tracking-widest text-primary">DOIRY SHOP</span>
            </Link>
            <h1 className="text-2xl font-serif font-bold text-text mt-4">Nouveau mot de passe</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl text-[13px] font-medium text-center border border-red-500/20">
              {error}
            </div>
          )}

          {message ? (
            <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-400 rounded-xl text-[14px] font-medium text-center border border-emerald-500/20">
              {message}
              <p className="mt-2 text-[13px] opacity-80">Redirection vers la connexion...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-medium text-text-light mb-1.5">Email</label>
                <input 
                  type="email" 
                  disabled
                  value={email}
                  className="w-full px-4 h-12 bg-surface border border-surface-border rounded-[12px] text-[15px] text-text-muted cursor-not-allowed opacity-60" 
                  placeholder="Email non trouvé" 
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-light mb-1.5">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text" 
                  placeholder="••••••••" 
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-light mb-1.5">Confirmer le mot de passe</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text" 
                  placeholder="••••••••" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !email}
                className="w-full mt-2 bg-primary text-white h-12 rounded-[12px] font-medium text-[15px] hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </button>
            </form>
          )}

          <p className="text-center text-[13px] mt-8 text-text-muted">
            <Link to="/login" className="text-accent font-medium hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
