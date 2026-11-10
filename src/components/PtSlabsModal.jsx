import React from 'react';
import { Info, Check } from 'lucide-react';

export default function PtSlabsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

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
        className="relative w-full max-w-lg rounded-tpl bg-[#0a222b] border border-line p-5 shadow-2xl flex flex-col gap-4 text-ink animate-in fade-in zoom-in-95 duration-150"
        style={{ borderRadius: 'var(--radius)' }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-line/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-info/20 text-info flex items-center justify-center">
              <Info size={18} />
            </div>
            <div>
              <h3 className="text-[16px] font-display font-bold text-ink leading-tight">
                India State Professional Tax (PT) Slabs
              </h3>
              <p className="text-[11.5px] text-muted">
                Applicable for Bengaluru (Karnataka) & Hyderabad (Telangana) hubs
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

        <div className="flex flex-col gap-3.5 text-[12.5px]">
          {/* Karnataka */}
          <div className="p-3 rounded-xl bg-surface2/40 border border-line flex flex-col gap-2">
            <span className="font-bold text-accent text-[13px] flex items-center justify-between">
              <span>Karnataka (Bengaluru Hub)</span>
              <span className="text-[11px] font-mono text-muted">Govt of Karnataka PT Act</span>
            </span>
            <div className="flex items-center justify-between text-muted text-[12px] border-t border-line/30 pt-1.5">
              <span>Gross Salary ≤ ₹24,999/mo:</span>
              <span className="font-mono text-ink">₹0 (Nil)</span>
            </div>
            <div className="flex items-center justify-between text-muted text-[12px]">
              <span>Gross Salary ≥ ₹25,000/mo:</span>
              <span className="font-mono text-good font-bold">₹200 / month</span>
            </div>
          </div>

          {/* Telangana */}
          <div className="p-3 rounded-xl bg-surface2/40 border border-line flex flex-col gap-2">
            <span className="font-bold text-accent2 text-[13px] flex items-center justify-between">
              <span>Telangana (Hyderabad Hub)</span>
              <span className="text-[11px] font-mono text-muted">Telangana PT Rules</span>
            </span>
            <div className="flex items-center justify-between text-muted text-[12px] border-t border-line/30 pt-1.5">
              <span>Gross Salary &lt; ₹15,000/mo:</span>
              <span className="font-mono text-ink">₹0</span>
            </div>
            <div className="flex items-center justify-between text-muted text-[12px]">
              <span>Gross Salary ₹15,001 – ₹20,000/mo:</span>
              <span className="font-mono text-ink">₹150 / month</span>
            </div>
            <div className="flex items-center justify-between text-muted text-[12px]">
              <span>Gross Salary &gt; ₹20,000/mo:</span>
              <span className="font-mono text-good font-bold">₹200 / month</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-surface2/20 border border-line/40 text-[11px] text-muted leading-relaxed">
            All 24 team members are configured for automated monthly deduction and Form 5 return reconciliation.
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-tpl text-[12px] font-bold bg-accent text-on-accent hover:brightness-110"
              style={{ borderRadius: 'var(--radius)' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

