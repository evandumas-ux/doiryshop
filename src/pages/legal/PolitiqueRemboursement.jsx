import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../../components/SEO';

const PolitiqueRemboursement = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      <SEO
        title="Politique de Remboursement"
        description="Politique de remboursement et conditions de retours de Doiry Shop."
        url="https://doiryshop.fr/politique-remboursement"
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
          Informations clients
        </p>
        <h1 className="text-4xl md:text-5xl font-serif mb-6">Politique de remboursement</h1>
        <p className="text-text-muted text-sm mb-10">Dernière mise à jour : Mai 2026</p>

        <div className="space-y-8 text-text-light leading-relaxed">
          
          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-4">1. Délai de rétractation</h2>
            <p className="mb-4">
              Conformément à la législation française (article L221-18 du Code de la consommation), vous disposez d'un délai de 14 jours francs à compter de la réception de votre commande pour exercer votre droit de rétractation sans avoir à justifier de motifs ni à payer de pénalités.
            </p>
            <p>
              Cependant, pour des raisons d'hygiène et de protection de la santé, les produits ayant été descellés, ouverts ou entamés après la livraison ne peuvent faire l'objet du droit de rétractation (article L221-28).
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-4">2. Conditions de retour</h2>
            <p className="mb-4">
              Pour qu'un retour soit accepté et le remboursement validé, les conditions suivantes doivent être respectées :
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Le produit doit être renvoyé dans son état d'origine, non utilisé, non ouvert et avec ses scellés intacts.</li>
              <li>En cas de produit reçu endommagé ou non conforme, le problème doit nous être signalé dans un délai de 72h maximum après la réception du colis.</li>
            </ul>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-4">3. Procédure de retour</h2>
            <p className="mb-4">
              Afin de faciliter le traitement de votre demande, merci de suivre ces étapes :
            </p>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Contact initial :</strong> Envoyez un e-mail à notre support client (contact@doiryshop.fr) contenant votre numéro de commande, la raison du retour, et d'éventuelles photos si le produit a été endommagé pendant le transport.</li>
              <li><strong>Validation :</strong> Notre équipe traitera votre demande et vous confirmera si le retour est accepté ainsi que l'adresse postale où renvoyer les articles.</li>
              <li><strong>Renvoi :</strong> Vous expédiez les produits à vos frais (sauf erreur manifeste de notre part ou casse avérée liée au transporteur).</li>
            </ol>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-4">4. Modalités de remboursement</h2>
            <p className="mb-4">
              Une fois votre retour réceptionné et inspecté par nos soins, nous vous informerons de l'approbation ou du refus de votre remboursement :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>En cas d'approbation, le remboursement sera traité et appliqué automatiquement sur votre mode de paiement initial (carte bancaire, etc.).</li>
              <li>Le traitement prend généralement entre 5 et 10 jours ouvrés selon les délais bancaires.</li>
              <li>Sauf erreur de notre part lors de la préparation, les frais d'expédition initiaux ne sont pas remboursables.</li>
            </ul>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-4">5. Produits non remboursables</h2>
            <p>
              Comme évoqué dans les conditions de retour, pour garantir l'intégrité de notre chaîne logistique et de nos engagements qualité, tout produit dont le sachet scellé a été ouvert, déchiré, ou dont le contenu a été partiellement consommé, sera systématiquement refusé pour un remboursement.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-4">6. Contact</h2>
            <p>
              Pour toute question relative aux retours et remboursements, vous pouvez nous joindre à tout moment à l'adresse suivante :{' '}
              <a className="text-accent hover:underline" href="mailto:contact@doiryshop.fr">
                contact@doiryshop.fr
              </a>.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
};

export default PolitiqueRemboursement;
