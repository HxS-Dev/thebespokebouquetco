import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three-stdlib';

const ROSE_PALETTE = [
  '#EACACD', // Soft Pink
  '#F4E1D2', // Champagne
  '#F9F1F0', // White/Blush
  '#D4A5A9', // Dusty Rose
  '#C27A7F', // Deep Mauve
];

/**
 * Loads a single OBJ and centers/scales it
 */
const useCenteredObj = (url: string, scale: number = 1) => {
  const obj = useLoader(OBJLoader, url);

  // Center geometry
  const box = new THREE.Box3().setFromObject(obj);
  const center = new THREE.Vector3();
  box.getCenter(center);
  obj.position.sub(center);

  // Scale geometry
  obj.scale.set(scale, scale, scale);

  // Apply basic material to all meshes
  obj.traverse((child: any) => {
    if (child.isMesh) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: '#fff',
        roughness: 0.5,
        metalness: 0,
        side: THREE.DoubleSide,
        sheen: 1,
      });
    }
  });

  return obj;
};

/**
 * Instanced floating flowers
 */
const FloatingFlowers: React.FC<{ count: number }> = ({ count }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const obj = useCenteredObj('/flower.obj', 0.05);

  // Create dummy object for instancing
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Store instance velocities
  const velocities = useMemo(
    () => Array.from({ length: count }).map(() => new THREE.Vector3(0, 0, 0)),
    [count]
  );

  // Generate initial positions, rotations, scales, and colors
  const instances = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 10 - 2
      ),
      rotation: new THREE.Euler(
        Math.random() * 0.5,
        Math.random() * Math.PI * 2,
        Math.random() * 0.2
      ),
      scale: 0.6 + Math.random() * 0.6,
      color: new THREE.Color(ROSE_PALETTE[Math.floor(Math.random() * ROSE_PALETTE.length)])
    }));
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const { pointer, viewport, camera } = state;
    const clock = state.clock.getElapsedTime();

    const vPort = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, 0));

    instances.forEach((inst, i) => {
      const vel = velocities[i];

      // Mouse repulsion
      const dx = (pointer.x * vPort.width) / 2 - inst.position.x;
      const dy = (pointer.y * vPort.height) / 2 - inst.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const interactionRadius = 4;
      if (dist < interactionRadius) {
        const force = (interactionRadius - dist) * 0.03;
        vel.x -= (dx / dist) * force;
        vel.y -= (dy / dist) * force;
        vel.z -= force * 0.4;
      }

      // Floating
      const t = clock + i * 10;
      const floatX = Math.cos(t * 0.5) * 0.2;
      const floatY = Math.sin(t * 1.0) * 0.3;
      const floatZ = Math.sin(t * 0.3) * 0.1;

      const homeX = inst.position.x + floatX;
      const homeY = inst.position.y + floatY;
      const homeZ = inst.position.z + floatZ;

      const springStrength = 0.02;
      vel.x += (homeX - inst.position.x) * springStrength;
      vel.y += (homeY - inst.position.y) * springStrength;
      vel.z += (homeZ - inst.position.z) * springStrength;

      vel.multiplyScalar(0.95);
      inst.position.add(vel);

      // Rotation drift
      inst.rotation.x += (Math.sin(t * 0.1) - inst.rotation.x) * 0.02;
      inst.rotation.y += (Math.cos(t * 0.1) - inst.rotation.y) * 0.02;

      // Update instanced mesh
      dummy.position.copy(inst.position);
      dummy.rotation.copy(inst.rotation);
      dummy.scale.setScalar(inst.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, inst.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if ((meshRef.current as any).instanceColor) (meshRef.current as any).instanceColor.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[obj.children[0].geometry, undefined, count]} />;
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
      <directionalLight position={[-10, -5, -5]} intensity={1} color="#FFD700" />
      <hemisphereLight intensity={0.5} color="#EACACD" groundColor="#5F6F52" />

      <FloatingFlowers count={50} />

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
        camera={{ position: [0, 0, 20], fov: 35 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
};
