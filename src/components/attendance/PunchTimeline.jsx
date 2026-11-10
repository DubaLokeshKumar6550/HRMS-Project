import React from 'react';
import { timeStringToMinutes } from '../../utils/attendanceEngine.js';

export default function PunchTimeline({
  shiftStart = '09:30',
  shiftEnd = '18:30',
  checkIn,
  checkOut,
  breaks = [],
  currentTime = '15:15',
}) {
  const windowStartMin = timeStringToMinutes(shiftStart) - 30; // 9:00 AM
  const windowEndMin = timeStringToMinutes(shiftEnd) + 30;     // 7:00 PM
  const totalWindowMin = windowEndMin - windowStartMin;        // 600 min

  const getPercent = (timeStr) => {
    if (!timeStr) return null;
    const min = timeStringToMinutes(timeStr);
    const clamped = Math.max(windowStartMin, Math.min(windowEndMin, min));
    return ((clamped - windowStartMin) / totalWindowMin) * 100;
  };

  const checkInPct = getPercent(checkIn);
  const checkOutPct = getPercent(checkOut);
  const currentPct = getPercent(currentTime);

  const shiftStartPct = getPercent(shiftStart);
  const shiftEndPct = getPercent(shiftEnd);

  const ariaDesc = `Attendance shift timeline: Shift ${shiftStart} to ${shiftEnd}. Check-in ${
    checkIn || 'none'
  }, Check-out ${checkOut || 'in progress'}.`;

  return (
    <div
      role="img"
      aria-label={ariaDesc}
      className="w-full flex flex-col gap-1.5 p-3 rounded-xl bg-surface/40 border border-line select-none"
    >
      <div className="flex items-center justify-between text-[10.5px] font-mono text-muted">
        <span>9:00 AM</span>
        <span>11:30 AM</span>
        <span>1:30 PM (Lunch)</span>
        <span>3:30 PM</span>
        <span>5:30 PM</span>
        <span>7:00 PM</span>
      </div>

      <div className="relative w-full h-8 bg-surface2 rounded-lg overflow-hidden border border-line/60">
        {/* Shift Window Highlight */}
        <div
          className="absolute top-0 bottom-0 bg-accent/10 border-x border-dashed border-accent/40"
          style={{
            left: `${shiftStartPct}%`,
            width: `${shiftEndPct - shiftStartPct}%`,
          }}
          title="Scheduled Shift (9:30 AM – 6:30 PM)"
        />

        {/* Working Duration Bar (checkIn to checkOut or current) */}
        {checkInPct !== null && (
          <div
            className="absolute top-2 bottom-2 bg-accent/40 rounded-sm"
            style={{
              left: `${checkInPct}%`,
              width: `${Math.max(2, (checkOutPct ?? currentPct) - checkInPct)}%`,
            }}
          />
        )}

        {/* Break Segments (Warn colored fills) */}
        {breaks.map((brk, idx) => {
          if (!brk.start) return null;
          const bStartPct = getPercent(brk.start);
          const bEndPct = getPercent(brk.end || currentTime);
          if (bStartPct === null || bEndPct === null) return null;
          return (
            <div
              key={idx}
              className="absolute top-1.5 bottom-1.5 bg-warn/80 rounded-sm shadow-sm"
              style={{
                left: `${bStartPct}%`,
                width: `${Math.max(2, bEndPct - bStartPct)}%`,
              }}
              title={`${brk.type || 'Break'}: ${brk.start} – ${brk.end || 'Active'}`}
            />
          );
        })}

        {/* Check-in Marker */}
        {checkInPct !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-accent z-10"
            style={{ left: `${checkInPct}%` }}
            title={`Check-in: ${checkIn}`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-accent -translate-x-[4px] -translate-y-1 shadow-sm" />
          </div>
        )}

        {/* Current Time Needle */}
        {!checkOut && currentPct !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-info z-10"
            style={{ left: `${currentPct}%` }}
            title={`Current Time: ${currentTime}`}
          >
            <div className="w-2 h-2 rounded-full bg-info -translate-x-[3px] translate-y-6 animate-pulse" />
          </div>
        )}

        {/* Check-out Marker */}
        {checkOutPct !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-good z-10"
            style={{ left: `${checkOutPct}%` }}
            title={`Check-out: ${checkOut}`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-good -translate-x-[4px] -translate-y-1 shadow-sm" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10.5px] text-muted font-mono pt-0.5">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-accent/40" /> Working
          <span className="w-2 h-2 rounded-sm bg-warn ml-2" /> Break
        </span>
        <span>Shift window: {shiftStart} – {shiftEnd} IST</span>
      </div>
    </div>
  );
}

