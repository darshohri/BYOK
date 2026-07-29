import React, { useEffect, useRef } from 'react';
import './SpotlightCard.css';

const glowColorMap = {
  blue:   { base: 220, spread: 40 },
  purple: { base: 270, spread: 50 },
  green:  { base: 140, spread: 40 },
  red:    { base: 0,   spread: 40 },
  orange: { base: 30,  spread: 40 },
};

/*
 * Single shared pointer-tracking listener.
 * Calculates cursor position RELATIVE TO each card's bounding box.
 */
const registeredCards = new Set();
let listenerAttached = false;

function syncAllCards(e) {
  const { clientX, clientY } = e;

  for (const el of registeredCards) {
    const rect = el.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    // Normalised position across the card width for hue shifting
    const xp = rect.width > 0 ? localX / rect.width : 0;

    // Set pixel positions for the gradient center
    el.style.setProperty('--glow-x', `${localX}px`);
    el.style.setProperty('--glow-y', `${localY}px`);
    el.style.setProperty('--xp', xp.toFixed(3));

    // If cursor is near/inside the card, brighten the glow
    const isNear =
      clientX >= rect.left - 100 &&
      clientX <= rect.right + 100 &&
      clientY >= rect.top - 100 &&
      clientY <= rect.bottom + 100;

    el.style.setProperty('--glow-opacity', isNear ? '0.8' : '0');
    el.style.setProperty('--bloom-opacity', isNear ? '0.25' : '0');
  }
}

function registerCard(el) {
  registeredCards.add(el);
  if (!listenerAttached) {
    document.addEventListener('pointermove', syncAllCards, { passive: true });
    listenerAttached = true;
  }
}

function unregisterCard(el) {
  registeredCards.delete(el);
  if (registeredCards.size === 0 && listenerAttached) {
    document.removeEventListener('pointermove', syncAllCards);
    listenerAttached = false;
  }
}

/**
 * GlowCard — cursor-tracking spotlight card with coloured border glow.
 *
 * Props
 * -----
 * children     — card content
 * className    — extra class names merged onto the outer wrapper
 * glowColor    — 'blue' | 'purple' | 'green' | 'red' | 'orange'
 * style        — extra inline styles (width / height / etc.)
 */
const GlowCard = ({
  children,
  className = '',
  glowColor = 'blue',
  style = {},
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    registerCard(el);
    return () => unregisterCard(el);
  }, []);

  const { base, spread } = glowColorMap[glowColor] ?? glowColorMap.blue;

  const cssVars = {
    '--base': base,
    '--spread': spread,
    '--hue': `calc(${base} + (var(--xp, 0.5) * ${spread}))`,
    '--spotlight-size': '350px',
  };

  return (
    <div
      ref={cardRef}
      className={`glow-card ${className}`}
      style={{ ...cssVars, ...style }}
    >
      <div className="glow-card-inner">
        {children}
      </div>
    </div>
  );
};

export { GlowCard };
