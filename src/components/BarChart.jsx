import React from 'react';

export default function BarChart({
  data = [], // [{ label: 'Mon', value: 8 }]
  height = 140,
  maxVal = 10,
  barColor = 'var(--accent)',
  className = '',
  ariaLabel = 'Bar chart',
}) {
  const computedMax = maxVal || Math.max(...data.map(d => d.value), 1);

  return (
    <div
      className={`w-full flex items-end justify-between gap-3 pt-4 pb-1 ${className}`}
      style={{ height: `${height}px` }}
      role="img"
      aria-label={ariaLabel}
    >
      {data.map((item, idx) => {
        const heightPct = Math.min(100, Math.max(10, (item.value / computedMax) * 100));
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
            <span className="text-[11px] font-mono text-muted group-hover:text-ink transition-colors tabular-nums">
              {item.value}
            </span>
            <div className="w-full max-w-[28px] h-full flex items-end">
              <div
                className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-110"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: item.color || barColor,
                  border: '1px solid var(--line)',
                  borderBottom: 'none',
                }}
              />
            </div>
            <span className="text-[11px] text-muted font-medium font-body mt-1 truncate">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

