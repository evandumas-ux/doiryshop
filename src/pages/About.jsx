import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Header from '../components/Header';
const Navbar = Header;

const About = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#050505] text-text pt-32 pb-32 px-6 relative overflow-hidden">
      <SEO
        title="Notre histoire — Doiry Shop"
        description="Découvrez l'histoire fondatrice de Doiryshop et la transition qui a donné naissance à notre approche."
        url="https://doiryshop.com/about"
      />
      
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-[#8b0000]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-[#1a1a1a]/10 rounded-full blur-[150px] pointer-events-none" />

      <Navbar
        onOpenCart={() => {}}
        onOpenLogin={() => navigate('/login')}
        onLogout={() => {}}
        cartItemsCount={0}
        user={null}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <header className="mb-32 lg:mb-48">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-16"
          >
            <img
              src="/favicon.jpg"
              alt="Logo Doiryshop"
              className="w-24 h-auto opacity-90 object-contain"
            />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-8xl font-serif text-white leading-[0.9] max-w-5xl tracking-tighter"
          >
            Une autre approche <br/>
            <span className="text-neutral-600 italic font-light">du geste et du temps.</span>
          </motion.h1>
        </header>

        {/* Narrative Grid */}
        <div className="grid lg:grid-cols-12 gap-24 lg:gap-32">
          {/* Column 1: Editorial Chapters */}
          <div className="lg:col-span-8 space-y-32">
            
            {/* Chapter 01 */}
            <section className="group">
              <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-neutral-700 block mb-10 transition-colors group-hover:text-[#8b0000]">01 / L'ORIGINE</span>
              <div className="max-w-2xl space-y-8 text-xl md:text-2xl font-light leading-relaxed text-neutral-400">
                <p>
                  Certaines histoires commencent sans bruit. La mienne s'est écrite dans un quotidien où la fumée faisait partie du décor. Je n'ai jamais cherché à juger, ni à imposer.
                </p>
                <p>
                  Mais j'ai voulu comprendre s'il existait une autre voie. Quelque chose de plus nuancé, de plus maîtrisé. Un geste qui reste, mais dont l'intention change.
                </p>
              </div>
            </section>

            {/* Chapter 02 */}
            <section className="group">
              <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-neutral-700 block mb-10 transition-colors group-hover:text-[#8b0000]">02 / LE GESTE</span>
              <div className="max-w-2xl space-y-8 text-xl md:text-2xl font-light leading-relaxed text-neutral-400 border-l border-white/5 pl-12">
                <p>
                  Alors j'ai commencé, simplement. Pour mes proches. En explorant les plantes, leurs textures, leurs arômes, leur simplicité. En cherchant une alternative qui ne brusque pas, mais qui accompagne.
                </p>
              </div>
            </section>

            {/* Chapter 03 */}
            <section className="group">
              <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-neutral-700 block mb-10 transition-colors group-hover:text-[#8b0000]">03 / LA TRANSITION</span>
              <div className="max-w-2xl space-y-10 text-xl md:text-2xl font-light leading-relaxed text-neutral-400">
                <p>
                  Peu à peu, ce qui était personnel est devenu évident. Si cela pouvait exister pour eux, cela pouvait exister pour d'autres. Doiryshop est né de cette transition.
                </p>
                <p>
                  Une manière de proposer, à ceux qui le souhaitent, une autre approche — plus douce, plus consciente, sans renier le geste. Ici, rien n'est excessif. Chaque produit est pensé comme une présence différente, plus calme, plus maîtrisée.
                </p>
                <p className="text-white font-serif italic text-3xl md:text-4xl pt-12 leading-tight">
                  "Ce n'est pas une promesse. <br/> C'est une continuité."
                </p>
              </div>
            </section>

            <div className="pt-20">
              <Link
                to="/boutique"
                className="inline-flex items-center gap-10 group"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-white">Découvrir la collection</span>
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:border-white group-hover:text-black transition-all duration-700">
                  <ArrowRight size={20} />
                </div>
              </Link>
            </div>
          </div>

          {/* Column 2: Visual/Empty space for asymmetry */}
          <div className="hidden lg:block lg:col-span-4 relative">
            <div className="sticky top-48 border-l border-white/5 pl-16 py-8">
              <div className="space-y-16">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-800 leading-[2] font-bold">
                    BOTANIQUE <br/>
                    MODERNITÉ <br/>
                    SÉRÉNITÉ
                  </p>
                </div>
                <div className="w-px h-32 bg-gradient-to-b from-neutral-800 to-transparent" />
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-600 leading-loose max-w-[180px]">
                  UNE DÉMARCHE ARTISANALE PORTÉE PAR LA RECHERCHE DE L'ÉQUILIBRE ET DE LA CLARTÉ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

// Simple Arrow Component for local use
const ArrowRight = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default About;
