export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  tags: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface SanityConfig {
  projectId: string;
  dataset: string;
}

export interface BouquetSize {
  _id: string;
  name: string;
  numberOfRoses: number;
  price: number;
}

export interface AddOn {
  _id: string;
  name: string;
  price?: number;
  requiresExtraInfo: boolean;
}

export interface CarouselImage {
  _id: string;
  title: string;
  description: string;
  image: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  order: number;
  bouquetSizes?: BouquetSize[];
  addOns?: AddOn[];
}

export interface CustomOrder {
  carouselImage: CarouselImage;
  selectedSize: BouquetSize;
  selectedAddOns: AddOn[];
  addOnDetails: { [addOnId: string]: string };
  quantity: number;
}

export interface CartItemCustom {
  _id: string;
  name: string;
  imageUrl: string;
  size: BouquetSize;
  addOns: AddOn[];
  addOnDetails: { [addOnId: string]: string };
  quantity: number;
  totalPrice: number;
}

export interface Testimonial {
  _id: string;
  image: {
    asset: {
      url: string;
    };
  };
  order: number;
}

// Chart Data Types
export interface SeasonalityData {
  month: string;
  availability: number;
  flower: string;
}
