import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, Float, PerspectiveCamera, PresentationControls, 
  Html, useScroll, ScrollControls, Scroll, ContactShadows 
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Pouch3D from './Pouch3D';

gsap.registerPlugin(ScrollTrigger);

// --- COMPOSANTS 3D ---

const BotanicalParticles = ({ count = 40 }) => {
  const mesh = useRef();
  const { viewport } = useThree();

  const particles = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      mesh.current.setMatrixAt(
        i,
        new THREE.Matrix4().compose(
          new THREE.Vector3(
            (xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10) / 10,
            (yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10) / 10,
            (zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10) / 10
          ),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(a, b, s)),
          new THREE.Vector3(s, s, s).multiplyScalar(0.05)
        )
      );
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color="#2d4a22" transparent opacity={0.6} side={THREE.DoubleSide} />
    </instancedMesh>
  );
};

const RitualScene = ({ scrollProgress }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      const p = Math.max(0, (scrollProgress - 0.66) / 0.34);
      groupRef.current.position.y = THREE.MathUtils.lerp(-5, 0, p);
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, -5, 0]}>
      <mesh position={[-1, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.6, 0.5, 0.8, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
    </group>
  );
};

// --- COMPOSANT PRINCIPAL ---

const EliteExperience = () => {
  const containerRef = useRef();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => trigger.kill();
  }, []);

  const hotspots = [
    { id: 1, pos: [1.2, 0.5, 0], label: "Zéro Nicotine", desc: "Pureté végétale garantie." },
    { id: 2, pos: [1.2, 0, 0], label: "Artisanal", desc: "Coupé à la main avec soin." },
    { id: 3, pos: [1.2, -0.5, 0], label: "30G", desc: "Format idéal pour la transition." },
  ];

  return (
    <div ref={containerRef} className="relative w-full h-[400vh] bg-black">
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        <Canvas shadows dpr={[1, 2]} className="bg-[#111]">
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />
          <ambientLight intensity={1.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={1.5} color="#8b0000" />
          
          <Suspense fallback={<Html center><div className="text-white">Chargement de l'univers Doiry...</div></Html>}>
            <Environment preset="night" />
            <BotanicalParticles count={60} />
            
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
              <Pouch3D scrollProgress={scrollProgress} />
            </Float>

            <RitualScene scrollProgress={scrollProgress} />

            {scrollProgress > 0.4 && scrollProgress < 0.6 && hotspots.map((h) => (
              <Html key={h.id} position={h.pos} center distanceFactor={10}>
                <div className="group relative flex items-center justify-center">
                  <div className="w-4 h-4 bg-white/20 border border-white/50 rounded-full animate-ping absolute" />
                  <div className="w-3 h-3 bg-white rounded-full relative cursor-pointer" />
                  <div className="absolute left-6 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-2xl">
                      <h4 className="text-white text-xs font-serif mb-1">{h.label}</h4>
                      <p className="text-gray-400 text-[10px] uppercase tracking-tighter">{h.desc}</p>
                    </div>
                  </div>
                </div>
              </Html>
            ))}

            <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
          </Suspense>
        </Canvas>

        {/* Hero Section Overlay */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-6 transition-all duration-1000 pointer-events-none ${scrollProgress < 0.2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <h1 className="font-serif text-6xl md:text-9xl text-white mb-6 leading-none" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Pureté <br /> Absolue.
          </h1>
          <p className="text-gray-400 text-xs md:text-sm tracking-[0.6em] uppercase mb-12">
            Transition contrôlée. 100% feuille de framboisier.
          </p>
          <button className="pointer-events-auto bg-transparent border border-white/20 hover:border-[#8b0000] text-white px-12 py-5 rounded-full text-[10px] uppercase tracking-[0.2em] transition-all duration-500 hover:bg-[#8b0000]/10 group">
            Découvrir le Rituel
          </button>
        </div>

        {/* Product Focus Section Overlay */}
        <div className={`absolute top-0 left-0 w-full h-full flex items-center px-[10%] transition-all duration-1000 pointer-events-none ${scrollProgress > 0.35 && scrollProgress < 0.6 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
          <div className="max-w-md bg-black/20 p-8 backdrop-blur-sm rounded-3xl border border-white/5">
            <span className="text-[#8b0000] text-[10px] font-bold uppercase tracking-widest mb-4 block">L'Essentiel — Base Pure</span>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6" style={{ fontFamily: "'Libre Baskerville', serif" }}>
              Le Format <br /> de Transition.
            </h2>
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-3xl text-white font-light">8,90 €</span>
              <span className="text-gray-500 text-sm line-through">12,00 €</span>
              <span className="bg-[#8b0000] text-white text-[10px] px-2 py-0.5 rounded-full ml-auto">30G</span>
            </div>
            <button className="pointer-events-auto w-full bg-[#8b0000] text-white py-4 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all duration-500 hover:brightness-125 shadow-lg shadow-[#8b0000]/20">
              Ajouter au Panier
            </button>
          </div>
        </div>

        {/* Ritual Transition Overlay */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-6 transition-all duration-1000 pointer-events-none ${scrollProgress > 0.7 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h2 className="font-serif text-5xl md:text-8xl text-white mb-8" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Le Geste de Soi.
          </h2>
          <p className="text-gray-400 text-sm md:text-xl tracking-[0.2em] max-w-2xl mx-auto leading-relaxed font-light">
            Un instant pour déconnecter. <br />
            Pour reprendre le contrôle sur vos rituels et vos sens.
          </p>
        </div>

        {/* Scroll Progress Indicator */}
        <div className="absolute bottom-10 left-10 flex flex-col gap-4">
          <div className="h-24 w-[1px] bg-white/10 relative">
            <div 
              className="absolute top-0 left-0 w-full bg-[#8b0000] transition-all duration-300"
              style={{ height: `${scrollProgress * 100}%` }}
            />
          </div>
          <span className="text-[8px] text-white/40 uppercase tracking-widest vertical-text">Scroll</span>
        </div>
      </div>
    </div>
  );
};

export default EliteExperience;
