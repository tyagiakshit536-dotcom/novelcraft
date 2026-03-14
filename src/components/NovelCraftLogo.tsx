import { useEffect, useState } from 'react';

type LogoSize = 'large' | 'medium' | 'small' | 'icon' | 'tiny';

interface NovelCraftLogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeMap = {
  large: { icon: 80, wordmarkSize: 28, byline: 11 },
  medium: { icon: 60, wordmarkSize: 22, byline: 9 },
  small: { icon: 36, wordmarkSize: 16, byline: 0 },
  icon: { icon: 32, wordmarkSize: 0, byline: 0 },
  tiny: { icon: 24, wordmarkSize: 0, byline: 0 },
};

export default function NovelCraftLogo({ size = 'small', showWordmark = true, onClick, className = '' }: NovelCraftLogoProps) {
  const [loaded, setLoaded] = useState(false);
  const s = sizeMap[size];

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  const iconOnly = size === 'icon' || size === 'tiny';

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      onClick={onClick}
      style={{
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 400ms ease, transform 400ms ease',
      }}
    >
      {/* Custom Logo Image */}
      <img
        src="/novelcraftlogo.png"
        alt="NovelCraft"
        width={s.icon}
        height={s.icon}
        className="shrink-0 object-contain"
        style={{ borderRadius: '8px' }}
      />

      {/* Wordmark */}
      {showWordmark && !iconOnly && s.wordmarkSize > 0 && (
        <div className="flex flex-col">
          <span style={{ fontSize: s.wordmarkSize, lineHeight: 1.1 }} className="font-display font-bold tracking-tight">
            <span style={{ color: '#ffffff', fontWeight: 600 }}>Novel</span>
            <span style={{ color: '#E24A4A', fontWeight: 700 }}>Craft</span>
          </span>
          {s.byline > 0 && (
            <span
              style={{ fontSize: s.byline, letterSpacing: '0.15em', color: '#B09090' }}
              className="font-ui uppercase mt-0.5"
            >
              by Detha
            </span>
          )}
        </div>
      )}
    </div>
  );
}
