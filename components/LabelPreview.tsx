import React from 'react';
import { LabelData } from '../types';

export const DEFAULT_LOGO_URL = 'data:image/png;base64,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';

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
            {allergens && (
              <p style={{
                fontSize: '9px', fontWeight: 700, color: '#555',
                textTransform: 'uppercase', letterSpacing: '0.4px',
                margin: '0 0 1px', lineHeight: 1.2,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
              }}>
                {allergens}
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
