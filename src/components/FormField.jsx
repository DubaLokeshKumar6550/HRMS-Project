import React from 'react';

export default function FormField({
  id,
  label,
  hint,
  error,
  required,
  children,
  className = '',
}) {
  const errorId = error && id ? `${id}-error` : undefined;
  const hintId = hint && id ? `${id}-hint` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-[12.5px] font-semibold text-ink flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-bad ml-1" aria-hidden="true">*</span>}
          </span>
          {hint && (
            <span id={hintId} className="text-[11px] font-normal text-muted">
              {hint}
            </span>
          )}
        </label>
      )}

      {children}

      {error && (
        <span
          id={errorId}
          role="alert"
          className="text-[11.5px] font-medium text-bad flex items-center gap-1 mt-0.5"
        >
          {error}
        </span>
      )}
    </div>
  );
}

