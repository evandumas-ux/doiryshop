import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useLogto } from '@logto/react';
import { getUserProfile, updateUserProfile } from '../services/api';

const CompleteProfile = ({ user, setUser }) => {
  const { getIdToken } = useLogto();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    date_naissance: '',
    telephone: '',
    adresse: '',
    complement_adresse: '',
    code_postal: '',
    ville: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Si l'utilisateur a déjà complété son profil, le renvoyer à l'accueil
    if (user?.profil_complete) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        setFormData({
          prenom: profile.prenom || profile.name?.split(' ')[0] || '',
          nom: profile.nom || profile.name?.split(' ').slice(1).join(' ') || '',
          date_naissance: profile.date_naissance || '',
          telephone: profile.telephone || '',
          adresse: profile.adresse || '',
          complement_adresse: profile.complement_adresse || '',
          code_postal: profile.code_postal || '',
          ville: profile.ville || ''
        });
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateAge = (birthday) => {
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    if (isNaN(ageDifMs)) return 0;
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const updateData = {
        prenom: formData.prenom || formData.firstName,
        nom: formData.nom || formData.lastName,
        telephone: formData.telephone || formData.phone,
        date_naissance: formData.date_naissance || formData.birthDate,
        adresse: formData.adresse || formData.address,
        complement_adresse: formData.complement_adresse,
        code_postal: formData.code_postal || formData.postalCode,
        ville: formData.ville || formData.city,
      };

      await updateUserProfile(updateData);
      
      // Rediriger vers la page d'accueil ou le panier
      window.location.href = '/';
    } catch (err) {
      console.error('[Profil] Erreur:', err.message);
      setError(err.message || 'Erreur réseau, réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-surface p-8 shadow-xl rounded-3xl border border-surface-border">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-text mb-3">Bienvenue ! Complétez votre profil</h2>
            <p className="text-text-light text-sm">Ces informations nous permettent de livrer vos commandes avec précision et en toute légalité.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Prénom *</label>
                <input type="text" name="prenom" required value={formData.prenom} onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Nom *</label>
                <input type="text" name="nom" required value={formData.nom} onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Date de naissance *</label>
                <input type="date" name="date_naissance" required value={formData.date_naissance} onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Téléphone *</label>
                <input type="tel" name="telephone" required value={formData.telephone} onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Adresse de livraison *</label>
              <input type="text" name="adresse" required placeholder="Ex: 12 rue de la Paix" value={formData.adresse} onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Complément d'adresse</label>
              <input type="text" name="complement_adresse" placeholder="Bâtiment, Étage, Appartement..." value={formData.complement_adresse} onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-text mb-2">Code Postal *</label>
                <input type="text" name="code_postal" required value={formData.code_postal} onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text mb-2">Ville *</label>
                <input type="text" name="ville" required value={formData.ville} onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-surface-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text" />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-text-light">
              <Lock size={14} className="text-primary" />
              <span>Vos données sont protégées conformément au RGPD</span>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-4 rounded-xl font-medium text-lg hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/20 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer mon profil'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;
