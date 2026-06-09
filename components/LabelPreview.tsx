import React from 'react';
import { LabelData } from '../types';

export const DEFAULT_LOGO_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MjAgOTAiPgogIDx0ZXh0IHg9IjI2MCIgeT0iNzgiCiAgICB0ZXh0LWFuY2hvcj0ibWlkZGxlIgogICAgZm9udC1mYW1pbHk9IkFyaWFsIEJsYWNrLCBBcmlhbCwgc2Fucy1zZXJpZiIKICAgIGZvbnQtd2VpZ2h0PSI5MDAiCiAgICBmb250LXNpemU9IjgyIgogICAgZmlsbD0iIzFCNUUyMCIKICAgIGxldHRlci1zcGFjaW5nPSItMSI+QkVMTEFCT05BPC90ZXh0Pgo8L3N2Zz4=';

interface LabelPreviewProps {
  data: LabelData;
  scale?: number;
  logoUrl?: string;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({ data, scale = 1, logoUrl }) => {
  const customerName = (data.customerName || '').toUpperCase().trim();
  const dishLetter   = (data.dishLetter  || '').toUpperCase().trim();
  const dishName     = (data.dishName    || '').trim();
  const dishType     = (data.dishType    || '').trim();
  const allergens    = (data.allergens   || '').trim();
  const brandText    = (data.brand       || 'BELLABONA').toUpperCase();
  const effectiveLogo = logoUrl ?? DEFAULT_LOGO_URL;

  return (
    <div
      className="flex flex-col items-center mx-auto"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '240px' }}
    >
      {/* Main Box */}
      <div
        className="w-full bg-white rounded border border-gray-300 shadow-sm relative overflow-hidden"
        style={{ height: '145px' }}
      >
        {/* ── Watermark ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <img src={effectiveLogo} alt="" draggable={false}
            className="w-[88%] object-contain" style={{ opacity: 0.07 }} />
        </div>

        {/* ── Footer: pinned at bottom ── */}
        <div className="absolute bottom-0 left-0 right-0 px-2 pb-1.5 text-center z-10">
          {dishType   && <p className="text-black font-bold uppercase text-[8px] tracking-wide truncate leading-tight">{dishType}</p>}
          {allergens  && <p className="text-black font-bold uppercase text-[8px] truncate leading-tight">{allergens}</p>}
          <p className="text-black font-bold uppercase text-[8px] tracking-widest truncate leading-tight">{brandText}</p>
        </div>

        {/* ── Main content: centred in full label height (above footer) ── */}
        <div
          className="absolute left-0 right-0 top-0 flex flex-col items-center justify-center gap-1.5 px-2 z-10"
          style={{ bottom: '28px' }}   {/* leave room for footer */}
        >
          {customerName && (
            <span className="text-black font-extrabold text-[15px] leading-tight uppercase tracking-tight truncate w-full text-center">
              {customerName}
            </span>
          )}

          {dishName && (
            <p className="text-gray-900 text-center font-normal text-[12px] leading-snug line-clamp-2 w-full">
              {dishName}
            </p>
          )}

          {dishLetter && (
            dishLetter.length > 2 ? (
              <div className="px-2 h-[24px] rounded-[4px] border-[1.5px] border-black flex items-center justify-center min-w-[38px]">
                <span className="text-black font-bold text-[11px] leading-none uppercase">{dishLetter}</span>
              </div>
            ) : (
              <div className="w-[26px] h-[26px] rounded-full border-[1.5px] border-black flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-[15px] leading-none">{dishLetter}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
