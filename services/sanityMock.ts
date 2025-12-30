import { MOCK_PRODUCTS } from '../constants';
import { Product, CarouselImage } from '../types';

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

export const fetchCarouselImages = async (): Promise<CarouselImage[]> => {
  // Mock carousel images data
  const mockCarouselImages: CarouselImage[] = [
    {
      _id: '1',
      title: 'Spring Blooms',
      description: 'Beautiful spring flowers',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1523694576729-dc99e9c0f9b4?w=800&h=1000&fit=crop'
        },
        alt: 'Spring bouquet'
      },
      order: 1
    },
    {
      _id: '2',
      title: 'Rose Garden',
      description: 'Elegant roses',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1497276236755-0f85ba99a126?w=800&h=1000&fit=crop'
        },
        alt: 'Rose arrangement'
      },
      order: 2
    },
    {
      _id: '3',
      title: 'Summer Collection',
      description: 'Vibrant summer flowers',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1523693916903-027d144a2b7d?w=800&h=1000&fit=crop'
        },
        alt: 'Summer bouquet'
      },
      order: 3
    },
    {
      _id: '4',
      title: 'Autumn Harvest',
      description: 'Warm autumn tones',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1539237310789-3fc92b237835?w=800&h=1000&fit=crop'
        },
        alt: 'Autumn arrangement'
      },
      order: 4
    },
    {
      _id: '5',
      title: 'Classic Elegance',
      description: 'Timeless beauty',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1521543832500-49e69fb2bea2?w=800&h=1000&fit=crop'
        },
        alt: 'Classic bouquet'
      },
      order: 5
    },
    {
      _id: '6',
      title: 'Garden Fresh',
      description: 'Fresh from the garden',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1559779080-6970e0186790?w=800&h=1000&fit=crop'
        },
        alt: 'Garden flowers'
      },
      order: 6
    },
    {
      _id: '7',
      title: 'Wildflower Mix',
      description: 'Natural wildflowers',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=1000&fit=crop'
        },
        alt: 'Wildflower bouquet'
      },
      order: 7
    },
    {
      _id: '8',
      title: 'Romantic Roses',
      description: 'Perfect for romance',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&h=1000&fit=crop'
        },
        alt: 'Romantic roses'
      },
      order: 8
    },
    {
      _id: '9',
      title: 'Pastel Dreams',
      description: 'Soft pastel colors',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=800&h=1000&fit=crop'
        },
        alt: 'Pastel bouquet'
      },
      order: 9
    },
    {
      _id: '10',
      title: 'Modern Minimalist',
      description: 'Clean and simple',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=800&h=1000&fit=crop'
        },
        alt: 'Minimalist arrangement'
      },
      order: 10
    },
    {
      _id: '11',
      title: 'Country Charm',
      description: 'Rustic beauty',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=1000&fit=crop'
        },
        alt: 'Country bouquet'
      },
      order: 11
    },
    {
      _id: '12',
      title: 'Tropical Paradise',
      description: 'Exotic tropical flowers',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&h=1000&fit=crop'
        },
        alt: 'Tropical arrangement'
      },
      order: 12
    },
    {
      _id: '13',
      title: 'Vintage Style',
      description: 'Classic vintage look',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&h=1000&fit=crop'
        },
        alt: 'Vintage bouquet'
      },
      order: 13
    },
    {
      _id: '14',
      title: 'Bold & Bright',
      description: 'Vibrant colors',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=800&h=1000&fit=crop'
        },
        alt: 'Bright bouquet'
      },
      order: 14
    },
    {
      _id: '15',
      title: 'Soft Petals',
      description: 'Delicate arrangements',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&h=1000&fit=crop'
        },
        alt: 'Delicate flowers'
      },
      order: 15
    },
    {
      _id: '16',
      title: 'Garden Party',
      description: 'Celebration ready',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=800&h=1000&fit=crop'
        },
        alt: 'Party bouquet'
      },
      order: 16
    },
    {
      _id: '17',
      title: 'Petal Perfect',
      description: 'Perfectly arranged',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&h=1000&fit=crop'
        },
        alt: 'Perfect arrangement'
      },
      order: 17
    },
    {
      _id: '18',
      title: 'Nature\'s Beauty',
      description: 'Natural elegance',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=1000&fit=crop'
        },
        alt: 'Natural bouquet'
      },
      order: 18
    },
    {
      _id: '19',
      title: 'Sunset Hues',
      description: 'Warm sunset colors',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=800&h=1000&fit=crop'
        },
        alt: 'Sunset arrangement'
      },
      order: 19
    },
    {
      _id: '20',
      title: 'Pure & Simple',
      description: 'Simple elegance',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&h=1000&fit=crop'
        },
        alt: 'Simple bouquet'
      },
      order: 20
    }
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCarouselImages);
    }, 600);
  });
};
