import React from 'react';
import { LabelData } from '../types';

export const DEFAULT_LOGO_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MjAgOTAiPgogIDx0ZXh0IHg9IjI2MCIgeT0iNzgiCiAgICB0ZXh0LWFuY2hvcj0ibWlkZGxlIgogICAgZm9udC1mYW1pbHk9IkFyaWFsIEJsYWNrLCBBcmlhbCwgc2Fucy1zZXJpZiIKICAgIGZvbnQtd2VpZ2h0PSI5MDAiCiAgICBmb250LXNpemU9IjgyIgogICAgZmlsbD0iIzFCNUUyMCIKICAgIGxldHRlci1zcGFjaW5nPSItMSI+QkVMTEFCT05BPC90ZXh0Pgo8L3N2Zz4=';

const BRAND_GREEN = '#1B5E20';
const FOOTER_PX   = 26;

// Returns font size (px) for the main content area based on how many fields are filled
const getContentFontSize = (count: number) => {
  if (count === 0) return 14;
  if (count === 1) return 20;   // just one thing → large
  if (count === 2) return 16;
  if (count === 3) return 13;
  return 11;                    // 4+ fields → compact
};

const getCircleSize = (count: number) => {
  if (count <= 1) return 36;    // big circle
  if (count === 2) return 30;
  return 24;
};

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

  // Count how many main content fields are present
  const contentItems = [customerName, dishName, dishLetter].filter(Boolean);
  const count        = contentItems.length;
  const fs           = getContentFontSize(count);
  const circleSize   = getCircleSize(count);

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
        {/* ── Watermark ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
             style={{ paddingBottom: `${FOOTER_PX}px` }}>
          <img src={logo} alt="" draggable={false}
            style={{ width: '82%', objectFit: 'contain', opacity: 0.10 }} />
        </div>

        {/* ── Main content: fills space above footer, font scales with content count ── */}
        <div
          className="absolute inset-x-0 top-0 flex flex-col items-center justify-center gap-1.5 px-3"
          style={{ bottom: `${FOOTER_PX}px`, zIndex: 10 }}
        >
          {customerName && (
            <span style={{
              fontSize: `${fs}px`,
              fontWeight: 900,
              letterSpacing: count === 1 ? '-0.5px' : '-0.3px',
              textTransform: 'uppercase',
              lineHeight: 1.15,
              color: '#111',
              textAlign: 'center',
              maxWidth: '100%',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis'
            }}>
              {customerName}
            </span>
          )}

          {dishName && (
            <p style={{
              fontSize: `${fs}px`,
              fontWeight: count === 1 ? 600 : 400,
              lineHeight: 1.3,
              color: '#222',
              textAlign: 'center',
              margin: 0,
              maxWidth: '100%',
              display: '-webkit-box',
              WebkitLineClamp: count === 1 ? 3 : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {dishName}
            </p>
          )}

          {dishLetter && (
            <div style={{ marginTop: count > 1 ? '1px' : '2px' }}>
              {dishLetter.length > 2 ? (
                <div style={{
                  border: `${count <= 2 ? 2 : 1.5}px solid #111`,
                  borderRadius: '5px',
                  padding: `${count <= 2 ? '3px 10px' : '2px 7px'}`,
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: `${fs - 1}px`, fontWeight: 700, letterSpacing: '0.5px' }}>
                    {dishLetter}
                  </span>
                </div>
              ) : (
                <div style={{
                  width:  `${circleSize}px`,
                  height: `${circleSize}px`,
                  borderRadius: '50%',
                  border: `${count <= 2 ? 2 : 1.5}px solid #111`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: `${circleSize * 0.55}px`, fontWeight: 700, lineHeight: 1 }}>
                    {dishLetter}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer: separator + BELLABONA + optional meta ── */}
        <div className="absolute bottom-0 inset-x-0" style={{ zIndex: 10 }}>
          <div style={{
            height: '0.75px',
            margin: '0 10px',
            backgroundColor: BRAND_GREEN,
            opacity: 0.4
          }} />
          <div style={{ padding: '3px 8px 4px', textAlign: 'center' }}>
            {(dishType || allergens) && (
              <p style={{
                fontSize: '6.5px', fontWeight: 700, color: '#555',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                margin: '0 0 1px', lineHeight: 1.3,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
              }}>
                {[dishType, allergens].filter(Boolean).join(' · ')}
              </p>
            )}
            <p style={{
              fontSize: '7.5px', fontWeight: 800, color: BRAND_GREEN,
              textTransform: 'uppercase', letterSpacing: '2.5px',
              margin: 0, lineHeight: 1.3
            }}>
              {brandText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
