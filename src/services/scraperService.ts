import type { Brand, Product, GapAnalysisResult, AnalysisProgress } from '../types';
import { tavilyService } from './tavilyService';

// Mock data for demonstration - in a real app, this would scrape actual websites
const MOCK_BRANDS: Brand[] = [
  { id: 'bosch', name: 'Bosch', website: 'https://www.autodoc.de/search?keyword=bosch' },
  { id: 'mann-filter', name: 'MANN-FILTER', website: 'https://www.autodoc.de/search?keyword=mann-filter' },
  { id: 'febi', name: 'febi bilstein', website: 'https://www.autodoc.de/search?keyword=febi' },
  { id: 'sachs', name: 'SACHS', website: 'https://www.autodoc.de/search?keyword=sachs' },
  { id: 'continental', name: 'Continental', website: 'https://www.autodoc.de/search?keyword=continental' },
  { id: 'valeo', name: 'Valeo', website: 'https://www.autodoc.de/search?keyword=valeo' },
  { id: 'mahle', name: 'MAHLE', website: 'https://www.autodoc.de/search?keyword=mahle' },
  { id: 'pierburg', name: 'PIERBURG', website: 'https://www.autodoc.de/search?keyword=pierburg' },
];

// Mock product categories
const CATEGORIES = [
  'Engine Parts',
  'Brake System',
  'Suspension',
  'Filters',
  'Electrical',
  'Cooling System',
  'Exhaust System',
  'Transmission',
  'Steering',
  'Body Parts'
];

// Generate mock products for a brand
const generateMockProducts = (brand: Brand, count: number = 50): Product[] => {
  const products: Product[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const productTypes = {
      'Engine Parts': ['Oil Filter', 'Air Filter', 'Spark Plug', 'Timing Belt', 'Water Pump'],
      'Brake System': ['Brake Pad', 'Brake Disc', 'Brake Fluid', 'Brake Caliper', 'Brake Hose'],
      'Suspension': ['Shock Absorber', 'Spring', 'Strut Mount', 'Control Arm', 'Stabilizer Link'],
      'Filters': ['Oil Filter', 'Air Filter', 'Fuel Filter', 'Cabin Filter', 'Hydraulic Filter'],
      'Electrical': ['Battery', 'Alternator', 'Starter', 'Ignition Coil', 'Sensor'],
      'Cooling System': ['Radiator', 'Thermostat', 'Water Pump', 'Cooling Fan', 'Hose'],
      'Exhaust System': ['Muffler', 'Catalytic Converter', 'Exhaust Pipe', 'Lambda Sensor', 'Gasket'],
      'Transmission': ['Transmission Oil', 'Clutch Kit', 'CV Joint', 'Drive Shaft', 'Gear Oil'],
      'Steering': ['Power Steering Pump', 'Steering Rack', 'Tie Rod', 'Ball Joint', 'Steering Fluid'],
      'Body Parts': ['Headlight', 'Mirror', 'Bumper', 'Door Handle', 'Window Regulator']
    };
    
    const typeOptions = productTypes[category as keyof typeof productTypes] || ['Generic Part'];
    const productType = typeOptions[Math.floor(Math.random() * typeOptions.length)];
    
    products.push({
      id: `${brand.id}-${i + 1}`,
      name: `${brand.name} ${productType} ${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      category,
      price: Math.round((Math.random() * 200 + 10) * 100) / 100,
      availability: Math.random() > 0.1 ? 'Available' : 'Out of Stock', // 90% availability
      brand: brand.name,
      url: `${brand.website}&product=${i + 1}`,
      description: `High-quality ${productType.toLowerCase()} from ${brand.name}`,
      imageUrl: `https://via.placeholder.com/200x150?text=${brand.name}+${productType.replace(' ', '+')}`
    });
  }
  
  return products;
};

export class ScraperService {
  static getBrands(): Brand[] {
    return MOCK_BRANDS;
  }

  static async scrapeProducts(
    brand: Brand, 
    onProgress?: (progress: number) => void
  ): Promise<Product[]> {
    // Simulate scraping delay
    const products = generateMockProducts(brand);
    
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress?.(i);
    }
    
