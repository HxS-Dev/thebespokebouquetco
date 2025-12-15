// src/components/ImageCarousel.tsx
import React, { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";

interface ImageCarouselProps {
  images?: string[];
  radius?: number;
  imageWidth?: number;
  imageHeight?: number;
  friction?: number;
  dragSensitivity?: number;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images = [
    "https://picsum.photos/seed/1/800/1000",
    "https://picsum.photos/seed/2/800/1000",
    "https://picsum.photos/seed/3/800/1000",
    "https://picsum.photos/seed/4/800/1000",
    "https://picsum.photos/seed/5/800/1000",
  ],
  radius: customRadius,
  imageWidth = 3.5,
  imageHeight = 4.5,
  friction = 0.95,
  dragSensitivity = 0.05,
}) => {
  // Calculate radius based on number of images to prevent overlap
  const radius = customRadius || Math.max(8, images.length * 0.8);
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const [currentIndex, setCurrentIndex] = useState(0);

  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const isDragging = useRef(false);
  const lastMouseX = useRef(0);

  const textures = useLoader(TextureLoader, images);
  textures.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  // Create rounded rectangle shape for the cards
  const cardShape = useMemo(() => {
    const shape = new THREE.Shape();
    const cornerRadius = 0.3;
    const width = imageWidth;
    const height = imageHeight;

    shape.moveTo(-width / 2 + cornerRadius, -height / 2);
    shape.lineTo(width / 2 - cornerRadius, -height / 2);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + cornerRadius);
    shape.lineTo(width / 2, height / 2 - cornerRadius);
    shape.quadraticCurveTo(width / 2, height / 2, width / 2 - cornerRadius, height / 2);
    shape.lineTo(-width / 2 + cornerRadius, height / 2);
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - cornerRadius);
    shape.lineTo(-width / 2, -height / 2 + cornerRadius);
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + cornerRadius, -height / 2);

    return shape;
  }, [imageWidth, imageHeight]);

  // Create UV mapping for the shape to fill the entire texture
  const generateUVs = (geometry: THREE.ExtrudeGeometry) => {
    const pos = geometry.attributes.position;
    const uvs = [];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Map coordinates to 0-1 range based on image dimensions
      const u = (x + imageWidth / 2) / imageWidth;
      const v = (y + imageHeight / 2) / imageHeight;

      uvs.push(u, v);
    }

    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  };

  // --- Pointer Handlers ---
  const handlePointerDown = (e: MouseEvent | TouchEvent) => {
    isDragging.current = true;
    lastMouseX.current = "touches" in e ? e.touches[0].clientX : e.clientX;
    gl.domElement.style.cursor = "grabbing";
  };

  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;
    const currentX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - lastMouseX.current;
    velocityRef.current += deltaX * dragSensitivity * 0.01;
    lastMouseX.current = currentX;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    gl.domElement.style.cursor = "grab";
  };

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.cursor = "grab";

    canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("mouseup", handlePointerUp);
    canvas.addEventListener("mouseleave", handlePointerUp);

    canvas.addEventListener("touchstart", handlePointerDown, { passive: true });
    canvas.addEventListener("touchmove", handlePointerMove, { passive: false });
    canvas.addEventListener("touchend", handlePointerUp);

    return () => {
      canvas.removeEventListener("mousedown", handlePointerDown);
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("mouseup", handlePointerUp);
      canvas.removeEventListener("mouseleave", handlePointerUp);
      canvas.removeEventListener("touchstart", handlePointerDown);
      canvas.removeEventListener("touchmove", handlePointerMove);
      canvas.removeEventListener("touchend", handlePointerUp);
    };
  }, [gl.domElement]);

  // --- Animate ---
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Auto-rotate when not dragging - speed scales with number of images
    // More images = slower rotation to give each image time to be viewed
    const baseSpeed = 0.0003;
    const speedMultiplier = Math.max(0.5, 10 / images.length); // Slower with more images
    if (!isDragging.current) {
      velocityRef.current += baseSpeed * speedMultiplier;
    }

    velocityRef.current *= Math.pow(friction, delta * 60);
    rotationRef.current += velocityRef.current * delta * 60;
    groupRef.current.rotation.y = rotationRef.current;

    const anglePerImage = (Math.PI * 2) / images.length;
    const normalizedAngle = ((-rotationRef.current + Math.PI * 2) % (Math.PI * 2));
    const newIndex = Math.round(normalizedAngle / anglePerImage) % images.length;
    if (newIndex !== currentIndex) setCurrentIndex(newIndex);
  });

  return (
    <group ref={groupRef}>
      {images.map((image, idx) => {
        const angle = (idx * Math.PI * 2) / images.length;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        // Calculate distance from center/front for depth effects
        const relativeIndex = Math.abs((idx - currentIndex + images.length) % images.length);
        const isCurrent = relativeIndex === 0;
        const isAdjacent = relativeIndex === 1 || relativeIndex === images.length - 1;

        // Enhanced depth-based effects
        const yPos = 0; // No vertical offset
        const opacity = isCurrent ? 1 : isAdjacent ? 0.85 : 0.6;

        return (
          <group key={idx} position={[x, yPos, z]} rotation={[0, angle, 0]}>
            {/* Main image with rounded corners - double sided */}
            <mesh>
              <extrudeGeometry
                args={[
                  cardShape,
                  {
                    depth: 0.05,
                    bevelEnabled: false,
                  },
                ]}
                onUpdate={(geometry) => generateUVs(geometry)}
              />
              <meshStandardMaterial
                map={textures[idx]}
                transparent
                opacity={opacity}
                roughness={0.3}
                metalness={0}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      {/* Enhanced lighting for glass effect */}
      <ambientLight intensity={0.5} color="#ffffff" />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#e6f0ff" />
      <pointLight position={[0, 5, 0]} intensity={1.5} color="#ffffff" decay={2} />

      {/* Backlighting for depth */}
      <pointLight position={[0, 2, -radius - 2]} intensity={0.6} color="#8899ff" decay={2} />
    </group>
  );
};
