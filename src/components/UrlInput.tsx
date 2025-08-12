import React, { useState } from 'react';
import { Globe, Search } from 'lucide-react';

interface UrlInputProps {
  onUrlSubmit: (url: string) => void;
  isLoading: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ onUrlSubmit, isLoading }) => {
  const [url, setUrl] = useState('https://www.autodoc.de');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onUrlSubmit(url.trim());
    }
  };

  return (
    <div className="url-input-container">
      <h2 className="url-input-title">
        <Globe className="url-input-icon" />
        Enter Store Website
      </h2>
      <p className="url-input-description">
        Enter the URL of an automotive parts website to discover available brands and analyze their product offerings.
      </p>
      
      <form onSubmit={handleSubmit} className="url-input-form">
        <div className="url-input-field">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.autodoc.de"
            className="url-input"
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="url-submit-button"
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Discovering Brands...
              </>
            ) : (
              <>
                <Search className="button-icon" />
                Discover Brands
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="url-examples">
        <p className="examples-title">Popular automotive websites:</p>
        <div className="examples-list">
          <button
            type="button"
            onClick={() => setUrl('https://www.autodoc.de')}
            className="example-button"
            disabled={isLoading}
          >
            autodoc.de
          </button>
          <button
            type="button"
            onClick={() => setUrl('https://www.eurocarparts.com')}
            className="example-button"
            disabled={isLoading}
          >
            eurocarparts.com
          </button>
          <button
            type="button"
            onClick={() => setUrl('https://www.gsf.co.uk')}
            className="example-button"
            disabled={isLoading}
          >
            gsf.co.uk
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrlInput;