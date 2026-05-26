import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../../components/SEO';

const PolitiqueConfidentialite = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      <SEO
        title="Politique de Confidentialité"
        description="Politique de confidentialité et protection des données personnelles de Doiry Shop."
        url="https://doiryshop.com/politique-confidentialite"
        robots="noindex, nofollow"
      />
      <div className="bg-surface border-b border-surface-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-text-light hover:text-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Retour à l'accueil
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <p className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4">
          Protection des données
        </p>
        <h1 className="text-4xl md:text-5xl font-serif mb-6">Politique de Confidentialité</h1>
        <p className="text-text-muted text-sm mb-10">Dernière mise à jour : mai 2026</p>

        <div className="space-y-6 text-text-light leading-relaxed">
          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3 text-text">1. RESPONSABLE DU TRAITEMENT</h2>
            <div className="space-y-1">
              <p className="font-medium text-text">DoiryShop</p>
              <p>Evan DUMAS</p>
              <p>3 avenues de Londres, 67300 Schiltigheim, France</p>
              <p>
                Email : <a href="mailto:doiryshop.pro@gmail.com" className="text-accent hover:underline">doiryshop.pro@gmail.com</a>
              </p>
            </div>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3 text-text">2. DONNÉES COLLECTÉES</h2>
            <p className="mb-4">Dans le cadre de votre commande et de l'utilisation du site, nous collectons :</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Nom, prénom, adresse email</li>
              <li>Adresse de livraison (rue, code postal, ville)</li>
              <li>Numéro de téléphone</li>
              <li>Données de commande (produits achetés, montant, date)</li>
            </ul>
            <p className="p-3 bg-primary/10 border-l-4 border-primary rounded-r-lg text-sm italic">
              Nous ne stockons JAMAIS vos données bancaires. Le paiement est traité par Stripe (stripe.com) qui applique ses propres règles de sécurité.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3 text-text">3. FINALITÉS DU TRAITEMENT</h2>
            <p className="mb-2">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Traiter et expédier votre commande</li>
              <li>Vous envoyer la confirmation de commande par email (via Resend)</li>
              <li>Gérer votre compte client (via Logto)</li>
              <li>Calculer les frais de livraison (via La Poste)</li>
              <li>Améliorer nos services</li>
            </ul>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3 text-text">4. DURÉE DE CONSERVATION</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Données de commande : 3 ans (obligation légale comptable)</li>
              <li>Données de compte : jusqu'à suppression de votre compte</li>
              <li>Données newsletter : jusqu'à désinscription</li>
            </ul>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3 text-text">5. PARTAGE DES DONNÉES</h2>
            <p className="mb-3">Vos données sont partagées uniquement avec :</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><span className="font-medium text-text">Stripe</span> (paiement) € <a href="https://stripe.com/fr/privacy" target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm">stripe.com/fr/privacy</a></li>
              <li><span className="font-medium text-text">Resend</span> (emails transactionnels) € <a href="https://resend.com/privacy" target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm">resend.com/privacy</a></li>
              <li><span className="font-medium text-text">La Poste</span> (expédition) € <a href="https://www.laposte.fr/politique-de-confidentialite" target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm">laposte.fr/politique-de-confidentialite</a></li>
              <li><span className="font-medium text-text">Logto</span> (authentification) € <a href="https://logto.io/privacy" target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm">logto.io/privacy</a></li>
            </ul>
            <p className="text-sm font-medium">Aucune donnée n'est vendue ou partagée à des fins publicitaires.</p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3 text-text">6. VOS DROITS (RGPD)</h2>
            <p className="mb-3">Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement ("droit à l'oubli")</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à : <a href="mailto:doiryshop.pro@gmail.com" className="text-accent hover:underline">doiryshop.pro@gmail.com</a>. Nous répondrons dans un délai de 30 jours.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3 text-text">7. COOKIES</h2>
            <p className="mb-2">Ce site utilise uniquement des cookies techniques nécessaires au fonctionnement :</p>
            <ul className="list-disc pl-5 space-y-1 mb-4 text-sm italic">
              <li>Cookie de session d'authentification (httpOnly, sécurisé)</li>
              <li>Cookie de panier</li>
            </ul>
            <p>Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3 text-text">8. SÉCURIT0</h2>
            <p className="mb-2">Vos données sont protégées par :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Connexion HTTPS (SSL)</li>
              <li>Tokens JWT stockés en cookie httpOnly</li>
              <li>Hébergement sécurisé (Netlify / Render)</li>
            </ul>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3 text-text">9. CONTACT & RÉCLAMATION</h2>
            <p className="mb-4">Pour toute question : <a href="mailto:doiryshop.pro@gmail.com" className="text-accent hover:underline">doiryshop.pro@gmail.com</a></p>
            <p>
              Vous pouvez également adresser une réclamation à la CNIL :<br />
              <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="text-accent hover:underline">cnil.fr</a> € 3 Place de Fontenoy, 75007 Paris
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PolitiqueConfidentialite;
