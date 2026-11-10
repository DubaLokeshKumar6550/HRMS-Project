import React from 'react';

// Generates a consistent HSL color based on the person's name
function getHueFromName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
}

export default function Avatar({ name = 'PN', size = 34, className = '', customBg }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');

  const hue = getHueFromName(name);
  const background = customBg || `hsl(${hue}, 52%, 40%)`;

  return (
    <div
      className={`inline-flex items-center justify-center font-display font-bold text-white shrink-0 select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: background,
        fontSize: `${Math.max(11, Math.round(size * 0.38))}px`,
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
      aria-label={name}
      title={name}
    >
      {initials}
    </div>
  );
}

