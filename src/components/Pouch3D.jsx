import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Composant Pouch3D
 * Modélisation isolée du pochon Doiry Shop (Doypack)
 * 
 * Géométrie : Stand-up pouch avec centre bombé (30g) et haut scellé plat.
 * Matériau : Noir Mat Absolu (#0D0D0D).
 * Logo : Rendu procédural (Cercle + Aigle stylisé).
 */
const Pouch3D = ({ scrollProgress = 0 }) => {
  const pouchRef = useRef();
  const materialRef = useRef();

  // Création d'une géométrie personnalisée pour le "Doypack"
  const pouchGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, -0.7);
    shape.lineTo(0.5, -0.7);
    shape.quadraticCurveTo(0.6, 0, 0.5, 0.7);
    shape.lineTo(-0.5, 0.7);
    shape.quadraticCurveTo(-0.6, 0, -0.5, -0.7);

    const extrudeSettings = {
      steps: 2,
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 5
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Matériau Noir Mat Élite
  const pouchMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0D0D0D",
    roughness: 0.85,
    metalness: 0.0,
    transparent: true,
    flatShading: false
  }), []);

  // Logique de transformation cinématique basée sur le scroll
  useFrame((state) => {
    if (pouchRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Scene 1: Hero (0 - 0.33)
      // Scene 2: Focus (0.33 - 0.66)
      // Scene 3: Ritual (0.66 - 1.0)

      if (scrollProgress < 0.33) {
        // Flottement et rotation douce
        pouchRef.current.rotation.y = Math.sin(t / 2) * 0.1 + (scrollProgress * Math.PI * 2);
        pouchRef.current.position.y = Math.sin(t) * 0.1;
        pouchRef.current.position.x = 0;
        pouchRef.current.scale.setScalar(1 + scrollProgress);
        pouchMaterial.opacity = 1;
      } else if (scrollProgress < 0.66) {
        // Pivot pour focus technique
        const p = (scrollProgress - 0.33) / 0.33;
        pouchRef.current.rotation.y = Math.PI + (p * Math.PI);
        pouchRef.current.position.x = THREE.MathUtils.lerp(0, 1.5, p);
        pouchRef.current.position.y = 0;
        pouchRef.current.scale.setScalar(2);
        pouchMaterial.opacity = 1;
      } else {
        // Sortie de scène vers le haut
        const p = (scrollProgress - 0.66) / 0.34;
        pouchRef.current.position.y = THREE.MathUtils.lerp(0, 5, p);
        pouchRef.current.position.x = 1.5;
        pouchRef.current.rotation.x = p * 2;
        pouchMaterial.opacity = 1 - p;
      }

      // Respiration subtile
      pouchRef.current.scale.z = pouchRef.current.scale.x * (1 + Math.sin(t * 1.5) * 0.02);
    }
  });

  return (
    <group ref={pouchRef}>
      {/* Corps principal du pochon */}
      <mesh geometry={pouchGeometry} material={pouchMaterial} castShadow receiveShadow />

      {/* Bande de scellage supérieure (Zip) */}
      <mesh position={[0, 0.65, 0.15]} castShadow>
        <boxGeometry args={[1.05, 0.1, 0.05]} />
        <meshStandardMaterial color="#151515" roughness={0.6} metalness={0.1} transparent opacity={pouchMaterial.opacity} />
      </mesh>

      {/* LOGO PROCEDURAL (Face Avant) */}
      <group position={[0, 0.1, 0.26]}>
        <mesh>
          <circleGeometry args={[0.22, 32]} />
          <meshStandardMaterial color="#050505" roughness={0.5} transparent opacity={pouchMaterial.opacity} />
        </mesh>
        
        <group scale={0.15} position={[0, 0.02, 0.01]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color="#8b0000" emissive="#4b0000" emissiveIntensity={0.5} transparent opacity={pouchMaterial.opacity} />
          </mesh>
          <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <planeGeometry args={[1.2, 0.4]} />
            <meshStandardMaterial color="#8b0000" transparent opacity={pouchMaterial.opacity} />
          </mesh>
          <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0, Math.PI / 6]}>
            <planeGeometry args={[1.2, 0.4]} />
            <meshStandardMaterial color="#8b0000" transparent opacity={pouchMaterial.opacity} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <circleGeometry args={[0.2, 16]} />
            <meshStandardMaterial color="#8b0000" transparent opacity={pouchMaterial.opacity} />
          </mesh>
        </group>

        <mesh position={[0, 0, -0.001]}>
          <ringGeometry args={[0.23, 0.25, 32]} />
          <meshStandardMaterial color="#222" transparent opacity={0.3 * pouchMaterial.opacity} />
        </mesh>
      </group>
    </group>
  );
};

export default Pouch3D;
