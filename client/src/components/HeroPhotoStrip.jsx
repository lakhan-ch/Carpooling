/**
 * HeroPhotoStrip — infinite auto-scrolling image carousel.
 * Mimics the Bending Spoons hero: 3 visible cards with rounded corners,
 * the centre card slightly larger, infinite smooth CSS marquee scroll.
 * 
 * Layout:
 *  [card] [card·LARGE] [card] [card] [card·LARGE] [card] ...repeated
 * The whole strip is duplicated so marquee loops seamlessly.
 */

const photos = [
  { src: '/ride1.jpg', alt: 'Friends sharing a carpool', label: '🚗 Koramangala → Whitefield' },
  { src: '/ride2.jpg', alt: 'Commuter looking out the window', label: '🌆 Mumbai → Pune' },
  { src: '/ride3.jpg', alt: 'Driver on city roads', label: '🛣️ Delhi → Noida' },
  { src: '/ride4.jpg', alt: 'Group ride with friends', label: '😄 Bangalore → Mysore' },
  { src: '/ride5.jpg', alt: 'Pickup at doorstep', label: '📍 HSR → Electronic City' },
];

export default function HeroPhotoStrip() {
  // Duplicate the array to make a seamless infinite loop
  const track = [...photos, ...photos];

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        /* Fade out edges */
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        paddingBottom: '2px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '20px',
          animation: 'marquee-scroll 28s linear infinite',
          width: 'max-content',
          willChange: 'transform',
        }}
      >
        {track.map((photo, i) => {
          const isCentre = i % photos.length === 1; // 2nd in each group is the "hero" card
          return (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: isCentre ? '480px' : '320px',
                height: isCentre ? '380px' : '300px',
                borderRadius: '28px',
                overflow: 'hidden',
                position: 'relative',
                alignSelf: 'center',
                transition: 'transform 0.3s ease',
                boxShadow: isCentre
                  ? '0 20px 60px rgba(0,0,0,0.18)'
                  : '0 8px 32px rgba(0,0,0,0.10)',
              }}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                loading="eager"
              />
              {/* Route label overlay at bottom */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  left: '14px',
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#0a0a0a',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                {photo.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inject the keyframe animation inline — avoids needing to touch global CSS */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-50%)); }
        }
      `}</style>
    </div>
  );
}
