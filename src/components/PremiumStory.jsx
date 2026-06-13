import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PremiumStory = ({ product, onAddToCart }) => {
  const containerRef = useRef();
  const heroRef = useRef();
  const productRef = useRef();
  const infoRef = useRef();
  const [showSticky, setShowSticky] = useState(false);

  const handleAddToCart = () => {
    if (product && onAddToCart) {
      onAddToCart(product);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sticky Bar Toggle with ScrollTrigger
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top+=800 top",
        end: "bottom top",
        onToggle: self => setShowSticky(self.isActive)
      });

      // Hero Animation
      gsap.from(".hero-content > *", {
        y: 60,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "power4.out"
      });

      // Product Reveal on Scroll
      gsap.from(".product-image-container", {
        scrollTrigger: {
          trigger: ".product-section",
          start: "top 80%",
          end: "top 20%",
          scrub: 1,
        },
        scale: 0.9,
        opacity: 0,
        y: 100,
      });

      // Ambient Light Pulsing
      gsap.to(".ambient-glow", {
        opacity: 0.6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Feature Reveal
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 85%",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#0A0A0A] text-[#F0EDE8] overflow-hidden">
      
      {/* --- STICKY SUB-BAR --- */}
      <div className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 transform ${showSticky ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="bg-background/80 backdrop-blur-2xl border-b border-white/5 py-5 px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-[11px] tracking-premium font-medium text-text-muted hidden sm:block">Série Signature</span>
              <span className="text-base font-serif text-accent tracking-wide">L'Essentiel — 8,90 €</span>
            </div>
            <button 
              onClick={handleAddToCart}
              className="bg-accent text-background px-10 py-3 rounded-full text-[11px] tracking-premium font-bold transition-all duration-500 hover:bg-accent-light hover:scale-[1.02] shadow-xl shadow-accent/10"
            >
              Ajouter au Panier
            </button>
          </div>
        </div>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 px-8">
        {/* Cinematic Ambient Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] max-w-[1000px] max-h-[1000px] bg-accent/5 rounded-full blur-[150px] pointer-events-none ambient-glow" />
        
        <div className="hero-content text-center relative z-10 max-w-5xl">
          <span className="text-accent text-[12px] font-medium tracking-[0.5em] uppercase mb-10 block">Le nouveau standard botanique</span>
          <h1 className="font-serif text-6xl md:text-[8rem] leading-[0.9] mb-16 tracking-tighter">
            La Transition <br /> <span className="italic opacity-60">Pure.</span>
          </h1>
          <p className="text-text-muted text-xl md:text-2xl font-light tracking-wide max-w-3xl mx-auto leading-relaxed mb-20">
            Une alternative végétale sans aucun compromis. 100% feuille de framboisier sauvage, sélectionnée pour sa finesse absolue et son équilibre naturel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link to="/boutique" className="bg-text text-background px-14 py-6 rounded-full text-[11px] tracking-premium font-bold transition-all duration-700 hover:bg-accent hover:shadow-2xl hover:shadow-accent/20 hover:scale-[1.02]">
              Découvrir la Collection
            </Link>
            <button 
              onClick={() => document.getElementById('notre-histoire')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent border border-white/10 text-text px-14 py-6 rounded-full text-[11px] tracking-premium font-bold transition-all duration-700 hover:bg-white/5 hover:border-white/20"
            >
              L'Éveil Botanique
            </button>
          </div>
        </div>
      </section>

      {/* --- PRODUCT FOCUS SECTION --- */}
      <section className="product-section relative py-48 px-8 bg-background-light">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          
          {/* Visual Side */}
          <div className="product-image-container relative flex justify-center items-center">
            {/* Dynamic Studio Lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/5 rounded-full blur-[150px] pointer-events-none animate-pulse duration-[6000ms]" />
            
            {/* Premium Image Container */}
            <div className="relative w-80 h-[500px] bg-background/40 backdrop-blur-xl rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden flex items-center justify-center p-6 hover:scale-[1.01] transition-all duration-1000 ease-out group">
              <img 
                src="/images/vrac preroll.png" 
                alt="Vrac Preroll" 
                className="w-full h-full object-cover rounded-[2rem] shadow-2xl transition-transform duration-[2000ms] group-hover:scale-105 opacity-90 group-hover:opacity-100"
              />

              {/* Interactive Hotspots */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Hotspot 1: Texture */}
                <div className="absolute top-[30%] left-[40%] pointer-events-auto group/hotspot1">
                  <div className="w-4 h-4 bg-accent rounded-full shadow-[0_0_20px_rgba(201,168,76,0.8)] animate-ping absolute" />
                  <div className="w-4 h-4 bg-white rounded-full relative z-10 cursor-pointer" />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-48 p-4 bg-background/60 backdrop-blur-2xl border border-white/10 rounded-2xl opacity-0 translate-y-2 group-hover/hotspot1:opacity-100 group-hover/hotspot1:translate-y-0 transition-all duration-700 pointer-events-none">
                    <p className="text-[11px] text-text font-serif tracking-premium mb-2">Texture Soyeuse</p>
                    <p className="text-[10px] text-text-muted leading-relaxed tracking-wide">Séchage lent à l'ombre pour préserver les terpènes.</p>
                  </div>
                </div>

                {/* Hotspot 2: Purity */}
                <div className="absolute bottom-[25%] right-[35%] pointer-events-auto group/hotspot2">
                  <div className="w-4 h-4 bg-accent rounded-full shadow-[0_0_20px_rgba(201,168,76,0.8)] animate-ping absolute" />
                  <div className="w-4 h-4 bg-white rounded-full relative z-10 cursor-pointer" />
                  
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-6 w-48 p-4 bg-background/60 backdrop-blur-2xl border border-white/10 rounded-2xl opacity-0 -translate-y-2 group-hover/hotspot2:opacity-100 group-hover/hotspot2:translate-y-0 transition-all duration-700 pointer-events-none">
                    <p className="text-[11px] text-text font-serif tracking-premium mb-2">100% Botanique</p>
                    <p className="text-[10px] text-text-muted leading-relaxed tracking-wide">Zéro tabac, zéro nicotine, zéro agent de texture.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Badge Overlay */}
            <div className="absolute top-12 right-12 md:-right-12 bg-background/40 backdrop-blur-xl border border-white/10 px-8 py-6 rounded-[2rem] shadow-2xl">
              <span className="block text-[11px] text-text-muted tracking-premium mb-2">Série Limitée</span>
              <span className="text-4xl font-serif text-text">8,90 €</span>
              <div className="text-[10px] text-accent font-bold mt-4 tracking-premium uppercase">Disponibilité immédiate</div>
            </div>
          </div>

          {/* Text Side */}
          <div className="space-y-16">
            <div className="info-reveal">
              <h2 className="font-serif text-5xl md:text-6xl mb-8 leading-tight tracking-tight">
                L'Essentiel. <br /> Sans Artifice.
              </h2>
              <p className="text-text-muted text-xl leading-relaxed font-light">
                Chaque pochon de 30G contient exclusivement des feuilles de framboisier sauvages, cueillies à maturité et séchées selon un protocole artisanal rigoureux.
              </p>
            </div>

            <div className="features-grid grid grid-cols-1 sm:grid-cols-2 gap-12">
              {[
                { title: "Zéro Nicotine", desc: "Une rupture sereine avec la dépendance physique." },
                { title: "Geste Intact", desc: "Préservez votre rituel sensoriel et social." },
                { title: "Feuille Pure", desc: "100% sauvage, sans aucun agent chimique." },
                { title: "Artisanal", desc: "Contrôlé et scellé à la main en France." }
              ].map((f, i) => (
                <div key={i} className="feature-card border-l border-accent/20 pl-8 py-3">
                  <h4 className="text-text text-[12px] font-serif tracking-premium mb-3">{f.title}</h4>
                  <p className="text-text-muted text-[11px] leading-relaxed tracking-wide italic">{f.desc}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full sm:w-auto bg-text text-background px-16 py-6 rounded-full text-[11px] tracking-premium font-bold transition-all duration-700 hover:bg-accent hover:shadow-2xl hover:shadow-accent/20 hover:scale-[1.02]"
            >
              Ajouter au Panier — Signature 30G
            </button>
          </div>
        </div>
      </section>

      {/* --- RITUAL EXPERIENCE --- */}
      <section className="relative py-64 px-6 text-center bg-[#0A0A0A]">
        {/* Subtle Depth Lines */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-white/10 to-transparent" />
        
        <div className="max-w-3xl mx-auto space-y-12">
          <h2 className="font-serif text-5xl md:text-7xl mb-8" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Le Geste de Soi.
          </h2>
          <p className="text-[#9A9590] text-xl md:text-2xl font-light italic leading-relaxed">
            "Ce n'est pas seulement une transition. C'est le moment où vous reprenez le contrôle sur vos sens, un instant à la fois."
          </p>
          <div className="pt-12">
             <Link 
               to="/about"
               className="inline-block bg-[#8b0000] text-white px-12 py-5 rounded-full text-[10px] uppercase tracking-[0.4em] font-bold transition-all duration-500 hover:brightness-125 hover:scale-105 shadow-2xl shadow-[#8b0000]/20"
             >
               Notre Histoire
             </Link>
          </div>
        </div>
      </section>

      {/* Scroll indicator for next section */}
      <div className="pb-10 flex justify-center opacity-30">
        <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent" />
      </div>
    </div>
  );
};

export default PremiumStory;
