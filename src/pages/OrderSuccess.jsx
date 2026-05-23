import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { confirmOrderPayment } from '../services/api';

const OrderSuccess = ({ setCartItems }) => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [reference, setReference] = useState(searchParams.get('reference') || `DRY-${orderId}`);

  useEffect(() => {
    // Vider le panier après validation
    localStorage.removeItem('cartItems');
    if (setCartItems) {
      setCartItems([]);
    }
    
    const fetchOrderData = async () => {
      if (!orderId) {
        setStatus('error');
        return;
      }

      // Si le montant n'est pas dans l'URL, on le récupère via l'API
      if (!amount) {
        try {
          const data = await confirmOrderPayment(orderId);
          if (data && data.order) {
            setAmount(data.order.total);
            setStatus('success');
          } else {
            setStatus('error');
          }
        } catch (err) {
          console.error('Erreur récupération commande:', err);
          setStatus('error');
        }
      } else {
        setStatus('success');
      }
    };

    fetchOrderData();
  }, [orderId, amount, setCartItems]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 size={48} className="animate-spin text-[#A68A56] mx-auto mb-6" />
        <h2 className="text-2xl font-serif text-[#F4D03F]">Génération de votre espace de paiement...</h2>
      </div>
    );
  }

  if (status === 'error' || !orderId) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={80} className="text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-serif mb-4 text-[#F4D03F]">Commande introuvable</h2>
        <p className="text-gray-400 mb-8 max-w-md">Une erreur est survenue lors de la récupération de votre commande.</p>
        <Link to="/" className="px-8 py-3 bg-[#5C141F] text-white rounded-xl font-medium hover:opacity-80 transition-opacity">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const amountInCents = Math.round(parseFloat(amount) * 100);
  const revolutLink = `https://revolut.me/dumase07?currency=EUR&amount=${amountInCents}&note=${reference}`;

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center py-12 px-6 text-center text-white selection:bg-[#F4D03F] selection:text-black">
      
      {/* En-tête de validation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <CheckCircle2 size={70} className="text-[#A68A56] mx-auto mb-6" />
      </motion.div>
      <h2 className="text-3xl md:text-4xl font-serif mb-3 text-[#F4D03F] tracking-wide">Commande Validée</h2>
      <p className="text-gray-400 mb-10 max-w-lg text-sm md:text-base leading-relaxed">
        Votre commande est enregistrée. Pour finaliser votre achat et déclencher l'expédition, veuillez procéder au paiement.
      </p>

      {/* Bouton Revolut */}
      <motion.a 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        href={revolutLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-sm mb-8 px-6 py-4 bg-white text-[#111111] rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center shadow-lg"
      >
        Payer instantanément via l'application Revolut
      </motion.a>

    </div>
  );
};

export default OrderSuccess;
