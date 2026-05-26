import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../../components/SEO';

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      <SEO
        title="Mentions LÃ©gales"
        description="Mentions lÃ©gales de Doiry Shop."
        url="https://doiryshop.com/mentions-legales"
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
          Informations lÃ©gales
        </p>
        <h1 className="text-4xl md:text-5xl font-serif mb-6">Mentions LÃ©gales</h1>
        <p className="text-text-muted text-sm mb-10">DerniÃ¨re mise Ã  jour : Avril 2026</p>

        <div className="space-y-8 text-text-light leading-relaxed">
          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">Ã‰diteur du site</h2>
            <p>Nom de l'entreprise ou du responsable : DUMAS Evan</p>
            <p>
              Email de contact :{' '}
              <a className="text-accent hover:underline" href="mailto:contact@doiryshop.com">
                contact@doiryshop.com
              </a>
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">Informations complÃ©mentaires</h2>
            <p>Directeur de publication : DUMAS Evan</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MentionsLegales;
