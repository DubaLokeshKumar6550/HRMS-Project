import React, { useState } from 'react';
import Avatar from './Avatar';
import { Calendar, Clock, Video, FileText, Check } from 'lucide-react';

export default function Schedule1on1Modal({
  isOpen,
  onClose,
  employee,
  onConfirmSchedule,
}) {
  const [date, setDate] = useState('2026-11-10');
  const [time, setTime] = useState('11:00 AM');
  const [agendaType, setAgendaType] = useState('Bi-weekly Sprint Sync');
  const [notes, setNotes] = useState('Review sprint blockers, OKR progress, and workload bandwidth.');

  if (!isOpen || !employee) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmSchedule({
      employeeId: employee.id,
      employeeName: employee.name,
      date,
      time,
      agendaType,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
        className="relative w-full max-w-md rounded-tpl bg-[#0a222b] border border-line p-5 shadow-2xl flex flex-col gap-4 text-ink animate-in fade-in zoom-in-95 duration-150"
        style={{ borderRadius: 'var(--radius)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line/40">
          <div className="flex items-center gap-2.5">
            <Avatar name={employee.name} size={36} />
            <div>
              <h3 id="schedule-modal-title" className="text-[16px] font-display font-bold text-ink leading-tight">
                Schedule 1:1 Meeting
              </h3>
              <p className="text-[11.5px] text-muted">
                With {employee.name} ({employee.role})
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-[12.5px]">
          {/* Meeting Type */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              Meeting Focus
            </label>
            <select
              value={agendaType}
              onChange={(e) => setAgendaType(e.target.value)}
              className="w-full bg-surface2 border border-line rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-accent"
            >
              <option value="Bi-weekly Sprint Sync">Bi-weekly Sprint Sync</option>
              <option value="Career & Performance Coaching">Career & Performance Coaching</option>
              <option value="Quarterly OKR Review">Quarterly OKR Review</option>
              <option value="Probation Check-in">Probation Check-in</option>
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1">
                <Calendar size={12} />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface2 border border-line rounded-lg px-2.5 py-1.5 text-ink focus:outline-none focus:border-accent font-mono text-[12px]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1">
                <Clock size={12} />
                Time (IST)
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-surface2 border border-line rounded-lg px-2.5 py-1.5 text-ink focus:outline-none focus:border-accent font-mono text-[12px]"
              >
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:30 PM">05:30 PM</option>
              </select>
            </div>
          </div>

          {/* Platform */}
          <div className="p-2.5 rounded-lg bg-surface2/40 border border-line flex items-center justify-between text-[11.5px]">
            <span className="flex items-center gap-2 text-muted">
              <Video size={14} className="text-accent" />
              <span>Google Meet · Auto-generated</span>
            </span>
            <span className="text-good font-semibold font-mono">Link Ready</span>
          </div>

          {/* Notes & Agenda */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1">
              <FileText size={12} />
              Agenda & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface2 border border-line rounded-lg p-2.5 text-ink focus:outline-none focus:border-accent resize-none text-[12px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line/40">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-tpl text-[12px] font-semibold text-muted hover:text-ink transition-colors"
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
              <span>Confirm & Send Invite</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

