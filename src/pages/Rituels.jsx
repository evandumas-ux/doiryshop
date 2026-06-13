import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flame,
  Leaf,
  Moon,
  Package,
  ShieldCheck,
  Sparkles,
  Sun,
  Wind
} from 'lucide-react';
import SEO from '../components/SEO';
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';

const MotionDiv = motion.div;
const MotionSection = motion.section;

const productGuides = [
  {
    id: 'pre-roules',
    order: '01',
    label: 'A utiliser en premier',
    title: 'Pré-roulés botaniques',
    subtitle: 'Le geste prêt, sans nicotine.',
    image: '/images/pack-5-open.png',
    icon: Flame,
    intro:
      "Les pré-roulés Doiry sont pensés pour les moments où l’envie arrive vite : une pause, une tension, une soirée, une transition. Vous gardez la gestuelle, la fumée texturée, la combustion lente, mais vous sortez du réflexe tabac.",
    cta: 'Voir les pré-roulés',
    moments: [
      {
        name: 'Pause de journée',
        when: 'Quand le stress monte ou que la main cherche une cigarette.',
        how: "Allumez lentement, tirez peu, laissez la fumée s'installer. Le but n'est pas de reproduire l'urgence, mais de ralentir le geste.",
        benefit: 'Retrouver une pause nette, sans nicotine.'
      },
      {
        name: 'Transition après repas',
        when: 'Quand le besoin automatique apparaît après manger.',
        how: 'Remplacez la cigarette réflexe par un pré-roulé botanique. Même rituel, autre intention, autre matière.',
        benefit: 'Garder le geste sans relancer la dépendance.'
      },
      {
        name: 'Soirée et moment social',
        when: 'Au milieu des verres, des discussions et des sorties.',
        how: 'Sortez-le comme un accessoire discret. Une fumée aromatique, intrigante, plus élégante qu’une cigarette classique.',
        benefit: 'Créer la curiosité sans odeur lourde ni vape artificielle.'
      },
      {
        name: 'Fin de journée',
        when: 'Quand vous voulez marquer le passage vers le calme.',
        how: 'Associez-le à une lumière basse et à une infusion du soir. Quelques bouffées suffisent pour installer un rythme plus doux.',
        benefit: 'Préparer le retour au calme.'
      }
    ]
  },
  {
    id: 'vrac-fumer',
    order: '02',
    label: 'Le vrac pour fumer',
    title: 'Vrac Botanique Doiry',
    subtitle: 'L’alternative pure au tabac dans vos mélanges.',
    image: '/images/vrac preroll.png',
    icon: Leaf,
    intro:
      "Le Vrac Botanique Doiry est fait pour rouler, doser et composer. Il remplace le tabac industriel dans vos mélanges, notamment avec vos fleurs de CBD, afin de préserver les arômes, éviter la nicotine et reprendre le contrôle de ce que vous consommez.",
    cta: 'Remplacer mon tabac',
    featured: true,
    moments: [
      {
        name: 'Mixer avec des fleurs de CBD',
        when: 'Quand vous voulez profiter de vos fleurs sans les gâcher avec du tabac.',
        how: 'Effritez votre fleur, ajoutez une base de Vrac Doiry, puis ajustez selon la texture voulue. Roulez doucement pour garder une combustion régulière.',
        benefit: 'Arômes préservés, mélange plus pur, sans nicotine.'
      },
      {
        name: 'Rouler votre propre pré-roll',
        when: 'Quand le roulage devient un rituel de détente en soi.',
        how: 'Préparez votre papier, votre filtre, votre dosage. Prenez le temps de façonner un cône propre, léger, adapté à votre moment.',
        benefit: 'Votre papier, votre filtre, votre rythme.'
      },
      {
        name: 'Remplacer le tabac progressivement',
        when: 'Quand vous voulez garder le geste sans subir la dépendance physique.',
        how: 'Commencez par remplacer une partie du tabac, puis augmentez la proportion de Vrac Doiry jusqu’à basculer vers une alternative pure.',
        benefit: 'Une transition plus douce, plus consciente.'
      },
      {
        name: 'Créer un mélange neutre et subtil',
        when: 'Quand vous cherchez une base végétale qui ne domine pas tout.',
        how: 'Dosez léger. Le Vrac Doiry doit soutenir la fumée, la texture et la combustion, pas saturer votre mélange.',
        benefit: 'Une fumée botanique douce et maîtrisée.'
      }
    ]
  },
  {
    id: 'infusions',
    order: '03',
    label: 'Pour boire',
    title: 'Infusions Doiry',
    subtitle: 'Le rituel chaud pour ancrer le corps.',
    image: '/images/vracthe.png',
    icon: Sun,
    intro:
      "Les infusions Doiry accompagnent les moments où le corps a besoin de chaleur, de clarté ou d’un retour au calme. Elles ne remplacent pas le geste fumé : elles l’encadrent, l’adoucissent et créent une routine plus complète.",
    cta: 'Découvrir les infusions',
    moments: [
      {
        name: 'Matin clair',
        when: 'Avant les messages, avant la vitesse.',
        how: 'Infusez quelques minutes, respirez la vapeur, buvez lentement. Le matin devient un point d’ancrage plutôt qu’une course.',
        benefit: 'Clarté, éveil doux, esprit plus net.'
      },
      {
        name: 'Après-midi focus',
        when: 'Quand l’énergie descend mais que la journée continue.',
        how: 'Préparez une tasse légère et gardez-la près de vous pendant le travail. Une pause calme, sans excitation brutale.',
        benefit: 'Focus plus posé, moins de nervosité.'
      },
      {
        name: 'Soir apaisé',
        when: 'Quand la journée doit enfin ralentir.',
        how: 'Associez l’infusion à un pré-roulé doux ou à un rituel sans écran. L’idée : relâcher, pas stimuler.',
        benefit: 'Retour au calme et préparation au sommeil.'
      }
    ]
  },
  {
    id: 'coffrets',
    order: '04',
    label: 'Pour commencer',
    title: 'Coffrets Doiry',
    subtitle: 'Le parcours complet pour installer un nouveau rythme.',
    image: '/images/coffretfumer.png',
    icon: Package,
    intro:
      "Les coffrets rassemblent les gestes essentiels : découvrir, tester, comparer, puis choisir son rituel. Ils sont faits pour celles et ceux qui veulent une transition guidée, belle et simple à suivre.",
    cta: 'Voir les coffrets',
    moments: [
      {
        name: 'Première transition',
        when: 'Quand vous ne savez pas par quoi commencer.',
        how: 'Utilisez le coffret comme une semaine d’essai : pré-roulé pour les envies fortes, infusion pour encadrer les moments sensibles, vrac si vous aimez rouler.',
        benefit: 'Un parcours clair, sans dispersion.'
      },
      {
        name: 'Routine du soir',
        when: 'Quand le stress retombe mal et que le sommeil tarde.',
        how: 'Créez une séquence stable : ranger la journée, préparer l’infusion, puis choisir une volute douce si le geste vous apaise.',
        benefit: 'Un rituel nocturne plus profond.'
      },
      {
        name: 'Cadeau bien-être',
        when: 'Pour offrir une alternative élégante, intime et utile.',
        how: 'Choisissez un coffret selon le moment de vie : transition tabac, soirée, sérénité, découverte botanique.',
        benefit: 'Un cadeau sensoriel, pas un objet banal.'
      }
    ]
  }
];

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const ProductGuideSection = ({ guide, index }) => {
  const Icon = guide.icon;
  const isReversed = index % 2 === 1;

  return (
    <MotionSection
      id={guide.id}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      className="scroll-mt-28 border-t border-white/5 bg-[#050505] px-5 py-24 md:px-8"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start">
        <div className={`${isReversed ? 'lg:order-2' : ''} lg:sticky lg:top-28`}>
          <div className="relative min-h-[460px] overflow-hidden rounded-2xl border border-white/5 bg-[#0A0A0A]">
            <img src={guide.image} alt={guide.title} className="absolute inset-0 h-full w-full object-contain p-12 drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]" />
            <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-5 py-2.5 text-[10px] uppercase tracking-[0.3em] text-neutral-400 backdrop-blur-xl">
              <Icon size={12} />
              {guide.label}
            </div>
          </div>
        </div>

        <div className={isReversed ? 'lg:order-1' : ''}>
          <div className="mb-12">
            <span className="mb-6 block text-[10px] font-bold uppercase tracking-[0.5em] text-[#8b0000]">{guide.order} / RITUEL</span>
            <h2 className="font-serif text-5xl leading-tight text-white md:text-6xl">{guide.title}</h2>
            <p className="mt-4 text-xl font-light text-neutral-400">{guide.subtitle}</p>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-500">{guide.intro}</p>
          </div>

          <div className="space-y-6">
            {guide.moments.map((moment, momentIndex) => (
              <MotionDiv
                key={moment.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: momentIndex * 0.05 }}
                className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-8 transition-all duration-500 hover:border-[#8b0000]/30 group"
              >
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h3 className="font-serif text-2xl text-white group-hover:text-[#8b0000] transition-colors">{moment.name}</h3>
                  <span className="hidden rounded-full border border-white/10 px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] text-neutral-500 sm:inline-flex">
                    Méthode
                  </span>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8b0000]">Quand</p>
                    <p className="text-sm leading-relaxed text-neutral-400">{moment.when}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8b0000]">Comment</p>
                    <p className="text-sm leading-relaxed text-neutral-400">{moment.how}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8b0000]">Sensation</p>
                    <p className="text-sm leading-relaxed text-neutral-400">{moment.benefit}</p>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>

          <Link
            to="/boutique"
            className="mt-12 inline-flex items-center gap-6 group"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">{guide.cta}</span>
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#8b0000] group-hover:border-[#8b0000] group-hover:text-white transition-all duration-500">
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      </div>
    </MotionSection>
  );
};

