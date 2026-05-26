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
            <ArrowLeft size={18} /> Retour Ã  l'accueil
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4 block">â˜¥ Informations lÃ©gales</span>
          <h1 className="text-4xl md:text-5xl font-serif text-text mb-3">Mentions LÃ©gales</h1>
          <p className="text-text-muted text-sm mb-12">DerniÃ¨re mise Ã  jour : Avril 2026</p>
        </motion.div>

        <div className="space-y-10 text-text-light font-light leading-relaxed">

          <Section number="1" title="Ã‰diteur du site" icon={Building2}>
            <p>
              Le site <strong className="text-accent">DOIRY SHOP</strong> est Ã©ditÃ© par :<br />
              <strong className="text-text">DOIRY SHOP SAS</strong><br />
              SiÃ¨ge social : <span className="text-text-muted italic">[Adresse Ã  complÃ©ter]</span><br />
              SIRET : <span className="text-text-muted italic">[NumÃ©ro Ã  complÃ©ter]</span><br />
              RCS : <span className="text-text-muted italic">[Ville Ã  complÃ©ter]</span><br />
              Capital social : <span className="text-text-muted italic">[Montant Ã  complÃ©ter]</span><br />
              TVA intracommunautaire : <span className="text-text-muted italic">[NumÃ©ro Ã  complÃ©ter]</span>
            </p>
          </Section>

          <Section number="2" title="Directeur de publication" icon={UserCheck}>
            <p>
              Directeur de la publication : <span className="text-text-muted italic">[Nom et prÃ©nom Ã  complÃ©ter]</span><br />
              QualitÃ© : GÃ©rant de la sociÃ©tÃ© DOIRY SHOP SAS
            </p>
          </Section>

          <Section number="3" title="Contact" icon={Mail}>
            <p>
              Email : <a href="mailto:contact@doiryshop.com" className="text-accent hover:underline">contact@doiryshop.com</a><br />
              TÃ©lÃ©phone : <span className="text-text-muted italic">[NumÃ©ro Ã  complÃ©ter]</span>
            </p>
          </Section>

          <Section number="4" title="HÃ©bergeur" icon={Globe}>
            <p>
              Le site est hÃ©bergÃ© par :<br />
              <span className="text-text-muted italic">[Nom de l'hÃ©bergeur]</span><br />
              <span className="text-text-muted italic">[Adresse de l'hÃ©bergeur]</span><br />
              <span className="text-text-muted italic">[TÃ©lÃ©phone de l'hÃ©bergeur]</span><br />
              <span className="text-text-muted italic">[Site web de l'hÃ©bergeur]</span>
            </p>
          </Section>

          <Section number="5" title="PropriÃ©tÃ© intellectuelle" icon={FileText}>
            <p>
              L'ensemble des contenus prÃ©sents sur le site DOIRY SHOP (textes, images, graphismes, logo, icÃ´nes, sons, logiciels, etc.) 
              sont protÃ©gÃ©s par les lois en vigueur en France relatives Ã  la propriÃ©tÃ© intellectuelle et au droit d'auteur. 
              Toute reproduction, reprÃ©sentation, modification, publication, adaptation de tout ou partie des Ã©lÃ©ments du site, 
              quel que soit le moyen ou le procÃ©dÃ© utilisÃ©, est interdite sauf autorisation Ã©crite prÃ©alable de DOIRY SHOP SAS.
            </p>
            <p className="mt-3">
              Toute exploitation non autorisÃ©e du site ou de son contenu sera considÃ©rÃ©e comme constitutive d'une contrefaÃ§on 
              et poursuivie conformÃ©ment aux articles L.335-2 et suivants du Code de la PropriÃ©tÃ© Intellectuelle.
            </p>
          </Section>

          <Section number="6" title="Limitation de responsabilitÃ©">
            <p>
              DOIRY SHOP ne pourra Ãªtre tenue responsable des dommages directs et indirects causÃ©s au matÃ©riel de l'utilisateur 
              lors de l'accÃ¨s au site. DOIRY SHOP dÃ©cline toute responsabilitÃ© quant Ã  l'utilisation qui pourrait Ãªtre faite 
              des informations et contenus prÃ©sents sur le site.
            </p>
            <p className="mt-3">
              DOIRY SHOP s'efforce de fournir sur le site des informations aussi prÃ©cises que possible. Toutefois, 
              elle ne pourra Ãªtre tenue responsable des omissions, des inexactitudes et des carences dans la mise Ã  jour, 
              qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
            </p>
          </Section>

          <Section number="7" title="Droit applicable">
            <p>
              Les prÃ©sentes mentions lÃ©gales sont rÃ©gies par le droit franÃ§ais. En cas de litige et Ã  dÃ©faut de rÃ©solution amiable, 
              les tribunaux franÃ§ais seront seuls compÃ©tents pour en connaÃ®tre.
            </p>
          </Section>

          {/* SÃ©parateur dÃ©coratif */}
          <div className="pt-8 border-t border-surface-border">
            <p className="text-xs text-text-muted text-center">
              ConformÃ©ment aux dispositions de la loi nÂ° 2004-575 du 21 juin 2004 pour la Confiance dans l'Ã‰conomie NumÃ©rique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;
