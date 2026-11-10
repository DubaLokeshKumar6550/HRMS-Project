import React, { useState } from 'react';
import { ShieldCheck, Check, AlertTriangle } from 'lucide-react';

export default function UanModal({
  isOpen,
  onClose,
  employee,
  onSaveUan,
}) {
  const [uanNumber, setUanNumber] = useState('1014 8892 4102');
  const [error, setError] = useState('');

  if (!isOpen || !employee) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanUan = uanNumber.replace(/\s+/g, '');
    if (cleanUan.length !== 12 || isNaN(cleanUan)) {
      setError('UAN must be exactly 12 numeric digits.');
      return;
    }
    setError('');
    onSaveUan(employee.id, cleanUan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="uan-modal-title"
        className="relative w-full max-w-md rounded-tpl bg-[#0a222b] border border-line p-5 shadow-2xl flex flex-col gap-4 text-ink animate-in fade-in zoom-in-95 duration-150"
        style={{ borderRadius: 'var(--radius)' }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-line/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-warn/20 text-warn flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 id="uan-modal-title" className="text-[16px] font-display font-bold text-ink leading-tight">
                Resolve EPFO UAN Compliance
              </h3>
              <p className="text-[11.5px] text-muted">
                Assign Universal Account Number for {employee.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface2 transition-colors border border-line/40 text-base"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-[12.5px]">
          <div className="p-3 rounded-lg bg-surface2/50 border border-line flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-muted uppercase">Statutory Requirement</span>
            <p className="text-[12px] text-ink leading-relaxed">
              Every employee enrolled under the Employees' Provident Fund (EPFO) scheme must have an active 12-digit UAN linked before the monthly payroll wage credit.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              12-Digit UAN Number
            </label>
            <input
              type="text"
              value={uanNumber}
              onChange={(e) => {
                setUanNumber(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 1012 3456 7890"
              maxLength={15}
              className="w-full bg-surface2 border border-line rounded-lg px-3 py-2 text-ink font-mono text-[14px] focus:outline-none focus:border-accent tracking-wider"
            />
            {error && <span className="text-[11px] text-bad mt-0.5">{error}</span>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line/40">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-tpl text-[12px] font-semibold text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-tpl text-[12.5px] font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--on-accent)',
                borderRadius: 'var(--radius)',
              }}
            >
              <Check size={14} strokeWidth={2.5} />
              <span>Validate & Link UAN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

