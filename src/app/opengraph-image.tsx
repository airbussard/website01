import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'getemergence.com - Webentwicklung';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '24px',
            }}
          >
            <span style={{ color: 'white', fontSize: '40px', fontWeight: 'bold' }}>
              {'</>'}
            </span>
          </div>
          <span
            style={{
              fontSize: '42px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #0284c7, #0ea5e9)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            getemergence.com
          </span>
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#1e293b',
            textAlign: 'center',
            marginBottom: '24px',
            lineHeight: 1.2,
          }}
        >
          Webentwicklung aus Deutschland
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            color: '#64748b',
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          Websites, Web-Apps & Mobile Apps für Unternehmen
        </div>

        {/* Badges */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '48px',
          }}
        >
          {['Made in Germany', 'Persönliche Betreuung', 'Faire Preise'].map((text) => (
            <div
              key={text}
              style={{
                background: 'white',
                padding: '12px 24px',
                borderRadius: '100px',
                border: '2px solid #e2e8f0',
                fontSize: '20px',
                color: '#475569',
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
