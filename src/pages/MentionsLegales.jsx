import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Building2, FileText, Globe, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Section = ({ number, title, icon: Icon, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
  >
    <div className="flex items-center gap-3 mb-4">
      {Icon && <div className="p-2 bg-primary/10 rounded-lg"><Icon size={18} className="text-primary" /></div>}
      <h2 className="text-2xl font-serif text-text">{number}. {title}</h2>
    </div>
    <div className="pl-0 md:pl-12">{children}</div>
  </motion.section>
);

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-surface-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-text-light hover:text-primary transition-colors text-sm font-medium">
            <ArrowLeft size={18} /> Retour à l'accueil
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4 block">�ܥ Informations légales</span>
          <h1 className="text-4xl md:text-5xl font-serif text-text mb-3">Mentions Légales</h1>
          <p className="text-text-muted text-sm mb-12">Dernière mise à jour : Avril 2026</p>
        </motion.div>

        <div className="space-y-10 text-text-light font-light leading-relaxed">

          <Section number="1" title="�0diteur du site" icon={Building2}>
            <p>
              Le site <strong className="text-accent">DOIRY SHOP</strong> est édité par :<br />
              <strong className="text-text">DOIRY SHOP SAS</strong><br />
              Siège social : <span className="text-text-muted italic">[Adresse à compléter]</span><br />
              SIRET : <span className="text-text-muted italic">[Numéro à compléter]</span><br />
              RCS : <span className="text-text-muted italic">[Ville à compléter]</span><br />
              Capital social : <span className="text-text-muted italic">[Montant à compléter]</span><br />
              TVA intracommunautaire : <span className="text-text-muted italic">[Numéro à compléter]</span>
            </p>
          </Section>

          <Section number="2" title="Directeur de publication" icon={UserCheck}>
            <p>
              Directeur de la publication : <span className="text-text-muted italic">[Nom et prénom à compléter]</span><br />
              Qualité : Gérant de la société DOIRY SHOP SAS
            </p>
          </Section>

          <Section number="3" title="Contact" icon={Mail}>
            <p>
              Email : <a href="mailto:contact@doiryshop.com" className="text-accent hover:underline">contact@doiryshop.com</a><br />
              Téléphone : <span className="text-text-muted italic">[Numéro à compléter]</span>
            </p>
          </Section>

          <Section number="4" title="Hébergeur" icon={Globe}>
            <p>
              Le site est hébergé par :<br />
              <span className="text-text-muted italic">[Nom de l'hébergeur]</span><br />
              <span className="text-text-muted italic">[Adresse de l'hébergeur]</span><br />
              <span className="text-text-muted italic">[Téléphone de l'hébergeur]</span><br />
              <span className="text-text-muted italic">[Site web de l'hébergeur]</span>
            </p>
          </Section>

          <Section number="5" title="Propriété intellectuelle" icon={FileText}>
            <p>
              L'ensemble des contenus présents sur le site DOIRY SHOP (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) 
              sont protégés par les lois en vigueur en France relatives à la propriété intellectuelle et au droit d'auteur. 
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, 
              quel que soit le moyen ou le procédé utilisé, est interdite sauf autorisation écrite préalable de DOIRY SHOP SAS.
            </p>
            <p className="mt-3">
              Toute exploitation non autorisée du site ou de son contenu sera considérée comme constitutive d'une contrefaçon 
              et poursuivie conformément aux articles L.335-2 et suivants du Code de la Propriété Intellectuelle.
            </p>
          </Section>

          <Section number="6" title="Limitation de responsabilité">
            <p>
              DOIRY SHOP ne pourra être tenue responsable des dommages directs et indirects causés au matériel de l'utilisateur 
              lors de l'accès au site. DOIRY SHOP décline toute responsabilité quant à l'utilisation qui pourrait être faite 
              des informations et contenus présents sur le site.
            </p>
            <p className="mt-3">
              DOIRY SHOP s'efforce de fournir sur le site des informations aussi précises que possible. Toutefois, 
              elle ne pourra être tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, 
              qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
            </p>
          </Section>

          <Section number="7" title="Droit applicable">
            <p>
              Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut de résolution amiable, 
              les tribunaux français seront seuls compétents pour en connaître.
            </p>
          </Section>

          {/* Séparateur décoratif */}
          <div className="pt-8 border-t border-surface-border">
            <p className="text-xs text-text-muted text-center">
              Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'�0conomie Numérique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;
