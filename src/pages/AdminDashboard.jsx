import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, LogOut, ChevronDown,
  ChevronUp, Eye, Search, Filter, TrendingUp, Clock,
  CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft, Plus, Edit, Trash2, Star, MessageSquare, Feather, X
} from 'lucide-react';
import { getAdminOrders, getProducts, createProduct, updateProduct, deleteProduct, getAdminCoupons, createCoupon, updateCoupon, deleteCoupon, getAdminReviews, approveReview, deleteReview, getAdminLoyalty, updateAdminLoyalty } from '../services/api';
import { useLogto } from '@logto/react';

const ProductManager = () => {
  const { getIdToken } = useLogto();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock: '', tagline: '', type: 'secondary', badge: '', categorie: 'vrac',
    weight_g: '50', height_cm: '5', width_cm: '10', length_cm: '15', use_cases: []
  });
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [useCaseInput, setUseCaseInput] = useState('');

  const parseJsonArray = (value) => {
    if (Array.isArray(value)) return value.filter((item) => typeof item === 'string' && item.trim());
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string' && item.trim()) : [];
    } catch (_) {
      return [];
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name || '', description: product.description || '', price: product.price || '',
        stock: product.stock || '', tagline: product.tagline || '',
        type: product.type || 'secondary', badge: product.badge || '', categorie: product.categorie || 'vrac',
        weight_g: product.weight_g || '50', height_cm: product.height_cm || '5', width_cm: product.width_cm || '10', length_cm: product.length_cm || '15',
        use_cases: parseJsonArray(product.use_cases)
      });
      let imgs = product.images || [];
      if (!Array.isArray(imgs) && product.image_url) imgs = [product.image_url];
      setExistingImages(imgs);
      setPreviewUrls(imgs);
      setSelectedImages([]);
    } else {
      setEditingId(null);
      setFormData({
        name: '', description: '', price: '', stock: '', tagline: '', type: 'secondary', badge: '', categorie: 'vrac',
        weight_g: '50', height_cm: '5', width_cm: '10', length_cm: '15', use_cases: []
      });
      setExistingImages([]);
      setSelectedImages([]);
      setPreviewUrls([]);
    }
    setUseCaseInput('');
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + selectedImages.length + files.length > 8) {
      alert("Vous ne pouvez pas ajouter plus de 8 images au total.");
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
    
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      const newExisting = [...existingImages];
      newExisting.splice(index, 1);
      setExistingImages(newExisting);
    } else {
      const selIndex = index - existingImages.length;
      const newSelected = [...selectedImages];
      newSelected.splice(selIndex, 1);
      setSelectedImages(newSelected);
    }
    const newPreviews = [...previewUrls];
    newPreviews.splice(index, 1);
    setPreviewUrls(newPreviews);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'use_cases') {
          submitData.append('use_cases', JSON.stringify(formData.use_cases || []));
          return;
        }
        submitData.append(key, formData[key]);
      });
      existingImages.forEach(img => submitData.append('existing_images', img));
      selectedImages.forEach(file => submitData.append('images', file));

      if (editingId) {
        await updateProduct(editingId, submitData);
      } else {
        await createProduct(submitData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const addUseCaseChip = (rawValue) => {
    const value = String(rawValue || '').trim();
    if (!value) return;
    setFormData((prev) => {
      const list = Array.isArray(prev.use_cases) ? prev.use_cases : [];
      if (list.includes(value)) return prev;
      return { ...prev, use_cases: [...list, value] };
    });
    setUseCaseInput('');
  };

  const removeUseCaseChip = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      use_cases: (prev.use_cases || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  if (loading) return <div className="text-center p-8">Chargement des produits...</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag size={20} className="text-primary" /> Produits
        </h2>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Ajouter un produit
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Image</th>
              <th className="px-6 py-4 font-semibold">Nom</th>
              <th className="px-6 py-4 font-semibold">Catégorie</th>
              <th className="px-6 py-4 font-semibold">Prix</th>
              <th className="px-6 py-4 font-semibold">Stock</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-800">
            {products.map(p => {
              const firstImage = (p.images && p.images.length > 0) ? p.images[0] : (p.image_url || '/placeholders/product-default.png');
              return (
              <tr key={p.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4"><img src={firstImage} alt={p.name} className="w-12 h-12 rounded object-cover bg-gray-200" /></td>
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td className="px-6 py-4">
                  {(() => {
                    const catConfig = {
                      'pre-roules': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pré-roulés' },
                      vrac: { bg: 'bg-green-50', text: 'text-green-700', label: 'En vrac' },
                      kits: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Kits & coffrets' },
                      tisanes: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Tisanes & infusions' },
                    };
                    const cfg = catConfig[p.categorie] || catConfig.vrac;
                    return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>;
                  })()}
                </td>
                <td className="px-6 py-4">{p.price} €</td>
                <td className="px-6 py-4">{p.stock}</td>
                <td className="px-6 py-4 flex items-center gap-3">
                  <button onClick={() => handleOpenModal(p)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">{editingId ? 'Modifier un produit' : 'Nouveau produit'}</h3>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description courte</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cas d'usage</label>
                  <input
                    type="text"
                    value={useCaseInput}
                    onChange={(e) => setUseCaseInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addUseCaseChip(useCaseInput);
                      }
                    }}
                    onBlur={() => addUseCaseChip(useCaseInput)}
                    placeholder="Tapez un cas d'usage puis Entrée"
                    className="w-full px-4 py-2 border rounded-xl"
                  />
                  {(formData.use_cases || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(formData.use_cases || []).map((useCase, index) => (
                        <span
                          key={`${useCase}-${index}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs text-gray-700"
                        >
                          {useCase}
                          <button
                            type="button"
                            onClick={() => removeUseCaseChip(index)}
                            className="text-gray-500 hover:text-red-500"
                            aria-label={`Supprimer ${useCase}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                    <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images du produit (Max 8)</label>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 border rounded-xl" />
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {previewUrls.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt="preview" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                          <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select required value={formData.categorie} onChange={e => setFormData({...formData, categorie: e.target.value})} className="w-full px-4 py-2 border rounded-xl bg-white">
                    <option value="pre-roules">Pré-roulés</option>
                    <option value="vrac">En vrac</option>
                    <option value="kits">Kits & coffrets</option>
                    <option value="tisanes">Tisanes & infusions</option>
                  </select>
                </div>
                <div className="p-4 border border-gray-200 rounded-2xl bg-gray-50">
                  <h4 className="font-semibold text-gray-800 mb-3">📦 Informations d'expédition</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Poids (g)</label>
                      <input type="number" min="1" required value={formData.weight_g} onChange={e => setFormData({...formData, weight_g: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Largeur (cm)</label>
                      <input type="number" min="1" required value={formData.width_cm} onChange={e => setFormData({...formData, width_cm: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hauteur (cm)</label>
                      <input type="number" min="1" required value={formData.height_cm} onChange={e => setFormData({...formData, height_cm: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longueur (cm)</label>
                      <input type="number" min="1" required value={formData.length_cm} onChange={e => setFormData({...formData, length_cm: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Ces informations sont utilisées pour calculer automatiquement les frais de livraison via Colissimo (La Poste).
                  </p>
                </div>
                <button type="submit" className="mt-4 bg-primary text-white py-3 rounded-xl font-medium">Enregistrer le produit</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CouponManager = () => {
  const { getIdToken } = useLogto();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '', type: 'pourcentage', valeur: '', date_expiration: '', nombre_utilisations_max: '', actif: true
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAdminCoupons();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingId(coupon.id);
      setFormData({
        code: coupon.code,
        type: coupon.type,
        valeur: coupon.valeur,
        date_expiration: coupon.date_expiration ? coupon.date_expiration.split('T')[0] : '',
        nombre_utilisations_max: coupon.nombre_utilisations_max || '',
        actif: coupon.actif === 1
      });
    } else {
      setEditingId(null);
      setFormData({
        code: '', type: 'pourcentage', valeur: '', date_expiration: '', nombre_utilisations_max: '', actif: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        valeur: Number(formData.valeur),
        nombre_utilisations_max: formData.nombre_utilisations_max ? Number(formData.nombre_utilisations_max) : null,
        date_expiration: formData.date_expiration ? formData.date_expiration + 'T23:59:59' : null
      };

      if (editingId) {
        await updateCoupon(editingId, submitData);
      } else {
        await createCoupon(submitData);
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce code promo ?")) return;
    try {
      await deleteCoupon(id);
      fetchCoupons();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await updateCoupon(coupon.id, { ...coupon, actif: !coupon.actif });
      fetchCoupons();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData(prev => ({ ...prev, code }));
  };

  if (loading) return <div className="text-center p-8">Chargement des codes promo...</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Package size={20} className="text-primary" /> Codes promo
        </h2>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
          <Plus size={16} /> Ajouter un code promo
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-4 font-medium text-xs">Code</th>
              <th className="px-5 py-4 font-medium text-xs">Réduction</th>
              <th className="px-5 py-4 font-medium text-xs">Utilisations</th>
              <th className="px-5 py-4 font-medium text-xs">Expiration</th>
              <th className="px-5 py-4 font-medium text-xs">Statut</th>
              <th className="px-5 py-4 font-medium text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map(c => {
              const isExpired = c.date_expiration && new Date(c.date_expiration) < new Date();
              const isMaxed = c.nombre_utilisations_max && c.nombre_utilisations_actuel >= c.nombre_utilisations_max;
              
              return (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-gray-900">{c.code}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {c.type === 'pourcentage' ? `${c.valeur}%` : `${c.valeur} €`}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {c.nombre_utilisations_actuel} {c.nombre_utilisations_max ? `/ ${c.nombre_utilisations_max}` : ''}
                    {isMaxed && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">MAX</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {c.date_expiration ? new Date(c.date_expiration).toLocaleDateString('fr-FR') : '—'}
                    {isExpired && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">EXPIRÉ</span>}
                  </td>
                  <td className="px-5 py-3">
                    <button 
                      onClick={() => toggleActive(c)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${c.actif ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${c.actif ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      {c.actif ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(c)} className="p-1.5 text-gray-400 hover:text-primary bg-white border border-gray-200 rounded-lg shadow-sm"><Edit size={14}/></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-lg shadow-sm"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-400">Aucun code promo</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setIsModalOpen(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900">{editingId ? 'Modifier code promo' : 'Nouveau code promo'}</h3>
                <button onClick={()=>setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><AlertCircle size={20}/></button>
              </div>
              <div className="p-5 overflow-y-auto">
                <form id="couponForm" onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Code</label>
                    <div className="flex gap-2">
                      <input required type="text" value={formData.code} onChange={e=>setFormData({...formData, code: e.target.value.toUpperCase()})} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-mono" placeholder="Ex: SUMMER20" />
                      {!editingId && (
                        <button type="button" onClick={generateCode} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors">Générer</button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Type de réduction</label>
                      <select value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <option value="pourcentage">Pourcentage (%)</option>
                        <option value="montant_fixe">Montant fixe (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Valeur</label>
                      <input required type="number" step="0.01" min="0" value={formData.valeur} onChange={e=>setFormData({...formData, valeur: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date d'expiration (Optionnel)</label>
                    <input type="date" value={formData.date_expiration} onChange={e=>setFormData({...formData, date_expiration: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nombre maximum d'utilisations (Optionnel)</label>
                    <input type="number" min="1" value={formData.nombre_utilisations_max} onChange={e=>setFormData({...formData, nombre_utilisations_max: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Illimité si vide" />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="actif" checked={formData.actif} onChange={e=>setFormData({...formData, actif: e.target.checked})} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                    <label htmlFor="actif" className="text-sm text-gray-700">Code promo actif</label>
                  </div>
                </form>
              </div>
              <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                <button onClick={()=>setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Annuler</button>
                <button type="submit" form="couponForm" className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-dark rounded-xl transition-colors shadow-sm">Enregistrer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Composant étoiles simple pour l'admin ──
const AdminStars = ({ note }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={14} fill={i <= note ? '#A8192B' : 'none'} color={i <= note ? '#A8192B' : '#d1d5db'} strokeWidth={1.5} />
    ))}
  </div>
);

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAdminReviews(activeFilter);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [activeFilter]);

  const handleApprove = async (id) => {
    try {
      await approveReview(id, true);
      fetchReviews();
    } catch (err) { alert('Erreur: ' + err.message); }
  };

  const handleReject = async (id) => {
    try {
      await approveReview(id, false);
      fetchReviews();
    } catch (err) { alert('Erreur: ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet avis définitivement ?')) return;
    try {
      await deleteReview(id);
      fetchReviews();
    } catch (err) { alert('Erreur: ' + err.message); }
  };

  if (loading) return <div className="text-center p-8">Chargement des avis...</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare size={20} className="text-primary" /> Avis clients
        </h2>
        <div className="flex items-center gap-2">
          {[{ key: 'pending', label: 'En attente' }, { key: 'approved', label: 'Approuvés' }, { key: 'all', label: 'Tous' }].map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeFilter === f.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-4 font-medium text-xs">Client</th>
              <th className="px-5 py-4 font-medium text-xs">Produit</th>
              <th className="px-5 py-4 font-medium text-xs">Note</th>
              <th className="px-5 py-4 font-medium text-xs">Commentaire</th>
              <th className="px-5 py-4 font-medium text-xs">Date</th>
              <th className="px-5 py-4 font-medium text-xs">Statut</th>
              <th className="px-5 py-4 font-medium text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map(r => {
              const initials = r.prenom && r.nom
                ? `${r.prenom[0]}${r.nom[0]}`.toUpperCase()
                : (r.user_name || 'A')[0].toUpperCase();
              const displayName = r.prenom ? `${r.prenom} ${r.nom || ''}` : r.user_name || 'Anonyme';

              return (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary-dark font-bold text-xs shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{displayName}</p>
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-700 text-sm">{r.product_name}</td>
                  <td className="px-5 py-3"><AdminStars note={r.note} /></td>
                  <td className="px-5 py-3 text-gray-600 text-sm max-w-[250px]">
                    <p className="truncate">{r.commentaire || <span className="text-gray-300 italic">Aucun commentaire</span>}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-sm whitespace-nowrap">
                    {new Date(r.date_creation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${r.verifie ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${r.verifie ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      {r.verifie ? 'Approuvé' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {!r.verifie && (
                        <button onClick={() => handleApprove(r.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 bg-white border border-gray-200 rounded-lg shadow-sm" title="Approuver">
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      {r.verifie && (
                        <button onClick={() => handleReject(r.id)} className="p-1.5 text-amber-500 hover:bg-amber-50 bg-white border border-gray-200 rounded-lg shadow-sm" title="Rejeter">
                          <AlertCircle size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-lg shadow-sm" title="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {reviews.length === 0 && (
              <tr><td colSpan="7" className="p-8 text-center text-gray-400">
                {activeFilter === 'pending' ? 'Aucun avis en attente de modération' : 'Aucun avis'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LoyaltyManager = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ stats: { total_plumes: 0, niveaux: {} }, users: [] });
  const [modalUser, setModalUser] = useState(null);
  const [pointsDelta, setPointsDelta] = useState('');
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchLoyalty = async () => {
    try {
      setLoading(true);
      const result = await getAdminLoyalty();
      setData(result);
    } catch (err) {
      console.error('Erreur chargement fidélité:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyalty();
  }, []);

  const openEditModal = (user) => {
    setModalUser(user);
    setPointsDelta('');
    setReason('');
  };

  const handleSavePoints = async (e) => {
    e.preventDefault();
    if (!modalUser) return;
    setIsSaving(true);
    try {
      await updateAdminLoyalty(modalUser.id, Number(pointsDelta), reason);
      setModalUser(null);
      fetchLoyalty();
    } catch (err) {
      alert(err.message || 'Erreur de mise à jour des points');
    } finally {
      setIsSaving(false);
    }
  };

  const levels = data?.stats?.niveaux || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Feather} label="Plumes distribuées" value={data?.stats?.total_plumes || 0} color="bg-primary" delay={0} />
        <StatCard icon={Feather} label="Initié" value={(levels.initie || 0) + (levels.inite || 0)} color="bg-slate-500" delay={0.1} />
        <StatCard icon={Feather} label="Chasseur" value={levels.chasseur || 0} color="bg-amber-500" delay={0.2} />
        <StatCard icon={Feather} label="Aigle Royal" value={levels.aigle_royal || 0} color="bg-emerald-600" delay={0.3} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Feather size={20} className="text-primary" /> Fidélité utilisateurs
          </h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement fidélité...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4 font-medium text-xs">Prénom</th>
                  <th className="px-5 py-4 font-medium text-xs">Email</th>
                  <th className="px-5 py-4 font-medium text-xs">Niveau</th>
                  <th className="px-5 py-4 font-medium text-xs">Points actuels</th>
                  <th className="px-5 py-4 font-medium text-xs">Points cumulés</th>
                  <th className="px-5 py-4 font-medium text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data.users || []).map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-gray-800 font-medium">{u.prenom || u.nom || '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                        <img
                          src={
                            u.niveau === 'aigle_royal'
                              ? '/aigle-royal.png'
                              : u.niveau === 'chasseur'
                                ? '/aigle.png'
                                : '/plume.png'
                          }
                          alt={u.niveau}
                          className="w-4 h-4 object-contain"
                        />
                        {u.niveau}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-800 font-semibold">{u.points_actuels}</td>
                    <td className="px-5 py-3 text-gray-800">{u.points_cumules_total}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openEditModal(u)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs hover:bg-primary-dark"
                      >
                        Modifier points
                      </button>
                    </td>
                  </tr>
                ))}
                {(data.users || []).length === 0 && (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-400">Aucun utilisateur fidélité</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setModalUser(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Modifier points fidélité</h3>
              <p className="text-sm text-gray-500 mb-4">{modalUser.email}</p>
              <form onSubmit={handleSavePoints} className="space-y-4">
                <input
                  type="number"
                  required
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(e.target.value)}
                  placeholder="Ex: 30 ou -20"
                  className="w-full px-4 py-2 border rounded-xl"
                />
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Raison"
                  className="w-full px-4 py-2 border rounded-xl"
                />
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-xl bg-primary text-white font-medium disabled:opacity-60"
                >
                  {isSaving ? 'Mise à jour...' : 'Enregistrer'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const config = {
    'payé': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
    'en attente': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    'annulé': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle },
  };
  const cfg = config[status] || config['en attente'];
  const StatusIcon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <StatusIcon size={12} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// OrderDetailModal has been replaced by AdminOrderDetail page

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date_creation', direction: 'desc' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getAdminOrders();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Erreur chargement commandes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch pending reviews count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const data = await getAdminReviews('pending');
        setPendingReviewsCount((data.reviews || []).length);
      } catch(e) {}
    };
    fetchPendingCount();
  }, [activeTab]);

  // Stats
  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const paidOrders = orders.filter(o => o.statut_paiement === 'payé').length;
  const pendingOrders = orders.filter(o => o.statut_paiement === 'en attente').length;

  // Recherche
  const filteredOrders = orders.filter(o => {
    const matchesSearch = (() => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        String(o.id).includes(q) ||
        (o.client_name || '').toLowerCase().includes(q) ||
        (o.client_email || '').toLowerCase().includes(q) ||
        (o.statut_paiement || '').toLowerCase().includes(q)
      );
    })();

    const matchesStatus = statusFilter === 'all' || o.statut_paiement === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Tri
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const { key, direction } = sortConfig;
    let aVal = a[key];
    let bVal = b[key];
    if (key === 'total') { aVal = Number(aVal); bVal = Number(bVal); }
    if (key === 'date_creation') { aVal = new Date(aVal); bVal = new Date(bVal); }
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronDown size={14} className="opacity-30" />;
    return sortConfig.direction === 'desc'
      ? <ChevronDown size={14} className="text-primary" />
      : <ChevronUp size={14} className="text-primary" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-primary-dark rounded-xl text-white">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-xs text-gray-500">Gestion des commandes</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">
                {(user?.name || 'A')[0].toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={async (e) => await onLogout(e)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Déconnexion"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveTab('orders')} className={`py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Commandes</button>
          <button onClick={() => setActiveTab('products')} className={`py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'products' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Produits</button>
          <button onClick={() => setActiveTab('coupons')} className={`py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'coupons' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Codes promo</button>
          <button onClick={() => setActiveTab('reviews')} className={`py-4 font-medium text-sm border-b-2 transition-colors relative ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Avis clients
            {pendingReviewsCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-primary text-white rounded-full">{pendingReviewsCount}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('loyalty')} className={`py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'loyalty' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Fidélité</button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {activeTab === 'orders' && (
          <>
            {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Package} label="Total commandes" value={orders.length} color="bg-blue-500" delay={0} />
          <StatCard icon={TrendingUp} label="Chiffre d'affaires" value={`${totalRevenue.toFixed(2)} €`} color="bg-emerald-500" delay={0.1} />
          <StatCard icon={CheckCircle2} label="Payées" value={paidOrders} color="bg-green-500" delay={0.2} />
          <StatCard icon={Clock} label="En attente" value={pendingOrders} color="bg-amber-500" delay={0.3} />
        </div>

        {/* Tableau principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Toolbar */}
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package size={20} className="text-primary" />
              Commandes récentes
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher (ID, client, statut...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="payé">Payées</option>
                  <option value="en attente">En attente</option>
                  <option value="expédié">Expédiées</option>
                  <option value="annulé">Annulées</option>
                  <option value="remboursé">Remboursées</option>
                </select>
                <Filter size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Contenu */}
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des commandes...</p>
            </div>
          ) : error ? (
            <div className="p-16 text-center">
              <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
              <p className="text-red-500 font-medium">Erreur : {error}</p>
              <p className="text-gray-400 text-sm mt-2">Vérifiez que le serveur backend est démarré.</p>
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="p-16 text-center">
              <Package size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune commande trouvée.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    {[
                      { key: 'id', label: 'ID' },
                      { key: 'client_name', label: 'Client' },
                      { key: 'date_creation', label: 'Date' },
                      { key: 'total', label: 'Total' },
                      { key: 'statut_paiement', label: 'Statut' },
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 cursor-pointer hover:text-primary transition-colors select-none"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          <SortIcon columnKey={col.key} />
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-gray-800">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary-dark font-bold text-sm shrink-0">
                            {(order.client_name || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{order.client_name || 'Inconnu'}</p>
                            <p className="text-xs text-gray-400">{order.client_email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.date_creation).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                        <span className="block text-xs text-gray-400">
                          {new Date(order.date_creation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{Number(order.total).toFixed(2)} €</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.statut_paiement} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Détails <ArrowLeft size={14} className="rotate-180" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {sortedOrders.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-sm text-gray-500 flex items-center justify-between">
              <span>{sortedOrders.length} commande{sortedOrders.length > 1 ? 's' : ''} trouvée{sortedOrders.length > 1 ? 's' : ''}</span>
              <span className="text-xs">Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}</span>
            </div>
          )}
        </motion.div>
        
          </>
        )}

        {activeTab === 'products' && (
          <ProductManager />
        )}

        {activeTab === 'coupons' && (
          <CouponManager />
        )}

        {activeTab === 'reviews' && (
          <ReviewManager />
        )}

        {activeTab === 'loyalty' && (
          <LoyaltyManager />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
