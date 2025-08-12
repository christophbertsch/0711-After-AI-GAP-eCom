import type { Brand, Product } from '../types';

const TAVILY_API_KEY = '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';
const TAVILY_API_URL = 'https://api.tavily.com/search';

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilyResponse {
  query: string;
  follow_up_questions: string[];
  answer: string;
  images: string[];
  results: TavilySearchResult[];
  response_time: number;
}

class TavilyService {
  private async searchTavily(query: string, domain?: string): Promise<TavilyResponse> {
    const searchQuery = domain ? `site:${domain} ${query}` : query;
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('API request timeout')), 10000); // 10 second timeout
    });

    try {
      const fetchPromise = fetch(TAVILY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query: searchQuery,
          search_depth: 'basic', // Use basic instead of advanced for faster response
          include_answer: true,
          include_images: false,
          include_raw_content: false, // Disable raw content for faster response
          max_results: 10, // Reduce results for faster response
        }),
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Tavily API error:', error);
      throw error;
    }
  }

  async discoverBrands(storeUrl: string): Promise<Brand[]> {
    try {
      const domain = new URL(storeUrl).hostname;
      
      // Try a single, focused search query first
      const query = `automotive parts brands ${domain}`;
      console.log('Searching for brands with query:', query);
      
      const response = await this.searchTavily(query, domain);
      console.log('Tavily response received:', response);

      // Extract brand names from the search results
      const brandNames = this.extractBrandNames(response.results);
      console.log('Extracted brand names:', brandNames);
      
      // If we found brands, convert to Brand objects
      if (brandNames.length > 0) {
        const brands: Brand[] = brandNames.map((name, index) => ({
          id: `brand_${index + 1}`,
          name,
          description: `Automotive parts and components from ${name}`,
          website: storeUrl,
          categories: this.getRandomCategories()
        }));

        return brands;
      } else {
        // If no brands found, use fallback
        console.log('No brands found in search results, using fallback');
        return this.getFallbackBrands(storeUrl);
      }
    } catch (error) {
      console.error('Error discovering brands:', error);
      // Fallback to some common automotive brands if API fails
      return this.getFallbackBrands(storeUrl);
    }
  }

  private extractBrandNames(results: TavilySearchResult[]): string[] {
    // Common automotive brand patterns
    const knownBrands = [
      'Bosch', 'Continental', 'Valeo', 'MAHLE', 'SACHS', 'febi bilstein',
      'MANN-FILTER', 'PIERBURG', 'Lemförder', 'TRW', 'Brembo', 'Bilstein',
      'Monroe', 'KYB', 'Denso', 'NGK', 'Champion', 'Hella', 'Osram',
      'Philips', 'Castrol', 'Mobil', 'Shell', 'Total', 'Liqui Moly',
      'Motul', 'Elring', 'Corteco', 'Reinz', 'Goetze', 'ATE', 'Textar',
      'Pagid', 'Ferodo', 'Jurid', 'Zimmermann', 'Optimal', 'Meyle',
      'Swag', 'Topran', 'Trucktec', 'Vemo', 'Ackoja', 'Blue Print'
    ];

    const foundBrands = new Set<string>();
    const content = results.map(r => `${r.title} ${r.content}`).join(' ').toLowerCase();

    // Look for known brands in the content
    knownBrands.forEach(brand => {
      if (content.includes(brand.toLowerCase())) {
        foundBrands.add(brand);
      }
    });

    // Also try to extract brand names from titles and content using patterns
    const brandPatterns = [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:parts|components|automotive|auto)/gi,
      /\b([A-Z]{2,}(?:-[A-Z]+)*)\s+(?:parts|components|automotive|auto)/gi,
    ];

    results.forEach(result => {
      const text = `${result.title} ${result.content}`;
      brandPatterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          const brandName = match[1].trim();
          if (brandName.length > 2 && brandName.length < 30) {
            foundBrands.add(brandName);
          }
        }
      });
    });

    return Array.from(foundBrands).slice(0, 15); // Limit to 15 brands
  }

  private getRandomCategories(): string[] {
    const allCategories = [
      'Body Parts', 'Brake System', 'Cooling System', 'Electrical',
      'Engine Parts', 'Exhaust System', 'Filters', 'Steering',
      'Suspension', 'Transmission'
    ];
    
    const numCategories = Math.floor(Math.random() * 5) + 3; // 3-7 categories
    const shuffled = [...allCategories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numCategories);
  }

  private getFallbackBrands(storeUrl: string = 'https://www.autodoc.de'): Brand[] {
    const fallbackBrands = [
      'Bosch', 'Continental', 'Valeo', 'MAHLE', 'SACHS', 
      'febi bilstein', 'MANN-FILTER', 'PIERBURG'
    ];

    return fallbackBrands.map((name, index) => ({
      id: `brand_${index + 1}`,
      name,
      description: `Automotive parts and components from ${name}`,
      website: storeUrl,
      categories: this.getRandomCategories()
    }));
  }

  async searchProducts(brandName: string, storeUrl: string, category?: string): Promise<Product[]> {
    try {
      const domain = new URL(storeUrl).hostname;
      const categoryFilter = category ? ` ${category}` : '';
      const query = `${brandName} automotive parts${categoryFilter} products prices`;
      
      const response = await this.searchTavily(query, domain);
      
      // Extract product information from search results
      return this.extractProducts(response.results, brandName);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  private extractProducts(results: TavilySearchResult[], brandName: string): Product[] {
    const products: Product[] = [];
    const categories = [
      'Body Parts', 'Brake System', 'Cooling System', 'Electrical',
      'Engine Parts', 'Exhaust System', 'Filters', 'Steering',
      'Suspension', 'Transmission'
    ];

    // Generate products based on search results
    results.forEach((result, index) => {
      if (products.length >= 10) return; // Limit to 10 products per search

      // Try to extract product names from titles and content
      const productTypes = [
        'brake pad', 'brake disc', 'oil filter', 'air filter', 'spark plug',
        'shock absorber', 'strut', 'belt', 'pump', 'sensor', 'valve',
        'gasket', 'bearing', 'joint', 'hose', 'fluid', 'bulb', 'fuse'
      ];

      const content = `${result.title} ${result.content}`.toLowerCase();
      const foundTypes = productTypes.filter(type => content.includes(type));

      if (foundTypes.length > 0) {
        foundTypes.forEach((type, typeIndex) => {
          if (products.length >= 10) return;

          const productId = `${brandName.toLowerCase().replace(/\s+/g, '')}_${type.replace(/\s+/g, '')}_${index}_${typeIndex}`;
          const price = Math.floor(Math.random() * 200) + 10;
          const category = categories[Math.floor(Math.random() * categories.length)];
          
          products.push({
            id: productId,
            name: `${brandName} ${type.charAt(0).toUpperCase() + type.slice(1)} ${this.generateProductCode()}`,
            description: `High-quality ${type} from ${brandName}`,
            price,
            category,
            availability: Math.random() > 0.2 ? 'Available' : 'Out of Stock',
            url: result.url,
            brand: brandName
          });
        });
      }
    });

    // If no products found, generate some based on brand name
    if (products.length === 0) {
      for (let i = 0; i < 5; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const productTypes = this.getProductTypesForCategory(category);
        const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
        
        products.push({
          id: `${brandName.toLowerCase().replace(/\s+/g, '')}_${i}`,
          name: `${brandName} ${productType} ${this.generateProductCode()}`,
          description: `Premium ${productType.toLowerCase()} from ${brandName}`,
          price: Math.floor(Math.random() * 200) + 10,
          category,
          availability: Math.random() > 0.2 ? 'Available' : 'Out of Stock',
          url: results[0]?.url || '',
          brand: brandName
        });
      }
    }

    return products;
  }

  private getProductTypesForCategory(category: string): string[] {
    const categoryProducts: { [key: string]: string[] } = {
      'Body Parts': ['Bumper', 'Fender', 'Hood', 'Door Panel', 'Mirror'],
      'Brake System': ['Brake Pad', 'Brake Disc', 'Brake Fluid', 'Brake Hose', 'Brake Caliper'],
      'Cooling System': ['Radiator', 'Water Pump', 'Thermostat', 'Coolant', 'Fan'],
      'Electrical': ['Battery', 'Alternator', 'Starter', 'Ignition Coil', 'Spark Plug'],
      'Engine Parts': ['Piston', 'Cylinder Head', 'Gasket', 'Timing Belt', 'Oil Pump'],
      'Exhaust System': ['Muffler', 'Catalytic Converter', 'Exhaust Pipe', 'Manifold', 'Gasket'],
      'Filters': ['Oil Filter', 'Air Filter', 'Fuel Filter', 'Cabin Filter', 'Hydraulic Filter'],
      'Steering': ['Power Steering Pump', 'Steering Rack', 'Tie Rod', 'Steering Fluid', 'Steering Wheel'],
      'Suspension': ['Shock Absorber', 'Strut', 'Spring', 'Bushing', 'Stabilizer Bar'],
      'Transmission': ['Clutch', 'Drive Shaft', 'CV Joint', 'Transmission Fluid', 'Gear']
    };

    return categoryProducts[category] || ['Component', 'Part', 'Assembly'];
  }

  private generateProductCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const tavilyService = new TavilyService();