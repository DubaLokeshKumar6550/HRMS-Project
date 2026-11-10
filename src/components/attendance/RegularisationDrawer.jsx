import React, { useState, useEffect } from 'react';
import Drawer from '../Drawer.jsx';
import { useAttendance } from '../../context/AttendanceContext';
import { AlertTriangle, Clock, Calendar, FileText, Check } from 'lucide-react';

export default function RegularisationDrawer({
  isOpen,
  onClose,
  initialDate,
  initialDateKey,
  onTriggerToast,
}) {
  const { regularise, regularisations, attendanceRules } = useAttendance();

  const [date, setDate] = useState(initialDate || '5 Nov 2026');
  const [dateKey, setDateKey] = useState(initialDateKey || '2026-11-05');
  const [issueType, setIssueType] = useState('Missed check-out');
  const [requestedCheckIn, setRequestedCheckIn] = useState('09:30 AM');
  const [requestedCheckOut, setRequestedCheckOut] = useState('06:30 PM');
  const [breakMin, setBreakMin] = useState(60);
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialDate) setDate(initialDate);
    if (initialDateKey) setDateKey(initialDateKey);
  }, [initialDate, initialDateKey]);

  // Validate regularisation rules
  const validateForm = () => {
    const errs = {};

    // 1. Minimum reason length >= 10 chars
    if (!reason.trim() || reason.trim().length < 10) {
      errs.reason = 'Reason is mandatory and must be at least 10 characters.';
    }

    // 2. Policy limit: Max 3 regularisations per month
    const thisMonthRegs = regularisations.filter((r) => r.dateKey?.startsWith('2026-11'));
    if (thisMonthRegs.length >= (attendanceRules.maxRegularisationsPerMonth || 3)) {
      errs.general = `Monthly regularisation limit reached (Maximum ${attendanceRules.maxRegularisationsPerMonth} per month allowed).`;
    }

    // 3. 3-day policy window check
    // Reference date: 6 Nov 2026
    const todayTimestamp = new Date('2026-11-06T00:00:00Z').getTime();
    const reqTimestamp = new Date(`${dateKey}T00:00:00Z`).getTime();
    const diffDays = Math.round((todayTimestamp - reqTimestamp) / (24 * 3600 * 1000));

    if (diffDays < 0) {
      errs.date = 'Cannot submit regularisation for future dates.';
    } else if (diffDays > (attendanceRules.regularisationWindowDays || 3)) {
      errs.date = `Regularisation window is ${attendanceRules.regularisationWindowDays} days; ${date} is too old.`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const newReg = await regularise({
        date,
        dateKey,
        issueType,
        requestedCheckIn,
        requestedCheckOut,
        breakMin: parseInt(breakMin, 10) || 60,
        reason,
        attachmentName: attachmentName || null,
      });

      onClose();
      onTriggerToast?.(
        `Regularisation for ${date} sent to Rahul Menon.`,
        () => {
          // Undo handler
          onTriggerToast?.('Regularisation request withdrawn.');
        }
      );
    } catch (err) {
      setErrors({ general: err.message || 'Failed to submit regularisation' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Request Attendance Regularisation"
      width="440px"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-[13px]">
        {errors.general && (
          <div className="p-3 rounded-xl bg-bad/10 border border-bad/30 text-bad text-[12px] flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-surface2/60 border border-line text-[12px] text-muted leading-relaxed">
          Regularisation requests must be submitted within <strong>3 days</strong> of the incident and require supervisor sign-off by <strong>{attendanceRules.approverName}</strong>.
        </div>

        {/* Date Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-ink" htmlFor="regDate">
            Incident Date
          </label>
          <input
            id="regDate"
            type="text"
            readOnly
            value={date}
            className="w-full bg-surface2/50 border border-line rounded-xl px-3 py-2 text-[12.5px] text-muted font-mono cursor-not-allowed"
          />
          {errors.date && <span className="text-[11px] text-bad">{errors.date}</span>}
        </div>

        {/* Issue Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-ink" htmlFor="issueType">
            Incident Category
          </label>
          <select
            id="issueType"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
          >
            <option value="Missed check-out">Missed check-out</option>
            <option value="Missed check-in">Missed check-in</option>
            <option value="Wrong time">Wrong time record</option>
            <option value="Work from home">Work from home punch</option>
            <option value="Forgot to start break">Forgot to start / end break</option>
          </select>
        </div>

        {/* Requested Times */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-muted" htmlFor="reqIn">
              Correct check-in
            </label>
            <input
              id="reqIn"
              type="text"
              value={requestedCheckIn}
              onChange={(e) => setRequestedCheckIn(e.target.value)}
              placeholder="09:30 AM"
              className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink font-mono focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-muted" htmlFor="reqOut">
              Correct check-out
            </label>
            <input
              id="reqOut"
              type="text"
              value={requestedCheckOut}
              onChange={(e) => setRequestedCheckOut(e.target.value)}
              placeholder="06:30 PM"
              className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink font-mono focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Break Minutes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-muted" htmlFor="reqBreak">
            Actual total break taken (minutes)
          </label>
          <input
            id="reqBreak"
            type="number"
            min={0}
            max={180}
            value={breakMin}
            onChange={(e) => setBreakMin(e.target.value)}
            className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink font-mono focus:outline-none focus:border-accent"
          />
        </div>

        {/* Reason Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-semibold text-ink" htmlFor="regReason">
              Reason for regularisation <span className="text-bad">*</span>
            </label>
            <span className="text-[11px] text-muted font-mono">{reason.length} / 10 min chars</span>
          </div>
          <textarea
            id="regReason"
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the operational reason or technical terminal glitch..."
            className="w-full bg-surface2 border border-line rounded-xl p-3 text-[12.5px] text-ink focus:outline-none focus:border-accent"
          />
          {errors.reason && <span className="text-[11px] text-bad">{errors.reason}</span>}
        </div>

        {/* Attachment (optional) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-muted" htmlFor="regAttach">
            Attachment name / reference (optional)
          </label>
          <input
            id="regAttach"
            type="text"
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
            placeholder="e.g. exit_gate_photo.jpg or incident_ticket.pdf"
            className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface2 text-muted hover:text-ink text-[12.5px] font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl font-display font-bold text-[12.5px] shadow-sm disabled:opacity-40"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--on-accent)',
              borderRadius: 'var(--radius)',
            }}
          >
            {isSubmitting ? 'Submitting…' : 'Send regularisation'}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
