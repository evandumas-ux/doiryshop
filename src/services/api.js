const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ====== AUTHENTIFICATION (Custom) ======

export const customRegister = async (firstName, lastName, email, password) => {
  const response = await fetch(`${API_URL}/auth/custom-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prenom: firstName, nom: lastName, email, password }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const customVerify = async (email, code) => {
  const response = await fetch(`${API_URL}/auth/custom-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

// ====== AUTHENTIFICATION (Legacy - login/register local) ======

export const register = async (firstName, lastName, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prenom: firstName, nom: lastName, email, password }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const login = async (email, password) => {
  const url = `${API_URL}/auth/login`;
  console.log('[API] login() appelé');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    
    console.log('[API LOGIN] status =', response.status);
    const text = await response.text();
    console.log('[API LOGIN] raw text =', text);

    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = {};
    }

    if (!response.ok) {
      const message = data.error || data.message || `Erreur serveur (${response.status})`;
      const err = new Error(message);
      err.status = response.status;
      throw err;
    }
    return data;
  } catch (err) {
    console.error('[API] login error brut =', err);
    throw err;
  }
};

export const logout = async () => {
  try {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch (err) {
    console.error('Logout error:', err);
  }
};

export const getMe = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.user;
};

// ====== SYNCHRONISATION LOGTO → BACKEND ======

/**
 * Synchronise l'utilisateur Logto avec notre DB locale.
 * Appelé automatiquement après chaque connexion Logto réussie.
 * Retourne les infos utilisateur locales (avec le rôle).
 */
export const syncSocialLogin = async (logtoUser) => {
  const response = await fetch(`${API_URL}/auth/sync-social-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      logto_id: logtoUser.sub,
      email: logtoUser.email,
      name: logtoUser.name || logtoUser.email?.split('@')[0] || 'Utilisateur',
    }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

// ====== COMMANDES (Orders) ======

/**
 * Créer une commande après validation du paiement.
 */
export const createOrder = async (orderData) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

// ====== PROFIL UTILISATEUR ======

export const confirmOrderPayment = async (orderId) => {
  const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const getUserProfile = async () => {
  const response = await fetch(`${API_URL}/user/profile`, {
    method: 'GET',
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.profile;
};

export const updateUserProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

// ====== COMMANDES (Orders) ======

/**
 * Récupérer les commandes de l'utilisateur connecté
 */
export const getMyOrders = async (userId = null) => {
  const endpoints = ['/orders/my-orders', '/user/orders', '/orders'];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) continue;

      const payload = await response.json();
      const rawOrders = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.orders)
          ? payload.orders
          : [];

      // Ne filtre jamais par statut: on affiche l'historique réel tel quel.
      const orders = rawOrders.filter((order) => {
        if (!userId) return true;
        if (order?.user_id === undefined || order?.user_id === null) return true;
        return Number(order.user_id) === Number(userId);
      });

      return { orders };
    } catch {
      // On tente l'endpoint suivant.
    }
  }

  return { orders: [] };
};

export const downloadOrderInvoice = async (orderId) => {
  const response = await fetch(`${API_URL}/orders/${orderId}/invoice`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    let message = 'Impossible de télécharger la facture.';
    try {
      const payload = await response.json();
      if (payload?.error) message = payload.error;
    } catch {
      // fallback message
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  return blob;
};

// ====== ADMIN ======

/**
 * Récupérer toutes les commandes (admin uniquement).
 */
export const getAdminOrders = async () => {
  const response = await fetch(`${API_URL}/admin/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const getAdminOrderById = async (id) => {
  const response = await fetch(`${API_URL}/admin/orders/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const updateAdminOrderNote = async (id, note) => {
  const response = await fetch(`${API_URL}/admin/orders/${id}/note`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ note }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const updateAdminOrderTracking = async (id, tracking_number) => {
  const response = await fetch(`${API_URL}/admin/orders/${id}/tracking`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tracking_number }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const updateAdminOrderStatus = async (id, status) => {
  const response = await fetch(`${API_URL}/admin/orders/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

// ====== PRODUITS ======

export const getProducts = async () => {
  const response = await fetch(`${API_URL}/products`, { credentials: 'include' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.products;
};

export const subscribeNewsletter = async (email, source = 'footer') => {
  const response = await fetch(`${API_URL}/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const createProduct = async (productData) => {
  let body = productData;
  let headers = {};
  
  if (!(productData instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(productData);
  }

  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers,
    body,
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const updateProduct = async (id, productData) => {
  let body = productData;
  let headers = {};
  
  if (!(productData instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(productData);
  }

  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers,
    body,
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

// ====== PANIER ======

export const getCart = async () => {
  const response = await fetch(`${API_URL}/cart`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) return { items: [] };
  return await response.json();
};

export const updateCart = async (items) => {
  const response = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items }),
    credentials: 'include'
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Erreur sauvegarde panier');
  }
  return await response.json();
};

// ====== COUPONS ======

export const verifyCoupon = async (code, cartTotal) => {
  const response = await fetch(`${API_URL}/coupons/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code, cartTotal }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

// ====== COUPONS ADMIN ======

export const getAdminCoupons = async () => {
  const response = await fetch(`${API_URL}/admin/coupons`, {
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const createCoupon = async (couponData) => {
  const response = await fetch(`${API_URL}/admin/coupons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(couponData),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const updateCoupon = async (id, couponData) => {
  const response = await fetch(`${API_URL}/admin/coupons/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(couponData),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const deleteCoupon = async (id) => {
  const response = await fetch(`${API_URL}/admin/coupons/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

// ====== ADMIN REVIEWS ======

export const getAdminReviews = async (status = 'all') => {
  const response = await fetch(`${API_URL}/admin/reviews?status=${status}`, {
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const approveReview = async (id, verifie) => {
  const response = await fetch(`${API_URL}/admin/reviews/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verifie }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const deleteReview = async (id) => {
  const response = await fetch(`${API_URL}/admin/reviews/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

// ============================================================
// PROGRAMME DE FIDÉLITÉ "LES PLUMES"
// ============================================================

export const getLoyaltyPoints = async () => {
  const response = await fetch(`${API_URL}/loyalty/my-points`, {
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const redeemLoyaltyReward = async (type_recompense) => {
  const response = await fetch(`${API_URL}/loyalty/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type_recompense }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const getReferralCode = async () => {
  const response = await fetch(`${API_URL}/loyalty/referral-code`, {
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const useReferralCode = async (code) => {
  const response = await fetch(`${API_URL}/loyalty/use-referral`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const getAdminLoyalty = async () => {
  const response = await fetch(`${API_URL}/admin/loyalty`, {
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export const updateAdminLoyalty = async (userId, points, raison) => {
  const response = await fetch(`${API_URL}/admin/loyalty/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points, raison }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

// ====== STRIPE ======

export const createCheckoutSession = async (items, orderId, couponCode, shippingZip, shippingServiceId) => {
  const response = await fetch(`${API_URL}/checkout/create-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, orderId, couponCode, shippingZip, shippingServiceId }),
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

// ====== SHIPPING ======
export async function getShippingOptions(cartTotal, items) {
  const res = await fetch(`${API_URL}/shipping/options`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartTotal, items })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur lors de la récupération des options de livraison');
  return data;
}
