import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { Product, CarouselImage } from '../types';

// Initialize Sanity client
export const client = createClient({
  projectId: 'il3vdy77',
  dataset: 'production',
  useCdn: true, // Use CDN for faster response times
  apiVersion: '2024-01-01', // Use current date for latest features
});

// Image URL builder
const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// Fetch products from Sanity
export const fetchProducts = async (): Promise<Product[]> => {
  const query = `*[_type == "product"] | order(order asc) {
    _id,
    name,
    price,
    description,
    "imageUrl": image.asset->url,
    tags
  }`;

  return await client.fetch(query);
};

// Fetch page content from Sanity
export const fetchPageContent = async () => {
  const query = `*[_type == "pageContent"][0] {
    title,
    heroText,
    aboutText
  }`;

  return await client.fetch(query);
};

// Fetch carousel images from Sanity
export const fetchCarouselImages = async (): Promise<CarouselImage[]> => {
  const query = `*[_type == "carouselImage"] | order(order asc) {
    _id,
    title,
    description,
    image {
      asset-> {
        url
      },
      alt
    },
    order
  }`;

  return await client.fetch(query);
};
