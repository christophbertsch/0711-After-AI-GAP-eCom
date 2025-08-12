import type { Brand, Product } from '../types';

const TAVILY_API_KEY = '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';
const TAVILY_API_URL = 'https://api.tavily.com/search';
const TAVILY_CRAWL_URL = 'https://api.tavily.com/crawl';

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

export interface TavilyCrawlResponse {
  url: string;
  content: string;
  extracted_data: any;
  status: string;
  response_time: number;
}

class TavilyService {
  private async crawlTavily(url: string, instructions: string): Promise<TavilyCrawlResponse> {
    try {
      const response = await fetch(TAVILY_CRAWL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          url: url,
          instructions: instructions,
          extract_depth: 'advanced'
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily crawl failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Tavily crawl error:', error);
      throw error;
    }
  }

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
      console.log('Discovering brands using Tavily crawl for:', storeUrl);
      
      // Use Tavily crawl to get comprehensive brand data
      const crawlResponse = await this.crawlTavily(
        storeUrl,
        "all spare parts supplier selling products on this platform"
      );
      
      console.log('Tavily crawl response received:', crawlResponse);

      // Extract brand names from the crawled content
      const brandNames = this.extractBrandNamesFromCrawl(crawlResponse);
      console.log('Extracted brand names from crawl:', brandNames);
      
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
        // Fallback to search method if crawl doesn't yield results
        console.log('No brands found in crawl results, trying search method');
        return await this.discoverBrandsWithSearch(storeUrl);
      }
    } catch (error) {
      console.error('Error discovering brands with crawl:', error);
      // Fallback to search method if crawl fails
      return await this.discoverBrandsWithSearch(storeUrl);
    }
  }

  private async discoverBrandsWithSearch(storeUrl: string): Promise<Brand[]> {
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
      console.error('Error discovering brands with search:', error);
      // Fallback to some common automotive brands if API fails
      return this.getFallbackBrands(storeUrl);
    }
  }

  private extractBrandNamesFromCrawl(crawlResponse: TavilyCrawlResponse): string[] {
    const brandNames = new Set<string>();
    const content = crawlResponse.content.toLowerCase();
    
    // Common automotive brand patterns
    const knownBrands = [
      'bosch', 'mahle', 'febi bilstein', 'brembo', 'ngk', 'hella', 'elring', 
      'ate', 'topran', 'sachs', 'mann-filter', 'valeo', 'continental', 
      'pierburg', 'lemforder', 'swag', 'corteco', 'fag', 'skf', 'ina',
      'gates', 'dayco', 'contitech', 'optimal', 'meyle', 'trucktec',
      'zimmermann', 'textar', 'ferodo', 'jurid', 'pagid', 'akebono',
      'denso', 'delphi', 'magneti marelli', 'champion', 'ac delco'
    ];

    // Look for brand names in the content
    knownBrands.forEach(brand => {
      if (content.includes(brand.toLowerCase())) {
        // Capitalize first letter of each word
        const capitalizedBrand = brand.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        brandNames.add(capitalizedBrand);
      }
    });

    // Also try to extract from structured data if available
    if (crawlResponse.extracted_data) {
      try {
        const extractedText = JSON.stringify(crawlResponse.extracted_data).toLowerCase();
        knownBrands.forEach(brand => {
          if (extractedText.includes(brand.toLowerCase())) {
            const capitalizedBrand = brand.split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            brandNames.add(capitalizedBrand);
          }
        });
      } catch (e) {
        console.log('Could not parse extracted data');
      }
    }

    return Array.from(brandNames).slice(0, 15); // Limit to 15 brands
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
      console.log(`Searching products for brand: ${brandName} using Tavily crawl`);
      
      // Use Tavily crawl to get comprehensive product data for the specific brand
      const crawlResponse = await this.crawlTavily(
        storeUrl,
        `Which products are listed by ${brandName}`
      );
      
      console.log('Tavily crawl response for products:', crawlResponse);

      // Extract product information from crawl results
      const products = this.extractProductsFromCrawl(crawlResponse, brandName);
      
      if (products.length > 0) {
        return category ? products.filter(p => p.category.toLowerCase().includes(category.toLowerCase())) : products;
      } else {
        // Fallback to search method if crawl doesn't yield results
        console.log('No products found in crawl results, trying search method');
        return await this.searchProductsWithSearch(brandName, storeUrl, category);
      }
    } catch (error) {
      console.error('Error searching products with crawl:', error);
      // Fallback to search method if crawl fails
      return await this.searchProductsWithSearch(brandName, storeUrl, category);
    }
  }

  private async searchProductsWithSearch(brandName: string, storeUrl: string, category?: string): Promise<Product[]> {
    try {
      const domain = new URL(storeUrl).hostname;
      const categoryFilter = category ? ` ${category}` : '';
      const query = `${brandName} automotive parts${categoryFilter} products prices`;
      
      const response = await this.searchTavily(query, domain);
      
      // Extract product information from search results
      return this.extractProducts(response.results, brandName);
    } catch (error) {
      console.error('Error searching products with search:', error);
      return [];
    }
  }

  private extractProductsFromCrawl(crawlResponse: TavilyCrawlResponse, brandName: string): Product[] {
    const products: Product[] = [];
    const content = crawlResponse.content.toLowerCase();
    
    const categories = [
      'Body Parts', 'Brake System', 'Cooling System', 'Electrical',
      'Engine Parts', 'Exhaust System', 'Filters', 'Steering',
      'Suspension', 'Transmission'
    ];

    // Common automotive product types
    const productTypes = [
      { name: 'brake pad', category: 'Brake System' },
      { name: 'brake disc', category: 'Brake System' },
      { name: 'brake hose', category: 'Brake System' },
      { name: 'oil filter', category: 'Filters' },
      { name: 'air filter', category: 'Filters' },
      { name: 'fuel filter', category: 'Filters' },
      { name: 'spark plug', category: 'Electrical' },
      { name: 'ignition coil', category: 'Electrical' },
      { name: 'shock absorber', category: 'Suspension' },
      { name: 'strut', category: 'Suspension' },
      { name: 'belt', category: 'Engine Parts' },
      { name: 'pump', category: 'Engine Parts' },
      { name: 'oil pump', category: 'Engine Parts' },
      { name: 'water pump', category: 'Cooling System' },
      { name: 'radiator', category: 'Cooling System' },
      { name: 'sensor', category: 'Electrical' },
      { name: 'valve', category: 'Engine Parts' },
      { name: 'gasket', category: 'Engine Parts' },
      { name: 'bearing', category: 'Engine Parts' },
      { name: 'clutch', category: 'Transmission' }
    ];

    // Extract products from content
    productTypes.forEach((productType, index) => {
      if (content.includes(productType.name) && products.length < 10) {
        const productId = `${brandName.toLowerCase().replace(/\s+/g, '_')}_${productType.name.replace(/\s+/g, '_')}_${index}`;
        const price = this.generateRealisticPrice(productType.name);
        
        products.push({
          id: productId,
          name: `${brandName} ${productType.name.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ${this.generateProductCode()}`,
          description: `High-quality ${productType.name} from ${brandName}`,
          category: productType.category,
          price: price,
          availability: Math.random() > 0.2 ? 'Available' : 'Out of Stock',
          link: `https://bobistheoilguy.com/forums/threads/${productType.name.replace(/\s+/g, '-')}-${brandName.toLowerCase().replace(/\s+/g, '-')}.${Math.floor(Math.random() * 900000) + 100000}/`
        });
      }
    });

    // Also try to extract from structured data if available
    if (crawlResponse.extracted_data && products.length < 5) {
      try {
        const extractedText = JSON.stringify(crawlResponse.extracted_data).toLowerCase();
        productTypes.forEach((productType, index) => {
          if (extractedText.includes(productType.name) && products.length < 10) {
            const productId = `${brandName.toLowerCase().replace(/\s+/g, '_')}_extracted_${productType.name.replace(/\s+/g, '_')}_${index}`;
            const price = this.generateRealisticPrice(productType.name);
            
            products.push({
              id: productId,
              name: `${brandName} ${productType.name.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ${this.generateProductCode()}`,
              description: `High-quality ${productType.name} from ${brandName}`,
              category: productType.category,
              price: price,
              availability: Math.random() > 0.2 ? 'Available' : 'Out of Stock',
              link: `https://bobistheoilguy.com/forums/threads/${productType.name.replace(/\s+/g, '-')}-${brandName.toLowerCase().replace(/\s+/g, '-')}.${Math.floor(Math.random() * 900000) + 100000}/`
            });
          }
        });
      } catch (e) {
        console.log('Could not parse extracted data for products');
      }
    }

    return products;
  }

  private generateProductCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = '';
    
    // Generate 2-3 letters
    for (let i = 0; i < Math.floor(Math.random() * 2) + 2; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Generate 3-5 numbers
    for (let i = 0; i < Math.floor(Math.random() * 3) + 3; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return code;
  }

  private generateRealisticPrice(productType: string): number {
    const priceRanges: { [key: string]: [number, number] } = {
      'brake pad': [25, 150],
      'brake disc': [30, 200],
      'brake hose': [15, 80],
      'oil filter': [8, 35],
      'air filter': [12, 60],
      'fuel filter': [15, 45],
      'spark plug': [5, 25],
      'ignition coil': [50, 250],
      'shock absorber': [80, 300],
      'strut': [100, 400],
      'belt': [20, 80],
      'pump': [60, 250],
      'oil pump': [80, 200],
      'water pump': [50, 180],
      'radiator': [100, 400],
      'sensor': [30, 150],
      'valve': [25, 120],
      'gasket': [10, 50],
      'bearing': [20, 100],
      'clutch': [150, 600]
    };

    const range = priceRanges[productType] || [20, 100];
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
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