import React from 'react';

export default function SegBar({
  segments = [], // [{ label: 'Basic', value: 40, color: 'var(--accent)' }]
  height = 14,
  className = '',
  showLegend = false,
}) {
  const total = segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0) || 100;

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      <div
        className="w-full flex rounded-full overflow-hidden gap-[2px] bg-surface2/50 p-[1px] border border-line"
        style={{ height: `${height}px` }}
      >
        {segments.map((seg, idx) => {
          const pct = Math.max(0, (seg.value / total) * 100);
          if (pct === 0) return null;
          return (
            <div
              key={idx}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 relative group"
              style={{
                width: `${pct}%`,
                backgroundColor: seg.color,
              }}
              title={`${seg.label}: ${seg.value}${seg.unit || '%'}`}
            />
          );
        })}
      </div>

      {showLegend && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-muted font-body">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span>
                {seg.label} <strong className="font-semibold text-ink">{seg.value}%</strong>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

