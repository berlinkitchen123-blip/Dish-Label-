import React from 'react';
import { LabelData } from '../types';

interface LabelPreviewProps {
  data: LabelData;
  scale?: number;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({ data, scale = 1 }) => {
  // Use full name
  const rawName = (data.customerName || "").toUpperCase();
  
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
        {/* 1. Customer Name */}
        <div className="w-full flex justify-center items-center mt-1 mb-0.5">
          <span className="text-black font-extrabold text-[16px] leading-none uppercase tracking-tight truncate px-1">
            {rawName}
          </span>
        </div>

        {/* 2. Dish Name (Below Customer) */}
        <div className="w-full flex justify-center mb-2 px-1 h-9 items-start">
          <p className="text-gray-900 text-center font-normal text-[13px] leading-snug line-clamp-2">
            {data.dishName || "Dish Name Content"}
          </p>
        </div>

        {/* 3. Dish Letter (Circle or Box) */}
        <div className="flex flex-col justify-center items-center mb-1">
          {dishLetter.length > 2 ? (
             <div className="px-2 h-[30px] rounded-[4px] border-[1.5px] border-black flex items-center justify-center min-w-[45px]">
                <span className="text-black font-bold text-[13px] leading-none uppercase">{dishLetter}</span>
             </div>
          ) : (
             <div className="w-[30px] h-[30px] rounded-full border-[1.5px] border-black flex items-center justify-center">
                <span className="text-black font-bold text-[17px] leading-none">{dishLetter}</span>
             </div>
          )}
        </div>

        {/* 4. Dish Type & Allergens (Small, above footer) */}
        <div className="mt-auto w-full pb-1">
            {data.dishType && (
            <div className="w-full text-center mb-[2px]">
                <p className="text-black font-bold uppercase text-[9px] truncate px-2">
                {data.dishType}
                </p>
            </div>
            )}
            {data.allergens && (
            <div className="w-full text-center mb-[2px]">
                <p className="text-black font-bold uppercase text-[8px] truncate px-2">
                {data.allergens}
                </p>
            </div>
            )}

            {/* 5. Restaurant Name (Footer) */}
            <div className="w-full text-center pt-[2px]">
            <p className="text-black font-bold uppercase text-[9px] tracking-wide truncate">
                {brandText}
            </p>
            </div>
        </div>
      </div>
    </div>
  );
};