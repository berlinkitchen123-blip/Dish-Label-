import React from 'react';
import { LabelData } from '../types';

interface LabelPreviewProps {
  data: LabelData;
  scale?: number;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({ data, scale = 1 }) => {
  // Extract first name for "First Customer name" requirement, or use full name
  const rawName = (data.customerName || "").toUpperCase();
  const firstChar = rawName.charAt(0);
  const restOfName = rawName.slice(1);
  
  const dishLetter = (data.dishLetter || "A").toUpperCase();
  const brandText = (data.brand || "RESTAURANT").toUpperCase();

  return (
    <div 
      className="flex flex-col items-center mx-auto"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        width: '240px' // Represents ~63mm
      }}
    >
      {/* Main Box - Aspect Ratio approx 63:38 */}
      {/* 63mm = ~240px, 38mm = ~145px */}
      <div 
        className="w-full bg-white rounded border border-gray-300 shadow-sm flex flex-col items-center p-2 relative overflow-hidden"
        style={{ height: '145px' }} 
      >
        {/* 1. Customer Name (Middle, First Letter Double Size) */}
        <div className="w-full flex justify-center items-baseline mt-2 mb-1">
          <span className="text-brand-green font-extrabold text-4xl leading-none uppercase tracking-tight">
            {firstChar}
          </span>
          <span className="text-brand-green font-extrabold text-xl leading-none uppercase tracking-tight">
            {restOfName}
          </span>
        </div>

        {/* 2. Dish Name (Below Customer) */}
        <div className="w-full flex justify-center mb-2 px-1">
          <p className="text-gray-900 text-center font-medium text-sm leading-tight line-clamp-2">
            {data.dishName || "Dish Name Content"}
          </p>
        </div>

        {/* 3. Dish Letter (Round Circle) */}
        <div className="flex-grow flex flex-col justify-center items-center mb-1">
          <div className="w-8 h-8 rounded-full border-2 border-brand-green flex items-center justify-center bg-brand-green/5">
            <span className="text-brand-green font-bold text-lg leading-none">
              {dishLetter}
            </span>
          </div>
          {/* Optional: Tiny dish type below letter if needed, or hidden to save space */}
          {data.dishType && (
            <span className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">{data.dishType}</span>
          )}
        </div>

        {/* 4. Allergens (Small, above footer) */}
        {data.allergens && (
           <div className="w-full text-center mb-0.5">
             <p className="text-brand-pink font-bold uppercase text-[9px] truncate px-2">
               {data.allergens}
             </p>
           </div>
        )}

        {/* 5. Restaurant Name (Footer) */}
        <div className="w-full text-center border-t border-dashed border-gray-100 pt-1">
          <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wide truncate">
            {brandText}
          </p>
        </div>
      </div>
    </div>
  );
};