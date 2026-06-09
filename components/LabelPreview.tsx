import React from 'react';
import { LabelData } from '../types';

// Default Bellabona wordmark — dark-green SVG embedded as base64
export const DEFAULT_LOGO_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MjAgOTAiPgogIDx0ZXh0IHg9IjI2MCIgeT0iNzgiCiAgICB0ZXh0LWFuY2hvcj0ibWlkZGxlIgogICAgZm9udC1mYW1pbHk9IkFyaWFsIEJsYWNrLCBBcmlhbCwgc2Fucy1zZXJpZiIKICAgIGZvbnQtd2VpZ2h0PSI5MDAiCiAgICBmb250LXNpemU9IjgyIgogICAgZmlsbD0iIzFCNUUyMCIKICAgIGxldHRlci1zcGFjaW5nPSItMSI+QkVMTEFCT05BPC90ZXh0Pgo8L3N2Zz4=';

interface LabelPreviewProps {
  data: LabelData;
  scale?: number;
  logoUrl?: string;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({ data, scale = 1, logoUrl }) => {
  const rawName = (data.customerName || "").toUpperCase().trim();
  const dishLetter = (data.dishLetter || "").toUpperCase().trim();
  const brandText = (data.brand || "BELLABONA").toUpperCase();
  const effectiveLogo = logoUrl ?? DEFAULT_LOGO_URL;

  return (
    <div
      className="flex flex-col items-center mx-auto"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '240px' }}
    >
      {/* Main Box ~63mm × 38mm */}
      <div
        className="w-full bg-white rounded border border-gray-300 shadow-sm flex flex-col items-center p-2 relative overflow-hidden"
        style={{ height: '145px' }}
      >
        {/* ── Watermark logo ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <img
            src={effectiveLogo}
            alt=""
            draggable={false}
            className="w-[88%] object-contain"
            style={{ opacity: 0.07 }}
          />
        </div>

        {/* ── Foreground content ── */}

        {/* 1. Customer Name — only if provided */}
        {rawName ? (
          <div className="w-full flex justify-center items-center mt-1 mb-0.5 relative z-10">
            <span className="text-black font-extrabold text-[16px] leading-none uppercase tracking-tight truncate px-1">
              {rawName}
            </span>
          </div>
        ) : <div className="mt-1 mb-0.5" />}

        {/* 2. Dish Name */}
        <div className="w-full flex justify-center mb-2 px-1 h-9 items-start relative z-10">
          <p className="text-gray-900 text-center font-normal text-[13px] leading-snug line-clamp-2">
            {data.dishName || ""}
          </p>
        </div>

        {/* 3. Dish Letter — only if provided */}
        {dishLetter ? (
          <div className="flex flex-col justify-center items-center mb-1 relative z-10">
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
        ) : <div className="mb-1" />}

        {/* 4. Dish Type + Allergens + Brand footer */}
        <div className="mt-auto w-full pb-1 relative z-10">
          {data.dishType && (
            <div className="w-full text-center mb-[2px]">
              <p className="text-black font-bold uppercase text-[9px] truncate px-2">{data.dishType}</p>
            </div>
          )}
          {data.allergens && (
            <div className="w-full text-center mb-[2px]">
              <p className="text-black font-bold uppercase text-[8px] truncate px-2">{data.allergens}</p>
            </div>
          )}

          {/* 5. Brand text footer */}
          <div className="w-full text-center pt-[2px]">
            <p className="text-black font-bold uppercase text-[9px] tracking-wide truncate">{brandText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
