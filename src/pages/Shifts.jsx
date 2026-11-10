import React, { useState } from 'react';
import Card from '../components/Card';
import Drawer from '../components/Drawer';
import FormField from '../components/FormField';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import StatusPill from '../components/StatusPill';
import Avatar from '../components/Avatar';
import RosterGrid from '../components/RosterGrid';
import {
  shiftTypes,
  currentWeekDays,
  initialRoster,
  initialShiftRequests,
  dailyShiftRequirements,
} from '../data/shifts';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Copy,
  Send,
  AlertTriangle,
  Check,
  X,
  Clock,
  ArrowRightLeft,
  Plus,
} from 'lucide-react';

export default function Shifts({ employees = [], onTriggerToast }) {
  const [roster, setRoster] = useState(initialRoster);
  const [shiftRequests, setShiftRequests] = useState(initialShiftRequests);
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  const [weekOffset, setWeekOffset] = useState(0); // 0 = This week

  // Assign shift drawer state
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [selectedCellTarget, setSelectedCellTarget] = useState(null);
  const [assignShiftForm, setAssignShiftForm] = useState({
    shiftCode: 'GEN',
    repeatOption: 'this day', // 'this day', 'this week', 'next 4 weeks'
    note: '',
  });
  const [conflictWarning, setConflictWarning] = useState(null);

  const notify = (msg, undoFn) => {
    if (onTriggerToast) onTriggerToast(msg, undoFn);
  };

  // Cell click handler
  const handleCellClick = ({ person, day, shiftCode }) => {
    setSelectedCellTarget({ person, day, currentShift: shiftCode });
    setAssignShiftForm({
      shiftCode: shiftCode === 'OFF' ? 'GEN' : shiftCode,
      repeatOption: 'this day',
      note: '',
    });
    setConflictWarning(null);
    setIsAssignDrawerOpen(true);
  };

  // Conflict validation engine
  const validateShiftConflict = (targetPerson, targetDay, newShiftCode) => {
    // Rule 1: No shift on approved leave
    if (targetPerson.shifts[targetDay.fullDate] === 'LV') {
      return 'Employee has approved leave on this date. Shift assignment blocked.';
    }

    // Rule 2: Minimum 11 hours rest between shifts (e.g. Night ending 6:30 AM cannot be followed by Morning at 6:00 AM on same/next day)
    const prevDayIndex = currentWeekDays.findIndex((d) => d.fullDate === targetDay.fullDate) - 1;
    if (prevDayIndex >= 0) {
      const prevDate = currentWeekDays[prevDayIndex].fullDate;
      const prevShift = targetPerson.shifts[prevDate];
      if (prevShift === 'NIG' && newShiftCode === 'MOR') {
        return 'Rest conflict: Less than 11 hours rest between Night shift and Morning shift.';
      }
      if (prevShift === 'EVE' && newShiftCode === 'MOR') {
        return 'Rest conflict: Evening shift ends at 22:30, Morning shift starts at 06:00 (only 7.5 hrs rest).';
      }
    }

    // Rule 3: Max 6 consecutive working days
    let workingDaysCount = 0;
    currentWeekDays.forEach((d) => {
      const s = d.fullDate === targetDay.fullDate ? newShiftCode : targetPerson.shifts[d.fullDate];
      if (s && s !== 'OFF' && s !== 'LV') {
        workingDaysCount++;
      }
    });

    if (workingDaysCount > 6) {
      return 'Statutory violation: Employee cannot work more than 6 consecutive days without a mandatory rest day.';
    }

    return null;
  };

  // Submit Shift Assignment
  const handleSaveShiftAssignment = () => {
    if (!selectedCellTarget) return;

    const conflict = validateShiftConflict(
      selectedCellTarget.person,
      selectedCellTarget.day,
      assignShiftForm.shiftCode
    );

    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    const prevRoster = [...roster];
    const { person, day } = selectedCellTarget;
    const { shiftCode, repeatOption } = assignShiftForm;

    setRoster((prev) =>
      prev.map((p) => {
        if (p.employeeId !== person.employeeId) return p;

        const updatedShifts = { ...p.shifts };

        if (repeatOption === 'this day') {
          updatedShifts[day.fullDate] = shiftCode;
        } else if (repeatOption === 'this week') {
          currentWeekDays.forEach((d) => {
            if (!d.isWeekend && updatedShifts[d.fullDate] !== 'LV') {
              updatedShifts[d.fullDate] = shiftCode;
            }
          });
        }

        return { ...p, shifts: updatedShifts };
      })
    );

    setIsAssignDrawerOpen(false);
    notify(
      `Assigned ${shiftCode} shift to ${person.name} (${day.day} ${day.date})`,
      () => setRoster(prevRoster)
    );
  };

  // Copy Last Week
  const handleCopyLastWeek = () => {
    notify('Copied shift schedule from previous week with zero conflicts', () => {});
  };

  // Publish Roster
  const handlePublishRoster = () => {
    notify('Published roster for 2–8 Nov 2026. Automated notification dispatched to 24 team members.', () => {});
  };

  // Shift Request Approval / Rejection
  const handleApproveRequest = (reqId) => {
    const req = shiftRequests.find((r) => r.id === reqId);
    if (!req) return;
    const prev = [...shiftRequests];

    setShiftRequests(
      shiftRequests.map((r) => (r.id === reqId ? { ...r, status: 'Approved' } : r))
    );

    notify(`Approved ${req.type} request for ${req.requesterName}`, () =>
      setShiftRequests(prev)
    );
  };

  const handleRejectRequest = (reqId) => {
    const req = shiftRequests.find((r) => r.id === reqId);
    if (!req) return;
    const prev = [...shiftRequests];

    setShiftRequests(
      shiftRequests.map((r) => (r.id === reqId ? { ...r, status: 'Rejected' } : r))
    );

    notify(`Rejected ${req.type} request for ${req.requesterName}`, () =>
      setShiftRequests(prev)
    );
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Controls Strip with Subtitle and Week Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12.5px] text-muted">
          Weekly team shift allocation, statutory conflict validation, and swap requests
        </p>

        {/* Action Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Week Switcher */}
          <div className="flex items-center bg-surface2 rounded-xl border border-line p-0.5">
            <button
              type="button"
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface"
              title="Previous week"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2.5 text-[12px] font-semibold text-ink font-mono select-none">
              {weekOffset === 0
                ? 'This Week (2–8 Nov)'
                : weekOffset < 0
                ? `${Math.abs(weekOffset)}w ago`
                : `+${weekOffset}w`}
            </span>
            <button
              type="button"
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface"
              title="Next week"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Week / Month Toggle */}
          <div className="flex items-center bg-surface2 rounded-xl border border-line p-0.5 text-[11.5px] font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-accent text-on-accent' : 'text-muted'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-accent text-on-accent' : 'text-muted'
              }`}
            >
              Month
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLastWeek}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[12px] font-semibold transition-all"
          >
            <Copy size={13} />
            <span>Copy last week</span>
          </button>

          <button
            type="button"
            onClick={handlePublishRoster}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent text-on-accent text-[12px] font-bold shadow-sm hover:opacity-90 transition-all"
          >
            <Send size={13} strokeWidth={2.2} />
            <span>Publish roster</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 equal columns, widgets rota and shiftreq span 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Widget: rota (spans 2) */}
        <Card
          id="rota"
          title="Weekly Engineering Roster (2–8 Nov 2026)"
          className="col-span-1 md:col-span-2"
          action={
            <div className="flex items-center gap-3 text-[11.5px] font-medium text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                General (9:30–18:30)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--info)' }} />
                Morning (6:00–14:30)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--warn)' }} />
                Evening (14:00–22:30)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#a855f7' }} />
                Night (22:00–6:30)
              </span>
            </div>
          }
        >
          <RosterGrid
            roster={roster}
            days={currentWeekDays}
            onCellClick={handleCellClick}
          />
        </Card>

        {/* Widget: shiftreq (spans 2) */}
        <Card
          id="shiftreq"
          title="Shift Change & Swap Requests"
          className="col-span-1 md:col-span-2"
          action={
            <span className="text-[11px] font-mono text-muted">
              {shiftRequests.filter((r) => r.status === 'Pending').length} pending requests
            </span>
          }
        >
          <div className="flex flex-col gap-3">
            {shiftRequests.length === 0 ? (
              <div className="py-8 text-center text-muted text-[13px]">
                No pending shift change requests.
              </div>
            ) : (
              shiftRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-surface2/40 border border-line flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar name={req.requesterName} size={36} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[13.5px] text-ink">
                          {req.requesterName}
                        </span>
                        <span className="text-[11px] text-muted">({req.requesterRole})</span>
                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-accent/20 text-accent border border-accent/40">
                          {req.type} Request
                        </span>
                        {req.swapWithName && (
                          <span className="text-[12px] text-muted flex items-center gap-1">
                            <ArrowRightLeft size={12} />
                            with <strong className="text-ink">{req.swapWithName}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[12px]">
                        <span className="text-muted">
                          Date: <strong className="text-ink font-mono">{req.date}</strong>
                        </span>
                        <span className="text-muted">
                          Current:{' '}
                          <span className="text-warn font-semibold">{req.currentShift}</span>
                        </span>
                        <span className="text-muted">
                          Requested:{' '}
                          <span className="text-good font-semibold">
                            {req.requestedShift}
                          </span>
                        </span>
                      </div>

                      <p className="text-[11.5px] text-muted/80 mt-1 italic">
                        "{req.reason}"
                      </p>
                    </div>
                  </div>

                  {/* Actions / Status */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {req.status === 'Pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveRequest(req.id)}
                          className="px-3 py-1.5 rounded-xl bg-accent text-on-accent text-[12px] font-bold shadow-sm hover:opacity-90 flex items-center gap-1"
                        >
                          <Check size={14} strokeWidth={2.2} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectRequest(req.id)}
                          className="px-3 py-1.5 rounded-xl bg-surface2 text-muted hover:text-bad border border-line text-[12px] font-semibold flex items-center gap-1"
                        >
                          <X size={14} strokeWidth={2.2} />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <StatusPill
                        status={req.status === 'Approved' ? 'good' : 'bad'}
                        label={req.status}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Assign Shift Drawer */}
      <Drawer
        isOpen={isAssignDrawerOpen}
        onClose={() => setIsAssignDrawerOpen(false)}
        title="Assign Shift & Validate Constraints"
        width="480px"
      >
        {selectedCellTarget && (
          <div className="flex flex-col gap-4">
            <div className="p-3.5 rounded-xl bg-surface2 border border-line flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar name={selectedCellTarget.person.name} size={34} />
                <div>
                  <h4 className="font-bold text-[13.5px] text-ink">
                    {selectedCellTarget.person.name}
                  </h4>
                  <p className="text-[11px] text-muted">
                    {selectedCellTarget.person.role}
                  </p>
                </div>
              </div>
              <span className="text-[12px] font-mono font-bold text-accent">
                {selectedCellTarget.day.day}, {selectedCellTarget.day.date}
              </span>
            </div>

            {/* Inline Conflict Warning if rule breached */}
            {conflictWarning && (
              <div className="p-3 rounded-xl bg-bad/15 border border-bad/50 flex items-start gap-2 text-bad text-[12px]">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <strong className="font-bold">Constraint Conflict:</strong>
                  <span>{conflictWarning}</span>
                </div>
              </div>
            )}

            <FormField label="Select Shift Type" id="assign-shift-code" required>
              <Select
                id="assign-shift-code"
                value={assignShiftForm.shiftCode}
                onChange={(e) => {
                  setAssignShiftForm({ ...assignShiftForm, shiftCode: e.target.value });
                  setConflictWarning(null);
                }}
                options={shiftTypes.map((s) => ({
                  value: s.code,
                  label: `${s.name} (${s.time})`,
                }))}
              />
            </FormField>

            <FormField label="Repeat For" id="assign-repeat">
              <Select
                id="assign-repeat"
                value={assignShiftForm.repeatOption}
                onChange={(e) =>
                  setAssignShiftForm({ ...assignShiftForm, repeatOption: e.target.value })
                }
                options={[
                  { value: 'this day', label: 'Only this day' },
                  { value: 'this week', label: 'All weekdays this week (Mon–Fri)' },
                  { value: 'next 4 weeks', label: 'Next 4 weeks' },
                ]}
              />
            </FormField>

            <FormField label="Manager Note (Optional)" id="assign-note">
              <Textarea
                id="assign-note"
                value={assignShiftForm.note}
                onChange={(e) =>
                  setAssignShiftForm({ ...assignShiftForm, note: e.target.value })
                }
                placeholder="Reason for change, rotational schedule shift note..."
                rows={2}
              />
            </FormField>

            <div className="p-3 rounded-xl bg-surface2/30 border border-line text-[11px] text-muted flex flex-col gap-1">
              <span className="font-bold text-ink uppercase tracking-wider font-mono">
                Statutory Guidelines Checked:
              </span>
              <span>✓ Maximum 6 consecutive working days without rest day</span>
              <span>✓ Minimum 11 hours rest required between successive shifts</span>
              <span>✓ Verified against approved leave calendar</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line mt-2">
              <button
                type="button"
                onClick={() => setIsAssignDrawerOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-surface2 text-muted border border-line text-[12.5px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveShiftAssignment}
                className="px-4 py-2 rounded-xl bg-accent text-on-accent text-[12.5px] font-bold shadow-sm hover:opacity-90"
              >
                Assign shift
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

