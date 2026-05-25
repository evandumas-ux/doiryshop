import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useLogto, useHandleSignInCallback } from '@logto/react';
import { Landing } from './pages/Landing';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrderDetail from './pages/AdminOrderDetail';
import Login from './pages/Login';
import MentionsLegales from './pages/legal/MentionsLegales';
import CGV from './pages/legal/CGV';
import PolitiqueConfidentialite from './pages/legal/PolitiqueConfidentialite';
import PolitiqueRemboursement from './pages/legal/PolitiqueRemboursement';
import CookieBanner from './components/CookieBanner';
import AgeVerification from './components/AgeVerification';
import Footer from './components/Footer';
import ProductDetail from './pages/ProductDetail';
import { getMe, syncLogtoUser, getCart, updateCart, getUserProfile, logout } from './services/api';
import CompleteProfile from './pages/CompleteProfile';
import Profile from './pages/Profile';
import ErrorBoundary from './components/ErrorBoundary';
import Register from './pages/Register';
import Inscription from './pages/Inscription';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Boutique from './pages/Boutique';
import About from './pages/About';
import MyOrders from './pages/MyOrders';
import OrderSuccess from './pages/OrderSuccess';
import OrderCancel from './pages/OrderCancel';
import ArretTabac from './pages/ArretTabac';
import ScrollToTop from './components/ScrollToTop';

// Composant Callback pour Logto (route /callback)
const LogtoCallback = () => {
  const { isLoading, error } = useHandleSignInCallback(() => {
    console.log('Callback Logto terminé avec succès');
    window.location.href = '/';
  });

  // Timeout de sécurité : si après 8 secondes ça ne redirige pas, on force
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('Timeout callback, redirection forcée vers /');
      window.location.href = '/';
    }, 8000);
    return () => clearTimeout(timeout);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-primary mb-4">Erreur de connexion : {error.message}</p>
          <a href="/" className="text-accent hover:underline">Retour à l'accueil</a>
        </div>
      </div>
    );
  }

  // Pendant le chargement, ou si on a fini mais pas encore redirigé
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <img src="/logo.jpg" alt="DOIRY SHOP" className="w-16 h-16 object-contain rounded-xl mx-auto mb-4 animate-pulse" />
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-light">Connexion en cours...</p>
      </div>
    </div>
  );
};

