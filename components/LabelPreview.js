import React from 'react';
import type { LabelData } from '../types.js';

interface LabelPreviewProps {
  data: LabelData;
  scale?: number;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({ data, scale = 1 }) => {
  return (
    <div 
      className="flex flex-col items-center mx-auto"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        width: '240px'
      }}
    >
      {/* Main Box - Aspect Ratio approx 63:38 */}
      <div 
        className="w-full bg-white rounded border border-gray-300 shadow-sm flex flex-col items-center p-2 relative"
        style={{ height: '145px' }} 
      >
        {/* 1. Header */}
        <h3 className="text-xl font-bold text-brand-green uppercase tracking-wide text-center leading-tight mt-1 mb-2">
          {data.header || "HEADER"}
        </h3>
        
        {/* 2. Content */}
        <div className="flex-grow flex items-center justify-center w-full mb-1">
          <p className="text-gray-800 text-center text-lg leading-tight px-1 line-clamp-2">
            {data.content || "Dish Name"}
          </p>
        </div>

        {/* 3. Footer (User) */}
        <div className="text-brand-pink font-bold uppercase tracking-wider text-sm mb-1 text-center w-full px-1 truncate">
          {data.footer || "User Name"}
        </div>

        {/* 4. Sub-Footer (Company) */}
        <div className="text-gray-500 font-bold uppercase tracking-wider text-xs text-center w-full px-1 truncate">
          {data.subFooter || "Company Name"}
        </div>
      </div>
    </div>
  );
};