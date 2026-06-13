import React, { useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PerspectiveCamera, PresentationControls } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Composant de transition/placeholder pour la scène 3D
const Scene3D = () => {
  const meshRef = useRef();

  // Animation de rotation légère continue
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t / 4) * 0.2;
      meshRef.current.position.y = Math.sin(t / 2) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* 
          Zone prête à recevoir le modèle 3D du pochon.
          Utilisation d'un volume invisible ou d'un repère pour l'instant.
      */}
      <mesh>
        <boxGeometry args={[1, 1.5, 0.5]} />
        <meshStandardMaterial color="#0a0a0a" transparent opacity={0} />
      </mesh>
    </group>
  );
};

const HeroPremium = () => {
  const containerRef = useRef();
  const titleRef = useRef();
  const subtitleRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation d'entrée pour le titre
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1.5,
        ease: "power4.out",
        delay: 0.5
      });

      // Animation d'entrée pour le sous-titre
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1.5,
        ease: "power3.out",
        delay: 0.8
      });

      // Animation d'entrée pour le canvas 3D
      gsap.from(canvasRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 2,
        ease: "power2.out",
        delay: 0.2
      });

      // Effet de scroll parallaxe sur le texte et la 3D
      gsap.to(canvasRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: 100,
        rotateZ: 5,
      });

      gsap.to(titleRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: -50,
        opacity: 0.3,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center pt-20"
    >
      {/* Arrière-plan texturé subtil (CSS pur) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1a1a1a_0%,_transparent_70%)]" />
      </div>

      {/* Conteneur 3D Immersif */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing"
      >
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b0000" /> {/* Accent bordeaux */}
          
          <Suspense fallback={null}>
            <PresentationControls
              global
              config={{ mass: 2, tension: 500 }}
              snap={{ mass: 4, tension: 1500 }}
              rotation={[0, 0, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
            >
              <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <Scene3D />
              </Float>
            </PresentationControls>
            <Environment preset="night" />
          </Suspense>
        </Canvas>
      </div>

      {/* Contenu Textuel de Luxe */}
      <div className="relative z-10 container mx-auto px-6 text-center pointer-events-none">
        <div className="max-w-4xl mx-auto">
          <h1 
            ref={titleRef}
            className="font-serif text-5xl md:text-8xl text-white leading-tight tracking-tight mb-8"
            style={{ fontFamily: "'Libre Baskerville', serif" }}
          >
            L'Essence de la <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 italic">
              Sérénité Botanique
            </span>
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-gray-400 text-lg md:text-xl font-light tracking-widest uppercase max-w-xl mx-auto leading-relaxed"
          >
            Une alternative végétale sans compromis. <br />
            Le rituel, réinventé pour votre transition.
          </p>
        </div>
      </div>

      {/* Indicateur de Scroll Minimaliste */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        <span className="text-[10px] text-white tracking-[0.3em] uppercase">Découvrir</span>
      </div>
    </section>
  );
};

export default HeroPremium;
