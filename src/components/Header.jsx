import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, LayoutDashboard, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserDropdown from './UserDropdown';

export const Header = ({ onOpenCart, onOpenLogin, onLogout, cartItemsCount, user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-background/95 backdrop-blur-xl shadow-lg shadow-black/20 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-3 group">
          <img src="/logo.jpg" alt="Doiry Shop" className="h-10 md:h-12 w-auto rounded-lg group-hover:scale-105 transition-transform duration-300" />
          <span className="font-display text-lg md:text-xl font-bold tracking-widest text-primary hidden sm:block">DOIRY SHOP</span>
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          <a href="/#pourquoi" className="text-sm font-medium tracking-widest uppercase text-text-light hover:text-accent transition-colors duration-300">Pourquoi</a>
          <a href="/#gammes" className="text-sm font-medium tracking-widest uppercase text-text-light hover:text-accent transition-colors duration-300">Gammes</a>
          <Link to="/about" className="text-sm font-medium tracking-widest uppercase text-text-light hover:text-accent transition-colors duration-300">Notre histoire</Link>
          <Link to="/boutique" className="text-sm font-medium tracking-widest uppercase text-text-light hover:text-accent transition-colors duration-300">Boutique</Link>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <UserDropdown user={user} onLogout={onLogout} />
          ) : (
            <button onClick={onOpenLogin} className="flex items-center gap-2 text-text-light hover:text-accent transition-colors p-2 rounded-full">
              <User size={22} />
            </button>
          )}
          <button onClick={onOpenCart} className="relative p-2 text-text-light hover:text-accent transition-colors rounded-full">
            <ShoppingCart size={22} />
            {cartItemsCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full transform translate-x-1/4 -translate-y-1/4 shadow-sm">{cartItemsCount}</motion.span>
            )}
          </button>
        </div>
        <div className="flex md:hidden items-center gap-4">
          <button onClick={onOpenCart} className="relative text-text-light">
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full">{cartItemsCount}</span>}
          </button>
          <button className="text-text-light" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden absolute top-full left-0 w-full bg-background-light border-b border-surface-border p-6 flex flex-col gap-4 shadow-2xl">
            <a href="/#pourquoi" onClick={() => setIsMenuOpen(false)} className="text-lg text-text-light uppercase tracking-widest font-serif">Pourquoi</a>
            <a href="/#gammes" onClick={() => setIsMenuOpen(false)} className="text-lg text-text-light uppercase tracking-widest font-serif">Gammes</a>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-lg text-text-light uppercase tracking-widest font-serif">Notre histoire</Link>
            <Link to="/boutique" onClick={() => setIsMenuOpen(false)} className="text-lg text-text-light uppercase tracking-widest font-serif">Boutique</Link>
            <hr className="border-surface-border my-2" />
            {user ? (
              <>
                <Link to="/profil" onClick={() => setIsMenuOpen(false)} className="text-lg flex items-center gap-3 text-accent"><User size={20} /> Mon profil</Link>
                <Link to="/mes-commandes" onClick={() => setIsMenuOpen(false)} className="text-lg flex items-center gap-3 text-text-light"><ShoppingCart size={20} /> Mes commandes</Link>
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="text-lg flex items-center gap-3 text-text-light"><LayoutDashboard size={20} /> Dashboard admin</Link>
                )}
                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="text-lg flex items-center gap-3 text-primary"><LogOut size={20} /> Deconnexion</button>
              </>
            ) : (
              <button onClick={() => { onOpenLogin(); setIsMenuOpen(false); }} className="text-lg flex items-center gap-3 text-text-light"><User size={20} /> Se connecter</button>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
