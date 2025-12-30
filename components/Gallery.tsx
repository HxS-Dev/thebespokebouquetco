// src/components/Gallery.tsx
import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ImageCarousel } from "./ImageCarousel";
import { CarouselImageModal } from "./CarouselImageModal";
import { fetchCarouselImages } from "../services/sanity";
import { CarouselImage } from "../types";

export const Gallery: React.FC = () => {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<CarouselImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadCarouselImages = async () => {
      const images = await fetchCarouselImages();
      const sortedImages = images.sort((a, b) => a.order - b.order);
      setCarouselImages(sortedImages);
    };
    loadCarouselImages();
  }, []);

  // Extract image URLs from carousel images
  const sampleImages = carouselImages.map(img => img.image.asset.url);

  // Handle image click
  const handleImageClick = (index: number) => {
    setSelectedImage(carouselImages[index]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedImage(null), 150); // Clear after animation
  };

  // Calculate camera settings based on number of images
  // More images = larger radius = need more distance and wider FOV
  const radius = Math.max(8, sampleImages.length * 0.8);
  const cameraDistance = radius + 5; // Much closer camera for tighter framing
  const fov = 90; // Maximum FOV to fill vertical space completely

  // Don't render carousel until images are loaded
  if (sampleImages.length === 0) {
    return (
      <div style={{
        width: "100vw",
        height: "750px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <p>Loading gallery...</p>
      </div>
    );
  }

  return (
    <>
      <div style={{
        width: "100vw",
        height: "750px",
        margin: 0,
        padding: 0,
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw"
      }}>
        <Canvas
          camera={{ position: [0, -0.5, cameraDistance], fov }}
          gl={{ preserveDrawingBuffer: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <ImageCarousel images={sampleImages} onImageClick={handleImageClick} />
          </Suspense>
        </Canvas>
      </div>

      {/* Modal for displaying image details */}
      <CarouselImageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        image={selectedImage}
      />
    </>
  );
};
