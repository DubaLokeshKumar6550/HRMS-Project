import React, { useEffect } from 'react';

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 400,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
          className="w-screen max-w-[400px] flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200"
          style={{
            backgroundColor: '#0a222b',
            borderLeft: '1px solid var(--line)',
            color: 'var(--ink)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-line/50 shrink-0">
            <div>
              <h2
                id="drawer-title"
                className="text-[18px] font-display font-bold text-ink"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-[12px] text-muted font-body mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface2 transition-colors border border-line/40 text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
            {children}
          </div>
        </aside>
      </div>
    </div>
  );
}

