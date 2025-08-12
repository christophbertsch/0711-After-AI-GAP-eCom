import React from 'react';
import type { Brand } from '../types';

interface BrandSelectorProps {
  brands: Brand[];
  selectedBrand: Brand | null;
  onBrandSelect: (brand: Brand | null) => void;
  label: string;
  disabled?: boolean;
}

export const BrandSelector: React.FC<BrandSelectorProps> = ({
  brands,
  selectedBrand,
  onBrandSelect,
  label,
  disabled = false
}) => {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
      </label>
      <select
        value={selectedBrand?.id || ''}
        onChange={(e) => {
          const brand = brands.find(b => b.id === e.target.value) || null;
          onBrandSelect(brand);
        }}
        disabled={disabled}
        className="form-select"
        style={{opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer'}}
      >
        <option value="">Select a brand...</option>
        {brands.map(brand => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
    </div>
  );
};