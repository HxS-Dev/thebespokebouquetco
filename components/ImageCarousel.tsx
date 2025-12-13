import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";

interface ImageCarouselProps {
  images: string[]; // URLs to your images
  radius?: number;  // distance from center
  rotationSpeed?: number; // carousel rotation speed
}

const CarouselItem: React.FC<{ image: string; angle: number; radius: number }> = ({ image, angle, radius }) => {
  const mesh = useRef<Mesh>(null);
  const texture = useLoader(TextureLoader, image);

  // position each image in a circle
  const x = radius * Math.sin(angle);
  const z = radius * Math.cos(angle);

  return (
    <mesh ref={mesh} position={[x, 0, z]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  radius = 3,
  rotationSpeed = 0.01,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed;
    }
  });

  const angleStep = (2 * Math.PI) / images.length;

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <group ref={groupRef}>
        {images.map((img, index) => (
          <CarouselItem
            key={index}
            image={img}
            angle={index * angleStep}
            radius={radius}
          />
        ))}
      </group>
    </Canvas>
  );
};