// Composant de protection des routes admin
const ProtectedAdminRoute = ({ children, user, isInitializing }) => {
  console.log('[ADMIN GUARD] user =', user, 'isInitializing =', isInitializing);
  
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    console.log('[ADMIN GUARD] No user found, redirecting to /');
    return <Navigate to="/" replace />;
  }
  
  console.log('[ADMIN GUARD] role =', user.role);
  if (user.role !== 'admin') {
    console.log('[ADMIN GUARD] Not an admin, redirecting to /');
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Composant pour forcer la complétion du profil (Désactivé : profil optionnel)
const ProfileCheck = ({ user, isInitializing }) => {
  // Le formulaire de profil devient optionnel (accessible depuis les paramètres du compte)
  // Ne plus forcer le formulaire, laisser passer
  return null;
};

const AppRoutes = ({ cartItems, setCartItems, user, isInitializing, handleSetUser, handleLogout }) => {
  const location = useLocation();
  const isCheckout = location.pathname === '/checkout';

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Landing
              cartItems={cartItems}
              setCartItems={setCartItems}
              user={user}
              setUser={handleSetUser}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="/login" element={<Login user={user} setUser={handleSetUser} />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/inscription" element={<Inscription setUser={handleSetUser} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/boutique"
          element={
            <Boutique
              cartItems={cartItems}
              setCartItems={setCartItems}
              user={user}
              setUser={handleSetUser}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/shop"
          element={
            <Boutique
              cartItems={cartItems}
              setCartItems={setCartItems}
              user={user}
              setUser={handleSetUser}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="/about" element={<About />} />
        <Route
          path="/arret-tabac"
          element={
            <ArretTabac
              cartItems={cartItems}
              setCartItems={setCartItems}
              user={user}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/checkout"
          element={<Checkout cartItems={cartItems} setCartItems={setCartItems} user={user} />}
        />
        <Route path="/callback" element={<LogtoCallback />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute user={user} isInitializing={isInitializing}>
              <AdminDashboard user={user} onLogout={handleLogout} />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <ProtectedAdminRoute user={user} isInitializing={isInitializing}>
              <AdminOrderDetail user={user} />
            </ProtectedAdminRoute>
          }
        />

        {/* Espace Client / Mises à jour du profil */}
        <Route path="/profil/completer" element={<CompleteProfile user={user} setUser={handleSetUser} />} />
        <Route
          path="/profil"
          element={
            <ErrorBoundary>
              <Profile user={user} setUser={handleSetUser} onLogout={handleLogout} isInitializing={isInitializing} />
            </ErrorBoundary>
          }
        />
        <Route path="/mes-commandes" element={<MyOrders user={user} isInitializing={isInitializing} />} />
        <Route path="/commande/succes" element={<OrderSuccess setCartItems={setCartItems} />} />
        <Route path="/commande/annulation" element={<OrderCancel />} />

        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/cgv" element={<CGV />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/politique-remboursement" element={<PolitiqueRemboursement />} />
        <Route path="/produit/:id" element={<ProductDetail cartItems={cartItems} setCartItems={setCartItems} user={user} />} />
        {/* Redirection pour les routes inconnues */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isCheckout && <Footer />}
      <CookieBanner />
    </>
  );
};

function App() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cartItems');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { isAuthenticated, isLoading, getIdTokenClaims, signOut: logtoSignOut } = useLogto();

  // Synchro LocalStorage + Backend sur changement du panier
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    if (user) {
      const timer = setTimeout(async () => {
        updateCart(cartItems).catch(err => console.error('Erreur save cart:', err));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cartItems, user]);

  // Sync user from Logto or local cookie on app load
  useEffect(() => {
    if (isLoading) {
      console.log('[Auth] Logto SDK still loading, waiting...');
      return;
    }

    console.log('[Auth] Logto SDK loaded. isAuthenticated =', isAuthenticated);

    const syncUser = async () => {
      let loggedUser = null;

      // 1. Essayer Logto d'abord
      if (isAuthenticated) {
        try {
          const claims = await getIdTokenClaims();
          console.log('[Auth] Logto claims:', claims?.sub, claims?.email);
          if (claims) {
            const syncResult = await syncLogtoUser(claims);
            console.log('[Auth] syncLogtoUser result:', JSON.stringify(syncResult));
            loggedUser = syncResult.user;
          }
        } catch (err) {
          console.error('[Auth] Erreur sync Logto:', err);
        }
      }

      // 2. Fallback: Cookie local (via getMe)
      if (!loggedUser) {
        try {
          loggedUser = await getMe();
          console.log('[Auth] getMe result:', JSON.stringify(loggedUser));
        } catch (err) {
          console.log('[Auth] Pas de session valide');
        }
      }

      if (loggedUser) {
        // 3. FETCH FULL PROFILE pour garantir l'état de profil_complete
        try {
          const profile = await getUserProfile();
          console.log('[Auth] getUserProfile result:', JSON.stringify(profile));
          // Merger mais s'assurer que profil_complete est un boolean
          loggedUser = { ...loggedUser, ...profile };
          loggedUser.profil_complete = !!loggedUser.profil_complete;
        } catch(e) {
          console.error('[Auth] Erreur fetch user profile:', e);
          if (loggedUser.profil_complete === undefined || loggedUser.profil_complete === null) {
            loggedUser.profil_complete = false;
          } else {
            loggedUser.profil_complete = !!loggedUser.profil_complete;
          }
        }

        console.log('[Auth] Final user set:', loggedUser.email, 'profil_complete =', loggedUser.profil_complete);
        setUser(loggedUser);

        // 4. Récupérer le panier distant
        try {
          const remoteCart = await getCart();
          if (remoteCart && remoteCart.items && remoteCart.items.length > 0) {
            setCartItems(prev => prev.length === 0 ? remoteCart.items : prev);
          }
        } catch(e) {
          console.error('[Auth] Erreur fetch remote cart:', e);
        }
      } else {
        console.log('[Auth] No user found, staying anonymous');
      }

      setIsInitializing(false);
    };
    syncUser();
  }, [isAuthenticated, isLoading]);

  const handleSetUser = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      // Déconnexion complète côté serveur + redirection automatique vers l'accueil
      await logtoSignOut(window.location.origin);
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <Router>
      <ScrollToTop />
      <AgeVerification />
      <ExitIntentPopup />
      <ProfileCheck user={user} isInitializing={isInitializing} />
      <AppRoutes
        cartItems={cartItems}
        setCartItems={setCartItems}
        user={user}
        isInitializing={isInitializing}
        handleSetUser={handleSetUser}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
