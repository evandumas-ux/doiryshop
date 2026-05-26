import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useLogto } from '@logto/react';
import { login as localLogin } from '../services/api';
import SEO from '../components/SEO';
import { Eye, EyeOff } from 'lucide-react';

export default function Login({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const redirectParam = query.get('redirect');

  const { signIn, isAuthenticated } = useLogto();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated || user) {
      navigate(redirectParam || '/');
    }
  }, [isAuthenticated, user, navigate, redirectParam]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn(`${window.location.origin}/callback`, { prompt: 'select_account' });
    } catch (err) {
      console.error('Erreur Logto:', err);
      setError('Impossible de se connecter avec Google.');
      setIsLoading(false);
    }
  };


  const handleLocalLogin = async (e) => {
    e.preventDefault();
    console.log('[LOGIN UI] submit déclenché');
    console.log('[LOGIN UI] email =', email);
    console.log('[LOGIN UI] password length =', password?.length);

    if (!email || !password) {
      console.log('[LOGIN UI] champs manquants, annulation');
      setError('Veuillez remplir tous les champs.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('[LOGIN UI] appel login()');
      const data = await localLogin(email, password);
      console.log('[LOGIN UI] login() réussi', data);
      if (setUser) setUser(data.user);
      navigate(redirectParam || '/');
    } catch (err) {
      console.error('[LOGIN UI] erreur attrapée =', err);
      setError(err.message || 'Erreur inconnue');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden font-sans">
      <SEO
        title="Connexion - Doiry Shop"
        description="Connectez-vous à votre compte Doiry Shop"
        url="https://doiryshop.com/login"
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
            <p className="text-text-muted text-sm mt-3">Bienvenue dans votre espace privilégié</p>
          </div>

          {redirectParam && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-primary/10 text-primary rounded-xl text-[13px] font-medium text-center border border-primary/20"
            >
              Connectez-vous pour accéder à votre profil.
            </motion.div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-surface-light border border-surface-border rounded-[12px] flex items-center justify-center gap-3 text-text font-medium text-[15px] hover:border-accent/30 transition-colors focus:ring-2 focus:ring-accent/30 focus:outline-none disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-surface-border"></div>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-surface-border"></div>
          </div>

          <form onSubmit={handleLocalLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1.5">Email</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full px-4 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text placeholder:text-text-muted" 
                placeholder="vous@email.com" 
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-light mb-1.5">Mot de passe</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full pl-4 pr-10 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text placeholder:text-text-muted" 
                  placeholder="••••••••" 
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link to="/mot-de-passe-oublie" className="text-[12px] text-accent hover:underline">Mot de passe oublié ?</Link>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-primary text-[13px] font-medium">
                {error}
              </motion.p>
            )}

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full mt-2 bg-primary text-white h-12 rounded-[12px] font-medium text-[15px] hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-[13px] mt-8 text-text-muted">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="text-accent font-medium hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
