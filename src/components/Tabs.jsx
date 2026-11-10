import React from 'react';

export default function Tabs({
  tabs = [], // [{ id: 'all', label: 'All', count: 7 }]
  activeId,
  onChange,
  className = '',
  size = 'md', // 'sm', 'md'
}) {
  const padClass = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-[12px]';

  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1 rounded-full bg-surface2/60 border border-line backdrop-blur-md overflow-x-auto max-w-full ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-pressed={isActive}
            onClick={() => onChange(tab.id)}
            className={`rounded-full font-medium transition-all duration-200 shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${padClass} ${
              isActive
                ? 'bg-accent text-on-accent font-semibold shadow-sm'
                : 'text-muted hover:text-ink hover:bg-surface2'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                  isActive
                    ? 'bg-black/20 text-on-accent'
                    : 'bg-surface2 text-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

