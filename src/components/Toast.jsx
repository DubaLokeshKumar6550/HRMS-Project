import React, { useEffect } from 'react';

export default function Toast({
  message,
  onUndo,
  onClose,
  duration = 5000,
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-full shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
      style={{
        backgroundColor: 'var(--ink)',
        color: 'var(--bg)',
        border: '1px solid rgba(0, 0, 0, 0.2)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.8)',
      }}
    >
      <span className="text-[13px] font-semibold tracking-normal flex items-center gap-2">
        <span>{message}</span>
      </span>

      {onUndo && (
        <button
          type="button"
          onClick={onUndo}
          className="text-[12px] font-bold uppercase tracking-wider underline hover:opacity-80 active:opacity-60 transition-opacity ml-1 pl-2 border-l border-black/20"
          style={{ color: 'var(--bg)' }}
        >
          Undo
        </button>
      )}

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss toast"
        className="text-[14px] font-bold opacity-60 hover:opacity-100 transition-opacity leading-none ml-1"
      >
        ×
      </button>
    </div>
  );
}

