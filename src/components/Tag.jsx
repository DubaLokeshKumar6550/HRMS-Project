import React from 'react';

export default function Tag({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted bg-surface2 border border-line rounded-[4px] select-none ${className}`}
    >
      {children}
    </span>
  );
}

