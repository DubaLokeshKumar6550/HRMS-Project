import React from 'react';

export default function Textarea({
  id,
  value = '',
  onChange,
  placeholder = '',
  rows = 3,
  maxLength,
  showCounter = false,
  disabled = false,
  error = false,
  className = '',
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  const currentLength = value?.length || 0;
  const isNearLimit = maxLength && currentLength > maxLength * 0.9;
  const isOverLimit = maxLength && currentLength >= maxLength;

  return (
    <div className="flex flex-col gap-1 w-full">
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={ariaDescribedBy}
        className={`w-full bg-surface2 text-ink text-[13px] font-medium px-3.5 py-2.5 rounded-xl border transition-all duration-150 outline-none resize-y placeholder:text-muted/60 disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? 'border-bad focus:border-bad focus:ring-2 focus:ring-bad/30'
            : 'border-line hover:border-line/80 focus:border-accent focus:ring-2 focus:ring-accent/20'
        } ${className}`}
        {...props}
      />

      {(showCounter || maxLength) && (
        <div className="flex justify-end">
          <span
            className={`text-[11px] font-mono tabular-nums ${
              isOverLimit ? 'text-bad font-bold' : isNearLimit ? 'text-warn' : 'text-muted'
            }`}
          >
            {currentLength} {maxLength ? `/ ${maxLength}` : 'chars'}
          </span>
        </div>
      )}
    </div>
  );
}

