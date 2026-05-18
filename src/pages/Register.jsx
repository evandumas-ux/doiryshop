import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { register, login, logout, useReferralCode as applyReferralCode } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const referralCode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get('ref') || '').trim().toUpperCase();
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (!dateNaissance) {
      setError('La date de naissance est obligatoire.');
      return;
    }

    const ageDifMs = Date.now() - new Date(dateNaissance).getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18) {
      setError('Désolé, la vente est réservée aux personnes majeures (18 ans et plus)');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      if (referralCode) {
        const loginData = await login(email, password);
        await applyReferralCode(referralCode, loginData.token);
        logout();
      }
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden font-sans">
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
            <h1 className="text-2xl font-serif font-bold text-text mt-4">Créer mon compte</h1>
            <p className="text-text-muted text-sm mt-2">Rejoignez-nous pour accéder à votre espace</p>
            {referralCode && (
              <p className="text-emerald-400 text-sm mt-2">Code parrainage appliqué : <span className="font-semibold">{referralCode}</span></p>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="mb-6 p-4 bg-primary/10 text-primary rounded-xl text-[13px] font-medium text-center border border-primary/20"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1.5">Nom complet</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full px-4 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text placeholder:text-text-muted" 
                placeholder="Jean Dupont" 
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1.5">Email</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full px-4 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text placeholder:text-text-muted" 
                placeholder="exemple@exemple.fr" 
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1.5">Mot de passe</label>
              <input 
                type="password" 
                required 
                minLength={6}
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full px-4 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text placeholder:text-text-muted" 
                placeholder="••••••••" 
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1.5">Confirmer le mot de passe</label>
              <input 
                type="password" 
                required 
                minLength={6}
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="w-full px-4 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text placeholder:text-text-muted" 
                placeholder="••••••••" 
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1.5">Date de naissance</label>
              <input 
                type="date" 
                required 
                value={dateNaissance} 
                onChange={e => setDateNaissance(e.target.value)} 
                className="w-full px-4 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text placeholder:text-text-muted" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full mt-2 bg-primary text-white h-12 rounded-[12px] font-medium text-[15px] hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-[13px] mt-8 text-text-muted">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
