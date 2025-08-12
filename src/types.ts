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
  status: 'idle' | 'discovering-brands' | 'analyzing-brand1' | 'analyzing-brand2' | 'finalizing' | 'completed' | 'error';
  currentStep: string;
  progress: number;
  brand1Progress: number;
  brand2Progress: number;
  error?: string;
  
  // Detailed progress information
  brandsFound: number;
  totalBrandsExpected: number;
  brand1ProductsFound: number;
  brand2ProductsFound: number;
  currentBrandBeingAnalyzed?: string;
  
  // Step-by-step details
  steps: {
    brandDiscovery: {
      status: 'pending' | 'in-progress' | 'completed' | 'error';
      brandsFound: number;
      message: string;
    };
    brand1Analysis: {
      status: 'pending' | 'in-progress' | 'completed' | 'error';
      productsFound: number;
      message: string;
    };
    brand2Analysis: {
      status: 'pending' | 'in-progress' | 'completed' | 'error';
      productsFound: number;
      message: string;
    };
  };
}