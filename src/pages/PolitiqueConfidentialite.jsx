import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Lock, Clock, UserCheck, Cookie, Bell } from 'lucide-react';
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

const PolitiqueConfidentialite = () => {
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
          <span className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4 block">â˜¥ Protection des donnÃ©es</span>
          <h1 className="text-4xl md:text-5xl font-serif text-text mb-3">Politique de ConfidentialitÃ©</h1>
          <p className="text-text-muted text-sm mb-12">DerniÃ¨re mise Ã  jour : Avril 2026</p>
        </motion.div>

        <div className="space-y-10 text-text-light font-light leading-relaxed">
          <div className="p-4 rounded-xl bg-surface border border-surface-border text-sm mb-8">
            <p className="flex items-center gap-2 font-medium text-text mb-2"><Shield size={16} className="text-accent" /> Engagement RGPD</p>
            <p>DOIRY SHOP s'engage Ã  ce que la collecte et le traitement de vos donnÃ©es, effectuÃ©s Ã  partir de notre site, soient conformes au RÃ¨glement GÃ©nÃ©ral sur la Protection des DonnÃ©es (RGPD) et Ã  la loi Informatique et LibertÃ©s.</p>
          </div>

          <Section number="1" title="Responsable du traitement" icon={Shield}>
            <p>
              Le responsable du traitement des donnÃ©es personnelles est la sociÃ©tÃ© :<br />
              <strong className="text-text">DOIRY SHOP SAS</strong><br />
              DÃ©lÃ©guÃ© Ã  la Protection des DonnÃ©es (DPO) : <span className="text-text-muted italic">[Nom du DPO Ã  complÃ©ter]</span><br />
              Email de contact RGPD : <a href="mailto:rgpd@doiryshop.com" className="text-accent hover:underline">rgpd@doiryshop.com</a>
            </p>
          </Section>

          <Section number="2" title="DonnÃ©es collectÃ©es" icon={Database}>
            <p>
              Dans le cadre de l'utilisation de notre site, nous pouvons collecter les donnÃ©es suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li><strong className="text-text">DonnÃ©es d'identitÃ© :</strong> nom, prÃ©nom</li>
              <li><strong className="text-text">CoordonnÃ©es :</strong> adresse email, adresse de livraison, numÃ©ro de tÃ©lÃ©phone</li>
              <li><strong className="text-text">DonnÃ©es d'Ã¢ge :</strong> date de naissance (pour la vÃ©rification de majoritÃ©)</li>
              <li><strong className="text-text">DonnÃ©es de transaction :</strong> historique des commandes, dÃ©tails des achats</li>
              <li><strong className="text-text">DonnÃ©es techniques :</strong> adresse IP, logs de connexion (via Logto et cookies)</li>
            </ul>
          </Section>

          <Section number="3" title="FinalitÃ© du traitement" icon={Bell}>
            <p>Les donnÃ©es que nous collectons sont utilisÃ©es pour les finalitÃ©s suivantes :</p>
            <div className="mt-4 grid gap-3">
              <div className="p-3 rounded-xl bg-surface/50 border border-surface-border text-sm">
                <span className="font-medium text-text block mb-1">Livraison et Commande</span>
                Traitement de vos achats, expÃ©dition des colis via Mondial Relay, et facturation.
              </div>
              <div className="p-3 rounded-xl bg-surface/50 border border-surface-border text-sm">
                <span className="font-medium text-text block mb-1">Compte Client</span>
                CrÃ©ation et gestion de votre espace personnel, sÃ©curisation des accÃ¨s (via Logto).
              </div>
              <div className="p-3 rounded-xl bg-surface/50 border border-surface-border text-sm">
                <span className="font-medium text-text block mb-1">VÃ©rification de l'Ã¢ge</span>
                S'assurer que nos clients ont plus de 18 ans, conformÃ©ment Ã  nos obligations lÃ©gales.
              </div>
            </div>
          </Section>

          <Section number="4" title="DurÃ©e de conservation" icon={Clock}>
            <p>
              Vos donnÃ©es personnelles sont conservÃ©es pour le temps strictement nÃ©cessaire :
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li><strong className="text-text">DonnÃ©es de compte :</strong> jusqu'Ã  suppression du compte ou aprÃ¨s 3 ans d'inactivitÃ©.</li>
              <li><strong className="text-text">DonnÃ©es de facturation :</strong> conservÃ©es pendant 10 ans pour rÃ©pondre aux obligations comptables et fiscales.</li>
              <li><strong className="text-text">Cookies et traceurs :</strong> durÃ©e maximale de 13 mois.</li>
            </ul>
          </Section>

          <Section number="5" title="Droits des utilisateurs" icon={UserCheck}>
            <p>
              ConformÃ©ment Ã  la rÃ©glementation europÃ©enne (RGPD), vous disposez des droits suivants sur vos donnÃ©es :
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li><strong className="text-text">Droit d'accÃ¨s :</strong> savoir quelles donnÃ©es nous dÃ©tenons sur vous</li>
              <li><strong className="text-text">Droit de rectification :</strong> modifier des informations inexactes</li>
              <li><strong className="text-text">Droit Ã  l'effacement (droit Ã  l'oubli) :</strong> demander la suppression de vos donnÃ©es</li>
              <li><strong className="text-text">Droit Ã  la limitation :</strong> geler temporairement l'utilisation de vos donnÃ©es</li>
              <li><strong className="text-text">Droit Ã  la portabilitÃ© :</strong> rÃ©cupÃ©rer vos donnÃ©es dans un format lisible</li>
              <li><strong className="text-text">Droit d'opposition :</strong> refuser certains traitements (ex: marketing)</li>
            </ul>
            <p className="mt-4">
              Pour exercer vos droits, vous pouvez nous contacter par email Ã  <strong className="text-accent">rgpd@doiryshop.com</strong>. 
              Vous avez Ã©galement le droit d'introduire une rÃ©clamation auprÃ¨s de la CNIL (<a href="https://www.cnil.fr" className="text-primary hover:underline">www.cnil.fr</a>).
            </p>
          </Section>

          <Section number="6" title="Cookies utilisÃ©s" icon={Cookie}>
            <p>
              Un cookie est un petit fichier texte dÃ©posÃ© sur votre terminal lors de la visite de notre site. Nous utilisons :
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li><strong className="text-text">Cookies strictement nÃ©cessaires :</strong> indispensables au fonctionnement du site (session utilisateur via Logto, panier d'achat). Ils ne peuvent Ãªtre dÃ©sactivÃ©s.</li>
              <li><strong className="text-text">Cookies de fonctionnalitÃ© :</strong> permettent de mÃ©moriser vos choix (comme l'acceptation du bandeau cookie ou l'avertissement d'Ã¢ge).</li>
            </ul>
            <p className="mt-3 text-sm text-text-muted">
              Nous n'utilisons actuellement pas de cookies publicitaires tiers invasifs.
            </p>
          </Section>

          <Section number="7" title="SÃ©curitÃ© des donnÃ©es" icon={Lock}>
            <p>
              DOIRY SHOP met en Å“uvre toutes les mesures techniques et organisationnelles appropriÃ©es pour garantir 
              la sÃ©curitÃ© de vos donnÃ©es, avec l'utilisation du protocole HTTPS, le hachage des mots de passe (via Logto), 
              et des accÃ¨s restreints aux bases de donnÃ©es.
            </p>
          </Section>

          {/* SÃ©parateur dÃ©coratif */}
          <div className="pt-8 border-t border-surface-border">
            <p className="text-xs text-text-muted text-center">
              Cette politique de confidentialitÃ© a Ã©tÃ© conÃ§ue pour Ãªtre claire et transparente. 
              Si vous avez la moindre question, n'hÃ©sitez pas Ã  nous contacter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;
