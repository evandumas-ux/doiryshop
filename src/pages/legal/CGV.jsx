import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../../components/SEO';

const CGV = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      <SEO
        title="CGV"
        description="Conditions gÃ©nÃ©rales de vente Doiry Shop."
        url="https://doiryshop.com/cgv"
        robots="noindex, nofollow"
      />
      <div className="bg-surface border-b border-surface-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-text-light hover:text-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Retour Ã  l'accueil
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <p className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4">
          Conditions de vente
        </p>
        <h1 className="text-4xl md:text-5xl font-serif mb-6">CGV</h1>
        <p className="text-text-muted text-sm mb-10">DerniÃ¨re mise Ã  jour : Avril 2026</p>

        <div className="space-y-6 text-text-light leading-relaxed">
          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">1. Objet et champ d'application</h2>
            <p>
              Les prÃ©sentes conditions gÃ©nÃ©rales de vente rÃ©gissent l'ensemble des commandes passÃ©es
              sur le site Doiry Shop.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">2. Produits</h2>
            <p>
              Les produits proposÃ©s sont des plantes sÃ©chÃ©es et infusions naturelles, des bases en vrac, des
              prÃ©-roulÃ©s Ã  base de plantes et des tisanes ou infusions. Les descriptions, compositions
              et conseils d'utilisation sont prÃ©sentÃ©es sur chaque fiche produit.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">3. Prix TTC et paiement</h2>
            <p>
              Les prix affichÃ©s sont exprimÃ©s en euros TTC. Le paiement est dÃ» Ã  la commande via les
              moyens proposÃ©s sur la boutique.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">4. Moyens de paiement</h2>
            <p>Les moyens de paiement acceptÃ©s sur la boutique sont :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Carte bancaire (Visa, Mastercard, CB)</li>
              <li>Paiement sÃ©curisÃ© via <strong>Stripe</strong> (prestataire de paiement)</li>
            </ul>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">5. Livraison</h2>
            <div className="space-y-3">
              <p>
                La livraison est assurÃ©e en <strong>France mÃ©tropolitaine uniquement</strong>.
              </p>
              <p>
                Les dÃ©lais indicatifs sont de <strong>48 Ã  72h</strong> pour <strong>Colissimo Domicile (La Poste)</strong> (jours ouvrÃ©s), aprÃ¨s expÃ©dition.
              </p>
              <p>
                Les frais de livraison sont de <strong>7,59â‚¬</strong> par commande (Colissimo Domicile, La Poste, livraison en 2-3 jours ouvrÃ©s).
                La livraison est offerte pour toute commande d'un montant supÃ©rieur ou Ã©gal Ã  <strong>35â‚¬</strong>.
              </p>
              <p className="text-sm text-text-muted">
                Les frais et dÃ©lais exacts sont rappelÃ©s au moment du paiement, avant validation de la commande.
              </p>
            </div>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">6. Droit de rÃ©tractation</h2>
            <p>
              ConformÃ©ment au Code de la consommation, le client dispose d'un dÃ©lai de 14 jours pour
              exercer son droit de rÃ©tractation.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">7. ModalitÃ©s de rÃ©tractation</h2>
            <p>
              Le client dispose de 14 jours pour se rÃ©tracter sans justification en envoyant un email Ã {' '}
              <a className="text-accent hover:underline" href="mailto:contact@doiryshop.com">
                contact@doiryshop.com
              </a>
              .
            </p>
            <p className="mt-2">
              Le remboursement sera effectuÃ© sous 14 jours aprÃ¨s rÃ©ception du retour. Les frais de
              retour sont Ã  la charge du client.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">8. Vente rÃ©servÃ©e aux majeurs</h2>
            <p>La vente est strictement rÃ©servÃ©e aux personnes majeures de 18 ans.</p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">9. ResponsabilitÃ© et garanties</h2>
            <p>
              Le vendeur est tenu des garanties lÃ©gales applicables. La responsabilitÃ© ne peut Ãªtre
              engagÃ©e en cas de mauvaise utilisation des produits.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">10. Litiges et droit applicable</h2>
            <p>Les prÃ©sentes CGV sont soumises au droit franÃ§ais.</p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">11. MÃ©diation</h2>
            <p>
              En cas de litige, le client peut recourir gratuitement au service de mÃ©diation de la
              consommation via la plateforme europÃ©enne :
            </p>
            <p className="mt-2">
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CGV;
