import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogto } from '@logto/react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import SEO from '../components/SEO';
import { customRegister, customVerify, login, useReferralCode as applyReferralCode, logout } from '../services/api';

export default function Inscription({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const referralCode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get('ref') || '').trim().toUpperCase();
  }, [location.search]);

  const { signIn } = useLogto();
  const [step, setStep] = useState(1); // 1 = form, 2 = code verification
  const [verificationCode, setVerificationCode] = useState('');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-surface-border', width: '0%' };
    if (password.length < 8) return { score: 1, label: 'Faible', color: 'bg-red-500', width: '33%' };
    
    let strength = 2;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (password.length >= 12 && strength >= 3) return { score: 3, label: 'Fort', color: 'bg-emerald-500', width: '100%' };
    if (password.length >= 8) return { score: 2, label: 'Moyen', color: 'bg-yellow-500', width: '66%' };
    return { score: 1, label: 'Faible', color: 'bg-red-500', width: '33%' };
  }, [password]);

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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setIsLoading(true);
    try {
      await customRegister(firstName.trim(), lastName.trim(), email.trim(), password);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await customVerify(email.trim(), verificationCode.trim());
      
      if (referralCode) {
        try {
          await applyReferralCode(referralCode);
        } catch (e2) {
          console.warn('Referral code error:', e2);
        }
      }

      if (setUser && data?.user) setUser(data.user);
      navigate('/profil');
    } catch (err) {
      setError(err.message || 'Code de vérification invalide ou expiré.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden font-sans">
      <SEO
        title="Inscription - Doiry Shop"
        description="Créez votre compte Doiry Shop."
        url="https://doiryshop.com/inscription"
        robots="noindex, nofollow"
      />

      <div className="absolute inset-0 bg-[url('/bg_texture.png')] bg-cover bg-center opacity-[0.03] pointer-events-none" />
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
            <h1 className="text-2xl font-serif font-bold text-text mt-4">
              {step === 1 ? 'Créer mon compte' : 'Vérification Email'}
            </h1>
            <p className="text-text-muted text-sm mt-2">
              {step === 1 ? 'Rejoignez-nous pour accéder à votre espace' : 'Entrez le code à 6 chiffres envoyé à ' + email}
            </p>
            {step === 1 && referralCode && (
              <p className="text-emerald-400 text-sm mt-2">
                Code parrainage appliqué : <span className="font-semibold">{referralCode}</span>
              </p>
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

          {step === 1 ? (
            <>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-12 bg-surface-light border border-surface-border rounded-[12px] flex items-center justify-center gap-3 text-text font-medium text-[15px] hover:border-accent/30 transition-colors focus:ring-2 focus:ring-accent/30 focus:outline-none disabled:opacity-50 mb-6"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuer avec Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-surface-border"></div>
                <span className="text-xs text-text-muted font-medium uppercase tracking-wider">ou</span>
                <div className="flex-1 h-px bg-surface-border"></div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-text-light mb-1.5">Prénom</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text placeholder:text-text-muted"
                      placeholder="Votre prénom"
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-text-light mb-1.5">Nom</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text placeholder:text-text-muted"
                      placeholder="Votre nom"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-text-light mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text placeholder:text-text-muted"
                    placeholder="vous@email.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-text-light mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-10 h-12 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text placeholder:text-text-muted"
                      placeholder="⬢⬢⬢⬢⬢⬢⬢⬢"
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
                  
                  {/* Strength bar */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Force : {passwordStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: passwordStrength.width }}
                          className={`h-full ${passwordStrength.color} transition-all duration-500`}
                        />
                      </div>
                      {password.length < 8 && (
                        <p className="text-primary text-[11px] mt-1 font-medium">Le mot de passe doit contenir au moins 8 caractères</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-text-light mb-1.5">Confirmer le mot de passe</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-4 pr-10 h-12 bg-background border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px] text-text placeholder:text-text-muted ${passwordError ? 'border-primary focus:ring-primary' : 'border-surface-border'}`}
                      placeholder="⬢⬢⬢⬢⬢⬢⬢⬢"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-primary text-[13px] mt-1.5 font-medium">{passwordError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-primary text-white h-12 rounded-[12px] font-medium text-[15px] hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    "Créer mon compte"
                  )}
                </button>
              </form>

              <p className="text-center text-[13px] mt-8 text-text-muted">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-accent font-medium hover:underline">
                  Se connecter
                </Link>
              </p>
            </>
          ) : (
            <motion.form 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleVerifySubmit} 
              className="flex flex-col gap-6"
            >
              <div className="flex justify-center mb-2">
                <ShieldCheck size={48} className="text-primary/80" />
              </div>
              
              <div>
                <label className="block text-[13px] font-medium text-text-light mb-1.5 text-center">Code secret à 6 chiffres</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 h-14 bg-background border border-surface-border rounded-[12px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[24px] tracking-[0.5em] text-center text-text placeholder:text-text-muted/30 font-mono"
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-primary text-white h-12 rounded-[12px] font-medium text-[15px] hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  "Valider mon accès"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-text-muted text-sm hover:text-text transition-colors mt-2"
              >
                € Retour
              </button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
