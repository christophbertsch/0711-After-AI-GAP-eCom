import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label
}) => {
  return (
    <div style={{width: '100%'}}>
      {label && (
        <div className="flex justify-between text-gray-600" style={{fontSize: '0.875rem', marginBottom: '0.25rem'}}>
          <span>{label}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};