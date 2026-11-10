import React from 'react';

export default function Progress({
  value = 0,
  max = 100,
  variant = 'normal', // 'normal', 'warn', 'bad', 'good'
  height = 8,
  className = '',
  showLabel = false,
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  let fillColor = 'var(--accent)';
  if (variant === 'warn') fillColor = 'var(--warn)';
  if (variant === 'bad') fillColor = 'var(--bad)';
  if (variant === 'good') fillColor = 'var(--good)';

  return (
    <div className={`w-full flex items-center gap-2 ${className}`}>
      <div
        className="w-full rounded-full bg-surface2 border border-line overflow-hidden p-[1px] relative"
        style={{ height: `${height}px` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-[12px] font-mono tabular-nums text-muted shrink-0">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

