import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flame,
  GlassWater,
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
    image: '/images/etui_preroules.png',
    icon: Flame,
    intro:
      "Les pré-roulés Doiry sont pensés pour les moments où l'envie arrive vite : une pause, une tension, une soirée, une transition. Vous gardez la gestuelle, la fumée texturée, la combustion lente, mais vous sortez du réflexe tabac.",
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
        how: 'Sortez-le comme un accessoire discret. Une fumée aromatique, intrigante, plus élégante qu�"une cigarette classique.',
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
    subtitle: 'L�"alternative pure au tabac dans vos mélanges.',
    image: '/images/pochon_kraft_noir.png',
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
        how: 'Commencez par remplacer une partie du tabac, puis augmentez la proportion de Vrac Doiry jusqu�"à basculer vers une alternative pure.',
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
    image: '/images/boite_infusion_kraft.png',
    icon: Sun,
    intro:
      "Les infusions Doiry accompagnent les moments où le corps a besoin de chaleur, de clarté ou d�"un retour au calme. Elles ne remplacent pas le geste fumé : elles l�"encadrent, l�"adoucissent et créent une routine plus complète.",
    cta: 'Découvrir les infusions',
    moments: [
      {
        name: 'Matin clair',
        when: 'Avant les messages, avant la vitesse.',
        how: 'Infusez quelques minutes, respirez la vapeur, buvez lentement. Le matin devient un point d�"ancrage plutôt qu�"une course.',
        benefit: 'Clarté, éveil doux, esprit plus net.'
      },
      {
        name: 'Après-midi focus',
        when: 'Quand l�"énergie descend mais que la journée continue.',
        how: 'Préparez une tasse légère et gardez-la près de vous pendant le travail. Une pause calme, sans excitation brutale.',
        benefit: 'Focus plus posé, moins de nervosité.'
      },
      {
        name: 'Soir apaisé',
        when: 'Quand la journée doit enfin ralentir.',
        how: 'Associez l�"infusion à un pré-roulé doux ou à un rituel sans écran. L�"idée : relâcher, pas stimuler.',
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
    image: '/images/coffret_complet_flatlay.png',
    icon: Package,
    intro:
      "Les coffrets rassemblent les gestes essentiels : découvrir, tester, comparer, puis choisir son rituel. Ils sont faits pour celles et ceux qui veulent une transition guidée, belle et simple à suivre.",
    cta: 'Voir les coffrets',
    moments: [
      {
        name: 'Première transition',
        when: 'Quand vous ne savez pas par quoi commencer.',
        how: 'Utilisez le coffret comme une semaine d�"essai : pré-roulé pour les envies fortes, infusion pour encadrer les moments sensibles, vrac si vous aimez rouler.',
        benefit: 'Un parcours clair, sans dispersion.'
      },
      {
        name: 'Routine du soir',
        when: 'Quand le stress retombe mal et que le sommeil tarde.',
        how: 'Créez une séquence stable : ranger la journée, préparer l�"infusion, puis choisir une volute douce si le geste vous apaise.',
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

const quickAccess = productGuides.flatMap((guide) =>
  guide.moments.map((moment) => ({
    id: `${guide.id}-${moment.name}`,
    guideId: guide.id,
    product: guide.title,
    name: moment.name,
    benefit: moment.benefit
  }))
);

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
      className="scroll-mt-28 border-t border-surface-border bg-background px-5 py-16 md:px-8 md:py-24"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className={`${isReversed ? 'lg:order-2' : ''} lg:sticky lg:top-28`}>
          <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-surface-border bg-surface">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-black/60 to-primary/10" />
            <img src={guide.image} alt={guide.title} className="absolute inset-0 h-full w-full object-contain p-8 drop-shadow-2xl" />
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-accent/30 bg-black/60 px-4 py-2 text-xs uppercase tracking-[0.22em] text-accent backdrop-blur">
              <Icon size={14} />
              {guide.label}
            </div>
          </div>
        </div>

        <div className={isReversed ? 'lg:order-1' : ''}>
          <div className="mb-8">
            <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.3em] text-accent">{guide.order}</span>
            <h2 className="font-serif text-4xl leading-tight text-text md:text-6xl">{guide.title}</h2>
            <p className="mt-3 text-2xl font-light text-white">{guide.subtitle}</p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-text-light md:text-lg">{guide.intro}</p>
          </div>

          <div className="space-y-4">
            {guide.moments.map((moment, momentIndex) => (
              <MotionDiv
                key={moment.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: momentIndex * 0.05 }}
                className="rounded-lg border border-surface-border bg-surface p-5 transition-colors hover:border-accent/40"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="font-serif text-2xl text-text">{moment.name}</h3>
                  <span className="hidden rounded-full border border-primary/30 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary sm:inline-flex">
                    Comment l'utiliser
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Quand</p>
                    <p className="text-sm leading-6 text-text-light">{moment.when}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Comment</p>
                    <p className="text-sm leading-6 text-text-light">{moment.how}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Effet recherché</p>
                    <p className="text-sm leading-6 text-text-light">{moment.benefit}</p>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>

          <Link
            to="/boutique"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 font-medium text-white shadow-glow-red transition-colors hover:bg-primary-dark"
          >
            {guide.cta}
            <ArrowRight size={18} />
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

      <main className="min-h-screen bg-background text-text">
        <section className="relative flex min-h-[86svh] items-end overflow-hidden px-5 pb-12 pt-32 md:px-8 md:pb-16">
          <img src="/hero_botanical.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-background/75 to-background" />
          <MotionDiv
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="relative z-10 mx-auto w-full max-w-7xl"
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-black/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-accent backdrop-blur">
              <Sparkles size={14} />
              Les Rituels Doiry
            </span>
            <h1 className="max-w-5xl font-serif text-5xl leading-[0.95] text-white md:text-7xl">
              Comment utiliser chaque produit, au bon moment.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-light md:text-xl">
              Un guide simple et sensoriel pour choisir entre pré-roulés, Vrac Botanique à fumer, infusions et coffrets. Le bon geste, la bonne plante, la bonne intensité.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => scrollToSection('pre-roules')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 font-medium text-white transition-colors hover:bg-primary-dark"
              >
                Commencer par les pré-roulés
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('vrac-fumer')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-surface-border bg-black/45 px-6 py-4 font-medium text-text backdrop-blur transition-colors hover:border-accent/40"
              >
                Voir le vrac à fumer
              </button>
            </div>
          </MotionDiv>
        </section>

        <section className="border-y border-surface-border bg-background-light/95 px-5 py-5 backdrop-blur md:sticky md:top-0 md:z-20 md:px-8">
          <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto pb-1">
            {productGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => scrollToSection(guide.id)}
                  className="flex min-w-[230px] items-center gap-3 rounded-lg border border-surface-border bg-surface px-4 py-3 text-left text-text-light transition-colors hover:border-accent/40 hover:text-text"
                >
                  <Icon size={18} className="text-accent" />
                  <span>
                    <span className="block text-[11px] uppercase tracking-[0.18em]">{guide.order} - {guide.label}</span>
                    <span className="block font-serif text-base">{guide.title}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-background px-5 py-14 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Liste rapide</span>
                <h2 className="mt-3 font-serif text-3xl text-text md:text-4xl">Tous les moments d'utilisation</h2>
              </div>
              <p className="hidden max-w-sm text-sm leading-6 text-text-muted md:block">
                Cliquez sur un moment pour accéder au produit adapté et à sa méthode d'utilisation.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {quickAccess.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.guideId)}
                  className="rounded-lg border border-surface-border bg-surface p-4 text-left transition-colors hover:border-accent/40"
                >
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-accent">{item.product}</p>
                  <p className="font-serif text-lg text-text">{item.name}</p>
                  <p className="mt-2 text-sm leading-6 text-text-light">{item.benefit}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background-light px-5 py-14 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
            {[
              { icon: ShieldCheck, title: 'Sans nicotine', text: 'Pour garder le rituel sans entretenir la dépendance physique.' },
              { icon: Flame, title: 'Combustion lente', text: 'Une fumée plus posée, plus douce, moins brutale.' },
              { icon: Wind, title: 'Arômes préservés', text: 'Idéal pour ne pas couvrir vos fleurs de CBD avec le tabac.' },
              { icon: Clock3, title: 'Moments guidés', text: 'Pause, soirée, sommeil, transition : chaque usage a son rythme.' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <MotionDiv
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  className="rounded-lg border border-surface-border bg-background p-5"
                >
                  <Icon className="mb-4 text-accent" size={24} />
                  <h3 className="mb-2 font-serif text-xl text-text">{item.title}</h3>
                  <p className="text-sm leading-6 text-text-light">{item.text}</p>
                </MotionDiv>
              );
            })}
          </div>
        </section>

        {productGuides.map((guide, index) => (
          <ProductGuideSection key={guide.id} guide={guide} index={index} />
        ))}

        <section className="relative overflow-hidden bg-background-light px-5 py-20 md:px-8">
          <div className="absolute inset-0 bg-[url('/bg_texture.png')] bg-cover bg-center opacity-[0.025]" />
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 text-accent">
              <CheckCircle2 size={26} />
            </div>
            <h2 className="font-serif text-4xl leading-tight text-text md:text-5xl">
              Le bon rituel commence par le bon produit.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-text-light">
              Pour une envie immédiate, commencez par les pré-roulés. Pour rouler, mixer vos fleurs ou remplacer le tabac, passez au Vrac Botanique.
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
