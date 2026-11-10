import React from 'react';

export default function Checklist({
  items = [], // [{ id: 'chk-1', text: 'Confirm attendance', done: false }]
  onToggle,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {items.map((item) => (
        <label
          key={item.id}
          className="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-surface2/50 group select-none"
        >
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => onToggle && onToggle(item.id)}
            className="w-4 h-4 mt-0.5 rounded cursor-pointer border-line bg-surface2 focus:ring-offset-0 focus:ring-2 focus:ring-accent"
            style={{ accentColor: 'var(--accent)' }}
          />
          <span
            className={`text-[13.5px] font-body transition-all duration-200 leading-snug ${
              item.done
                ? 'text-muted line-through opacity-70'
                : 'text-ink group-hover:text-ink'
            }`}
          >
            {item.text}
          </span>
        </label>
      ))}
    </div>
  );
}

