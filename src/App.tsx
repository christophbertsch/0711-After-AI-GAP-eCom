import { useState, useCallback } from 'react';
import type { Brand, GapAnalysisResult, AnalysisProgress } from './types';
import { ScraperService } from './services/scraperService';
import { tavilyService } from './services/tavilyService';
import { BrandSelector } from './components/BrandSelector';
import { ProgressBar } from './components/ProgressBar';
import { AnalysisResults } from './components/AnalysisResults';
import UrlInput from './components/UrlInput';
import { Play, RefreshCw, AlertCircle } from 'lucide-react';

function App() {
  const [storeUrl, setStoreUrl] = useState<string>('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand1, setSelectedBrand1] = useState<Brand | null>(null);
  const [selectedBrand2, setSelectedBrand2] = useState<Brand | null>(null);
  const [isDiscoveringBrands, setIsDiscoveringBrands] = useState(false);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress>({
    status: 'idle',
    currentStep: '',
    progress: 0,
    brand1Progress: 0,
    brand2Progress: 0
  });
  const [analysisResult, setAnalysisResult] = useState<GapAnalysisResult | null>(null);

  const handleUrlSubmit = useCallback(async (url: string) => {
    setIsDiscoveringBrands(true);
    setStoreUrl(url);
    setBrands([]);
    setSelectedBrand1(null);
    setSelectedBrand2(null);
    setAnalysisResult(null);
    setIsUsingFallbackData(false);

    try {
      const discoveredBrands = await tavilyService.discoverBrands(url);
      setBrands(discoveredBrands);
      
      // Check if we're using fallback brands (they have specific IDs)
      const usingFallback = discoveredBrands.some(brand => brand.id.startsWith('brand_') && 
        ['Bosch', 'Continental', 'Valeo', 'MAHLE', 'SACHS', 'febi bilstein', 'MANN-FILTER', 'PIERBURG'].includes(brand.name));
      setIsUsingFallbackData(usingFallback);
    } catch (error) {
      console.error('Error discovering brands:', error);
      // Fallback to mock brands if discovery fails
      setBrands(ScraperService.getBrands());
      setIsUsingFallbackData(true);
    } finally {
      setIsDiscoveringBrands(false);
    }
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!selectedBrand1 || !selectedBrand2 || !storeUrl) {
      return;
    }

    setAnalysisResult(null);
    setProgress({
      status: 'scraping',
      currentStep: 'Starting analysis...',
      progress: 0,
      brand1Progress: 0,
      brand2Progress: 0
    });

    try {
      // Scrape products from both brands using Tavily
      setProgress(prev => ({
        ...prev,
        currentStep: `Searching products from ${selectedBrand1.name} and ${selectedBrand2.name} on ${new URL(storeUrl).hostname}...`
      }));

      // Simulate progressive loading for better UX
      const brand1ProductsPromise = (async () => {
        const products = await tavilyService.searchProducts(selectedBrand1.name, storeUrl);
        setProgress(prev => ({
          ...prev,
          brand1Progress: 100,
          progress: (100 + prev.brand2Progress) / 2
        }));
        return products;
      })();

      const brand2ProductsPromise = (async () => {
        const products = await tavilyService.searchProducts(selectedBrand2.name, storeUrl);
        setProgress(prev => ({
          ...prev,
          brand2Progress: 100,
          progress: (prev.brand1Progress + 100) / 2
        }));
        return products;
      })();

      const [brand1Products, brand2Products] = await Promise.all([
        brand1ProductsPromise,
        brand2ProductsPromise
      ]);

      setProgress(prev => ({
        ...prev,
        status: 'analyzing',
        currentStep: 'Analyzing product gaps...',
        progress: 90
      }));

      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = ScraperService.analyzeGap(brand1Products, brand2Products);
      
      setProgress(prev => ({
        ...prev,
        status: 'completed',
        currentStep: 'Analysis completed!',
        progress: 100
      }));

      setAnalysisResult(result);

    } catch (error) {
      setProgress(prev => ({
        ...prev,
        status: 'error',
        currentStep: 'Analysis failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, [selectedBrand1, selectedBrand2, storeUrl]);

  const resetAnalysis = () => {
    setProgress({
      status: 'idle',
      currentStep: '',
      progress: 0,
      brand1Progress: 0,
      brand2Progress: 0
    });
    setAnalysisResult(null);
  };

  const canRunAnalysis = selectedBrand1 && selectedBrand2 && selectedBrand1.id !== selectedBrand2.id && storeUrl;
  const isRunning = progress.status === 'scraping' || progress.status === 'analyzing';

  return (
    <div className="container">
      {/* Header */}
      <div className="text-center" style={{marginBottom: '2rem'}}>
        <h1 className="text-3xl font-bold" style={{marginBottom: '1rem'}}>
          Product Gap Analysis Tool
        </h1>
        <p className="text-lg text-gray-600">
          Compare product offerings between automotive brands to identify gaps and opportunities. 
          Enter a store URL to discover brands and analyze their product portfolios.
        </p>
      </div>

      {/* URL Input */}
      <div className="card">
        <UrlInput onUrlSubmit={handleUrlSubmit} isLoading={isDiscoveringBrands} />
      </div>

      {/* Fallback Data Notice */}
      {isUsingFallbackData && brands.length > 0 && (
        <div className="card" style={{backgroundColor: '#fef3c7', borderColor: '#f59e0b'}}>
          <div className="flex items-center text-amber-800">
            <AlertCircle style={{marginRight: '0.5rem'}} size={20} />
            <div>
              <strong>Demo Mode:</strong> Unable to fetch live data from the website. 
              Using sample automotive brands for demonstration. The analysis will use simulated product data.
            </div>
          </div>
        </div>
      )}

      {/* Brand Selection */}
      {brands.length > 0 && (
        <div className="card">
        <h2 className="text-2xl font-semibold" style={{marginBottom: '1.5rem'}}>Select Brands to Compare</h2>
        
        <div className="grid grid-cols-2" style={{marginBottom: '1.5rem'}}>
          <BrandSelector
            brands={brands}
            selectedBrand={selectedBrand1}
            onBrandSelect={setSelectedBrand1}
            label="Brand 1"
            disabled={isRunning}
          />
          <BrandSelector
            brands={brands.filter(b => b.id !== selectedBrand1?.id)}
            selectedBrand={selectedBrand2}
            onBrandSelect={setSelectedBrand2}
            label="Brand 2"
            disabled={isRunning}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={runAnalysis}
            disabled={!canRunAnalysis || isRunning}
            className="btn btn-primary"
          >
            {isRunning ? (
              <>
                <div className="loading-spinner" style={{marginRight: '0.5rem'}}></div>
                Running Analysis...
              </>
            ) : (
              <>
                <Play style={{marginRight: '0.5rem'}} size={20} />
                Start Analysis
              </>
            )}
          </button>

          {(progress.status === 'completed' || progress.status === 'error') && (
            <button
              onClick={resetAnalysis}
              className="btn btn-secondary"
            >
              <RefreshCw style={{marginRight: '0.5rem'}} size={20} />
              Reset
            </button>
          )}
        </div>

        {!canRunAnalysis && selectedBrand1 && selectedBrand2 && selectedBrand1.id === selectedBrand2.id && (
          <div className="flex items-center text-red-600" style={{marginTop: '1rem'}}>
            <AlertCircle style={{marginRight: '0.5rem'}} size={20} />
            Please select two different brands to compare.
          </div>
        )}
        </div>
      )}

      {/* Progress Section */}
      {progress.status !== 'idle' && (
        <div className="card">
          <h3 className="text-lg font-semibold" style={{marginBottom: '1rem'}}>Analysis Progress</h3>
          
          <div>
            <div className="text-gray-600" style={{marginBottom: '0.5rem', fontSize: '0.875rem'}}>{progress.currentStep}</div>
            <ProgressBar progress={progress.progress} />
          </div>

          {progress.status === 'scraping' && (
            <div className="grid grid-cols-2" style={{marginTop: '1rem'}}>
              <ProgressBar 
                progress={progress.brand1Progress} 
                label={`${selectedBrand1?.name} Products`}
              />
              <ProgressBar 
                progress={progress.brand2Progress} 
                label={`${selectedBrand2?.name} Products`}
              />
            </div>
          )}

          {progress.status === 'error' && progress.error && (
            <div className="flex items-center text-red-600 bg-red-50" style={{padding: '0.75rem', borderRadius: '8px', marginTop: '1rem'}}>
              <AlertCircle style={{marginRight: '0.5rem'}} size={20} />
              <span>{progress.error}</span>
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {analysisResult && selectedBrand1 && selectedBrand2 && (
        <AnalysisResults
          result={analysisResult}
          brand1Name={selectedBrand1.name}
          brand2Name={selectedBrand2.name}
        />
      )}

      {/* Footer */}
      <div className="text-center text-gray-600" style={{marginTop: '3rem', fontSize: '0.875rem'}}>
        <p>
          This tool uses Tavily AI search to discover brands and analyze real product data from automotive websites.
          Enter any automotive parts website URL to get started with live data analysis.
        </p>
      </div>
    </div>
  );
}

export default App;
