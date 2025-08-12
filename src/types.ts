export interface Brand {
  id: string;
  name: string;
  website: string;
  description?: string;
  categories?: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price?: number;
  availability: string;
  brand: string;
  url?: string;
  description?: string;
  imageUrl?: string;
}

export interface GapAnalysisResult {
  brand1Products: Product[];
  brand2Products: Product[];
  uniqueToBrand1: Product[];
  uniqueToBrand2: Product[];
  commonProducts: Array<{
    brand1Product: Product;
    brand2Product: Product;
    priceDifference?: number;
  }>;
  categories: string[];
  summary: {
    totalBrand1: number;
    totalBrand2: number;
    uniqueBrand1Count: number;
    uniqueBrand2Count: number;
    commonCount: number;
  };
}

export interface AnalysisProgress {
  status: 'idle' | 'scraping' | 'analyzing' | 'completed' | 'error';
  currentStep: string;
  progress: number;
  brand1Progress: number;
  brand2Progress: number;
  error?: string;
}