import React from 'react';
import { LabelData } from '../types';

export const DEFAULT_LOGO_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MjAgOTAiPgogIDx0ZXh0IHg9IjI2MCIgeT0iNzgiCiAgICB0ZXh0LWFuY2hvcj0ibWlkZGxlIgogICAgZm9udC1mYW1pbHk9IkFyaWFsIEJsYWNrLCBBcmlhbCwgc2Fucy1zZXJpZiIKICAgIGZvbnQtd2VpZ2h0PSI5MDAiCiAgICBmb250LXNpemU9IjgyIgogICAgZmlsbD0iIzFCNUUyMCIKICAgIGxldHRlci1zcGFjaW5nPSItMSI+QkVMTEFCT05BPC90ZXh0Pgo8L3N2Zz4=';

const BRAND_GREEN = '#1B5E20';
const FOOTER_PX   = 26;   // px reserved for footer (separator + text)

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
          height: '145px',
          border: '1px solid #d1d5db',
          borderRadius: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}
      >
        {/* ── Watermark: Bellabona logo, centred, subtle ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
             style={{ paddingBottom: `${FOOTER_PX}px` }}>
          <img src={logo} alt="" draggable={false}
            style={{ width: '82%', objectFit: 'contain', opacity: 0.10 }} />
        </div>

        {/* ── Main content: centred in full label, padded below for footer ── */}
        <div
          className="absolute inset-x-0 top-0 flex flex-col items-center justify-center gap-1 px-3"
          style={{ bottom: `${FOOTER_PX}px`, zIndex: 10 }}
        >
          {customerName && (
            <span style={{
              fontSize: '15px', fontWeight: 900, letterSpacing: '-0.3px',
              textTransform: 'uppercase', lineHeight: 1.2,
              color: '#111', textAlign: 'center', maxWidth: '100%',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
            }}>
              {customerName}
            </span>
          )}

          {dishName && (
            <p style={{
              fontSize: '13px', fontWeight: 400, lineHeight: 1.35,
              color: '#222', textAlign: 'center',
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
              maxWidth: '100%', margin: 0
            }}>
              {dishName}
            </p>
          )}

          {dishLetter && (
            <div style={{ marginTop: dishName ? '2px' : 0 }}>
              {dishLetter.length > 2 ? (
                <div style={{
                  border: '1.5px solid #111', borderRadius: '4px',
                  padding: '2px 8px', display: 'inline-flex', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
                    {dishLetter}
                  </span>
                </div>
              ) : (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: '1.5px solid #111',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1 }}>
                    {dishLetter}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer: separator line + brand info ── */}
        <div className="absolute bottom-0 inset-x-0" style={{ zIndex: 10 }}>
          {/* Separator */}
          <div style={{
            height: '0.75px', margin: '0 12px',
            backgroundColor: BRAND_GREEN, opacity: 0.35
          }} />

          {/* Brand block */}
          <div style={{ padding: '3px 8px 4px', textAlign: 'center' }}>
            {(dishType || allergens) && (
              <p style={{
                fontSize: '7px', fontWeight: 700, color: '#444',
                textTransform: 'uppercase', letterSpacing: '0.4px',
                margin: 0, lineHeight: 1.4,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
              }}>
                {[dishType, allergens].filter(Boolean).join(' · ')}
              </p>
            )}
            <p style={{
              fontSize: '8px', fontWeight: 800, color: BRAND_GREEN,
              textTransform: 'uppercase', letterSpacing: '2px',
              margin: 0, lineHeight: 1.4
            }}>
              {brandText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