const Rituels = ({ user, cartItems = [], setCartItems, onLogout }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <SEO
        title="Les Rituels Doiry | Guide d'utilisation botanique"
        description="Comment utiliser les pré-roulés, le Vrac Botanique, les infusions et les coffrets Doiry selon chaque moment de la journée."
        url="https://doiryshop.com/rituels"
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
        onRemove={(id) => setCartItems((prev) => prev.filter((item) => item.id !== id))}
        onUpdateQuantity={(id, change) => {
          setCartItems((prev) => prev.map((item) => {
            if (item.id !== id) return item;
            const nextQuantity = item.quantity + change;
            return nextQuantity > 0 ? { ...item, quantity: nextQuantity } : null;
          }).filter(Boolean));
        }}
        onCheckout={() => navigate('/checkout')}
      />

      <main className="min-h-screen bg-[#050505] text-text">
        {/* Hero Section */}
        <section className="relative flex min-h-[90svh] items-center overflow-hidden px-5 pb-12 pt-32 md:px-8">
          {/* Ambient Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8b0000]/10 rounded-full blur-[140px] pointer-events-none" />
          
          <MotionDiv
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative z-10 mx-auto w-full max-w-7xl text-center"
          >
            <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 backdrop-blur-xl">
              <Sparkles size={12} className="text-[#8b0000]" />
              Les Rituels Doiry
            </span>
            <h1 className="mx-auto max-w-5xl font-serif text-5xl leading-[1.1] text-white md:text-7xl lg:text-8xl">
              Comment utiliser chaque produit, <br/>
              <span className="italic text-neutral-500">au bon moment.</span>
            </h1>
            <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-neutral-500 md:text-xl font-light">
              Un guide simple et sensoriel pour choisir entre pré-roulés, Vrac Botanique à fumer, infusions et coffrets. Le bon geste, la bonne plante, la bonne intensité.
            </p>
            <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => scrollToSection('pre-roules')}
                className="group inline-flex items-center justify-center gap-4 rounded-full bg-[#8b0000] px-10 py-5 text-[11px] font-bold uppercase tracking-[0.3em] text-white transition-all duration-500 hover:brightness-125 hover:scale-105 shadow-2xl shadow-[#8b0000]/20"
              >
                Commencer par les pré-roulés
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('vrac-fumer')}
                className="inline-flex items-center justify-center gap-4 rounded-full border border-white/10 bg-white/5 px-10 py-5 text-[11px] font-bold uppercase tracking-[0.3em] text-white backdrop-blur-xl transition-all duration-500 hover:bg-white/10"
              >
                Voir le vrac à fumer
              </button>
            </div>
          </MotionDiv>
        </section>

        {/* Floating Navigation */}
        <section className="sticky top-0 z-40 border-y border-white/5 bg-[#050505]/80 px-5 py-6 backdrop-blur-2xl md:px-8">
          <div className="mx-auto flex max-w-7xl justify-center gap-8 overflow-x-auto scrollbar-hide">
            {productGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => scrollToSection(guide.id)}
                  className="group flex flex-col items-center gap-3 text-center min-w-fit"
                >
                  <Icon size={16} className="text-neutral-600 group-hover:text-[#8b0000] transition-colors" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 group-hover:text-white transition-colors">
                    {guide.title}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Steps Expansion - Masonry/Spaced Layout */}
        <section className="bg-black px-5 py-40 md:px-8 relative overflow-hidden">
          {/* Ambient Flare */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[600px] bg-[#8b0000]/5 rounded-full blur-[160px] pointer-events-none" />
          
          <div className="mx-auto max-w-7xl relative z-10">
            <header className="mb-32 text-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-neutral-700 block mb-8">L'ESSENTIEL</span>
              <h2 className="font-serif text-5xl text-white md:text-7xl leading-tight">Une expérience <br/><span className="italic text-neutral-500 font-light">délibérée.</span></h2>
            </header>
            
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 items-start">
              {[
                { icon: ShieldCheck, title: 'Sans nicotine', text: 'Pour garder le rituel sans entretenir la dépendance physique.', height: 'lg:mt-0' },
                { icon: Flame, title: 'Combustion lente', text: 'Une fumée plus posée, plus douce, moins brutale.', height: 'lg:mt-24' },
                { icon: Wind, title: 'Arômes préservés', text: 'Idéal pour ne pas couvrir vos fleurs de CBD avec le tabac.', height: 'lg:mt-12' },
                { icon: Clock3, title: 'Moments guidés', text: 'Pause, soirée, sommeil, transition : chaque usage a son rythme.', height: 'lg:mt-32' }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <MotionDiv
                    key={item.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                    className={`rounded-[2.5rem] border border-white/5 bg-neutral-950/50 backdrop-blur-sm p-12 flex flex-col h-full hover:border-[#8b0000]/30 transition-all duration-1000 group ${item.height}`}
                  >
                    <div className="mb-10 w-16 h-16 rounded-2xl border border-white/5 flex items-center justify-center text-neutral-700 group-hover:text-[#8b0000] group-hover:border-[#8b0000]/30 group-hover:bg-[#8b0000]/5 transition-all duration-700">
                      <Icon size={24} />
                    </div>
                    <h3 className="mb-6 font-serif text-2xl text-white tracking-wide">{item.title}</h3>
                    <p className="text-base leading-relaxed text-neutral-500 font-light">{item.text}</p>
                    <div className="mt-12 h-px w-8 bg-neutral-800 group-hover:w-full group-hover:bg-[#8b0000]/50 transition-all duration-1000" />
                  </MotionDiv>
                );
              })}
            </div>
          </div>
        </section>

        {productGuides.map((guide, index) => (
          <ProductGuideSection key={guide.id} guide={guide} index={index} />
        ))}

        {/* Final CTA */}
        <section className="relative overflow-hidden bg-[#0A0A0A] px-5 py-40 md:px-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#8b0000]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto max-w-4xl text-center"
          >
            <div className="mb-10 inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/10 text-[#8b0000]">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="font-serif text-5xl leading-tight text-white md:text-6xl">
              Le bon rituel commence <br/>
              <span className="text-neutral-500 italic">par le bon produit.</span>
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-neutral-500 font-light">
              Pour une envie immédiate, commencez par les pré-roulés. Pour rouler, mixer vos fleurs ou remplacer le tabac, passez au Vrac Botanique.
            </p>
            <Link
              to="/boutique"
              className="mt-12 group inline-flex items-center justify-center gap-6"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Composer mon rituel</span>
              <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#8b0000] group-hover:border-[#8b0000] group-hover:text-white transition-all duration-500">
                <ArrowRight size={18} />
              </div>
            </Link>
          </MotionDiv>
        </section>
      </main>
    </>
  );
};

export default Rituels;
