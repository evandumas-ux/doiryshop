import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../../components/SEO';

const CGV = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      <SEO
        title="CGV"
        description="Conditions générales de vente Doiry Shop."
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
            Retour à l'accueil
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <p className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4">
          Conditions de vente
        </p>
        <h1 className="text-4xl md:text-5xl font-serif mb-6">CGV</h1>
        <p className="text-text-muted text-sm mb-10">Dernière mise à jour : Avril 2026</p>

        <div className="space-y-6 text-text-light leading-relaxed">
          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">1. Objet et champ d'application</h2>
            <p>
              Les présentes conditions générales de vente régissent l'ensemble des commandes passées
              sur le site Doiry Shop.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">2. Produits</h2>
            <p>
              Les produits proposés sont des plantes séchées et infusions naturelles, des bases en vrac, des
              pré-roulés à base de plantes et des tisanes ou infusions. Les descriptions, compositions
              et conseils d'utilisation sont présentées sur chaque fiche produit.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">3. Prix TTC et paiement</h2>
            <p>
              Les prix affichés sont exprimés en euros TTC. Le paiement est dû à la commande via les
              moyens proposés sur la boutique.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">4. Moyens de paiement</h2>
            <p>Les moyens de paiement acceptés sur la boutique sont :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Carte bancaire (Visa, Mastercard, CB)</li>
              <li>Paiement sécurisé via <strong>Stripe</strong> (prestataire de paiement)</li>
            </ul>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">5. Livraison</h2>
            <div className="space-y-3">
              <p>
                La livraison est assurée en <strong>France métropolitaine uniquement</strong>.
              </p>
              <p>
                Les délais indicatifs sont de <strong>48 à 72h</strong> pour <strong>Colissimo Domicile (La Poste)</strong> (jours ouvrés), après expédition.
              </p>
              <p>
                Les frais de livraison sont de <strong>7,59��</strong> par commande (Colissimo Domicile, La Poste, livraison en 2-3 jours ouvrés).
                La livraison est offerte pour toute commande d'un montant supérieur ou égal à <strong>35��</strong>.
              </p>
              <p className="text-sm text-text-muted">
                Les frais et délais exacts sont rappelés au moment du paiement, avant validation de la commande.
              </p>
            </div>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">6. Droit de rétractation</h2>
            <p>
              Conformément au Code de la consommation, le client dispose d'un délai de 14 jours pour
              exercer son droit de rétractation.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">7. Modalités de rétractation</h2>
            <p>
              Le client dispose de 14 jours pour se rétracter sans justification en envoyant un email à{' '}
              <a className="text-accent hover:underline" href="mailto:contact@doiryshop.com">
                contact@doiryshop.com
              </a>
              .
            </p>
            <p className="mt-2">
              Le remboursement sera effectué sous 14 jours après réception du retour. Les frais de
              retour sont à la charge du client.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">8. Vente réservée aux majeurs</h2>
            <p>La vente est strictement réservée aux personnes majeures de 18 ans.</p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">9. Responsabilité et garanties</h2>
            <p>
              Le vendeur est tenu des garanties légales applicables. La responsabilité ne peut être
              engagée en cas de mauvaise utilisation des produits.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">10. Litiges et droit applicable</h2>
            <p>Les présentes CGV sont soumises au droit français.</p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">11. Médiation</h2>
            <p>
              En cas de litige, le client peut recourir gratuitement au service de médiation de la
              consommation via la plateforme européenne :
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
