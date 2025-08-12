# Product Gap Analysis Tool

A comprehensive React TypeScript application for analyzing product gaps between automotive brands on e-commerce websites. This tool integrates with Tavily AI to discover brands and scrape real product data for accurate gap analysis.

## Key Features

### 🔍 **Advanced Tavily AI Integration**
- **Comprehensive Brand Discovery**: Uses Tavily's advanced crawl API to discover all spare parts suppliers on automotive platforms
- **Deep Product Analysis**: Crawls specific brand pages to extract detailed product catalogs with the instruction: "Which products are listed by [Brand Name]"
- **Dual API Approach**: Primary crawl method with search fallback for maximum data coverage
- Support for popular sites: autodoc.de, eurocarparts.com, gsf.co.uk
- Robust fallback system with demo data when API is unavailable

### 📊 **Comprehensive Gap Analysis**
- Side-by-side brand comparison with detailed product breakdowns
- Real-time analysis progress tracking with visual indicators
- Tabbed interface: Summary, Unique to Brand 1, Unique to Brand 2, Common Products
- Category-based filtering for focused analysis

### 🎨 **Professional UI/UX**
- Modern React TypeScript architecture with Tailwind CSS styling
- Responsive design with intuitive navigation
- Expandable product sections with detailed information
- Real-time updates during analysis process

### 🛠 **Technical Implementation**
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React for consistent iconography
- **API Integration**: Tavily AI crawl and search APIs
- **Development**: Hot reload, ESLint, PostCSS

## Tavily API Integration

### Brand Discovery
```javascript
// Uses Tavily crawl API with instruction:
"all spare parts supplier selling products on this platform"
```

### Product Analysis
```javascript
// Uses Tavily crawl API with instruction:
"Which products are listed by [Brand Name]"
```

### API Configuration
The application uses the Tavily API key: `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`

For production deployment, configure as environment variable:
```bash
VITE_TAVILY_API_KEY=your_tavily_api_key_here
```

## Product Data Features
- **Detailed Product Information**: Name, description, category, price, availability
- **Category Filtering**: Filter products by automotive categories (Brake System, Suspension, Electrical, etc.)
- **Direct Links**: Clickable links to original product pages
- **Price Comparison**: Euro pricing with availability status
- **Gap Identification**: Clear visualization of unique and common products

## Demo Mode
When Tavily API is unavailable, the application automatically switches to demo mode with:
- Sample automotive brands (Bosch, febi bilstein, Brembo, NGK, etc.)
- Realistic product data with proper categorization
- Full functionality demonstration without external dependencies

## Installation & Usage

```bash
# Clone the repository
git clone https://github.com/christophbertsch/0711-After-AI-GAP-eCom.git
cd 0711-After-AI-GAP-eCom

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173` with full functionality for automotive product gap analysis.

## Project Structure

```
src/
├── components/
│   ├── AnalysisResults.tsx    # Results display with tabs and filtering
│   ├── BrandSelector.tsx      # Brand selection dropdowns
│   ├── ProgressBar.tsx        # Analysis progress indicator
│   └── UrlInput.tsx          # Website URL input with suggestions
├── services/
│   ├── tavilyService.ts      # Enhanced Tavily API integration
│   └── scraperService.ts     # Product analysis orchestration
├── types.ts                  # TypeScript type definitions
└── App.tsx                   # Main application component
```

## Production Ready Features
- CORS and iframe compatibility for hosting
- Environment variable configuration for API keys
- Error handling and graceful degradation
- Optimized build process with Vite
- TypeScript for type safety
- ESLint for code quality

## Testing Completed
✅ Complete UI/UX functionality testing  
✅ Brand selection and analysis workflow  
✅ Category filtering system verification  
✅ Product data display and navigation  
✅ Tavily API integration with fallback testing  
✅ Cross-browser compatibility  
✅ Multi-brand analysis scenarios  

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
