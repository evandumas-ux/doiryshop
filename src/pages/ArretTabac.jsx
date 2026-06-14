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
  const [inputs, setInputs] = useState({
    packs: "1",
    cigarettes: "20"
  });
  const [pricePerPack, setPricePerPack] = useState("13");

  const handlePacksChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setInputs({ packs: "", cigarettes: "" });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setInputs({
        packs: val,
        cigarettes: String(+(num * 20).toFixed(2))
      });
    } else {
      setInputs(prev => ({ ...prev, packs: val }));
    }
  };

  const handleCigarettesChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setInputs({ packs: "", cigarettes: "" });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setInputs({
        cigarettes: val,
        packs: String(+(num / 20).toFixed(3))
      });
    } else {
      setInputs(prev => ({ ...prev, cigarettes: val }));
    }
  };

  const packsPerDayNum = parseFloat(inputs.packs) || 0;
  const priceNum = parseFloat(pricePerPack) || 0;

  const dailySavings = packsPerDayNum * priceNum;
  const weeklySavings = dailySavings * 7;
  const monthlySavings = dailySavings * 30;
  const yearlySavings = dailySavings * 365;

  useEffect(() => {
    const timer = setTimeout(() => {
      trackEvent('arret_tabac_calculator_change', {
        packs_per_day: packsPerDayNum,
        cigarettes_per_day: parseFloat(inputs.cigarettes) || 0,
        pack_price: priceNum,
        monthly_savings: monthlySavings,
        annual_savings: yearlySavings
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [inputs.packs, inputs.cigarettes, pricePerPack, monthlySavings, yearlySavings]);

  const formatPrice = (val) => val.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="bg-background-light/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      <div className="flex items-center gap-6 mb-12">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-accent">
          <Calculator size={28} />
        </div>
        <h3 className="text-3xl font-serif text-text tracking-tight">Estimez votre liberté financière</h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mb-4">
        <div className="space-y-4">
          <label className="block text-xs text-neutral-200 font-serif tracking-premium uppercase ml-2">Cigarettes / jour</label>
          <div className="flex items-center bg-background/50 border border-white/5 rounded-2xl px-6 py-4 focus-within:border-accent/30 transition-all">
            <input 
              type="number" 
              min="0" step="1"
              value={inputs.cigarettes} 
              onChange={handleCigarettesChange}
              className="bg-transparent w-full outline-none text-text text-xl font-serif"
            />
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-xs text-neutral-200 font-serif tracking-premium uppercase ml-2">Paquets / jour</label>
          <div className="flex items-center bg-background/50 border border-white/5 rounded-2xl px-6 py-4 focus-within:border-accent/30 transition-all">
            <input 
              type="number" 
              min="0" step="0.1"
              value={inputs.packs} 
              onChange={handlePacksChange}
              className="bg-transparent w-full outline-none text-text text-xl font-serif"
            />
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-xs text-neutral-200 font-serif tracking-premium uppercase ml-2">Prix du paquet (€)</label>
          <div className="flex items-center bg-background/50 border border-white/5 rounded-2xl px-6 py-4 focus-within:border-accent/30 transition-all">
            <input 
              type="number" 
              min="1" step="0.1"
              value={pricePerPack} 
              onChange={(e) => setPricePerPack(e.target.value)}
              className="bg-transparent w-full outline-none text-text text-xl font-serif"
            />
          </div>
        </div>
      </div>
      <p className="text-[11px] text-neutral-200 mb-12 italic tracking-wide">Base de calcul : 1 paquet = 20 cigarettes</p>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-background/40 rounded-3xl p-8 border border-white/5 text-center transition-all hover:bg-background/60">
          <p className="text-[10px] text-neutral-200 font-serif tracking-premium uppercase mb-4">Par semaine</p>
          <p className="text-3xl font-serif text-text">{formatPrice(weeklySavings)}</p>
        </div>
        <div className="bg-accent/5 rounded-3xl p-8 border border-accent/20 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <p className="text-[10px] text-accent font-serif tracking-premium uppercase mb-4 relative z-10">Par mois</p>
          <p className="text-4xl font-serif text-accent relative z-10 font-bold tracking-tight">{formatPrice(monthlySavings)}</p>
        </div>
        <div className="bg-background/40 rounded-3xl p-8 border border-white/5 text-center transition-all hover:bg-background/60">
          <p className="text-[10px] text-neutral-200 font-serif tracking-premium uppercase mb-4">Par an</p>
          <p className="text-3xl font-serif text-text">{formatPrice(yearlySavings)}</p>
        </div>
      </div>

      <div className="mt-16 text-center">
        <a 
          href="#doiryshop-alternative" 
          onClick={() => trackEvent('arret_tabac_cta_click', { cta_name: 'Découvrir nos alternatives (calculator)', section: 'calculator' })}
          className="inline-flex items-center gap-4 px-10 py-5 bg-text text-background rounded-full font-serif text-xs tracking-premium hover:bg-accent hover:scale-[1.02] transition-all shadow-2xl shadow-accent/10"
        >
          Découvrir nos alternatives sans nicotine <ArrowRight size={18} />
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
        <ChevronRight className={`transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-90 text-accent' : 'text-neutral-200'}`} size={20} />
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

  const cartItemsCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <>
      <SEO 
        title="Arrêter de fumer : Les vrais bénéfices et économies | DoiryShop"
        description="Découvrez les bénéfices concrets de l'arrêt du tabac : santé, souffle, et calculez vos économies. DoiryShop vous accompagne avec des alternatives sans nicotine."
        url="https://doiryshop.com/arret-tabac"
      />

      <Header 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => navigate('/login')}
        onLogout={onLogout}
        cartItemsCount={cartItemsCount}
        user={user}
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

      <main className="min-h-screen bg-[#050505] pt-24 pb-20 overflow-hidden">
        
        {/* HERO SECTION */}
        <section className="relative px-6 pt-24 pb-32">
          {/* Background Flare */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#3A080E]/10 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-rose-500 mb-12 block">
                La décision qui change tout
              </span>
              
              <h1 className="text-5xl md:text-7xl font-serif text-white mb-12 leading-tight">
                Ce que vous gagnez <br/>
                <span className="text-neutral-300 italic">en arrêtant de fumer.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-neutral-200 font-light max-w-2xl mx-auto mb-16 leading-relaxed">
                Retrouvez du souffle, une respiration plus aisée, et réalisez des économies immédiates tout en abaissant vos risques à long terme. Le changement commence ici.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a 
                  href="#benefices" 
                  onClick={() => trackEvent('arret_tabac_cta_click', { cta_name: 'Voir les bénéfices', section: 'hero' })}
                  className="group w-full sm:w-auto px-10 py-5 border border-[#8b0000] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-500 hover:bg-[#8b0000] hover:shadow-2xl hover:shadow-[#8b0000]/20 flex items-center justify-center gap-4"
                >
                  Voir les bénéfices <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </a>
                <a 
                  href="#calculateur" 
                  onClick={() => trackEvent('arret_tabac_cta_click', { cta_name: 'Calculer mes économies', section: 'hero' })}
                  className="w-full sm:w-auto px-10 py-5 border border-white/10 bg-white/5 text-white rounded-full text-[11px] font-bold uppercase tracking-[0.3em] backdrop-blur-xl transition-all duration-500 hover:bg-white/10 flex items-center justify-center gap-4"
                >
                  <Calculator size={16} className="opacity-60" /> Calculer mes économies
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION TIMELINE SANTE */}
        <section id="benefices" className="py-32 bg-[#0A0A0A] border-y border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-24">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#8b0000] block mb-6">ÉVOLUTION</span>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-8">Un corps qui récupère, étape par étape</h2>
              <p className="text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed">
                Dès les premiers jours, votre organisme entame son processus de nettoyage. Les bénéfices documentés s'accumulent au fil du temps.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
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
            
            <p className="text-center text-[10px] text-neutral-600 uppercase tracking-widest mt-20">
              * Données basées sur les observations générales de l'arrêt du tabac (OMS, Ministère de la Santé).
            </p>
          </div>
        </section>

        {/* SECTION ECONOMIES */}
        <section id="calculateur" className="py-32 relative">
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#8b0000]/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-600 block mb-6">FINANCES</span>
              <h2 className="text-4xl font-serif text-white mb-6">Le coût d'une habitude</h2>
              <p className="text-neutral-300 font-light leading-relaxed">
                Au-delà de la santé, l'arrêt du tabac représente un gain financier majeur.
              </p>
            </div>
            
            <SavingsCalculator />
          </div>
        </section>

        {/* SECTION POURQUOI CETTE PAGE */}
        <section className="py-32 bg-[#0A0A0A]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center mx-auto mb-10 text-neutral-600">
              <HelpCircle size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white mb-8">Pourquoi parler de l'arrêt du tabac ici ?</h3>
            <p className="text-neutral-200 font-light leading-relaxed text-lg max-w-3xl mx-auto">
              Chez DoiryShop, nous refusons les fausses promesses. L'arrêt du tabac est un parcours personnel complexe. 
              Cependant, nous savons que l'une des plus grandes difficultés réside dans la perte du "rituel" quotidien ou du simple geste. 
              C'est pour cela que nous proposons une alternative douce et transparente, pour accompagner la transition gestuelle, sans la moindre trace de nicotine. 
              La décision d'arrêter vous appartient. Si le geste vous manque, nous avons une solution.
            </p>
          </div>
        </section>

        {/* SECTION DOIRYSHOP */}
        <section id="doiryshop-alternative" className="py-32 bg-neutral-950 border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/bg_texture.png')] bg-cover bg-center opacity-[0.015] pointer-events-none" />
          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <Leaf className="w-12 h-12 text-[#8b0000] mx-auto mb-10 opacity-80" />
            <h2 className="text-4xl font-serif text-white mb-8 leading-tight">Conserver le geste, <br/> <span className="text-neutral-300 italic">retirer la nicotine.</span></h2>
            <p className="text-xl text-neutral-200 font-light leading-relaxed mb-16 max-w-2xl mx-auto">
              L'une des plus grandes difficultés lors de l'arrêt du tabac est la perte du rituel. DoiryShop s'inscrit comme une alternative végétale, pensée pour vous accompagner dans votre transition sans introduire de nouvelle dépendance à la nicotine.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-8 mb-20">
              <div className="bg-[#0A0A0A] p-10 rounded-3xl border border-white/5 hover:border-[#8b0000]/20 transition-all duration-500 group">
                <CheckCircle2 className="w-8 h-8 text-[#8b0000] mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-serif text-white mb-4">100% Sans nicotine</h4>
                <p className="text-sm text-neutral-300 leading-relaxed font-light">Pas d'entretien de l'addiction chimique.</p>
              </div>
              <div className="bg-[#0A0A0A] p-10 rounded-3xl border border-white/5 hover:border-[#8b0000]/20 transition-all duration-500 group">
                <CheckCircle2 className="w-8 h-8 text-[#8b0000] mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-serif text-white mb-4">Rituel préservé</h4>
                <p className="text-sm text-neutral-300 leading-relaxed font-light">Garder le geste pour faciliter la transition.</p>
              </div>
              <div className="bg-[#0A0A0A] p-10 rounded-3xl border border-white/5 hover:border-[#8b0000]/20 transition-all duration-500 group">
                <CheckCircle2 className="w-8 h-8 text-[#8b0000] mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-serif text-white mb-4">Plantes naturelles</h4>
                <p className="text-sm text-neutral-300 leading-relaxed font-light">Une composition lisible et transparente.</p>
              </div>
            </div>

            <Link 
              to="/boutique" 
              onClick={() => trackEvent('arret_tabac_shop_click', { section: 'doiryshop' })}
              className="group inline-flex items-center gap-6"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Découvrir nos alternatives</span>
              <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#8b0000] group-hover:border-[#8b0000] group-hover:text-white transition-all duration-500">
                <ArrowRight size={18} />
              </div>
            </Link>

            <div className="mt-24 p-8 bg-white/5 border border-white/5 rounded-3xl text-left flex gap-6 items-start max-w-3xl mx-auto backdrop-blur-xl">
              <Info className="w-6 h-6 text-[#8b0000] shrink-0 mt-1 opacity-60" />
              <div>
                <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b0000] mb-3">Avertissement important</h5>
                <p className="text-sm text-neutral-300 leading-relaxed font-light italic">
                  Les produits proposés par DoiryShop ne sont pas des traitements médicaux ni des médicaments de sevrage. Ils constituent une alternative récréative ou rituelle sans nicotine. En cas de dépendance forte au tabac, l'accompagnement par un professionnel de santé (médecin, tabacologue) ou l'utilisation de substituts nicotiniques pharmaceutiques reste la démarche la plus recommandée.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION FAQ */}
        <section className="py-32">
          <div className="max-w-4xl mx-auto px-6">
            <header className="mb-20 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-600 block mb-6">RESSOURCES</span>
              <h2 className="text-4xl font-serif text-white">Questions fréquentes</h2>
            </header>
            
            <div className="space-y-4">
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