    return products;
  }

  static async performComprehensiveAnalysis(
    storeUrl: string,
    brand1Name: string,
    brand2Name: string,
    onProgress?: (progress: AnalysisProgress) => void
  ): Promise<GapAnalysisResult> {
    // Set up progress callback
    if (onProgress) {
      tavilyService.setProgressCallback(onProgress);
    }

    try {
      // Step 1: Discover brands
      onProgress?.({
        status: 'discovering-brands',
        currentStep: 'Discovering available brands...',
        progress: 0,
        brand1Progress: 0,
        brand2Progress: 0,
        brandsFound: 0,
        totalBrandsExpected: 10,
        brand1ProductsFound: 0,
        brand2ProductsFound: 0,
        steps: {
          brandDiscovery: { status: 'in-progress', brandsFound: 0, message: 'Starting brand discovery...' },
          brand1Analysis: { status: 'pending', productsFound: 0, message: 'Waiting for brand discovery...' },
          brand2Analysis: { status: 'pending', productsFound: 0, message: 'Waiting for brand discovery...' }
        }
      });

      const brands = await tavilyService.discoverBrandsDeepDive(storeUrl);
      
      // Find the requested brands
      const brand1 = brands.find(b => b.name.toLowerCase().includes(brand1Name.toLowerCase())) || 
                    { id: 'brand1', name: brand1Name, website: storeUrl };
      const brand2 = brands.find(b => b.name.toLowerCase().includes(brand2Name.toLowerCase())) || 
                    { id: 'brand2', name: brand2Name, website: storeUrl };

      // Step 2: Analyze Brand 1 products
      onProgress?.({
        status: 'analyzing-brand1',
        currentStep: `Analyzing ${brand1.name} products...`,
        progress: 80,
        brand1Progress: 0,
        brand2Progress: 0,
        brandsFound: brands.length,
        totalBrandsExpected: 10,
        brand1ProductsFound: 0,
        brand2ProductsFound: 0,
        currentBrandBeingAnalyzed: brand1.name,
        steps: {
          brandDiscovery: { status: 'completed', brandsFound: brands.length, message: `Found ${brands.length} brands` },
          brand1Analysis: { status: 'in-progress', productsFound: 0, message: `Starting analysis for ${brand1.name}...` },
          brand2Analysis: { status: 'pending', productsFound: 0, message: 'Waiting for Brand 1 analysis...' }
        }
      });

      const brand1Products = await tavilyService.searchProducts(brand1.name, storeUrl, undefined, true);

      // Step 3: Analyze Brand 2 products
      onProgress?.({
        status: 'analyzing-brand2',
        currentStep: `Analyzing ${brand2.name} products...`,
        progress: 90,
        brand1Progress: 100,
        brand2Progress: 0,
        brandsFound: brands.length,
        totalBrandsExpected: 10,
        brand1ProductsFound: brand1Products.length,
        brand2ProductsFound: 0,
        currentBrandBeingAnalyzed: brand2.name,
        steps: {
          brandDiscovery: { status: 'completed', brandsFound: brands.length, message: `Found ${brands.length} brands` },
          brand1Analysis: { status: 'completed', productsFound: brand1Products.length, message: `Found ${brand1Products.length} products for ${brand1.name}` },
          brand2Analysis: { status: 'in-progress', productsFound: 0, message: `Starting analysis for ${brand2.name}...` }
        }
      });

      const brand2Products = await tavilyService.searchProducts(brand2.name, storeUrl, undefined, false);

      // Step 4: Finalize analysis
      onProgress?.({
        status: 'finalizing',
        currentStep: 'Finalizing gap analysis...',
        progress: 95,
        brand1Progress: 100,
        brand2Progress: 100,
        brandsFound: brands.length,
        totalBrandsExpected: 10,
        brand1ProductsFound: brand1Products.length,
        brand2ProductsFound: brand2Products.length,
        steps: {
          brandDiscovery: { status: 'completed', brandsFound: brands.length, message: `Found ${brands.length} brands` },
          brand1Analysis: { status: 'completed', productsFound: brand1Products.length, message: `Found ${brand1Products.length} products for ${brand1.name}` },
          brand2Analysis: { status: 'completed', productsFound: brand2Products.length, message: `Found ${brand2Products.length} products for ${brand2.name}` }
        }
      });

      // Perform gap analysis
      const result = this.analyzeGap(brand1Products, brand2Products);

      // Final completion
      onProgress?.({
        status: 'completed',
        currentStep: 'Analysis completed successfully!',
        progress: 100,
        brand1Progress: 100,
        brand2Progress: 100,
        brandsFound: brands.length,
        totalBrandsExpected: 10,
        brand1ProductsFound: brand1Products.length,
        brand2ProductsFound: brand2Products.length,
        steps: {
          brandDiscovery: { status: 'completed', brandsFound: brands.length, message: `Found ${brands.length} brands` },
          brand1Analysis: { status: 'completed', productsFound: brand1Products.length, message: `Analysis completed for ${brand1.name}` },
          brand2Analysis: { status: 'completed', productsFound: brand2Products.length, message: `Analysis completed for ${brand2.name}` }
        }
      });

      return result;

    } catch (error) {
      console.error('Analysis error:', error);
      
      onProgress?.({
        status: 'error',
        currentStep: 'Analysis failed',
        progress: 0,
        brand1Progress: 0,
        brand2Progress: 0,
        brandsFound: 0,
        totalBrandsExpected: 10,
        brand1ProductsFound: 0,
        brand2ProductsFound: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        steps: {
          brandDiscovery: { status: 'error', brandsFound: 0, message: 'Analysis failed' },
          brand1Analysis: { status: 'error', productsFound: 0, message: 'Analysis failed' },
          brand2Analysis: { status: 'error', productsFound: 0, message: 'Analysis failed' }
        }
      });

      throw error;
    }
  }

  static analyzeGap(brand1Products: Product[], brand2Products: Product[]): GapAnalysisResult {
    // Simple analysis based on product names and categories
    const uniqueToBrand1: Product[] = [];
    const uniqueToBrand2: Product[] = [];
    const commonProducts: Array<{
      brand1Product: Product;
      brand2Product: Product;
      priceDifference?: number;
    }> = [];

    // Find products unique to brand 1
    brand1Products.forEach(p1 => {
      const similar = brand2Products.find(p2 => 
        this.areProductsSimilar(p1, p2)
      );
      
      if (!similar) {
        uniqueToBrand1.push(p1);
      } else {
        commonProducts.push({
          brand1Product: p1,
          brand2Product: similar,
          priceDifference: p1.price && similar.price ? p1.price - similar.price : undefined
        });
      }
    });

    // Find products unique to brand 2
    brand2Products.forEach(p2 => {
      const similar = brand1Products.find(p1 => 
        this.areProductsSimilar(p1, p2)
      );
      
      if (!similar) {
        uniqueToBrand2.push(p2);
      }
    });

    // Get all categories
    const categories = Array.from(new Set([
      ...brand1Products.map(p => p.category),
      ...brand2Products.map(p => p.category)
    ])).sort();

    return {
      brand1Products,
      brand2Products,
      uniqueToBrand1,
      uniqueToBrand2,
      commonProducts,
      categories,
      summary: {
        totalBrand1: brand1Products.length,
        totalBrand2: brand2Products.length,
        uniqueBrand1Count: uniqueToBrand1.length,
        uniqueBrand2Count: uniqueToBrand2.length,
        commonCount: commonProducts.length
      }
    };
  }

  private static areProductsSimilar(p1: Product, p2: Product): boolean {
    // Simple similarity check based on category and product type
    if (p1.category !== p2.category) return false;
    
    const p1Words = p1.name.toLowerCase().split(' ');
    const p2Words = p2.name.toLowerCase().split(' ');
    
    // Check if they share common product type words (excluding brand names)
    const commonWords = p1Words.filter(word => 
      p2Words.includes(word) && 
      word.length > 3 && 
      !p1.brand.toLowerCase().includes(word) &&
      !p2.brand.toLowerCase().includes(word)
    );
    
    return commonWords.length >= 2;
  }
}