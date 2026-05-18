import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../../components/SEO';

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-background text-text">
      <SEO
        title="Mentions Légales"
        description="Mentions légales de Doiry Shop."
        url="https://doiryshop.fr/mentions-legales"
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
          Informations légales
        </p>
        <h1 className="text-4xl md:text-5xl font-serif mb-6">Mentions Légales</h1>
        <p className="text-text-muted text-sm mb-10">Dernière mise à jour : Avril 2026</p>

        <div className="space-y-8 text-text-light leading-relaxed">
          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">Éditeur du site</h2>
            <p>Nom de l'entreprise ou du responsable : DUMAS Evan</p>
            <p>
              Email de contact :{' '}
              <a className="text-accent hover:underline" href="mailto:contact@doiryshop.fr">
                contact@doiryshop.fr
              </a>
            </p>
          </section>

          <section className="bg-surface/60 border border-surface-border rounded-2xl p-6">
            <h2 className="text-2xl font-serif mb-3">Informations complémentaires</h2>
            <p>Directeur de publication : DUMAS Evan</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MentionsLegales;
