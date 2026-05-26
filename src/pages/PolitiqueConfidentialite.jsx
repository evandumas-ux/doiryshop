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
            <ArrowLeft size={18} /> Retour à l'accueil
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4 block">⚖️ Protection des données</span>
          <h1 className="text-4xl md:text-5xl font-serif text-text mb-3">Politique de Confidentialité</h1>
          <p className="text-text-muted text-sm mb-12">Dernière mise à jour : Avril 2026</p>
        </motion.div>

        <div className="space-y-10 text-text-light font-light leading-relaxed">
          <div className="p-4 rounded-xl bg-surface border border-surface-border text-sm mb-8">
            <p className="flex items-center gap-2 font-medium text-text mb-2"><Shield size={16} className="text-accent" /> Engagement RGPD</p>
            <p>DOIRY SHOP s'engage à ce que la collecte et le traitement de vos données, effectués à partir de notre site, soient conformes au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.</p>
          </div>

          <Section number="1" title="Responsable du traitement" icon={Shield}>
            <p>
              Le responsable du traitement des données personnelles est la société :<br />
              <strong className="text-text">DOIRY SHOP SAS</strong><br />
              Délégué à la Protection des Données (DPO) : <span className="text-text-muted italic">[Nom du DPO à compléter]</span><br />
              Email de contact RGPD : <a href="mailto:rgpd@doiryshop.com" className="text-accent hover:underline">rgpd@doiryshop.com</a>
            </p>
          </Section>

          <Section number="2" title="Données collectées" icon={Database}>
            <p>
              Dans le cadre de l'utilisation de notre site, nous pouvons collecter les données suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li><strong className="text-text">Données d'identité :</strong> nom, prénom</li>
              <li><strong className="text-text">Coordonnées :</strong> adresse email, adresse de livraison, numéro de téléphone</li>
              <li><strong className="text-text">Données d'âge :</strong> date de naissance (pour la vérification de majorité)</li>
              <li><strong className="text-text">Données de transaction :</strong> historique des commandes, détails des achats</li>
              <li><strong className="text-text">Données techniques :</strong> adresse IP, logs de connexion (via Logto et cookies)</li>
            </ul>
          </Section>

          <Section number="3" title="Finalité du traitement" icon={Bell}>
            <p>Les données que nous collectons sont utilisées pour les finalités suivantes :</p>
            <div className="mt-4 grid gap-3">
              <div className="p-3 rounded-xl bg-surface/50 border border-surface-border text-sm">
                <span className="font-medium text-text block mb-1">Livraison et Commande</span>
                Traitement de vos achats, expédition des colis via Mondial Relay, et facturation.
              </div>
              <div className="p-3 rounded-xl bg-surface/50 border border-surface-border text-sm">
                <span className="font-medium text-text block mb-1">Compte Client</span>
                Création et gestion de votre espace personnel, sécurisation des accès (via Logto).
              </div>
              <div className="p-3 rounded-xl bg-surface/50 border border-surface-border text-sm">
                <span className="font-medium text-text block mb-1">Vérification de l'âge</span>
                S'assurer que nos clients ont plus de 18 ans, conformément à nos obligations légales.
              </div>
            </div>
          </Section>

          <Section number="4" title="Durée de conservation" icon={Clock}>
            <p>
              Vos données personnelles sont conservées pour le temps strictement nécessaire :
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li><strong className="text-text">Données de compte :</strong> jusqu'à suppression du compte ou après 3 ans d'inactivité.</li>
              <li><strong className="text-text">Données de facturation :</strong> conservées pendant 10 ans pour répondre aux obligations comptables et fiscales.</li>
              <li><strong className="text-text">Cookies et traceurs :</strong> durée maximale de 13 mois.</li>
            </ul>
          </Section>

          <Section number="5" title="Droits des utilisateurs" icon={UserCheck}>
            <p>
              Conformément à la réglementation européenne (RGPD), vous disposez des droits suivants sur vos données :
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li><strong className="text-text">Droit d'accès :</strong> savoir quelles données nous détenons sur vous</li>
              <li><strong className="text-text">Droit de rectification :</strong> modifier des informations inexactes</li>
              <li><strong className="text-text">Droit à l'effacement (droit à l'oubli) :</strong> demander la suppression de vos données</li>
              <li><strong className="text-text">Droit à la limitation :</strong> geler temporairement l'utilisation de vos données</li>
              <li><strong className="text-text">Droit à la portabilité :</strong> récupérer vos données dans un format lisible</li>
              <li><strong className="text-text">Droit d'opposition :</strong> refuser certains traitements (ex: marketing)</li>
            </ul>
            <p className="mt-4">
              Pour exercer vos droits, vous pouvez nous contacter par email à <strong className="text-accent">rgpd@doiryshop.com</strong>. 
              Vous avez également le droit d'introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" className="text-primary hover:underline">www.cnil.fr</a>).
            </p>
          </Section>

          <Section number="6" title="Cookies utilisés" icon={Cookie}>
            <p>
              Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite de notre site. Nous utilisons :
            </p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li><strong className="text-text">Cookies strictement nécessaires :</strong> indispensables au fonctionnement du site (session utilisateur via Logto, panier d'achat). Ils ne peuvent être désactivés.</li>
              <li><strong className="text-text">Cookies de fonctionnalité :</strong> permettent de mémoriser vos choix (comme l'acceptation du bandeau cookie ou l'avertissement d'âge).</li>
            </ul>
            <p className="mt-3 text-sm text-text-muted">
              Nous n'utilisons actuellement pas de cookies publicitaires tiers invasifs.
            </p>
          </Section>

          <Section number="7" title="Sécurité des données" icon={Lock}>
            <p>
              DOIRY SHOP met en €uvre toutes les mesures techniques et organisationnelles appropriées pour garantir 
              la sécurité de vos données, avec l'utilisation du protocole HTTPS, le hachage des mots de passe (via Logto), 
              et des accès restreints aux bases de données.
            </p>
          </Section>

          {/* Séparateur décoratif */}
          <div className="pt-8 border-t border-surface-border">
            <p className="text-xs text-text-muted text-center">
              Cette politique de confidentialité a été conçue pour être claire et transparente. 
              Si vous avez la moindre question, n'hésitez pas à nous contacter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;
