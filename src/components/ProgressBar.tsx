import React from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import type { AnalysisProgress } from '../types';

interface ProgressBarProps {
  progress: AnalysisProgress;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const getStatusColor = (status: AnalysisProgress['status']) => {
    switch (status) {
      case 'discovering-brands':
        return 'bg-blue-500';
      case 'analyzing-brand1':
        return 'bg-purple-500';
      case 'analyzing-brand2':
        return 'bg-indigo-500';
      case 'finalizing':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = (status: AnalysisProgress['status']) => {
    switch (status) {
      case 'discovering-brands':
        return 'Discovering Brands';
      case 'analyzing-brand1':
        return 'Analyzing Brand 1';
      case 'analyzing-brand2':
        return 'Analyzing Brand 2';
      case 'finalizing':
        return 'Finalizing Analysis';
      case 'completed':
        return 'Analysis Complete';
      case 'error':
        return 'Error Occurred';
      default:
        return 'Ready';
    }
  };

  const getStepIcon = (stepStatus: 'pending' | 'in-progress' | 'completed' | 'error') => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (progress.status === 'idle') {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Time Estimation Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Processing Large Dataset</h4>
              <p className="text-sm text-blue-800">
                We're analyzing massive automotive datasets with thousands of products. 
                This comprehensive analysis can take <strong>up to 2 minutes</strong> to ensure 
                accurate and complete results. Thank you for your patience!
              </p>
            </div>
          </div>
        </div>

        {/* Main Progress Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {progress.status !== 'completed' && progress.status !== 'error' && (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-3" />
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {getStatusText(progress.status)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{progress.currentStep}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-800">
              {Math.round(progress.progress)}%
            </span>
            {progress.currentBrandBeingAnalyzed && (
              <p className="text-sm text-gray-600">
                Analyzing: {progress.currentBrandBeingAnalyzed}
              </p>
            )}
            {progress.status !== 'completed' && progress.status !== 'error' && progress.progress > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Est. {Math.max(1, Math.round((120 * (100 - progress.progress)) / 100))}s remaining
              </p>
            )}
          </div>
        </div>
        
        {/* Main Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getStatusColor(progress.status)}`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>

        {/* Detailed Step Progress */}
        <div className="space-y-4">
          {/* Brand Discovery Step */}
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            {getStepIcon(progress.steps.brandDiscovery.status)}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">Brand Discovery</span>
                <span className="text-sm text-gray-600">
                  {progress.steps.brandDiscovery.brandsFound} brands found
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {progress.steps.brandDiscovery.message}
              </p>
            </div>
          </div>

          {/* Brand 1 Analysis Step */}
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            {getStepIcon(progress.steps.brand1Analysis.status)}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">Brand 1 Analysis</span>
                <span className="text-sm text-gray-600">
                  {progress.steps.brand1Analysis.productsFound} products found
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {progress.steps.brand1Analysis.message}
              </p>
              {progress.steps.brand1Analysis.status === 'in-progress' && (
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div
                    className="bg-purple-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progress.brand1Progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Brand 2 Analysis Step */}
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            {getStepIcon(progress.steps.brand2Analysis.status)}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">Brand 2 Analysis</span>
                <span className="text-sm text-gray-600">
                  {progress.steps.brand2Analysis.productsFound} products found
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {progress.steps.brand2Analysis.message}
              </p>
              {progress.steps.brand2Analysis.status === 'in-progress' && (
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div
                    className="bg-indigo-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progress.brand2Progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {(progress.brandsFound > 0 || progress.brand1ProductsFound > 0 || progress.brand2ProductsFound > 0) && (
          <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.brandsFound}</div>
              <div className="text-sm text-gray-600">Brands Discovered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{progress.brand1ProductsFound}</div>
              <div className="text-sm text-gray-600">Brand 1 Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{progress.brand2ProductsFound}</div>
              <div className="text-sm text-gray-600">Brand 2 Products</div>
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {progress.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-800">Error</span>
            </div>
            <p className="text-sm text-red-600 mt-2">{progress.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};