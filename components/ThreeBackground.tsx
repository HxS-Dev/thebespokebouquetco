import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

const ROSE_PALETTE = [
  '#EACACD', // Soft Pink
  '#F4E1D2', // Champagne
  '#F9F1F0', // White/Blush
  '#D4A5A9', // Dusty Rose
  '#C27A7F', // Deep Mauve
];

/**
 * A single petal mesh.
 * Uses a curved Sphere geometry segment to mimic the cup shape of a rose petal.
 */
const Petal = ({ position, rotation, scale, color, roughness }: any) => {
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 16, 0, 2.8, 0, 1.3]} />
      <meshPhysicalMaterial 
        color={color} 
        side={THREE.DoubleSide} 
        roughness={roughness}
        metalness={0.0}
        sheen={1.0}
        sheenColor={color}
        clearcoat={0.1}
        transmission={0.0}
        thickness={0.1}
      />
    </mesh>
  );
};

/**
 * Interactive Rose Component.
 * Handles:
 * 1. Procedural geometry generation
 * 2. Idle floating animation
 * 3. Mouse repulsion physics
 */
const RealisticRose = ({ position: initialPos, rotation: initialRot, scale, color }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Physics State Refs
  // We use refs instead of state to update on every frame without re-rendering
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetPos = useRef(new THREE.Vector3(...initialPos));
  const timeOffset = useRef(Math.random() * 100); 

  useFrame((state) => {
    if (!groupRef.current) return;

    const { pointer, viewport, camera } = state;
    const clock = state.clock.getElapsedTime();

    // --- 1. MOUSE INTERACTION CALCULATION ---
    
    // We need to determine where the mouse is in 3D space relative to this specific flower.
    // The flower exists at a specific Z-depth.
    const depth = initialPos[2]; 
    
    // Calculate the viewport size at this specific Z-depth.
    // This accounts for perspective: viewport is smaller when closer, larger when further.
    const targetVec = new THREE.Vector3(0, 0, depth);
    const vPort = viewport.getCurrentViewport(camera, targetVec);
    
    // Map normalized pointer coordinates (-1 to 1) to world units at this depth
    const mouseX = (pointer.x * vPort.width) / 2;
    const mouseY = (pointer.y * vPort.height) / 2;
    
    const currentPos = groupRef.current.position;
    
    // Calculate distance between cursor (at depth) and flower center
    const dx = mouseX - currentPos.x;
    const dy = mouseY - currentPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Interaction settings
    // Reduced radius so cursor has to be closer (6.0 -> 4.0)
    const interactionRadius = 4.0; 
    
    if (dist < interactionRadius) {
      // Repulsion force: stronger when closer
      // Drastically lowered multiplier to limit movement distance (0.1 -> 0.03)
      const force = (interactionRadius - dist) * 0.03; 
      
      // Apply force to velocity (push away from cursor)
      velocity.current.x -= (dx / dist) * force;
      velocity.current.y -= (dy / dist) * force;
      
      // Add a 'deep' push (Z-axis) so it feels like you're pushing them into the background
      velocity.current.z -= force * 0.4;
      
      // Add dynamic rotation based on impact
      // Reduced rotation speed for elegance
      groupRef.current.rotation.x += velocity.current.y * 0.05;
      groupRef.current.rotation.y -= velocity.current.x * 0.05;
    }

    // --- 2. IDLE FLOATING ANIMATION ---
    // The "Home" position wanders slightly to create the floating effect
    const t = clock + timeOffset.current;
    const floatX = Math.cos(t * 0.5) * 0.2;
    const floatY = Math.sin(t * 1.0) * 0.3;
    const floatZ = Math.sin(t * 0.3) * 0.1;

    const homeX = targetPos.current.x + floatX;
    const homeY = targetPos.current.y + floatY;
    const homeZ = targetPos.current.z + floatZ;

    // --- 3. PHYSICS INTEGRATION ---
    // Spring Force: Pull back towards Home
    // Slightly increased spring to constrain movement range (0.015 -> 0.02)
    const springStrength = 0.02;
    velocity.current.x += (homeX - currentPos.x) * springStrength;
    velocity.current.y += (homeY - currentPos.y) * springStrength;
    velocity.current.z += (homeZ - currentPos.z) * springStrength;

    // Damping: Air resistance to stop them from oscillating forever
    // Kept high for "underwater" feel
    const damping = 0.95; 
    velocity.current.multiplyScalar(damping);

    // Apply velocity to position
    currentPos.add(velocity.current);

    // Softly dampen rotation back to original + slow spin
    const targetRotX = initialRot[0];
    const targetRotY = initialRot[1] + t * 0.1; // Slow continuous spin
    
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.02;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.02;
  });

  // Generate Petals (Memoized)
  const petals = useMemo(() => {
    const generatedPetals = [];
    const petalCount = 18; 
    const goldenAngle = 137.5 * (Math.PI / 180);

    for (let i = 0; i < petalCount; i++) {
      const theta = i * goldenAngle;
      const r = 0.2 + (0.15 * Math.sqrt(i)); 
      const y = 0.2 - (i * 0.02); 
      const xRot = i < 4 ? 0.1 + (i * 0.1) : 0.5 + (i / petalCount);
      const scaleVal = i < 4 
        ? [0.25, 0.4, 0.25] 
        : [0.4 + (i * 0.02), 0.5, 0.4 + (i * 0.02)];

      generatedPetals.push({
        position: [r * Math.cos(theta), y, r * Math.sin(theta)],
        rotation: [xRot, -theta, 0.2],
        scale: scaleVal,
        roughness: 0.5 + (i * 0.02)
      });
    }
    return generatedPetals;
  }, []);

  return (
    <group ref={groupRef} position={initialPos} rotation={initialRot} scale={scale}>
      {/* Central tight bud */}
      <mesh position={[0, 0.25, 0]} scale={[0.15, 0.25, 0.15]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshPhysicalMaterial color={color} roughness={0.7} sheen={1} />
      </mesh>
      
      {petals.map((props, i) => (
          <Petal key={i} {...props} color={color} />
      ))}
      
      {/* Sepals */}
      <group position={[0, -0.2, 0]}>
          {[0, 1, 2, 3, 4].map(k => (
            <mesh key={k} rotation={[2, 0, (k * Math.PI * 2) / 5]}>
              <coneGeometry args={[0.08, 0.6, 3]} />
              <meshStandardMaterial color="#5F6F52" roughness={0.9} />
            </mesh>
          ))}
      </group>
    </group>
  );
};

const Scene = () => {
  const roses = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 24,    // Wider X spread
        (Math.random() - 0.5) * 20,    // Wider Y spread
        (Math.random() - 0.5) * 8 - 2  // Z Depth
      ],
      rotation: [
        Math.random() * 0.5, 
        Math.random() * Math.PI * 2, 
        Math.random() * 0.2
      ],
      scale: 0.6 + Math.random() * 0.6, 
      color: ROSE_PALETTE[Math.floor(Math.random() * ROSE_PALETTE.length)]
    }));
  }, []);

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
      <directionalLight position={[-10, -5, -5]} intensity={1} color="#FFD700" />
      <hemisphereLight intensity={0.5} color="#EACACD" groundColor="#5F6F52" />
      
      {roses.map((props, i) => (
        <RealisticRose key={i} {...props} />
      ))}
      <Environment preset="city" />
    </>
  );
};

export const ThreeBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-auto opacity-100">
      <Canvas 
        eventSource={document.body}
        eventPrefix="client"
        camera={{ position: [0, 0, 15], fov: 35 }} 
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
};