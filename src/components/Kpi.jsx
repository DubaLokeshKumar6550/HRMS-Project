import React from 'react';

export default function Kpi({
  label,
  value,
  delta,
  deltaType = 'neutral', // 'good', 'warn', 'bad', 'neutral'
  className = '',
  onClick,
}) {
  let deltaColor = 'text-muted';
  if (deltaType === 'good') deltaColor = 'text-good';
  if (deltaType === 'warn') deltaColor = 'text-warn';
  if (deltaType === 'bad') deltaColor = 'text-bad';

  return (
    <div
      onClick={onClick}
      className={`glass-card justify-between transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-accent/40 active:scale-[0.99]' : ''
      } ${className}`}
      style={{
        padding: 'calc(var(--pad) - 4px) var(--pad)',
        gap: '6px',
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted truncate">
        {label}
      </div>

      <div
        className="font-display font-bold text-ink tabular-nums leading-none tracking-tight"
        style={{ fontSize: 'clamp(26px, 2.6vw, 34px)' }}
      >
        {value}
      </div>

      {delta && (
        <div className={`text-[12px] font-body leading-tight truncate ${deltaColor}`}>
          {delta}
        </div>
      )}
    </div>
  );
}

