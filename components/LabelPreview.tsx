import React from 'react';
import { LabelData } from '../types';

// Default Bellabona wordmark — dark-green SVG embedded as base64
export const DEFAULT_LOGO_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MjAgOTAiPgogIDx0ZXh0IHg9IjI2MCIgeT0iNzgiCiAgICB0ZXh0LWFuY2hvcj0ibWlkZGxlIgogICAgZm9udC1mYW1pbHk9IkFyaWFsIEJsYWNrLCBBcmlhbCwgc2Fucy1zZXJpZiIKICAgIGZvbnQtd2VpZ2h0PSI5MDAiCiAgICBmb250LXNpemU9IjgyIgogICAgZmlsbD0iIzFCNUUyMCIKICAgIGxldHRlci1zcGFjaW5nPSItMSI+QkVMTEFCT05BPC90ZXh0Pgo8L3N2Zz4=';

interface LabelPreviewProps {
  data: LabelData;
  scale?: number;
  logoUrl?: string;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({ data, scale = 1, logoUrl }) => {
  const customerName = (data.customerName || "").toUpperCase().trim();
  const dishLetter   = (data.dishLetter  || "").toUpperCase().trim();
  const dishName     = (data.dishName    || "").trim();
  const dishType     = (data.dishType    || "").trim();
  const allergens    = (data.allergens   || "").trim();
  const brandText    = (data.brand       || "BELLABONA").toUpperCase();
  const effectiveLogo = logoUrl ?? DEFAULT_LOGO_URL;

  const hasHeader  = !!customerName;
  const hasBody    = !!dishName || !!dishLetter;
  const hasFooter  = !!dishType || !!allergens || !!brandText;

  return (
    <div
      className="flex flex-col items-center mx-auto"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '240px' }}
    >
      {/* Main Box ~63mm × 38mm */}
      <div
        className="w-full bg-white rounded border border-gray-300 shadow-sm relative overflow-hidden"
        style={{ height: '145px' }}
      >
        {/* ── Watermark ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <img src={effectiveLogo} alt="" draggable={false}
            className="w-[88%] object-contain" style={{ opacity: 0.07 }} />
        </div>

        {/* ── Foreground: flex column filling full height ── */}
        <div className="relative z-10 h-full flex flex-col px-2 py-1.5">

          {/* Header: Customer Name */}
          {hasHeader && (
            <div className="flex-none text-center mb-1">
              <span className="text-black font-extrabold text-[16px] leading-none uppercase tracking-tight truncate block">
                {customerName}
              </span>
            </div>
          )}

          {/* Body: Dish Name + Letter — flex-1 so it fills available space, content centred */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 min-h-0">
            {dishName && (
              <p className="text-gray-900 text-center font-normal text-[13px] leading-snug line-clamp-2 w-full px-1">
                {dishName}
              </p>
            )}

            {dishLetter && (
              dishLetter.length > 2 ? (
                <div className="px-2 h-[26px] rounded-[4px] border-[1.5px] border-black flex items-center justify-center min-w-[40px]">
                  <span className="text-black font-bold text-[12px] leading-none uppercase">{dishLetter}</span>
                </div>
              ) : (
                <div className="w-[28px] h-[28px] rounded-full border-[1.5px] border-black flex items-center justify-center">
                  <span className="text-black font-bold text-[16px] leading-none">{dishLetter}</span>
                </div>
              )
            )}
          </div>

          {/* Footer: Dish Type, Allergens, Brand — always at bottom */}
          {hasFooter && (
            <div className="flex-none text-center space-y-[1px]">
              {dishType   && <p className="text-black font-bold uppercase text-[8px] tracking-wide truncate">{dishType}</p>}
              {allergens  && <p className="text-black font-bold uppercase text-[8px] truncate">{allergens}</p>}
              <p className="text-black font-bold uppercase text-[8px] tracking-wide truncate">{brandText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
