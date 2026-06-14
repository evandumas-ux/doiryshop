import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, LayoutDashboard, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserDropdown from './UserDropdown';

const MotionSpan = motion.span;
const MotionNav = motion.nav;

export const Header = ({ onOpenCart, onOpenLogin, onLogout, cartItemsCount, user, simplified = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-background/95 backdrop-blur-xl shadow-lg shadow-black/20 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-full mx-auto px-8 flex justify-between items-center">
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-3 group whitespace-nowrap">
          <img src="/favicon.jpg" alt="Doiry Shop" className="h-7 w-7 object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-screen" />
          <span className="font-serif text-lg md:text-xl font-light tracking-[0.4em] text-white hidden sm:block">DOIRY SHOP</span>
        </Link>
        {!simplified && (
          <nav className="hidden md:flex gap-6 items-center whitespace-nowrap">
            <a href="/#pourquoi" className="nav-link-premium text-[13px] font-serif tracking-premium text-neutral-200 font-medium hover:text-white transition-colors duration-200">Pourquoi ?</a>
            <a href="/#gammes" className="nav-link-premium text-[13px] font-serif tracking-premium text-neutral-200 font-medium hover:text-white transition-colors duration-200">Gammes</a>
            <Link to="/about" className="nav-link-premium text-[13px] font-serif tracking-premium text-neutral-200 font-medium hover:text-white transition-colors duration-200">Notre Histoire</Link>
            <Link to="/rituels" className="nav-link-premium text-[13px] font-serif tracking-premium text-neutral-200 font-medium hover:text-white transition-colors duration-200">Les Rituels</Link>
            <Link to="/boutique" className="nav-link-premium text-[13px] font-serif tracking-premium text-neutral-200 font-medium hover:text-white transition-colors duration-200">Boutique</Link>
            <Link to="/arret-tabac" className="nav-link-premium text-[13px] font-serif tracking-premium text-neutral-200 font-medium hover:text-white transition-colors duration-200">Arrêt du Tabac</Link>
          </nav>
        )}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-3 border-r border-white/10 mr-1">
            <div className="w-5 h-3.5 rounded-[1px] overflow-hidden flex shadow-sm border border-white/5 shrink-0">
              <div className="w-1/3 h-full bg-[#002395]" />
              <div className="w-1/3 h-full bg-white" />
              <div className="w-1/3 h-full bg-[#ED2939]" />
            </div>
            <span className="text-[10px] tracking-widest text-neutral-200 font-medium uppercase">Français</span>
          </div>
          {user ? (
            <UserDropdown user={user} onLogout={onLogout} />
          ) : (
            <button onClick={onOpenLogin} className="flex items-center gap-2 text-neutral-200 font-medium hover:text-white transition-colors duration-200 p-2 rounded-full">
              <User size={22} />
            </button>
          )}
          <button onClick={onOpenCart} className="relative p-2 text-neutral-200 font-medium hover:text-white transition-colors duration-200 rounded-full">
            <ShoppingCart size={22} />
            {cartItemsCount > 0 && (
              <MotionSpan initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full transform translate-x-1/4 -translate-y-1/4 shadow-sm">{cartItemsCount}</MotionSpan>
            )}
          </button>
        </div>
        <div className="flex md:hidden items-center gap-4">
          <button onClick={onOpenCart} className="relative text-neutral-100">
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full">{cartItemsCount}</span>}
          </button>
          <button className="text-neutral-100" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <MotionNav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden absolute top-full left-0 w-full bg-background-light border-b border-surface-border p-6 flex flex-col gap-4 shadow-2xl">
            {!simplified && (
              <>
                <a href="/#pourquoi" onClick={() => setIsMenuOpen(false)} className="text-lg text-neutral-100 font-medium tracking-premium font-serif">Pourquoi ?</a>
                <a href="/#gammes" onClick={() => setIsMenuOpen(false)} className="text-lg text-neutral-100 font-medium tracking-premium font-serif">Gammes</a>
                <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-lg text-neutral-100 font-medium tracking-premium font-serif">Notre Histoire</Link>
                <Link to="/rituels" onClick={() => setIsMenuOpen(false)} className="text-lg text-neutral-100 font-medium tracking-premium font-serif">Les Rituels</Link>
                <Link to="/boutique" onClick={() => setIsMenuOpen(false)} className="text-lg text-neutral-100 font-medium tracking-premium font-serif">Boutique</Link>
                <Link to="/arret-tabac" onClick={() => setIsMenuOpen(false)} className="text-lg text-neutral-100 font-medium tracking-premium font-serif">Arrêt du Tabac</Link>
                <hr className="border-surface-border my-2" />
              </>
            )}
            {user ? (
              <>
                <Link to="/profil" onClick={() => setIsMenuOpen(false)} className="text-lg flex items-center gap-3 text-accent font-medium"><User size={20} /> Mon profil</Link>
                <Link to="/mes-commandes" onClick={() => setIsMenuOpen(false)} className="text-lg flex items-center gap-3 text-neutral-100 font-medium"><ShoppingCart size={20} /> Mes commandes</Link>
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="text-lg flex items-center gap-3 text-neutral-100 font-medium"><LayoutDashboard size={20} /> Dashboard admin</Link>
                )}
                <button onClick={async (e) => { await onLogout(e); setIsMenuOpen(false); }} className="text-lg flex items-center gap-3 text-primary font-medium"><LogOut size={20} /> Deconnexion</button>
              </>
            ) : (
              <button onClick={() => { onOpenLogin(); setIsMenuOpen(false); }} className="text-lg flex items-center gap-3 text-neutral-100 font-medium"><User size={20} /> Se connecter</button>
            )}
          </MotionNav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
