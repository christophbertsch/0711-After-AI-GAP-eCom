import React, { useState } from 'react';
import type { GapAnalysisResult, Product } from '../types';
import { ChevronDown, ChevronUp, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';

interface AnalysisResultsProps {
  result: GapAnalysisResult;
  brand1Name: string;
  brand2Name: string;
}

interface ProductTableProps {
  products: Product[];
  title: string;
  emptyMessage: string;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, title, emptyMessage }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = Array.from(new Set(products.map(p => p.category))).sort();
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="card" style={{border: '1px solid #e5e7eb', padding: 0}}>
      <div 
        className="flex items-center justify-between"
        style={{padding: '1rem', cursor: 'pointer', borderRadius: '8px 8px 0 0'}}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <h3 className="text-lg font-semibold">
          {title} ({products.length})
        </h3>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      
      {isExpanded && (
        <div style={{borderTop: '1px solid #e5e7eb'}}>
          {products.length === 0 ? (
            <p className="text-gray-600 text-center" style={{padding: '1rem'}}>{emptyMessage}</p>
          ) : (
            <>
              <div style={{padding: '1rem', borderBottom: '1px solid #e5e7eb'}}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-select"
                  style={{maxWidth: '20rem'}}
                >
                  <option value="all">All Categories ({products.length})</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category} ({products.filter(p => p.category === category).length})
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{maxHeight: '24rem', overflowY: 'auto'}}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.slice(0, 50).map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="font-semibold" style={{fontSize: '0.875rem'}}>
                            {product.name}
                          </div>
                          <div className="text-gray-600" style={{fontSize: '0.875rem'}}>
                            {product.description}
                          </div>
                        </td>
                        <td style={{fontSize: '0.875rem'}}>
                          {product.category}
                        </td>
                        <td style={{fontSize: '0.875rem'}}>
                          {product.price ? `€${product.price.toFixed(2)}` : 'N/A'}
                        </td>
                        <td>
                          <span className={`badge ${
                            product.availability 
                              ? 'badge-success' 
                              : 'badge-warning'
                          }`}>
                            {product.availability ? 'Available' : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          {product.url && (
                            <a
                              href={product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600"
                              style={{textDecoration: 'none'}}
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length > 50 && (
                  <div className="text-center text-gray-600" style={{padding: '1rem', fontSize: '0.875rem'}}>
                    Showing first 50 of {filteredProducts.length} products
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  brand1Name,
  brand2Name
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'unique1' | 'unique2' | 'common'>('summary');

  const tabs = [
    { id: 'summary', label: 'Summary', count: null },
    { id: 'unique1', label: `Unique to ${brand1Name}`, count: result.summary.uniqueBrand1Count },
    { id: 'unique2', label: `Unique to ${brand2Name}`, count: result.summary.uniqueBrand2Count },
    { id: 'common', label: 'Common Products', count: result.summary.commonCount },
  ];

  return (
    <div className="card">
      <h2 className="text-2xl font-bold" style={{marginBottom: '1.5rem'}}>
        Gap Analysis Results: {brand1Name} vs {brand2Name}
      </h2>

      {/* Tab Navigation */}
      <div className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="badge badge-info">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'summary' && (
          <div>
            <div className="grid grid-cols-4" style={{marginBottom: '1.5rem'}}>
              <div className="stats-card" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>
                <div className="stats-number">{result.summary.totalBrand1}</div>
                <div className="stats-label">{brand1Name} Products</div>
              </div>
              <div className="stats-card" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                <div className="stats-number">{result.summary.totalBrand2}</div>
                <div className="stats-label">{brand2Name} Products</div>
              </div>
              <div className="stats-card" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                <div className="stats-number">{result.summary.commonCount}</div>
                <div className="stats-label">Common Products</div>
              </div>
              <div className="stats-card" style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>
                <div className="stats-number">{result.categories.length}</div>
                <div className="stats-label">Categories</div>
              </div>
            </div>

            <div className="bg-blue-50" style={{padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem'}}>
              <h3 className="text-lg font-semibold" style={{marginBottom: '0.75rem'}}>Key Insights</h3>
              <div>
                <div className="insight-item">
                  <TrendingUp className="text-green-600" size={16} />
                  <span style={{fontSize: '0.875rem'}}>
                    {brand1Name} has {result.summary.uniqueBrand1Count} unique products 
                    ({((result.summary.uniqueBrand1Count / result.summary.totalBrand1) * 100).toFixed(1)}% of their catalog)
                  </span>
                </div>
                <div className="insight-item">
                  <TrendingUp className="text-blue-600" size={16} />
                  <span style={{fontSize: '0.875rem'}}>
                    {brand2Name} has {result.summary.uniqueBrand2Count} unique products 
                    ({((result.summary.uniqueBrand2Count / result.summary.totalBrand2) * 100).toFixed(1)}% of their catalog)
                  </span>
                </div>
                <div className="insight-item">
                  <TrendingDown className="text-gray-600" size={16} />
                  <span style={{fontSize: '0.875rem'}}>
                    {result.summary.commonCount} products overlap between both brands 
                    ({((result.summary.commonCount / Math.max(result.summary.totalBrand1, result.summary.totalBrand2)) * 100).toFixed(1)}% market overlap)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold" style={{marginBottom: '0.75rem'}}>Categories Breakdown</h3>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                {result.categories.map(category => (
                  <div key={category} className="category-tag">
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'unique1' && (
          <ProductTable
            products={result.uniqueToBrand1}
            title={`Products Unique to ${brand1Name}`}
            emptyMessage={`No unique products found for ${brand1Name}`}
          />
        )}

        {activeTab === 'unique2' && (
          <ProductTable
            products={result.uniqueToBrand2}
            title={`Products Unique to ${brand2Name}`}
            emptyMessage={`No unique products found for ${brand2Name}`}
          />
        )}

        {activeTab === 'common' && (
          <div>
            <h3 className="text-lg font-semibold" style={{marginBottom: '1rem'}}>
              Common Products ({result.commonProducts.length})
            </h3>
            
            {result.commonProducts.length === 0 ? (
              <p className="text-gray-600 text-center" style={{padding: '2rem'}}>No common products found</p>
            ) : (
              <div style={{maxHeight: '24rem', overflowY: 'auto'}}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>{brand1Name.toUpperCase()} PRODUCT</th>
                      <th>{brand2Name.toUpperCase()} PRODUCT</th>
                      <th>PRICE DIFFERENCE</th>
                      <th>CATEGORY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.commonProducts.slice(0, 50).map((common, index) => (
                      <tr key={index}>
                        <td>
                          <div className="font-semibold" style={{fontSize: '0.875rem'}}>
                            {common.brand1Product.name}
                          </div>
                          <div className="text-gray-600" style={{fontSize: '0.875rem'}}>
                            {common.brand1Product.price ? `€${common.brand1Product.price.toFixed(2)}` : 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div className="font-semibold" style={{fontSize: '0.875rem'}}>
                            {common.brand2Product.name}
                          </div>
                          <div className="text-gray-600" style={{fontSize: '0.875rem'}}>
                            {common.brand2Product.price ? `€${common.brand2Product.price.toFixed(2)}` : 'N/A'}
                          </div>
                        </td>
                        <td style={{fontSize: '0.875rem'}}>
                          {common.priceDifference !== undefined ? (
                            <span className={`font-semibold ${
                              common.priceDifference > 0 
                                ? 'price-positive' 
                                : common.priceDifference < 0 
                                  ? 'price-negative' 
                                  : 'text-gray-600'
                            }`}>
                              {common.priceDifference > 0 ? '+' : ''}€{common.priceDifference.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-600">N/A</span>
                          )}
                        </td>
                        <td style={{fontSize: '0.875rem'}}>
                          {common.brand1Product.category}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.commonProducts.length > 50 && (
                  <div className="text-center text-gray-600" style={{padding: '1rem', fontSize: '0.875rem'}}>
                    Showing first 50 of {result.commonProducts.length} common products
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};