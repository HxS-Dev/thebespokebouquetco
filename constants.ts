import { Product, SeasonalityData } from './types';

// Mocking Sanity Content (In a real app, this would be fetched from Sanity)
export const MOCK_PRODUCTS: Product[] = [
  {
    _id: '1',
    name: "The Victorian Rose",
    price: 85,
    description: "A classic arrangement of dusty pink roses and eucalyptus.",
    imageUrl: "https://picsum.photos/id/400/800/800",
    tags: ["Romantic", "Classic"]
  },
  {
    _id: '2',
    name: "Wildflower Meadow",
    price: 65,
    description: "An untamed mix of seasonal stems, bringing the countryside indoors.",
    imageUrl: "https://picsum.photos/id/306/800/800",
    tags: ["Rustic", "Wild"]
  },
  {
    _id: '3',
    name: "White Elegance",
    price: 120,
    description: "Pristine white lilies and orchids for a sophisticated touch.",
    imageUrl: "https://picsum.photos/id/152/800/800",
    tags: ["Modern", "Luxury"]
  },
  {
    _id: '4',
    name: "Autumn Whisper",
    price: 75,
    description: "Burnt orange roses mixed with dried wheat and berries.",
    imageUrl: "https://picsum.photos/id/106/800/800",
    tags: ["Seasonal", "Warm"]
  }
];

export const SEASONALITY_DATA: SeasonalityData[] = [
  { month: 'Jan', availability: 40, flower: 'Carnation' },
  { month: 'Feb', availability: 60, flower: 'Rose' },
  { month: 'Mar', availability: 80, flower: 'Tulip' },
  { month: 'Apr', availability: 95, flower: 'Peony' },
  { month: 'May', availability: 100, flower: 'Peony' },
  { month: 'Jun', availability: 90, flower: 'Rose' },
  { month: 'Jul', availability: 85, flower: 'Sunflower' },
  { month: 'Aug', availability: 80, flower: 'Dahlia' },
  { month: 'Sep', availability: 70, flower: 'Dahlia' },
  { month: 'Oct', availability: 60, flower: 'Marigold' },
  { month: 'Nov', availability: 50, flower: 'Chrysanthemum' },
  { month: 'Dec', availability: 45, flower: 'Holly' },
];

export const SANITY_CONFIG = {
  projectId: 'mock_project_id',
  dataset: 'production'
};
