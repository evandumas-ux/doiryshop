import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLogto } from '@logto/react';
import { confirmOrderPayment } from '../services/api';

const OrderSuccess = ({ setCartItems }) => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { getIdToken } = useLogto();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Vider le panier après une commande réussie
    localStorage.removeItem('cartItems');
    if (setCartItems) {
      setCartItems([]);
    }
    
    const validatePayment = async () => {
      if (!orderId) {
        setStatus('success'); // Pas d'ID, on affiche juste le succès standard
        return;
      }

      try {
        const data = await confirmOrderPayment(orderId);
        setOrderDetails(data.order);
        setStatus('success');
      } catch (err) {
        console.error('Erreur validation paiement:', err);
        setStatus('error');
      }
    };

    validatePayment();
  }, [orderId, getIdToken]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Loader2 size={48} className="animate-spin text-primary mx-auto mb-6" />
        <h2 className="text-2xl font-serif text-text">Validation de votre paiement...</h2>
        <p className="text-text-light mt-2">Veuillez ne pas fermer cette page.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={80} className="text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-serif mb-4 text-text">Erreur de validation</h2>
        <p className="text-text-light mb-8 max-w-md">Nous n'avons pas pu confirmer le paiement de votre commande. Veuillez vérifier vos commandes ou nous contacter.</p>
        <Link to="/mes-commandes" className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">
          Voir mes commandes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
      </motion.div>
      <h2 className="text-3xl font-serif mb-4 text-text">Paiement réussi ! 🎉</h2>
      <p className="text-text-light mb-2 max-w-md">Merci pour votre achat. Votre commande a été enregistrée et payée avec succès.</p>
      
      {orderDetails && (
        <div className="bg-surface border border-surface-border p-4 rounded-xl mt-4 mb-6 max-w-md w-full mx-auto">
          <p className="font-medium text-text">Commande N° {orderDetails.id}</p>
          <p className="text-text-light">Montant total : {orderDetails.total} €</p>
        </div>
      )}

      <p className="text-text-muted text-sm mb-8">Vous recevrez un email de confirmation très bientôt.</p>
      <div className="flex gap-4 justify-center">
        <Link to="/" className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">
          Retour à la boutique
        </Link>
        <Link to="/mes-commandes" className="px-8 py-3 bg-surface border border-surface-border text-text rounded-xl font-medium hover:bg-surface-light transition-colors">
          Voir mes commandes
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
