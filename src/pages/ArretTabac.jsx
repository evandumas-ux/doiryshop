import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Heart, Leaf, Calculator, ArrowRight, Info, CheckCircle2, HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';
import { trackEvent } from '../utils/tracking';

// Section composant interactif
const SavingsCalculator = () => {
  const [packsPerDay, setPacksPerDay] = useState(1);
  const [pricePerPack, setPricePerPack] = useState(13);

  const dailySavings = (packsPerDay || 0) * (pricePerPack || 0);
  const weeklySavings = dailySavings * 7;
  const monthlySavings = dailySavings * 30;
  const yearlySavings = dailySavings * 365;

  useEffect(() => {
    const timer = setTimeout(() => {
      trackEvent('arret_tabac_calculator_change', {
        packs_per_day: packsPerDay,
        pack_price: pricePerPack,
        monthly_savings: monthlySavings,
        annual_savings: yearlySavings
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [packsPerDay, pricePerPack, monthlySavings, yearlySavings]);

  const formatPrice = (val) => val.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="bg-surface border border-surface-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Calculator size={24} />
        </div>
        <h3 className="text-2xl font-serif text-text">Calculez vos économies</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <label className="block text-sm text-text-light font-medium mb-1">Paquets fumés par jour</label>
          <div className="flex items-center bg-background border border-surface-border rounded-xl px-4 py-3">
            <input 
              type="number" 
              min="0.5" step="0.5"
              value={packsPerDay} 
              onChange={(e) => setPacksPerDay(Number(e.target.value) || 0)}
              className="bg-transparent w-full outline-none text-text text-lg font-serif"
            />
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-text-light font-medium mb-1">Prix moyen du paquet (€)</label>
          <div className="flex items-center bg-background border border-surface-border rounded-xl px-4 py-3">
            <input 
              type="number" 
              min="1" step="0.1"
              value={pricePerPack} 
              onChange={(e) => setPricePerPack(Number(e.target.value) || 0)}
              className="bg-transparent w-full outline-none text-text text-lg font-serif"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background rounded-2xl p-5 border border-surface-border text-center">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Par semaine</p>
          <p className="text-2xl md:text-3xl font-serif text-text">{formatPrice(weeklySavings)}</p>
        </div>
        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 text-center relative overflow-hidden shadow-[0_0_20px_rgba(139,26,26,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2 relative z-10">Par mois</p>
          <p className="text-2xl md:text-3xl font-serif text-primary relative z-10 font-bold">{formatPrice(monthlySavings)}</p>
        </div>
        <div className="bg-background rounded-2xl p-5 border border-surface-border text-center">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Par an</p>
          <p className="text-2xl md:text-3xl font-serif text-text">{formatPrice(yearlySavings)}</p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <a 
          href="#doiryshop-alternative" 
          onClick={() => trackEvent('arret_tabac_cta_click', { cta_name: 'Découvrir nos alternatives (calculator)', section: 'calculator' })}
          className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-primary/30 text-primary rounded-xl font-medium hover:bg-primary/5 transition-colors"
        >
          Découvrir nos alternatives sans nicotine <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
};

const TimelineItem = ({ time, title, description, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="relative pl-10 lg:pl-0 h-full"
  >
    <div className="lg:hidden absolute left-0 top-2 w-3 h-3 rounded-full bg-primary border-4 border-background z-10" />
    <div className="lg:hidden absolute left-1.5 top-5 bottom-[-40px] w-0.5 bg-surface-border" />
    
    <div className="bg-surface border border-surface-border rounded-2xl p-5 hover:border-primary/30 transition-colors h-full flex flex-col break-words overflow-hidden">
      <span className="inline-block w-fit px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] sm:text-xs font-bold tracking-widest uppercase mb-3">
        {time}
      </span>
      <h4 className="text-[17px] font-serif text-text mb-2 leading-snug">{title}</h4>
      <p className="text-[13px] sm:text-sm text-text-light leading-relaxed flex-grow">{description}</p>
    </div>
  </motion.div>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    const newOpenState = !isOpen;
    setIsOpen(newOpenState);
    if (newOpenState) {
      trackEvent('arret_tabac_faq_open', { question });
    }
  };

  return (
    <div className="border-b border-surface-border py-4">
      <button onClick={handleToggle} aria-expanded={isOpen} aria-controls={`faq-answer-${question}`} className="w-full flex justify-between items-center text-left gap-4 hover:text-accent transition-colors">
        <span className="font-serif text-lg text-text">{question}</span>
        <ChevronRight className={`transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-90 text-accent' : 'text-text-muted'}`} size={20} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <p className="text-text-light font-light leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const ArretTabac = ({ user, setCartItems, cartItems, onLogout }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cartItemsCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <>
      <SEO 
        title="Arrêter de fumer : Les vrais bénéfices et économies | DoiryShop"
        description="Découvrez les bénéfices concrets de l'arrêt du tabac : santé, souffle, et calculez vos économies. DoiryShop vous accompagne avec des alternatives sans nicotine."
        url="https://doiryshop.fr/arret-tabac"
      />

      <Header 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => navigate('/login')}
        onLogout={onLogout}
        cartItemsCount={cartItemsCount}
        user={user}
        simplified={true}
      />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        products={[]} 
        onAddProduct={() => {}} 
        onRemove={(id) => setCartItems(prev => prev.filter(item => item.id !== id))}
        onUpdateQuantity={(id, change) => {
          setCartItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            const nextQ = item.quantity + change;
            return nextQ > 0 ? { ...item, quantity: nextQ } : null;
          }).filter(Boolean));
        }}
        onCheckout={() => navigate('/checkout')}
      />

      <main className="min-h-screen bg-background pt-24 pb-20">
        
        {/* HERO SECTION */}
        <section className="relative px-6 pt-12 pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/bg_texture.png')] bg-cover bg-center opacity-[0.03] pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-8">
                <Heart size={14} /> La décision qui change tout
              </span>
              <h1 className="text-4xl md:text-6xl font-serif text-text mb-6 leading-tight">
                Ce que vous gagnez en arrêtant de fumer
              </h1>
              <p className="text-lg md:text-xl text-text-light font-light max-w-2xl mx-auto mb-10 leading-relaxed">
                Retrouvez du souffle, une respiration plus aisée, et réalisez des économies immédiates tout en abaissant vos risques à long terme. Le changement commence ici.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href="#benefices" 
                  onClick={() => trackEvent('arret_tabac_cta_click', { cta_name: 'Voir les bénéfices', section: 'hero' })}
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-medium hover:bg-[#6e1515] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  Voir les bénéfices <ArrowRight size={18} />
                </a>
                <a 
                  href="#calculateur" 
                  onClick={() => trackEvent('arret_tabac_cta_click', { cta_name: 'Calculer mes économies', section: 'hero' })}
                  className="w-full sm:w-auto px-8 py-4 bg-surface border border-surface-border text-text rounded-xl font-medium hover:border-accent/40 transition-colors flex items-center justify-center gap-2"
                >
                  <Calculator size={18} /> Calculer mes économies
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION TIMELINE SANTE */}
        <section id="benefices" className="py-20 bg-background-light border-y border-surface-border">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-text mb-4">Un corps qui récupère, étape par étape</h2>
              <p className="text-text-light max-w-2xl mx-auto">
                Dès les premiers jours, votre organisme entame son processus de nettoyage. Les bénéfices documentés s'accumulent au fil du temps.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <TimelineItem 
                index={0}
                time="72 Heures"
                title="Respiration facilitée"
                description="La respiration devient plus facile. Les bronches commencent à se relâcher et l'énergie augmente."
              />
              <TimelineItem 
                index={1}
                time="2 à 12 Semaines"
                title="Circulation améliorée"
                description="La circulation sanguine s'améliore, rendant la marche et l'effort physique plus aisés."
              />
              <TimelineItem 
                index={2}
                time="3 à 9 Mois"
                title="Moins de toux"
                description="Diminution de la toux et de l'essoufflement. La fonction pulmonaire peut augmenter jusqu'à 10 %."
              />
              <TimelineItem 
                index={3}
                time="1 An"
                title="Risque cardiaque réduit"
                description="Le risque de crise cardiaque est environ 50 % plus faible que chez un fumeur."
              />
              <TimelineItem 
                index={4}
                time="10 Ans"
                title="Protection à long terme"
                description="Le risque de cancer du poumon est environ 50 % plus faible que chez une personne qui continue de fumer."
              />
            </div>
            
            <p className="text-center text-xs text-text-muted mt-10 italic">
              * Données basées sur les observations générales de l'arrêt du tabac (OMS, Ministère de la Santé).
            </p>
          </div>
        </section>

        {/* SECTION ECONOMIES */}
        <section id="calculateur" className="py-24">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif text-text mb-4">Le coût d'une habitude</h2>
              <p className="text-text-light">
                Au-delà de la santé, l'arrêt du tabac représente un gain financier majeur.
              </p>
            </div>
            
            <SavingsCalculator />
          </div>
        </section>

        {/* SECTION POURQUOI CETTE PAGE */}
        <section className="py-16 bg-background">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <HelpCircle className="w-10 h-10 text-primary/40 mx-auto mb-6" />
            <h3 className="text-2xl font-serif text-text mb-4">Pourquoi parler de l'arrêt du tabac ici ?</h3>
            <p className="text-text-light leading-relaxed">
              Chez DoiryShop, nous refusons les fausses promesses. L'arrêt du tabac est un parcours personnel complexe. 
              Cependant, nous savons que l'une des plus grandes difficultés réside dans la perte du "rituel" quotidien ou du simple geste. 
              C'est pour cela que nous proposons une alternative douce et transparente, pour accompagner la transition gestuelle, sans la moindre trace de nicotine. 
              La décision d'arrêter vous appartient. Si le geste vous manque, nous avons une solution.
            </p>
          </div>
        </section>

        {/* SECTION DOIRYSHOP */}
        <section id="doiryshop-alternative" className="py-24 bg-surface border-y border-surface-border relative overflow-hidden">
          <div className="absolute inset-0 bg-hieroglyphs-overlay opacity-[0.02]" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <Leaf className="w-12 h-12 text-accent mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-serif text-text mb-6">Conserver le geste, retirer la nicotine.</h2>
            <p className="text-lg text-text-light font-light leading-relaxed mb-10 max-w-2xl mx-auto">
              L'une des plus grandes difficultés lors de l'arrêt du tabac est la perte du rituel. DoiryShop s'inscrit comme une alternative végétale, pensée pour vous accompagner dans votre transition sans introduire de nouvelle dépendance à la nicotine.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <div className="bg-background p-6 rounded-2xl border border-surface-border">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-4" />
                <h4 className="text-lg font-serif text-text mb-2">100% Sans nicotine</h4>
                <p className="text-sm text-text-light">Pas d'entretien de l'addiction chimique.</p>
              </div>
              <div className="bg-background p-6 rounded-2xl border border-surface-border">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-4" />
                <h4 className="text-lg font-serif text-text mb-2">Rituel préservé</h4>
                <p className="text-sm text-text-light">Garder le geste pour faciliter la transition.</p>
              </div>
              <div className="bg-background p-6 rounded-2xl border border-surface-border">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-4" />
                <h4 className="text-lg font-serif text-text mb-2">Plantes naturelles</h4>
                <p className="text-sm text-text-light">Une composition lisible et transparente.</p>
              </div>
            </div>

            <Link 
              to="/boutique" 
              onClick={() => trackEvent('arret_tabac_shop_click', { section: 'doiryshop' })}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-medium hover:bg-[#6e1515] transition-all shadow-lg shadow-primary/20"
            >
              Découvrir nos alternatives <ArrowRight size={18} />
            </Link>

            <div className="mt-16 p-6 bg-red-950/10 border border-red-900/20 rounded-2xl text-left flex gap-4 items-start">
              <Info className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h5 className="text-primary font-medium mb-1">Avertissement important</h5>
                <p className="text-sm text-text-muted leading-relaxed">
                  Les produits proposés par DoiryShop ne sont pas des traitements médicaux ni des médicaments de sevrage. Ils constituent une alternative récréative ou rituelle sans nicotine. En cas de dépendance forte au tabac, l'accompagnement par un professionnel de santé (médecin, tabacologue) ou l'utilisation de substituts nicotiniques pharmaceutiques reste la démarche la plus recommandée.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION FAQ */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-serif text-text mb-10 text-center">Questions fréquentes</h2>
            <div className="space-y-2">
              <FAQItem 
                question="En combien de temps le souffle revient-il ?"
                answer="Généralement, on observe une nette amélioration de la respiration entre 72 heures et quelques semaines après l'arrêt. Les bronches se relâchent et la capacité pulmonaire globale peut augmenter progressivement de 10% sur les premiers mois."
              />
              <FAQItem 
                question="Combien peut-on économiser en arrêtant ?"
                answer="Tout dépend de votre consommation quotidienne. À raison d'un paquet à 13€ par jour, l'économie s'élève à près de 400€ par mois, et plus de 4700€ par an. N'hésitez pas à utiliser notre calculateur plus haut pour obtenir votre propre estimation."
              />
              <FAQItem 
                question="DoiryShop remplace-t-il un traitement médical ?"
                answer="Absolument pas. DoiryShop propose des plantes séchées et infusions sans nicotine pour accompagner votre rituel. Ce n'est pas un substitut nicotinique vendu en pharmacie ni un traitement médical."
              />
              <FAQItem 
                question="S'agit-il d'une démarche de sevrage ?"
                answer="L'utilisation de nos produits peut s'inscrire dans une démarche personnelle de changement d'habitude en palliant le « manque du geste », mais elle ne traite pas la dépendance physique à la nicotine. Pour un sevrage complet, l'avis d'un médecin est conseillé."
              />
            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default ArretTabac;
