import React from 'react';

export default function Switch({
  checked = false,
  onChange,
  disabled = false,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className = '',
}) {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      id={id}
      name={name}
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center w-[40px] h-[22px] rounded-full transition-all duration-200 select-none border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#06141c] shrink-0 ${
        checked
          ? 'bg-accent border-accent/80'
          : 'bg-surface2 hover:bg-surface2/80'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <span
        className={`inline-block w-[16px] h-[16px] rounded-full transition-transform duration-200 shadow-sm ${
          checked
            ? 'translate-x-[20px] bg-on-accent'
            : 'translate-x-[2px] bg-muted'
        }`}
      />
    </button>
  );
}

