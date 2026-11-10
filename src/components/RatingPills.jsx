import React from 'react';

const RATING_LEVELS = [
  { value: 1, label: '1 - Needs Improvement' },
  { value: 2, label: '2 - Developing' },
  { value: 3, label: '3 - Meets Expectations' },
  { value: 4, label: '4 - Exceeds Expectations' },
  { value: 5, label: '5 - Outstanding' },
];

export default function RatingPills({
  name,
  value,
  onChange,
  disabled = false,
  className = '',
}) {
  return (
    <div
      role="radiogroup"
      aria-label={`${name} rating`}
      className={`flex items-center gap-2 flex-wrap ${className}`}
    >
      {RATING_LEVELS.map((level) => {
        const isSelected = value === level.value;
        return (
          <button
            key={level.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(level.value)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 select-none flex items-center gap-1.5 border ${
              isSelected
                ? 'bg-accent text-on-accent border-accent shadow-sm'
                : 'bg-surface2 text-muted border-line hover:text-ink hover:border-line/80'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSelected ? 'bg-on-accent' : 'bg-muted/40'
              }`}
            />
            <span>{level.value}</span>
            <span className="hidden sm:inline opacity-80 text-[11px] font-normal">
              {level.label.split('- ')[1]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

