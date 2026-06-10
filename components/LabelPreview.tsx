import React from 'react';
import { LabelData } from '../types';

export const DEFAULT_LOGO_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MjAgOTAiPgogIDx0ZXh0IHg9IjI2MCIgeT0iNzYiCiAgICB0ZXh0LWFuY2hvcj0ibWlkZGxlIgogICAgZm9udC1mYW1pbHk9IkltcGFjdCwgJ0ZyYW5rbGluIEdvdGhpYyBIZWF2eScsICdBcmlhbCBOYXJyb3cnLCBzYW5zLXNlcmlmIgogICAgZm9udC13ZWlnaHQ9IjkwMCIKICAgIGZvbnQtc2l6ZT0iNzgiCiAgICBmaWxsPSIjMUI1RTIwIgogICAgbGV0dGVyLXNwYWNpbmc9IjUiCiAgICB0ZXh0TGVuZ3RoPSI1MTAiCiAgICBsZW5ndGhBZGp1c3Q9InNwYWNpbmdBbmRHbHlwaHMiPkJFTExBQk9OQTwvdGV4dD4KPC9zdmc+';

const BRAND_GREEN = '#1B5E20';
const FOOTER_PX   = 44;   // space for 20px BELLABONA + optional sub-line

// Font scales DOWN as more fields are present; 30px is the max (1 field)
const getFs = (count: number): number => {
  if (count <= 1) return 28;
  if (count === 2) return 20;
  if (count === 3) return 14;
  return 11;   // 4+ fields
};

const getCirclePx = (count: number): number => {
  if (count <= 1) return 44;
  if (count === 2) return 34;
  if (count === 3) return 28;
  return 22;
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
  const logo         = logoUrl ?? DEFAULT_LOGO_URL;

  const count    = [customerName, dishName, dishLetter].filter(Boolean).length;
  const fs       = getFs(count);
  const circlePx = getCirclePx(count);

  return (
    <div
      className="flex flex-col items-center mx-auto"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '240px' }}
    >
      <div
        style={{
          width: '240px', height: '168px',
          backgroundColor: '#fff',
          border: '1px solid #d1d5db',
          borderRadius: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden'         // hard clip — nothing escapes the label
        }}
      >

        {/* ── Main content: centred in the zone above footer ── */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          bottom: `${FOOTER_PX}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${count <= 1 ? 6 : count === 2 ? 4 : 3}px`,
          padding: '6px 10px 4px',
          zIndex: 10,
          overflow: 'hidden'
        }}>
          {customerName && (
            <span style={{
              fontSize: `${fs}px`, fontWeight: 900,
              textTransform: 'uppercase', lineHeight: 1.1, color: '#111',
              textAlign: 'center', maxWidth: '100%',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              display: 'block'
            }}>
              {customerName}
            </span>
          )}

          {dishName && (
            <p style={{
              fontSize: `${fs}px`, fontWeight: count === 1 ? 600 : 400,
              lineHeight: 1.2, color: '#F06EB5', textAlign: 'center', margin: 0,
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
            dishLetter.length > 2 ? (
              <div style={{
                border: '2px solid #111', borderRadius: '5px',
                padding: `${count <= 2 ? '3px 10px' : '2px 7px'}`,
                display: 'inline-flex', alignItems: 'center', flexShrink: 0
              }}>
                <span style={{ fontSize: `${Math.max(fs - 2, 11)}px`, fontWeight: 700 }}>
                  {dishLetter}
                </span>
              </div>
            ) : (
              <div style={{
                width: `${circlePx}px`, height: `${circlePx}px`,
                borderRadius: '50%', border: '2px solid #111',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ fontSize: `${circlePx * 0.55}px`, fontWeight: 700, lineHeight: 1 }}>
                  {dishLetter}
                </span>
              </div>
            )
          )}
        </div>

        {/* ── Footer: logo image + optional allergens/type, pinned at bottom ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10
        }}>
          {/* separator */}
          <div style={{
            height: '1px', margin: '0 10px',
            backgroundColor: BRAND_GREEN, opacity: 0.45
          }} />
          <div style={{ padding: '2px 8px 4px', textAlign: 'center' }}>
            {(dishType || allergens) && (
              <p style={{
                fontSize: '9px', fontWeight: 700, color: '#555',
                textTransform: 'uppercase', letterSpacing: '0.4px',
                margin: '0 0 1px', lineHeight: 1.2,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
              }}>
                {[dishType, allergens].filter(Boolean).join(' · ')}
              </p>
            )}
            <img
              src={logo}
              alt="Bellabona"
              draggable={false}
              style={{
                maxHeight: '22px', maxWidth: '90%',
                objectFit: 'contain',
                display: 'inline-block',
                mixBlendMode: 'multiply'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
