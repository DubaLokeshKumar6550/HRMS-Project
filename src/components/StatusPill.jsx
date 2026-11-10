import React from 'react';

const STATUS_CONFIG = {
  'in-office': {
    label: 'In office',
    color: 'var(--good)',
    dotBg: 'var(--good)',
  },
  'remote': {
    label: 'Remote',
    color: 'var(--info)',
    dotBg: 'var(--info)',
  },
  'late': {
    label: 'Late',
    color: 'var(--warn)',
    dotBg: 'var(--warn)',
  },
  'on-leave': {
    label: 'On leave',
    color: 'var(--accent2)',
    dotBg: 'var(--accent2)',
  },
  'not-punched': {
    label: 'Not punched',
    color: 'var(--bad)',
    dotBg: 'var(--bad)',
  },
  // Overloaded for performance/OKR statuses
  'on-track': {
    label: 'On track',
    color: 'var(--good)',
    dotBg: 'var(--good)',
  },
  'at-risk': {
    label: 'At risk',
    color: 'var(--warn)',
    dotBg: 'var(--warn)',
  },
  'behind': {
    label: 'Behind',
    color: 'var(--bad)',
    dotBg: 'var(--bad)',
  },
};

export default function StatusPill({ status = 'in-office', extraText = '', className = '' }) {
  const normKey = (status || '').toLowerCase().replace(/\s+/g, '-');
  const config = STATUS_CONFIG[normKey] || {
    label: status,
    color: 'var(--muted)',
    dotBg: 'var(--muted)',
  };

  const displayText = extraText ? `${config.label} ${extraText}` : config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium tracking-normal select-none ${className}`}
      style={{
        border: `1px solid ${config.color}`,
        color: config.color,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
      }}
    >
      <span
        className="w-[7px] h-[7px] rounded-full shrink-0"
        style={{ backgroundColor: config.dotBg }}
        aria-hidden="true"
      />
      <span>{displayText}</span>
    </span>
  );
}

