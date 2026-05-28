import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const items = [
    {
      q: 'Que contient la gamme Le Rituel ?',
      a: "Des feuilles de framboisier en vrac, des pré-roulés et des kits de roulage, pensés pour celles et ceux qui veulent garder le geste avec une base végétale sans nicotine.",
    },
    {
      q: 'Ces produits contiennent-ils du tabac ou de la nicotine ?',
      a: 'Non. Tous nos produits sont composés exclusivement de plantes séchées sans tabac ni nicotine. Ils ne sont pas des produits du tabac au sens de la réglementation française.',
    },
    {
      q: "Quels sont vos délais de livraison ?",
      a: 'Toutes les commandes sont expédiées sous 24h à 48h ouvrées. La livraison prend ensuite généralement 2 à 3 jours ouvrés via Colissimo Domicile ou lettre suivie.',
    },
    {
      q: "La livraison est-elle vraiment offerte ?",
      a: 'Oui, la livraison à domicile est offerte dès 45 € d’achat pour la France métropolitaine. L’option s’applique automatiquement à votre panier.',
    },
    {
      q: "Le colis est-il discret ?",
      a: 'Absolument. Nous expédions dans des emballages neutres (enveloppes kraft ou boites carton recyclé) sans aucune mention explicite de Doiry Shop sur l’étiquette de transport pour garantir votre totale discrétion.',
    },
    {
      q: "Les produits sont-ils réservés aux adultes ?",
      a: 'Oui. La vente est strictement réservée aux personnes majeures (+18 ans). Un contrôle d’âge est effectué à l’entrée du site.',
    },
    {
      q: "Comment choisir entre Le Rituel et L'Apaisement ?",
      a: "Le Rituel accompagne le geste et la transition. L'Apaisement s'adresse plutot aux routines du soir, aux pauses chaudes et aux coffrets bien-etre.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="pt-24 pb-12 bg-background relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-serif mb-4 text-text">Questions Fréquentes</h2>
          <p className="text-text-light font-light text-lg">Des réponses simples pour comprendre la collection sans tourner autour du pot.</p>
        </motion.div>
        <div className="space-y-4">
          {items.map((faq, index) => (
            <motion.div key={faq.q} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="border border-surface-border rounded-2xl overflow-hidden bg-surface/50 hover:border-accent/20 transition-colors">
              <button onClick={() => setOpenIndex(index === openIndex ? -1 : index)} className="w-full px-6 py-5 flex justify-between items-center text-left">
                <span className="font-medium text-lg pr-4 text-text">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-accent transition-transform duration-300 ${index === openIndex ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {index === openIndex && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-6 pb-5 pt-2 text-text-light font-light leading-relaxed border-t border-surface-border">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
