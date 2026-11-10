import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { formatMsToHoursMins } from '../../utils/attendanceEngine.js';
import { Clock, Coffee, Check, LogOut, LogIn } from 'lucide-react';

export default function PunchControl({ onNavigateToMine, onTriggerCheckIn, onTriggerCheckOut, onTriggerBreak }) {
  const {
    today,
    isCheckedIn,
    isCheckedOut,
    onBreak,
    liveNetMs,
    activeBreakDurationMs,
    checkIn,
    endBreak,
  } = useAttendance();

  const handleCheckInAction = () => {
    if (onTriggerCheckIn) {
      onTriggerCheckIn();
    } else {
      checkIn({ mode: 'office', location: 'Bengaluru HQ' });
    }
  };

  const handleEndBreakAction = () => {
    if (onTriggerBreak) {
      onTriggerBreak();
    } else {
      endBreak();
    }
  };

  const handleCheckOutAction = () => {
    if (onTriggerCheckOut) {
      onTriggerCheckOut();
    } else if (onNavigateToMine) {
      onNavigateToMine();
    }
  };

  // If already checked out today
  if (isCheckedOut) {
    return (
      <button
        type="button"
        onClick={onNavigateToMine}
        title="Day completed. Click to view attendance details."
        className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface2 border border-line text-[11.5px] font-semibold text-muted hover:text-ink hover:border-accent transition-all select-none"
      >
        <span className="w-2 h-2 rounded-full bg-good shrink-0" />
        <span>Checked out ({today.checkOut})</span>
      </button>
    );
  }

  // Not checked in yet
  if (!isCheckedIn) {
    return (
      <button
        type="button"
        onClick={handleCheckInAction}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-display font-bold text-[12px] shadow-sm hover:brightness-110 active:scale-95 transition-all select-none"
        style={{
          backgroundColor: 'var(--accent)',
          color: 'var(--on-accent)',
        }}
      >
        <LogIn size={13} strokeWidth={2.4} />
        <span>Check in</span>
      </button>
    );
  }

  // Checked in: on break vs actively working
  const breakMinutes = Math.floor(activeBreakDurationMs / 60000);
  const breakSeconds = Math.floor((activeBreakDurationMs % 60000) / 1000);
  const breakTimeStr = `${String(breakMinutes).padStart(2, '0')}:${String(breakSeconds).padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-1.5 bg-surface/50 border border-line rounded-full p-0.5">
      {/* Live Timer Pill - clicking opens My Attendance */}
      <button
        type="button"
        onClick={onNavigateToMine}
        title="Click to view My Attendance details"
        aria-live="polite"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-mono tabular-nums font-semibold transition-colors ${
          onBreak
            ? 'bg-warn/15 text-warn border border-warn/30'
            : 'bg-surface2 text-ink hover:bg-surface2/80'
        }`}
      >
        {onBreak ? (
          <>
            <Coffee size={12} className="animate-pulse text-warn shrink-0" />
            <span>On break {breakTimeStr}</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-good shrink-0 animate-pulse" />
            <span>{formatMsToHoursMins(liveNetMs)}</span>
          </>
        )}
      </button>

      {/* Action Button: End Break or Check out */}
      {onBreak ? (
        <button
          type="button"
          onClick={handleEndBreakAction}
          className="px-2.5 py-1 rounded-full bg-warn text-black font-semibold text-[11px] hover:brightness-110 transition-all select-none"
        >
          End break
        </button>
      ) : (
        <button
          type="button"
          onClick={handleCheckOutAction}
          className="px-2.5 py-1 rounded-full bg-surface2 hover:bg-bad/20 hover:text-bad border border-line text-muted text-[11px] font-semibold transition-all select-none"
        >
          Check out
        </button>
      )}
    </div>
  );
}
