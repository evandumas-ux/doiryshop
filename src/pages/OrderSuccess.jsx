import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { buildOrderReference, buildRevolutMeUrl } from '../utils/revolutPayment';

const OrderSuccess = ({ setCartItems }) => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount') || '';
  const reference = searchParams.get('reference') || (orderId ? buildOrderReference(orderId) : '');

  const status = orderId && amount ? 'success' : 'error';

  useEffect(() => {
    localStorage.removeItem('cartItems');
    if (setCartItems) {
      setCartItems([]);
    }
  }, [setCartItems]);

  if (status === 'error' || !orderId) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={80} className="text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-serif mb-4 text-[#F4D03F]">Commande introuvable</h2>
        <p className="text-gray-400 mb-8 max-w-md">Une erreur est survenue lors de la preparation du paiement.</p>
        <Link to="/" className="px-8 py-3 bg-[#5C141F] text-white rounded-xl font-medium hover:opacity-80 transition-opacity">
          Retour a la boutique
        </Link>
      </div>
    );
  }

  const revolutLink = buildRevolutMeUrl({ amount, orderId, reference });

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center py-12 px-6 text-center text-white selection:bg-[#F4D03F] selection:text-black">
      <div>
        <CheckCircle2 size={70} className="text-[#A68A56] mx-auto mb-6" />
      </div>

      <h2 className="text-3xl md:text-4xl font-serif mb-3 text-[#F4D03F] tracking-wide">Commande enregistree</h2>
      <p className="text-gray-400 mb-10 max-w-lg text-sm md:text-base leading-relaxed">
        Votre commande est enregistree. Pour finaliser votre achat et declencher l'expedition, ouvrez Revolut dans un nouvel onglet puis revenez sur Doiry Shop.
      </p>

      <a
        href={revolutLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-sm mb-8 px-6 py-4 bg-white text-[#111111] rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center shadow-lg"
      >
        Payer instantanement via l'application Revolut
      </a>

      <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
        Revenir a la boutique
      </Link>
    </div>
  );
};

export default OrderSuccess;
