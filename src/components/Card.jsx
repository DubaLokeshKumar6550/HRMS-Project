import React from 'react';

export default function Card({
  title,
  subtitle,
  children,
  headerAction,
  className = '',
  dataW,
  style = {},
}) {
  return (
    <div
      data-w={dataW}
      className={`glass-card ${className}`}
      style={style}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-line/40">
          <div className="flex flex-col gap-0.5 min-w-0">
            {title && (
              <h2 className="text-[17px] font-display font-bold text-ink tracking-tight flex items-center gap-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <span className="text-[12px] text-muted font-body leading-normal">
                {subtitle}
              </span>
            )}
          </div>
          {headerAction && (
            <div className="flex items-center gap-2 shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-3 min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}

