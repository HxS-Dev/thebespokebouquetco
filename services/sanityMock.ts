import { MOCK_PRODUCTS } from '../constants';
import { Product } from '../types';

// In a real implementation, we would use the @sanity/client
// const client = createClient({ ... });

export const fetchProducts = async (): Promise<Product[]> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_PRODUCTS);
    }, 800);
  });
};

export const fetchPageContent = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: "The Bespoke Bouquet Co.",
        heroText: "Nature's Artistry, Hand-Tied.",
        aboutText: "We believe every petal tells a story. Sourced from sustainable local gardens."
      });
    }, 600);
  });
};
