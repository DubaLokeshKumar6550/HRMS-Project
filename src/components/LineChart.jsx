import React from 'react';

export default function LineChart({
  data = [], // [{ day: '7 Oct', rate: 93.5 }]
  height = 160,
  yMin = 88,
  yMax = 100,
  unit = '%',
  ariaLabel = 'Attendance rate trend line chart',
  className = '',
}) {
  if (!data || data.length === 0) {
    return <div className="text-[12px] text-muted py-8 text-center">No trend data available</div>;
  }

  const width = 500;
  const paddingLeft = 36;
  const paddingRight = 36;
  const paddingTop = 20;
  const paddingBottom = 26;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const normY = Math.min(1, Math.max(0, (d.rate - yMin) / (yMax - yMin)));
    const y = paddingTop + chartHeight - normY * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  const lastPoint = points[points.length - 1];

  // Grid lines (3 horizontal lines)
  const gridTicks = [yMin, (yMin + yMax) / 2, yMax];

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
        role="img"
        aria-label={ariaLabel}
      >
        {/* Horizontal grid lines */}
        {gridTicks.map((val, idx) => {
          const y = paddingTop + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="var(--line)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 6}
                y={y + 3}
                textAnchor="end"
                className="text-[10px] fill-muted font-mono"
              >
                {Math.round(val)}{unit}
              </text>
            </g>
          );
        })}

        {/* Shaded Area Fill */}
        <path
          d={areaD}
          fill="var(--accent)"
          fillOpacity="0.14"
        />

        {/* Accent Line */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((pt, idx) => {
          const isLast = idx === points.length - 1;
          if (!isLast && idx % 3 !== 0) return null;
          return (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={isLast ? 4.5 : 2.5}
              fill={isLast ? 'var(--accent)' : 'var(--bg)'}
              stroke="var(--accent)"
              strokeWidth={isLast ? '2' : '1.5'}
            />
          );
        })}

        {/* Last point label badge */}
        {lastPoint && (
          <g>
            <rect
              x={Math.min(width - 50, lastPoint.x - 22)}
              y={lastPoint.y - 24}
              width="44"
              height="18"
              rx="4"
              fill="var(--accent)"
            />
            <text
              x={Math.min(width - 28, lastPoint.x)}
              y={lastPoint.y - 12}
              textAnchor="middle"
              className="text-[10.5px] font-bold fill-on-accent font-mono"
            >
              {lastPoint.rate}{unit}
            </text>
          </g>
        )}

        {/* X Axis Day Labels */}
        {points.map((pt, idx) => {
          if (idx !== 0 && idx !== Math.floor(points.length / 2) && idx !== points.length - 1) return null;
          return (
            <text
              key={`label-${idx}`}
              x={pt.x}
              y={height - 6}
              textAnchor={idx === 0 ? 'start' : idx === points.length - 1 ? 'end' : 'middle'}
              className="text-[10px] fill-muted font-body"
            >
              {pt.day}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

