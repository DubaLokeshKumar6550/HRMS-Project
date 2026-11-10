import React from 'react';
import Tag from '../Tag.jsx';
import StatusPill from '../StatusPill.jsx';
import { evaluateDay, formatMsToHoursMins, minutesTo12Hour, timeStringToMinutes } from '../../utils/attendanceEngine.js';
import { attendanceRules } from '../../config/attendanceRules.js';
import { AlertTriangle, Clock, Coffee, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HistoryCalendar({
  days = [],
  selectedDay,
  onSelectDay,
  onOpenRegularise,
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-good';
      case 'Late':
      case 'Short hours':
      case 'Half day':
        return 'bg-warn';
      case 'Absent':
      case 'Missed check-out':
        return 'bg-bad';
      case 'On leave':
        return 'bg-accent2';
      case 'Work from home':
      case 'Remote':
        return 'bg-info';
      case 'Holiday':
      case 'Weekly off':
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      {/* 7-column Calendar Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-muted py-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd}>{wd}</div>
        ))}
      </div>

      {/* 7-column Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 w-full">
        {days.map((item) => {
          const evalResult = item.record
            ? evaluateDay(item.record, attendanceRules, { isPastDay: item.isPast })
            : null;

          const isToday = item.dateKey === '2026-11-06';
          const isSelected = selectedDay?.dateKey === item.dateKey;
          const isWeekend = item.dayOfWeek === 'Saturday' || item.dayOfWeek === 'Sunday';

          return (
            <button
              key={item.dateKey}
              type="button"
              onClick={() => onSelectDay(item)}
              aria-label={`${item.dateStr || item.dateKey}, Status ${evalResult?.status || 'Off'}`}
              className={`min-h-[68px] p-2 rounded-xl text-left transition-all relative flex flex-col justify-between border ${
                isSelected
                  ? 'border-accent ring-2 ring-accent/40 bg-surface2 shadow-md'
                  : isToday
                  ? 'border-accent bg-surface2/60'
                  : 'border-line/60 bg-surface/30 hover:bg-surface2/40'
              } ${isWeekend ? 'opacity-60' : 'opacity-100'}`}
            >
              {/* Top row: Date Number + Status Dot / Holiday indicator */}
              <div className="flex items-center justify-between w-full">
                <span className={`font-mono text-[12px] font-bold ${isToday ? 'text-accent' : 'text-ink'}`}>
                  {item.dayNumber}
                </span>

                {item.isHoliday ? (
                  <AlertTriangle size={12} className="text-warn shrink-0" title={item.holidayName || 'Holiday'} />
                ) : evalResult ? (
                  <span
                    className={`w-2 h-2 rounded-full ${getStatusColor(evalResult.status)} shrink-0`}
                    title={evalResult.status}
                  />
                ) : null}
              </div>

              {/* Middle row: Net Hours or Status */}
              <div className="flex flex-col gap-0.5">
                {evalResult?.netMs > 0 ? (
                  <span className="font-mono text-[11.5px] font-semibold text-ink tabular-nums">
                    {formatMsToHoursMins(evalResult.netMs)}
                  </span>
                ) : item.isHoliday ? (
                  <span className="text-[10px] text-warn font-semibold truncate">
                    Holiday
                  </span>
                ) : isWeekend ? (
                  <span className="text-[10px] text-muted font-mono">Off</span>
                ) : (
                  <span className="text-[10px] text-muted font-mono">—</span>
                )}
              </div>

              {/* Bottom row: Tiny Flag Tags (Late, Early, etc.) */}
              <div className="flex items-center gap-1 flex-wrap">
                {evalResult?.lateMin > 0 && (
                  <span className="px-1 py-0.2 text-[9px] rounded font-bold bg-warn/20 text-warn border border-warn/30">
                    Late
                  </span>
                )}
                {evalResult?.earlyMin > 0 && (
                  <span className="px-1 py-0.2 text-[9px] rounded font-bold bg-warn/20 text-warn border border-warn/30">
                    Early
                  </span>
                )}
                {evalResult?.status === 'Missed check-out' && (
                  <span className="px-1 py-0.2 text-[9px] rounded font-bold bg-bad/20 text-bad border border-bad/30">
                    Missed
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend Row */}
      <div className="flex items-center gap-4 flex-wrap text-[11px] text-muted font-mono pt-2 border-t border-line/40">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-good" /> Present
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-warn" /> Late / Short hours
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-bad" /> Absent / Missed punch
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent2" /> On leave
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-info" /> Work from home
        </span>
        <span className="flex items-center gap-1.5">
          <AlertTriangle size={11} className="text-warn" /> Holiday
        </span>
      </div>

      {/* Selected Day Dashed Info Box */}
      {selectedDay && (
        <div className="p-4 rounded-xl border border-dashed border-line bg-surface/40 flex flex-col gap-3 animate-in fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-[14px] text-ink">
                {selectedDay.dateStr || selectedDay.dateKey}
              </span>
              {selectedDay.record && (
                <StatusPill
                  status={selectedDay.record.checkIn ? 'approved' : 'rejected'}
                  text={evaluateDay(selectedDay.record, attendanceRules, { isPastDay: true }).status}
                />
              )}
            </div>

            {/* Regularise Action Button if eligible */}
            {selectedDay.record?.isMissedCheckout && (
              <button
                type="button"
                onClick={() => onOpenRegularise?.(selectedDay.dateStr, selectedDay.dateKey)}
                className="px-3 py-1.5 rounded-xl font-display font-bold text-[12px] shadow-sm transition-all text-on-accent"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Regularise this punch
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
            <div>
              <span className="text-muted block text-[11px]">Check-in</span>
              <span className="font-mono font-bold text-ink">
                {selectedDay.record?.checkIn
                  ? minutesTo12Hour(timeStringToMinutes(selectedDay.record.checkIn))
                  : '—'}
              </span>
            </div>

            <div>
              <span className="text-muted block text-[11px]">Check-out</span>
              <span className="font-mono font-bold text-ink">
                {selectedDay.record?.checkOut
                  ? minutesTo12Hour(timeStringToMinutes(selectedDay.record.checkOut))
                  : '—'}
              </span>
            </div>

            <div>
              <span className="text-muted block text-[11px]">Break logged</span>
              <span className="font-mono font-bold text-ink">
                {selectedDay.record?.breaks?.length
                  ? `${selectedDay.record.breaks.reduce((a, b) => a + (b.durationMin || 0), 0)} min`
                  : '—'}
              </span>
            </div>

            <div>
              <span className="text-muted block text-[11px]">Net hours</span>
              <span className="font-mono font-bold text-accent">
                {selectedDay.record
                  ? formatMsToHoursMins(
                      evaluateDay(selectedDay.record, attendanceRules, { isPastDay: true }).netMs
                    )
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

