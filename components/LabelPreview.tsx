import React from 'react';
import { LabelData } from '../types';

export const DEFAULT_LOGO_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MjAgOTAiPgogIDx0ZXh0IHg9IjI2MCIgeT0iNzgiCiAgICB0ZXh0LWFuY2hvcj0ibWlkZGxlIgogICAgZm9udC1mYW1pbHk9IkFyaWFsIEJsYWNrLCBBcmlhbCwgc2Fucy1zZXJpZiIKICAgIGZvbnQtd2VpZ2h0PSI5MDAiCiAgICBmb250LXNpemU9IjgyIgogICAgZmlsbD0iIzFCNUUyMCIKICAgIGxldHRlci1zcGFjaW5nPSItMSI+QkVMTEFCT05BPC90ZXh0Pgo8L3N2Zz4=';

const BRAND_GREEN = '#1B5E20';
const FOOTER_PX   = 42;   // taller footer for 20px BELLABONA

interface LabelPreviewProps {
  data: LabelData;
  scale?: number;
  logoUrl?: string;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({ data, scale = 1, logoUrl }) => {
  const customerName = (data.customerName || '').toUpperCase().trim();
  const dishLetter   = (data.dishLetter  || '').toUpperCase().trim();
  const dishName     = (data.dishName    || '').trim();
  const dishType     = (data.dishType    || '').toUpperCase().trim();
  const allergens    = (data.allergens   || '').toUpperCase().trim();
  const brandText    = (data.brand       || 'BELLABONA').toUpperCase();
  const logo         = logoUrl ?? DEFAULT_LOGO_URL;

  return (
    <div
      className="flex flex-col items-center mx-auto"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '240px' }}
    >
      <div
        className="w-full bg-white relative overflow-hidden"
        style={{
          height: '165px',
          border: '1px solid #d1d5db',
          borderRadius: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}
      >
        {/* ── Watermark ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
             style={{ paddingBottom: `${FOOTER_PX}px` }}>
          <img src={logo} alt="" draggable={false}
            style={{ width: '82%', objectFit: 'contain', opacity: 0.10 }} />
        </div>

        {/* ── Main content: 30px, centred above footer ── */}
        <div
          className="absolute inset-x-0 top-0 flex flex-col items-center justify-center gap-2 px-3"
          style={{ bottom: `${FOOTER_PX}px`, zIndex: 10 }}
        >
          {customerName && (
            <span style={{
              fontSize: '30px', fontWeight: 900, letterSpacing: '-0.5px',
              textTransform: 'uppercase', lineHeight: 1.1, color: '#111',
              textAlign: 'center', maxWidth: '100%',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
            }}>
              {customerName}
            </span>
          )}

          {dishName && (
            <p style={{
              fontSize: '30px', fontWeight: 500, lineHeight: 1.2,
              color: '#222', textAlign: 'center', margin: 0, maxWidth: '100%',
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
              {dishName}
            </p>
          )}

          {dishLetter && (
            dishLetter.length > 2 ? (
              <div style={{
                border: '2px solid #111', borderRadius: '6px',
                padding: '4px 12px', display: 'inline-flex', alignItems: 'center'
              }}>
                <span style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '0.5px' }}>{dishLetter}</span>
              </div>
            ) : (
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%',
                border: '2px solid #111',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <span style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>{dishLetter}</span>
              </div>
            )
          )}
        </div>

        {/* ── Footer: separator + 20px BELLABONA ── */}
        <div className="absolute bottom-0 inset-x-0" style={{ zIndex: 10 }}>
          <div style={{
            height: '1px', margin: '0 10px',
            backgroundColor: BRAND_GREEN, opacity: 0.4
          }} />
          <div style={{ padding: '4px 8px 5px', textAlign: 'center' }}>
            {(dishType || allergens) && (
              <p style={{
                fontSize: '9px', fontWeight: 700, color: '#555',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                margin: '0 0 2px', lineHeight: 1.3,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
              }}>
                {[dishType, allergens].filter(Boolean).join(' · ')}
              </p>
            )}
            <p style={{
              fontSize: '20px', fontWeight: 800, color: BRAND_GREEN,
              textTransform: 'uppercase', letterSpacing: '2px',
              margin: 0, lineHeight: 1.1
            }}>
              {brandText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
