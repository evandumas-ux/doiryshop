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
        url="https://doiryshop.com/politique-remboursement"
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
          Informations clients
        </p>
        <h1 className="text-4xl md:text-5xl font-serif mb-6">Politique de remboursement</h1>
        <p className="text-text-muted text-sm mb-10">DerniÃ¨re mise Ã  jour : Mai 2026</p>

        <div className="space-y-8 text-text-light leading-relaxed">
          
          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-4">1. DÃ©lai de rÃ©tractation</h2>
            <p className="mb-4">
              ConformÃ©ment Ã  la lÃ©gislation franÃ§aise (article L221-18 du Code de la consommation), vous disposez d'un dÃ©lai de 14 jours francs Ã  compter de la rÃ©ception de votre commande pour exercer votre droit de rÃ©tractation sans avoir Ã  justifier de motifs ni Ã  payer de pÃ©nalitÃ©s.
            </p>
            <p>
              Cependant, pour des raisons d'hygiÃ¨ne et de protection de la santÃ©, les produits ayant Ã©tÃ© descellÃ©s, ouverts ou entamÃ©s aprÃ¨s la livraison ne peuvent faire l'objet du droit de rÃ©tractation (article L221-28).
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-4">2. Conditions de retour</h2>
            <p className="mb-4">
              Pour qu'un retour soit acceptÃ© et le remboursement validÃ©, les conditions suivantes doivent Ãªtre respectÃ©es :
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Le produit doit Ãªtre renvoyÃ© dans son Ã©tat d'origine, non utilisÃ©, non ouvert et avec ses scellÃ©s intacts.</li>
              <li>En cas de produit reÃ§u endommagÃ© ou non conforme, le problÃ¨me doit nous Ãªtre signalÃ© dans un dÃ©lai de 72h maximum aprÃ¨s la rÃ©ception du colis.</li>
            </ul>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-4">3. ProcÃ©dure de retour</h2>
            <p className="mb-4">
              Afin de faciliter le traitement de votre demande, merci de suivre ces Ã©tapes :
            </p>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Contact initial :</strong> Envoyez un e-mail Ã  notre support client (contact@doiryshop.com) contenant votre numÃ©ro de commande, la raison du retour, et d'Ã©ventuelles photos si le produit a Ã©tÃ© endommagÃ© pendant le transport.</li>
              <li><strong>Validation :</strong> Notre Ã©quipe traitera votre demande et vous confirmera si le retour est acceptÃ© ainsi que l'adresse postale oÃ¹ renvoyer les articles.</li>
              <li><strong>Renvoi :</strong> Vous expÃ©diez les produits Ã  vos frais (sauf erreur manifeste de notre part ou casse avÃ©rÃ©e liÃ©e au transporteur).</li>
            </ol>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-4">4. ModalitÃ©s de remboursement</h2>
            <p className="mb-4">
              Une fois votre retour rÃ©ceptionnÃ© et inspectÃ© par nos soins, nous vous informerons de l'approbation ou du refus de votre remboursement :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>En cas d'approbation, le remboursement sera traitÃ© et appliquÃ© automatiquement sur votre mode de paiement initial (carte bancaire, etc.).</li>
              <li>Le traitement prend gÃ©nÃ©ralement entre 5 et 10 jours ouvrÃ©s selon les dÃ©lais bancaires.</li>
              <li>Sauf erreur de notre part lors de la prÃ©paration, les frais d'expÃ©dition initiaux ne sont pas remboursables.</li>
            </ul>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-4">5. Produits non remboursables</h2>
            <p>
              Comme Ã©voquÃ© dans les conditions de retour, pour garantir l'intÃ©gritÃ© de notre chaÃ®ne logistique et de nos engagements qualitÃ©, tout produit dont le sachet scellÃ© a Ã©tÃ© ouvert, dÃ©chirÃ©, ou dont le contenu a Ã©tÃ© partiellement consommÃ©, sera systÃ©matiquement refusÃ© pour un remboursement.
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-4">6. Contact</h2>
            <p>
              Pour toute question relative aux retours et remboursements, vous pouvez nous joindre Ã  tout moment Ã  l'adresse suivante :{' '}
              <a className="text-accent hover:underline" href="mailto:contact@doiryshop.com">
                contact@doiryshop.com
              </a>.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
};

export default PolitiqueRemboursement;
