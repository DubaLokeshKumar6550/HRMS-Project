import React from 'react';

export default function Select({
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  error = false,
  className = '',
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={ariaDescribedBy}
        className={`w-full appearance-none bg-surface2 text-ink text-[13px] font-medium px-3.5 py-2.5 rounded-xl border transition-all duration-150 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? 'border-bad focus:border-bad focus:ring-2 focus:ring-bad/30'
            : 'border-line hover:border-line/80 focus:border-accent focus:ring-2 focus:ring-accent/20'
        } ${className}`}
        style={{ colorScheme: 'dark' }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-[#0a222b] text-muted">
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val} className="bg-[#0a222b] text-ink">
              {label}
            </option>
          );
        })}
      </select>

      {/* Custom dropdown chevron */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

