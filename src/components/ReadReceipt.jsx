import React from 'react';

export default function ReadReceipt({
  readCount = 0,
  totalCount = 24,
  ackCount = 0,
  showAck = true,
  onClick,
  className = '',
}) {
  const percentage = Math.round((readCount / (totalCount || 1)) * 100);

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`flex flex-col gap-1 min-w-[140px] ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
      title="Click to view read and unread members"
    >
      <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
        <span className="group-hover:text-ink transition-colors">
          <strong className="text-ink font-bold tabular-nums">{readCount}</strong> of{' '}
          <span className="tabular-nums">{totalCount}</span> read
        </span>
        <span className="text-[10px] text-accent font-mono tabular-nums">{percentage}%</span>
      </div>

      <div className="w-full h-1.5 bg-surface2 rounded-full overflow-hidden border border-line/40">
        <div
          className="h-full bg-accent transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showAck && ackCount > 0 && (
        <span className="text-[10.5px] text-muted/80">
          <span className="text-good font-semibold tabular-nums">{ackCount}</span> acknowledged
        </span>
      )}
    </div>
  );
}

