import React, { useState, useMemo } from 'react';
import TodayPanel from './TodayPanel.jsx';
import BreakTracker from './BreakTracker.jsx';
import MonthSummary from './MonthSummary.jsx';
import HistoryCalendar from './HistoryCalendar.jsx';
import HistoryTable from './HistoryTable.jsx';
import PolicyCard from './PolicyCard.jsx';
import RegularisationDrawer from './RegularisationDrawer.jsx';
import CheckoutConfirmDrawer from './CheckoutConfirmDrawer.jsx';
import Card from '../Card.jsx';
import StatusPill from '../StatusPill.jsx';
import Tag from '../Tag.jsx';
import { useAttendance } from '../../context/AttendanceContext';
import { evaluateDay, formatMsToHoursMins, timeStringToMinutes } from '../../utils/attendanceEngine.js';
import {
  Calendar as CalendarIcon,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Plus,
  Trash2,
  FileText,
  TrendingUp,
} from 'lucide-react';

const FILTER_PILLS = [
  'All',
  'Late',
  'Early departure',
  'Short hours',
  'Absent',
  'Leave',
  'Overtime',
  'Needs regularisation',
];

export default function MyAttendanceView({ onTriggerToast }) {
  const {
    today,
    history,
    regularisations,
    checkIn,
    undoCheckIn,
    startBreak,
    endBreak,
    checkOut,
    undoCheckOut,
    withdrawRegularisation,
    attendanceRules,
  } = useAttendance();

  // Month navigation: November 2026
  const [selectedMonth, setSelectedMonth] = useState({ year: 2026, month: 11, label: 'November 2026' });
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'table'
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  // Drawers
  const [regDrawerTarget, setRegDrawerTarget] = useState(null);
  const [isCheckoutConfirmOpen, setIsCheckoutConfirmOpen] = useState(false);
  const [pendingEarlyMin, setPendingEarlyMin] = useState(0);

  // Days list for November 2026 (30 days)
  const novemberDays = useMemo(() => {
    const list = [];
    // Nov 1 was Sunday (day 0), let's map Monday to Sunday
    for (let dayNum = 1; dayNum <= 30; dayNum++) {
      const dateKey = `2026-11-${String(dayNum).padStart(2, '0')}`;
      const dateStr = `${dayNum} Nov 2026`;
      const dateObj = new Date(2026, 10, dayNum); // month is 0-indexed
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = dayNames[dateObj.getDay()];
      const isPast = dayNum < 6;
      const isHoliday = dayNum === 8 || dayNum === 9;
      const holidayName = dayNum === 8 ? 'Diwali' : dayNum === 9 ? 'Diwali Balipratipada' : null;

      const record = history.find((h) => h.dateKey === dateKey);

      list.push({
        dayNumber: dayNum,
        dateKey,
        dateStr,
        dayOfWeek,
        isPast,
        isHoliday,
        holidayName,
        record: record || (isHoliday ? { isHoliday: true } : dateObj.getDay() === 0 || dateObj.getDay() === 6 ? { isWeeklyOff: true } : null),
      });
    }
    return list;
  }, [history]);

  // Filtered records for Table view
  const filteredRecords = useMemo(() => {
    return history.filter((rec) => {
      if (activeFilter === 'All') return true;
      const evalRes = evaluateDay(rec, attendanceRules, { isPastDay: true });
      if (activeFilter === 'Late') return evalRes.lateMin > 0;
      if (activeFilter === 'Early departure') return evalRes.earlyMin > 0;
      if (activeFilter === 'Short hours') return evalRes.status === 'Short hours';
      if (activeFilter === 'Absent') return evalRes.status === 'Absent';
      if (activeFilter === 'Leave') return evalRes.status === 'On leave' || rec.leaveApplied;
      if (activeFilter === 'Overtime') return evalRes.overtimeMin > 0;
      if (activeFilter === 'Needs regularisation') return rec.isMissedCheckout || evalRes.status === 'Short hours';
      return true;
    });
  }, [history, activeFilter, attendanceRules]);

  // Check-in trigger with prompt/mode
  const handleCheckIn = async (mode = 'Office') => {
    try {
      const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const rec = await checkIn({ time: nowStr, workMode: mode });
      const inMin = timeStringToMinutes(nowStr);
      const cutoffMin = timeStringToMinutes(attendanceRules.lateCutoffTime);
      if (inMin > cutoffMin) {
        onTriggerToast?.(`Checked in at ${nowStr}. You are ${inMin - timeStringToMinutes(attendanceRules.shift.startTime)} min late.`);
      } else {
        onTriggerToast?.(`Checked in at ${nowStr}. On time.`);
      }
    } catch (err) {
      onTriggerToast?.(err.message || 'Check-in failed');
    }
  };

  // Check-out trigger with early departure check
  const handleInitiateCheckOut = () => {
    if (!today?.checkIn) return;
    const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const nowMin = timeStringToMinutes(nowStr);
    const inMin = timeStringToMinutes(today.checkIn);
    const earlyCutoff = timeStringToMinutes(attendanceRules.earlyDepartureCutoffTime || '18:15');

    // Edge case 1: Check-out < 5 min after check-in
    if (nowMin - inMin < 5) {
      setPendingEarlyMin(0);
      setIsCheckoutConfirmOpen(true);
      return;
    }

    // Edge case 2: Early check-out before 6:15 PM
    if (nowMin < earlyCutoff) {
      const earlyDiff = timeStringToMinutes(attendanceRules.shift.endTime) - nowMin;
      setPendingEarlyMin(earlyDiff);
      setIsCheckoutConfirmOpen(true);
      return;
    }

    // Standard check-out
    executeCheckOut();
  };

  const executeCheckOut = async (earlyReason = '') => {
    try {
      const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      await checkOut({ time: nowStr, earlyReason });

      onTriggerToast?.(
        `Checked out at ${nowStr} · Day finalized.`,
        () => {
          undoCheckOut();
          onTriggerToast?.('Check-out undone. Day resumed.');
        }
      );
    } catch (err) {
      onTriggerToast?.(err.message || 'Check-out failed');
    }
  };

  const handleWithdrawReg = async (regId) => {
    try {
      await withdrawRegularisation(regId);
      onTriggerToast?.('Regularisation request withdrawn.');
    } catch {
      onTriggerToast?.('Failed to withdraw regularisation.');
    }
  };

  return (
    <div className="standard-grid-2col w-full">
      {/* 5.1 TODAY PANEL (spans 2) */}
      <TodayPanel
        onTriggerCheckIn={handleCheckIn}
        onTriggerUndoCheckIn={async () => {
          await undoCheckIn();
          onTriggerToast?.('Today punch reset. You can check in again.');
        }}
        onTriggerCheckOut={handleInitiateCheckOut}
        onTriggerBreak={() => {
          if (today?.activeBreak) {
            endBreak();
            onTriggerToast?.('Break ended.');
          } else {
            startBreak('Lunch');
            onTriggerToast?.('Started Lunch break.');
          }
        }}
        onOpenRegularise={(dateStr, dateKey) => setRegDrawerTarget({ dateStr, dateKey })}
      />

      {/* 5.2 BREAK TRACKER (spans 1 at >=1100px) */}
      <BreakTracker onTriggerToast={onTriggerToast} />

      {/* 5.3 MONTH SUMMARY (spans 1 at >=1100px) */}
      <MonthSummary />

      {/* 5.4 MONTHLY ATTENDANCE HISTORY (spans 2) */}
      <Card
        id="myhistory"
        title="Monthly Attendance History"
        subtitle="Daily punch logs, shift compliance and working hours"
        className="col-span-1 md:col-span-2"
        headerAction={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Month Switcher */}
            <div className="flex items-center bg-surface2 rounded-xl border border-line p-0.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedMonth({ year: 2026, month: 10, label: 'October 2026' });
                  onTriggerToast?.('Switched to October 2026 view.');
                }}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-surface"
                title="October 2026"
              >
                <ChevronLeft size={15} />
              </button>

              <span className="px-2.5 text-[12px] font-semibold text-ink font-mono select-none">
                {selectedMonth.label}
              </span>

              <button
                type="button"
                disabled={selectedMonth.month === 11}
                onClick={() => setSelectedMonth({ year: 2026, month: 11, label: 'November 2026' })}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next Month"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-surface2 rounded-xl border border-line p-0.5 text-[12px]">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  viewMode === 'calendar' ? 'bg-accent text-on-accent font-bold' : 'text-muted hover:text-ink'
                }`}
              >
                <CalendarIcon size={13} />
                <span>Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-accent text-on-accent font-bold' : 'text-muted hover:text-ink'
                }`}
              >
                <TableIcon size={13} />
                <span>Table</span>
              </button>
            </div>

            {/* Export Buttons */}
            <button
              type="button"
              onClick={() => onTriggerToast?.('Monthly attendance exported as CSV.')}
              className="p-1.5 rounded-xl bg-surface2 text-muted hover:text-ink border border-line"
              title="Export CSV"
            >
              <Download size={14} />
            </button>
            <button
              type="button"
              onClick={() => onTriggerToast?.('Preparing monthly attendance PDF…')}
              className="p-1.5 rounded-xl bg-surface2 text-muted hover:text-ink border border-line"
              title="Export PDF"
            >
              <FileText size={14} />
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="p-1.5 rounded-xl bg-surface2 text-muted hover:text-ink border border-line"
              title="Print record"
            >
              <Printer size={14} />
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-5 w-full">
          {/* Small Daily Net Hours Bar Chart (SVG) */}
          <div className="p-3.5 rounded-xl bg-surface/30 border border-line flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-muted">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <TrendingUp size={13} className="text-accent" /> Daily Net Hours (vs 8h Target)
              </span>
              <span>8h target threshold line</span>
            </div>

            <div className="relative w-full h-16 flex items-end gap-1.5 pt-4">
              {/* 8h Target Dashed Horizontal Line */}
              <div
                className="absolute left-0 right-0 border-b border-dashed border-accent/50 z-10"
                style={{ bottom: '70%' }}
                title="8h Target"
              />

              {novemberDays.slice(0, 15).map((d) => {
                const evalD = d.record ? evaluateDay(d.record, attendanceRules, { isPastDay: d.isPast }) : null;
                const hours = evalD ? evalD.netMs / (3600 * 1000) : 0;
                const heightPct = Math.min(100, (hours / 10) * 100);

                return (
                  <div
                    key={d.dateKey}
                    className="flex-1 flex flex-col items-center gap-1 h-full justify-end group"
                  >
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        hours >= 8 ? 'bg-accent/80 group-hover:bg-accent' : hours >= 4.5 ? 'bg-warn/70' : 'bg-surface2'
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`${d.dateStr}: ${hours.toFixed(1)}h`}
                    />
                    <span className="text-[9px] font-mono text-muted">{d.dayNumber}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {FILTER_PILLS.map((pill) => {
              const isSelected = activeFilter === pill;
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setActiveFilter(pill)}
                  className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all shrink-0 border ${
                    isSelected
                      ? 'border-accent font-bold'
                      : 'bg-surface/40 text-muted border-line hover:text-ink'
                  }`}
                  style={isSelected ? { backgroundColor: 'var(--accent)', color: 'var(--on-accent)' } : {}}
                >
                  {pill}
                </button>
              );
            })}
          </div>

          {/* Active View: Calendar or Table */}
          {viewMode === 'calendar' ? (
            <HistoryCalendar
              days={novemberDays}
              selectedDay={selectedCalendarDay}
              onSelectDay={setSelectedCalendarDay}
              onOpenRegularise={(dateStr, dateKey) => setRegDrawerTarget({ dateStr, dateKey })}
            />
          ) : (
            <HistoryTable
              records={filteredRecords}
              onOpenRegularise={(dateStr, dateKey) => setRegDrawerTarget({ dateStr, dateKey })}
            />
          )}

          {/* My Regularisation Requests List */}
          <div className="pt-4 border-t border-line flex flex-col gap-3">
            <span className="text-[12px] font-mono uppercase font-bold text-muted">
              My Regularisation Requests ({regularisations.length})
            </span>

            {regularisations.length === 0 ? (
              <span className="text-[12px] text-muted italic">No regularisations submitted.</span>
            ) : (
              <div className="overflow-x-auto w-full rounded-xl border border-line bg-surface/30">
                <table className="w-full border-collapse text-left min-w-[620px] text-[12px]">
                  <thead>
                    <tr className="border-b border-line bg-surface2/50 text-[10.5px] font-bold uppercase tracking-wider text-muted font-mono">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Issue</th>
                      <th className="py-2.5 px-3">Requested Times</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Decided By</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/30">
                    {regularisations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-surface2/30 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-ink">{reg.date}</td>
                        <td className="py-2.5 px-3 text-muted">{reg.issueType}</td>
                        <td className="py-2.5 px-3 font-mono text-ink">
                          {reg.requestedCheckIn} – {reg.requestedCheckOut} ({reg.breakMin}m break)
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusPill
                            status={
                              reg.status === 'Approved'
                                ? 'approved'
                                : reg.status === 'Rejected'
                                ? 'rejected'
                                : 'pending'
                            }
                            text={reg.status}
                          />
                        </td>
                        <td className="py-2.5 px-3 text-muted">{reg.decidedBy}</td>
                        <td className="py-2.5 px-3 text-right">
                          {reg.status === 'Pending' ? (
                            <button
                              type="button"
                              onClick={() => handleWithdrawReg(reg.id)}
                              className="text-bad hover:underline font-semibold text-[11.5px]"
                            >
                              Withdraw
                            </button>
                          ) : (
                            <span className="text-muted font-mono text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 5.5 POLICY CARD (spans 2) */}
      <PolicyCard onTriggerToast={onTriggerToast} />

      {/* Regularisation Drawer */}
      <RegularisationDrawer
        isOpen={Boolean(regDrawerTarget)}
        onClose={() => setRegDrawerTarget(null)}
        initialDate={regDrawerTarget?.dateStr}
        initialDateKey={regDrawerTarget?.dateKey}
        onTriggerToast={onTriggerToast}
      />

      {/* Checkout Early Departure Confirmation Drawer */}
      <CheckoutConfirmDrawer
        isOpen={isCheckoutConfirmOpen}
        onClose={() => setIsCheckoutConfirmOpen(false)}
        earlyMin={pendingEarlyMin}
        isImmediateCheckout={pendingEarlyMin === 0}
        onConfirmCheckout={(reason) => executeCheckOut(reason)}
      />
    </div>
  );
}
