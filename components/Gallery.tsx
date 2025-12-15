// src/components/Gallery.tsx
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ImageCarousel } from "./ImageCarousel";

export const Gallery: React.FC = () => {
  // Flower/bouquet images from Unsplash
  const sampleImages = [
    "https://images.unsplash.com/photo-1523694576729-dc99e9c0f9b4?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1497276236755-0f85ba99a126?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1523693916903-027d144a2b7d?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1539237310789-3fc92b237835?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1521543832500-49e69fb2bea2?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1559779080-6970e0186790?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&h=1000&fit=crop",
  ];

  // Calculate camera settings based on number of images
  // More images = larger radius = need more distance and wider FOV
  const radius = Math.max(8, sampleImages.length * 0.8);
  const cameraDistance = radius + 10; // Distance scales with radius
  const fov = Math.min(70, 45 + sampleImages.length * 0.8); // FOV increases with more images

  return (
    <div style={{
      width: "100vw",
      height: "800px",
      margin: 0,
      padding: 0,
      position: "relative",
      left: "50%",
      right: "50%",
      marginLeft: "-50vw",
      marginRight: "-50vw"
    }}>
      <Canvas
        camera={{ position: [0, 0, cameraDistance], fov }}
        gl={{ preserveDrawingBuffer: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ImageCarousel images={sampleImages} />
        </Suspense>
      </Canvas>
    </div>
  );
};
