import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, CheckCircle2, Building, Loader2, AlertCircle } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { confirmOrderPayment } from '../services/api';

const OrderSuccess = ({ setCartItems }) => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  // États pour les données de la commande
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [reference, setReference] = useState(searchParams.get('reference') || `DRY-${orderId}`);

  // États pour les micro-interactions de copie
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

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
            // Si la DB stocke la référence, on pourrait aussi l'écraser ici
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

  // Fonction utilitaire pour la copie + retour haptique
  const handleCopy = async (text, setCopiedState) => {
    try {
      await navigator.clipboard.writeText(text);
      if (navigator.vibrate) {
        navigator.vibrate(50); // Retour haptique
      }
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error('Erreur de copie', err);
    }
  };

  const handleDownload = () => {
    // Déclenche le téléchargement du RIB
    const imageUrl = `/doiryshop_rib_${orderId}.png`;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `DoiryShop_RIB_${orderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 size={48} className="animate-spin text-[#A68A56] mx-auto mb-6" />
        <h2 className="text-2xl font-serif text-[#F4D03F]">Génération de votre espace sécurisé...</h2>
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
        Votre commande est enregistrée. Pour valider l'expédition, veuillez scanner ce RIB digital depuis l'application de votre banque.
      </p>

      {/* Affichage du RIB Digital */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm mb-10 rounded-2xl overflow-hidden border border-[#A68A56]/30 shadow-2xl shadow-[#A68A56]/10"
      >
        {/* Assurez-vous que l'image est servie correctement depuis le dossier public ou backend */}
        <img 
          src={`/doiryshop_rib_${orderId}.png`} 
          alt="RIB Sécurisé Doiry Shop" 
          className="w-full h-auto object-contain bg-[#111111]"
          onError={(e) => {
            // Fallback si l'image n'est pas encore disponible ou le chemin diffère
            e.target.onerror = null; 
            e.target.src = '/images/placeholder_rib.png'; 
          }}
        />
      </motion.div>

      {/* Bouton de Téléchargement */}
      <button 
        onClick={handleDownload}
        className="w-full max-w-sm mb-8 px-6 py-4 bg-[#5C141F] text-white rounded-xl font-medium hover:bg-[#721924] transition-colors flex items-center justify-center gap-3 shadow-lg"
      >
        <Download size={20} />
        Télécharger le RIB sécurisé
      </button>

      {/* Actions de copie (Montant et Référence) */}
      <div className="w-full max-w-sm space-y-4 mb-12">
        <button 
          onClick={() => handleCopy(amount, setCopiedAmount)}
          className={`w-full px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 border ${
            copiedAmount 
              ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400' 
              : 'bg-[#1A1A1A] border-[#333333] text-gray-200 hover:border-[#A68A56]/50'
          }`}
        >
          {copiedAmount ? <CheckCircle2 size={20} /> : <Copy size={20} className="text-[#A68A56]" />}
          {copiedAmount ? "Copié ✓" : `Copier le montant exact (${amount} €)`}
        </button>

        <button 
          onClick={() => handleCopy(reference, setCopiedRef)}
          className={`w-full px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 border ${
            copiedRef 
              ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400' 
              : 'bg-[#1A1A1A] border-[#333333] text-gray-200 hover:border-[#A68A56]/50'
          }`}
        >
          {copiedRef ? <CheckCircle2 size={20} /> : <Copy size={20} className="text-[#A68A56]" />}
          {copiedRef ? "Copié ✓" : `Copier la référence (${reference})`}
        </button>
      </div>

      {/* Deep Linking App Bancaire (Redirection générique vers l'ouverture d'une app) */}
      <motion.a
        href="bankapp://"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[#A68A56] hover:text-[#F4D03F] text-sm font-medium flex items-center gap-2 underline underline-offset-4 decoration-[#A68A56]/40 transition-colors"
        onClick={(e) => {
          // Fallback haptique
          if (navigator.vibrate) navigator.vibrate(20);
        }}
      >
        <Building size={16} />
        Ouvrir mon application bancaire
      </motion.a>

    </div>
  );
};

export default OrderSuccess;
