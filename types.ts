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

// Chart Data Types
export interface SeasonalityData {
  month: string;
  availability: number;
  flower: string;
}
