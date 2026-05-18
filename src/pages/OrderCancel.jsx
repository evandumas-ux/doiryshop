import React from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderCancel = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <XCircle size={80} className="text-red-500 mx-auto mb-6" />
      </motion.div>
      <h2 className="text-3xl font-serif mb-4 text-text">Paiement annulé</h2>
      <p className="text-text-light mb-8 max-w-md">Vous avez annulé le processus de paiement. Votre commande n'a pas été validée.</p>
      <div className="flex gap-4 justify-center">
        <Link to="/checkout" className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">
          Retourner au paiement
        </Link>
        <Link to="/" className="px-8 py-3 bg-surface border border-surface-border text-text rounded-xl font-medium hover:bg-surface-light transition-colors">
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
};

export default OrderCancel;
