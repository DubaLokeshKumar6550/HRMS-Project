import React, { useState } from 'react';
import { Target, Check, CheckSquare, Square } from 'lucide-react';
import Progress from './Progress';

export default function OkrCheckinModal({
  isOpen,
  onClose,
  okr,
  onSaveOkr,
}) {
  if (!isOpen || !okr) return null;

  const [progress, setProgress] = useState(okr.progress);
  const [keyResults, setKeyResults] = useState(okr.keyResults || []);

  const handleToggleKeyResult = (idx) => {
    const updated = keyResults.map((kr, i) => (i === idx ? { ...kr, done: !kr.done } : kr));
    setKeyResults(updated);
    // Auto-update progress based on completed key results
    const doneCount = updated.filter((k) => k.done).length;
    const computedPct = Math.round((doneCount / updated.length) * 100);
    setProgress(computedPct);
  };

  const handleSave = () => {
    let status = 'On track';
    let atRisk = false;
    if (progress < 50) {
      status = 'Behind';
      atRisk = true;
    } else if (progress < 70) {
      status = 'At risk';
      atRisk = true;
    }

    onSaveOkr({
      ...okr,
      progress,
      status,
      atRisk,
      keyResults,
    });
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
        aria-labelledby="okr-modal-title"
        className="relative w-full max-w-lg rounded-tpl bg-[#0a222b] border border-line p-5 shadow-2xl flex flex-col gap-4 text-ink animate-in fade-in zoom-in-95 duration-150"
        style={{ borderRadius: 'var(--radius)' }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-line/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center">
              <Target size={18} />
            </div>
            <div>
              <h3 id="okr-modal-title" className="text-[16px] font-display font-bold text-ink leading-tight">
                OKR Check-in & Progress Update
              </h3>
              <p className="text-[11.5px] text-muted">
                Objective: {okr.title}
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

        <div className="flex flex-col gap-4 text-[12.5px]">
          {/* Progress Slider */}
          <div className="p-3.5 rounded-xl bg-surface2/40 border border-line flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-muted">
                Overall Progress
              </span>
              <span className="font-mono font-bold text-[16px] text-accent tabular-nums">
                {progress}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
            <Progress value={progress} max={100} height={6} />
          </div>

          {/* Key Results Checklist */}
          <div className="flex flex-col gap-2">
            <span className="text-[11.5px] font-semibold uppercase tracking-wider text-muted">
              Key Results Milestone Checkpoints
            </span>

            <div className="flex flex-col gap-2">
              {keyResults.map((kr, idx) => (
                <div
                  key={idx}
                  onClick={() => handleToggleKeyResult(idx)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-colors ${
                    kr.done
                      ? 'bg-good/10 border-good/30 text-ink'
                      : 'bg-surface2/40 border-line text-muted hover:border-line hover:text-ink'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 text-accent">
                    {kr.done ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                  <span className={`text-[12px] leading-snug ${kr.done ? 'line-through opacity-80' : ''}`}>
                    {kr.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line/40">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-tpl text-[12px] font-semibold text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-tpl text-[12.5px] font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--on-accent)',
                borderRadius: 'var(--radius)',
              }}
            >
              <Check size={14} strokeWidth={2.5} />
              <span>Save Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

