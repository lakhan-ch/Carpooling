import { useEffect, useRef, useState } from 'react';

/**
 * ScrollRevealText — Bending Spoons style paragraph reveal.
 * 
 * Each word starts at opacity 0.15 + blur(4px).
 * As the user scrolls and the word enters the "active zone",
 * it transitions to opacity 1 + blur(0) with a slight stagger.
 * 
 * Effect: the paragraph appears to be "typed out" / revealed by scroll.
 */
export default function ScrollRevealText({ text, className = '', style = {} }) {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0); // 0 → 1: how far through we've scrolled

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Start revealing when top of element hits 80% of viewport height
      // Finish revealing when bottom of element hits 20% of viewport height
      const start = windowH * 0.85;
      const end   = windowH * 0.15;

      // Map rect.top from [start → end] to progress [0 → 1]
      const raw = (start - rect.top) / (start - end);
      setProgress(Math.min(1, Math.max(0, raw)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const words = text.split(' ');

  return (
    <p
      ref={containerRef}
      className={className}
      style={{
        lineHeight: 1.55,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0 0.28em',
        ...style,
      }}
    >
      {words.map((word, i) => {
        // Each word reveals when progress passes its threshold
        const wordThreshold = i / words.length;
        // Give a slight lookahead so reveal feels slightly ahead of scroll
        const wordProgress = Math.min(1, Math.max(0, (progress - wordThreshold * 0.7) / 0.35));

        const opacity  = 0.13 + wordProgress * 0.87;          // 0.13 → 1.0
        const blur     = (1 - wordProgress) * 5;              // 5px → 0
        const translateY = (1 - wordProgress) * 6;            // 6px → 0

        return (
          <span
            key={i}
            style={{
              opacity,
              filter: `blur(${blur.toFixed(2)}px)`,
              transform: `translateY(${translateY.toFixed(2)}px)`,
              transition: 'opacity 0.25s ease, filter 0.25s ease, transform 0.25s ease',
              display: 'inline-block',
              willChange: 'opacity, filter, transform',
            }}
          >
            {word}
          </span>
        );
      })}
    </p>
  );
}
