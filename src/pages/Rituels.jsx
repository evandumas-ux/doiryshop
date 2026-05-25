import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Flame,
  GlassWater,
  Leaf,
  Moon,
  Palette,
  ShieldCheck,
  Sparkles,
  Sun,
  Wind
} from 'lucide-react';
import SEO from '../components/SEO';
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';

const ritualIcons = {
  matin: Sun,
  vrac: Leaf,
  transition: Briefcase,
  atelier: Palette,
  social: GlassWater,
  nuit: Moon
};

const rituals = [
  {
    id: 'matin',
    moment: 'Le rituel matinal',
    title: 'Clarté & Éveil',
    product: 'Infusions légères et dynamisantes',
    image: '/images/boite_infusion_kraft.png',
    eyebrow: 'À l’aube, avant le bruit',
    headline: 'Remplacer la précipitation par un premier geste clair.',
    description:
      "Quand la journée commence trop vite, l’infusion devient un point d’ancrage. Une vapeur douce, des arômes végétaux nets, une chaleur tenue entre les mains : le corps se réveille sans être brusqué, l’esprit retrouve sa ligne.",
    sensory: ['esprit clair', 'chaleur fine', 'ancrage du matin'],
    cta: "Découvrir l'Éveil Botanique"
  },
  {
    id: 'vrac',
    moment: 'L’alternative absolue',
    title: 'Purifier ses Fleurs',
    product: 'Le Vrac Botanique Doiry',
    image: '/images/pochon_kraft_noir.png',
    eyebrow: 'Substitution tabac / mix CBD',
    headline: 'Ne laissez plus le tabac industriel couvrir vos fleurs.',
    description:
      "Le Vrac Botanique Doiry est pensé comme le substitut de tabac ultime : une coupe souple, une texture agréable à rouler, une combustion lente et une présence aromatique maîtrisée. Il accompagne vos fleurs de CBD sans les écraser, préserve leurs nuances et vous aide à reprendre le contrôle de ce que vous consommez.",
    sensory: ['sans nicotine', 'arômes préservés', 'alternative pure'],
    cta: 'Remplacer mon Tabac',
    featured: true
  },
  {
    id: 'transition',
    moment: 'Le rituel de transition',
    title: 'Le Geste Sain',
    product: 'Coffret Transition & pré-rolls alternatifs',
    image: '/images/coffret_complet_flatlay.png',
    eyebrow: 'Pause, tension, besoin de focus',
    headline: 'Garder le geste, retirer la dépendance.',
    description:
      "Il y a ces instants où la main cherche une pause, où le stress réclame un automatisme. Le rituel Doiry conserve l’élégance du geste et le plaisir d’une fumée texturée, les toxines et la nicotine en moins. Un appui naturel pour rester présent, sans l’anxiété du manque.",
    sensory: ['fumée texturée', 'focus calme', 'geste préservé'],
    cta: 'Entamer ma Transition'
  },
  {
    id: 'atelier',
    moment: 'L’atelier du connaisseur',
    title: "L'Art de Rouler",
    product: 'Le Vrac Botanique Doiry',
    image: '/images/pochon_kraft_noir.png',
    eyebrow: 'Dosage, papier, filtre, rythme',
    headline: 'Faire du roulage un rituel de détente.',
    description:
      "Pour celles et ceux qui aiment composer eux-mêmes : ouvrir le pochon, effleurer la matière, doser selon l’envie, façonner un pré-roll à son rythme. Le Vrac Doiry offre une base noble, saine et 100 % naturelle pour créer un moment précis, personnel, presque méditatif.",
    sensory: ['texture parfaite', 'dosage libre', 'plantes nobles'],
    cta: 'Découvrir le Vrac Doiry'
  },
  {
    id: 'social',
    moment: 'Le rituel social',
    title: "L'Élégance en Soirée",
    product: 'Pré-rolls botaniques premium',
    image: '/images/etui_preroules.png',
    eyebrow: 'Au milieu des verres et des discussions',
    headline: 'Un accessoire de style plus qu’une habitude.',
    description:
      "En soirée, le pré-roll Doiry se sort comme un détail choisi. Une combustion douce, une fumée aromatique et intrigante, une alternative pure qui attire la curiosité sans l’odeur lourde de la cigarette classique ni la sensation artificielle de la vape.",
    sensory: ['combustion lente', 'fumée aromatique', 'allure discrète'],
    cta: 'Sublimer mes Soirées'
  },
  {
    id: 'nuit',
    moment: 'Le rituel nocturne',
    title: 'Sérénité Absolue',
    product: 'Coffret Sérénité & infusions du soir',
    image: '/images/coffret-serenite-placeholder.svg',
    eyebrow: 'Le retour au calme',
    headline: 'Fermer la journée avec douceur.',
    description:
      "Quand le corps demande à redescendre, Doiry installe une scène plus lente : infusion chaude, lumière basse, volute apaisante. Un duo de plantes et de silence pour relâcher les tensions, apaiser le mental et préparer un sommeil profond.",
    sensory: ['infusion chaude', 'volute apaisante', 'calme profond'],
    cta: "S'offrir la Sérénité"
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

const MotionDiv = motion.div;
const MotionSpan = motion.span;
const MotionH2 = motion.h2;
const MotionH3 = motion.h3;
const MotionP = motion.p;

const RitualSection = ({ ritual, index }) => {
  const Icon = ritualIcons[ritual.id] || Leaf;
  const isReversed = index % 2 === 1;

  return (
    <section id={ritual.id} className="relative scroll-mt-28 overflow-hidden bg-background py-20 md:py-28">
      <div className="absolute inset-0 bg-[url('/bg_texture.png')] bg-cover bg-center opacity-[0.025] pointer-events-none" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 md:px-8 lg:grid-cols-2 lg:gap-16">
        <MotionDiv
          initial={{ opacity: 0, x: isReversed ? 36 : -36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className={`${isReversed ? 'lg:order-2' : ''} relative min-h-[420px] overflow-hidden rounded-lg border border-surface-border bg-surface`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/50 to-primary/10" />
          <img
            src={ritual.image}
            alt={ritual.product}
            className="absolute inset-0 h-full w-full object-contain p-10 opacity-95 drop-shadow-2xl transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-black/60 px-4 py-2 text-xs uppercase tracking-[0.22em] text-accent backdrop-blur">
            <Icon size={14} />
            {ritual.moment}
          </div>
          {ritual.featured && (
            <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-accent/25 bg-black/70 p-4 backdrop-blur">
              <p className="text-sm leading-relaxed text-text-light">
                Pensé pour les mélanges CBD : une alternative pure, sans nicotine, qui respecte les arômes au lieu de les masquer.
              </p>
            </div>
          )}
        </MotionDiv>

        <MotionDiv
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          transition={{ staggerChildren: 0.09 }}
          className={`${isReversed ? 'lg:order-1' : ''} max-w-xl`}
        >
          <MotionSpan variants={fadeUp} className="mb-4 block text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            {ritual.eyebrow}
          </MotionSpan>
          <MotionH2 variants={fadeUp} className="mb-3 font-serif text-4xl leading-tight text-text md:text-5xl">
            {ritual.title}
          </MotionH2>
          <MotionP variants={fadeUp} className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">
            {ritual.product}
          </MotionP>
          <MotionH3 variants={fadeUp} className="mb-5 text-2xl font-light leading-snug text-white md:text-3xl">
            {ritual.headline}
          </MotionH3>
          <MotionP variants={fadeUp} className="mb-7 text-base leading-8 text-text-light md:text-lg">
            {ritual.description}
          </MotionP>
          <MotionDiv variants={fadeUp} className="mb-8 flex flex-wrap gap-3">
            {ritual.sensory.map((tag) => (
              <span key={tag} className="rounded-full border border-surface-border bg-surface px-4 py-2 text-sm text-text-light">
                {tag}
              </span>
            ))}
          </MotionDiv>
          <MotionDiv variants={fadeUp}>
            <Link
              to="/boutique"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 font-medium text-white shadow-glow-red transition-colors hover:bg-primary-dark"
            >
              {ritual.cta}
              <ArrowRight size={18} />
            </Link>
          </MotionDiv>
        </MotionDiv>
      </div>
    </section>
  );
};

const Rituels = ({ user, cartItems = [], setCartItems, onLogout }) => {
  const [activeRitual, setActiveRitual] = useState(rituals[0].id);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToRitual = (id) => {
    setActiveRitual(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <SEO
        title="Les Rituels Doiry | Quand et comment utiliser nos plantes"
        description="Découvrez les rituels Doiry : infusions, pré-rolls, coffrets et Vrac Botanique pour le matin, la transition, les soirées et le retour au calme."
        url="https://doiryshop.fr/rituels"
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

      <main className="min-h-screen bg-background text-text">
        <section className="relative flex min-h-[88svh] items-end overflow-hidden px-5 pb-12 pt-28 md:px-8 md:pb-16">
          <img src="/hero_botanical.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-background/70 to-background" />
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 mx-auto w-full max-w-6xl"
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-accent backdrop-blur">
              <Sparkles size={14} />
              Les Rituels Doiry
            </span>
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.95] text-white md:text-7xl">
              À chaque moment, sa plante, son geste, son silence.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-light md:text-xl">
              Infusions, coffrets, pré-rolls et Vrac Botanique : une cartographie sensorielle pour choisir le bon rituel, préserver les arômes et transformer l’envie en art de vivre.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => scrollToRitual('vrac')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 font-medium text-white transition-colors hover:bg-primary-dark"
              >
                Explorer le Vrac Botanique
                <ArrowRight size={18} />
              </button>
              <Link
                to="/boutique"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-surface-border bg-black/40 px-6 py-4 font-medium text-text backdrop-blur transition-colors hover:border-accent/40"
              >
                Voir la boutique
              </Link>
            </div>
          </MotionDiv>
        </section>

        <section className="border-y border-surface-border bg-background-light/80 px-5 py-5 backdrop-blur md:sticky md:top-0 md:z-20 md:px-8">
          <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto pb-1">
            {rituals.map((ritual) => {
              const Icon = ritualIcons[ritual.id] || Leaf;
              const isActive = activeRitual === ritual.id;
              return (
                <button
                  key={ritual.id}
                  type="button"
                  onClick={() => scrollToRitual(ritual.id)}
                  className={`flex min-w-[210px] items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                    isActive
                      ? 'border-accent/60 bg-accent/10 text-text'
                      : 'border-surface-border bg-surface text-text-light hover:border-accent/30'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-accent' : 'text-text-muted'} />
                  <span>
                    <span className="block text-[11px] uppercase tracking-[0.18em]">{ritual.moment}</span>
                    <span className="block font-serif text-base">{ritual.title}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-background px-5 py-16 md:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Sans nicotine', text: 'Une alternative pure pour sortir du tabac sans sacrifier le rituel.' },
              { icon: Flame, title: 'Combustion lente', text: 'Une matière végétale pensée pour une fumée plus douce et plus posée.' },
              { icon: Wind, title: 'Arômes préservés', text: 'Des mélanges qui accompagnent vos fleurs au lieu de les saturer.' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <MotionDiv
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55 }}
                  className="rounded-lg border border-surface-border bg-surface p-6"
                >
                  <Icon className="mb-5 text-accent" size={26} />
                  <h2 className="mb-3 font-serif text-2xl text-text">{item.title}</h2>
                  <p className="leading-7 text-text-light">{item.text}</p>
                </MotionDiv>
              );
            })}
          </div>
        </section>

        {rituals.map((ritual, index) => (
          <RitualSection key={ritual.id} ritual={ritual} index={index} />
        ))}

        <section className="relative overflow-hidden bg-background-light px-5 py-20 md:px-8">
          <div className="absolute inset-0 bg-[url('/bg_texture.png')] bg-cover bg-center opacity-[0.025]" />
          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="relative mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 text-accent">
              <CheckCircle2 size={26} />
            </div>
            <h2 className="font-serif text-4xl leading-tight text-text md:text-5xl">
              Choisissez le rituel qui respecte votre corps.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-text-light">
              Une pause, une soirée, une transition, un mélange CBD à purifier : Doiry transforme chaque usage en geste plus noble, plus conscient, plus beau.
            </p>
            <Link
              to="/boutique"
              className="mt-9 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-4 font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Composer mon rituel
              <ArrowRight size={18} />
            </Link>
          </MotionDiv>
        </section>
      </main>
    </>
  );
};

export default Rituels;
