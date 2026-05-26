import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShoppingCart, LayoutDashboard, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user.prenom && user.nom
    ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
    : (user.name || 'U')[0].toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-surface/80 transition-colors">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/20">
          {initials}
        </div>
        <span className="text-sm font-medium text-text-light hidden lg:block">{user.prenom || user.name}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="absolute right-0 top-full mt-2 w-72 bg-surface border border-surface-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-[60]"
          >
            <div className="px-5 py-4 border-b border-surface-border bg-surface-light/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-base font-bold shadow-md shadow-primary/20 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-text text-sm truncate">{user.prenom ? `${user.prenom} ${user.nom || ''}` : user.name}</p>
                  {user.role === 'admin' && (
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="py-2">
              <Link to="/profil" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-text-light hover:bg-primary/10 hover:text-primary transition-colors">
                <User size={16} />
                Mon profil
              </Link>
              <Link to="/mes-commandes" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-text-light hover:bg-primary/10 hover:text-primary transition-colors">
                <ShoppingCart size={16} />
                Mes commandes
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-accent hover:bg-accent/10 transition-colors">
                  <LayoutDashboard size={16} />
                  Dashboard admin
                </Link>
              )}
            </div>

            <div className="border-t border-surface-border py-2">
              <button onClick={async (e) => { setIsOpen(false); await onLogout(e); }} className="flex items-center gap-3 px-5 py-3 text-sm text-primary hover:bg-primary/10 transition-colors w-full text-left">
                <LogOut size={16} />
                Se deconnecter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdown;
