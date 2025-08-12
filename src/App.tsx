import { useState, useCallback } from 'react';
import type { Brand, GapAnalysisResult, AnalysisProgress } from './types';
import { ScraperService } from './services/scraperService';
import { tavilyService } from './services/tavilyService';
import { BrandSelector } from './components/BrandSelector';
import { ProgressBar } from './components/ProgressBar';
import { AnalysisResults } from './components/AnalysisResults';
import UrlInput from './components/UrlInput';
import { Play, RefreshCw, AlertCircle, Search } from 'lucide-react';

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
    brand2Progress: 0,
    brandsFound: 0,
    totalBrandsExpected: 10,
    brand1ProductsFound: 0,
    brand2ProductsFound: 0,
    steps: {
      brandDiscovery: { status: 'pending', brandsFound: 0, message: 'Waiting to start...' },
      brand1Analysis: { status: 'pending', productsFound: 0, message: 'Waiting to start...' },
      brand2Analysis: { status: 'pending', productsFound: 0, message: 'Waiting to start...' }
    }
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
      // Use the new smart brand discovery approach
      const discoveredBrands = await tavilyService.getTopAutomotiveBrands();
      setBrands(discoveredBrands);
      setIsUsingFallbackData(false);
    } catch (error) {
      console.error('Error getting top automotive brands:', error);
      // Fallback to mock brands if discovery fails
      setBrands(ScraperService.getBrands());
      setIsUsingFallbackData(true);
    } finally {
      setIsDiscoveringBrands(false);
    }
  }, []);

  const handleDeepDive = useCallback(async () => {
    if (!storeUrl) return;
    
    setIsDiscoveringBrands(true);
    setBrands([]);
    setSelectedBrand1(null);
    setSelectedBrand2(null);
    setAnalysisResult(null);

    try {
      const discoveredBrands = await tavilyService.discoverBrandsDeepDive(storeUrl);
      setBrands(discoveredBrands);
      
      // Check if we're using fallback brands (they have specific IDs)
      const usingFallback = discoveredBrands.some(brand => brand.id.startsWith('brand_') && 
        ['Bosch', 'Continental', 'Valeo', 'MAHLE', 'SACHS', 'febi bilstein', 'MANN-FILTER', 'PIERBURG'].includes(brand.name));
      setIsUsingFallbackData(usingFallback);
    } catch (error) {
      console.error('Error discovering brands with deep dive:', error);
      // Fallback to mock brands if discovery fails
      setBrands(ScraperService.getBrands());
      setIsUsingFallbackData(true);
    } finally {
      setIsDiscoveringBrands(false);
    }
  }, [storeUrl]);

  const runAnalysis = useCallback(async () => {
    if (!selectedBrand1 || !selectedBrand2 || !storeUrl) {
      return;
    }

    setAnalysisResult(null);
    
    // Reset progress to initial state
    setProgress({
      status: 'idle',
      currentStep: 'Preparing analysis...',
      progress: 0,
      brand1Progress: 0,
      brand2Progress: 0,
      brandsFound: 0,
      totalBrandsExpected: 10,
      brand1ProductsFound: 0,
      brand2ProductsFound: 0,
      steps: {
        brandDiscovery: { status: 'pending', brandsFound: 0, message: 'Waiting to start...' },
        brand1Analysis: { status: 'pending', productsFound: 0, message: 'Waiting to start...' },
        brand2Analysis: { status: 'pending', productsFound: 0, message: 'Waiting to start...' }
      }
    });

    try {
      // Use the comprehensive analysis method with real-time progress updates
      const result = await ScraperService.performComprehensiveAnalysis(
        storeUrl,
        selectedBrand1.name,
        selectedBrand2.name,
        setProgress
      );

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
      brand2Progress: 0,
      brandsFound: 0,
      totalBrandsExpected: 10,
      brand1ProductsFound: 0,
      brand2ProductsFound: 0,
      steps: {
        brandDiscovery: { status: 'pending', brandsFound: 0, message: 'Waiting to start...' },
        brand1Analysis: { status: 'pending', productsFound: 0, message: 'Waiting to start...' },
        brand2Analysis: { status: 'pending', productsFound: 0, message: 'Waiting to start...' }
      }
    });
    setAnalysisResult(null);
  };

  const canRunAnalysis = selectedBrand1 && selectedBrand2 && selectedBrand1.id !== selectedBrand2.id && storeUrl;
  const isRunning = progress.status === 'discovering-brands' || progress.status === 'analyzing-brand1' || 
                   progress.status === 'analyzing-brand2' || progress.status === 'finalizing';

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

      {/* Smart Brands Notice */}
      {!isUsingFallbackData && brands.length > 0 && (
        <div className="card" style={{backgroundColor: '#dcfce7', borderColor: '#16a34a'}}>
          <div className="flex items-center text-green-800">
            <AlertCircle style={{marginRight: '0.5rem'}} size={20} />
            <div>
              <strong>Smart Brand Discovery:</strong> Showing top automotive spare parts brands. 
              Use "Deep Dive" to discover all brands specifically available on {storeUrl ? new URL(storeUrl).hostname : 'the website'}.
            </div>
          </div>
        </div>
      )}

      {/* Fallback Data Notice */}
      {isUsingFallbackData && brands.length > 0 && (
        <div className="card" style={{backgroundColor: '#fef3c7', borderColor: '#f59e0b'}}>
          <div className="flex items-center text-amber-800">
            <AlertCircle style={{marginRight: '0.5rem'}} size={20} />
            <div>
              <strong>Demo Mode:</strong> Unable to fetch live data. 
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

          {storeUrl && !isRunning && (
            <button
              onClick={handleDeepDive}
              disabled={isDiscoveringBrands}
              className="btn btn-secondary"
              title="Discover all brands available on the website (takes longer)"
            >
              {isDiscoveringBrands ? (
                <>
                  <div className="loading-spinner" style={{marginRight: '0.5rem'}}></div>
                  Deep Diving...
                </>
              ) : (
                <>
                  <Search style={{marginRight: '0.5rem'}} size={20} />
                  Deep Dive
                </>
              )}
            </button>
          )}

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
        <ProgressBar progress={progress} />
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
