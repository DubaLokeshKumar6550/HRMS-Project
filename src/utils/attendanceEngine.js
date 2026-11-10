// Attendance Rules Engine - Pure calculation functions
// Evaluates attendance for any given day based on configured rules

import { attendanceRules as defaultRules } from '../config/attendanceRules.js';

/**
 * Converts "HH:MM" (24-hour) or "h:mm A" string to minutes from midnight
 */
export function timeStringToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const clean = timeStr.trim().toUpperCase();

  // Handle 12-hour format e.g. "9:30 AM", "06:15 PM"
  if (clean.includes('AM') || clean.includes('PM')) {
    const isPM = clean.includes('PM');
    const withoutPeriod = clean.replace(/[AP]M/, '').trim();
    const [hStr, mStr] = withoutPeriod.split(':');
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr || '0', 10);
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // Handle 24-hour format e.g. "09:30", "18:30"
  const [hStr, mStr] = clean.split(':');
  const hours = parseInt(hStr, 10) || 0;
  const minutes = parseInt(mStr || '0', 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight to 12-hour format with AM/PM (e.g. 570 -> "9:30 AM")
 */
export function minutesTo12Hour(minutes) {
  if (minutes == null || isNaN(minutes)) return '—';
  const totalMins = Math.floor(minutes);
  const hours24 = Math.floor(totalMins / 60) % 24;
  const mins = totalMins % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minsPadded = mins < 10 ? `0${mins}` : mins;
  return `${hours12}:${minsPadded} ${period}`;
}

/**
 * Formats milliseconds into clean string like "8h 14m" or "45m"
 */
export function formatMsToHoursMins(ms) {
  if (!ms || ms <= 0) return '0m';
  const totalMinutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h 00m`;
  return `${mins}m`;
}

/**
 * Evaluates the attendance state of a single day entry
 * 
 * @param {Object} entry - Day record
 * @param {Object} [rules] - Configured rules (defaults to attendanceRules)
 * @param {Object} [context] - Environmental context (e.g. isToday, nowMinutes)
 * @returns {Object} { status, grossMs, breakMs, netMs, lateMin, earlyMin, overtimeMin, flags }
 */
export function evaluateDay(entry = {}, rules = defaultRules, context = {}) {
  const flags = [];
  const shift = entry.shift || rules.shift;
  const shiftStartMin = timeStringToMinutes(shift.startTime);
  const shiftEndMin = timeStringToMinutes(shift.endTime);
  const gracePeriodMin = rules.gracePeriodMin ?? 15;
  const lateCutoffMin = shiftStartMin + gracePeriodMin; // 09:45

  // 1. Holiday check
  if (entry.isHoliday) {
    return {
      status: 'Holiday',
      grossMs: 0,
      breakMs: 0,
      netMs: 0,
      lateMin: 0,
      earlyMin: 0,
      overtimeMin: 0,
      flags: ['Holiday'],
    };
  }

  // 2. Weekly Off check
  const isWeeklyOff = Boolean(entry.isWeeklyOff);
  if (isWeeklyOff && !entry.checkIn) {
    return {
      status: 'Weekly off',
      grossMs: 0,
      breakMs: 0,
      netMs: 0,
      lateMin: 0,
      earlyMin: 0,
      overtimeMin: 0,
      flags: ['Weekly off'],
    };
  }

  // 3. Approved Leave (Full Day)
  if (entry.leaveApplied && entry.leaveApplied !== 'Half day' && !entry.checkIn) {
    return {
      status: 'On leave',
      grossMs: 0,
      breakMs: 0,
      netMs: 0,
      lateMin: 0,
      earlyMin: 0,
      overtimeMin: 0,
      flags: [`Leave (${entry.leaveApplied})`],
    };
  }

  // 4. Punch Presence check
  if (!entry.checkIn) {
    return {
      status: 'Absent',
      grossMs: 0,
      breakMs: 0,
      netMs: 0,
      lateMin: 0,
      earlyMin: 0,
      overtimeMin: 0,
      flags: ['No punch recorded'],
    };
  }

  // 5. Work on Weekly Off / Holiday
  if (isWeeklyOff) {
    flags.push('Extra day (comp-off eligible)');
  }

  // 6. Arrival & Late Calculation
  const checkInMin = timeStringToMinutes(entry.checkIn);
  let lateMin = 0;
  if (checkInMin > lateCutoffMin) {
    lateMin = checkInMin - shiftStartMin; // e.g. 09:52 - 09:30 = 22 min
    flags.push(`Late by ${lateMin} min`);
  }

  // 7. Breaks Calculation
  let rawBreakMs = 0;
  if (Array.isArray(entry.breaks)) {
    for (const b of entry.breaks) {
      if (b.durationMin) {
        // Minimum break filter (breaks < 5m merged into working time)
        if (b.durationMin >= (rules.minBreakRecordMin ?? 5)) {
          rawBreakMs += b.durationMin * 60 * 1000;
        }
      } else if (b.start && b.end) {
        const bStart = timeStringToMinutes(b.start);
        const bEnd = timeStringToMinutes(b.end);
        const diffMin = Math.max(0, bEnd - bStart);
        if (diffMin >= (rules.minBreakRecordMin ?? 5)) {
          rawBreakMs += diffMin * 60 * 1000;
        }
      }
    }
  } else if (typeof entry.breakMin === 'number') {
    if (entry.breakMin >= (rules.minBreakRecordMin ?? 5)) {
      rawBreakMs = entry.breakMin * 60 * 1000;
    }
  }

  // Mandatory 60 min lunch break auto-deduction if person records no breaks
  let breakMs = rawBreakMs;
  let isAutoBreakDeducted = false;
  if (rawBreakMs === 0 && entry.checkOut) {
    breakMs = (rules.mandatoryBreakMin ?? 60) * 60 * 1000;
    isAutoBreakDeducted = true;
    flags.push('Auto 60 min lunch break');
  }

  // Break exceeded check (> 75 min)
  const breakMinTotal = Math.round(breakMs / 60000);
  const maxAllowedBreakMin = rules.allowedBreakTotalMin ?? 75;
  if (breakMinTotal > maxAllowedBreakMin) {
    const exceededMin = breakMinTotal - maxAllowedBreakMin;
    flags.push(`Break exceeded by ${exceededMin} min`);
  }

  // 8. Missed check-out check
  if (entry.isMissedCheckout || (!entry.checkOut && context.isPastDay)) {
    return {
      status: 'Missed check-out',
      grossMs: 0,
      breakMs,
      netMs: 0,
      lateMin,
      earlyMin: 0,
      overtimeMin: 0,
      flags: [...flags, 'Missed check-out'],
    };
  }

  // 9. If Checked in but Day is In-Progress (Today)
  let checkOutMin;
  let isDayComplete = false;
  if (entry.checkOut) {
    checkOutMin = timeStringToMinutes(entry.checkOut);
    isDayComplete = true;
  } else if (context.nowMinutes) {
    checkOutMin = context.nowMinutes;
  } else {
    // Default fallback to shift end or check-in
    checkOutMin = checkInMin;
  }

  const grossMins = Math.max(0, checkOutMin - checkInMin);
  const grossMs = grossMins * 60 * 1000;
  const netMs = Math.max(0, grossMs - breakMs);
  const netHours = netMs / (60 * 60 * 1000);

  // 10. Early Departure check
  let earlyMin = 0;
  const earlyDepartureCutoffMin = timeStringToMinutes(rules.earlyDepartureCutoffTime || '18:15');
  if (isDayComplete && checkOutMin < earlyDepartureCutoffMin && netHours < (rules.fullDayMinHours ?? 8)) {
    earlyMin = Math.max(0, shiftEndMin - checkOutMin);
    flags.push(`Early departure by ${earlyMin} min`);
  }

  // 11. Overtime Calculation (Net hours above 9h)
  let overtimeMin = 0;
  if (netMs > (rules.overtimeThresholdMs ?? 9 * 60 * 60 * 1000)) {
    overtimeMin = Math.round((netMs - (rules.overtimeThresholdMs ?? 9 * 60 * 60 * 1000)) / (60 * 1000));
    flags.push(`Overtime ${formatMsToHoursMins(overtimeMin * 60 * 1000)}`);
  }

  // 12. Location Mismatch Flag
  if (entry.locationMismatch) {
    flags.push('Location mismatch');
  }

  // 13. Determine Primary Status
  let status = 'Present';

  if (entry.workMode === 'Work from home' || entry.workMode === 'Remote/Travel') {
    status = entry.workMode === 'Work from home' ? 'Work from home' : 'Remote';
  } else if (entry.leaveApplied === 'Half day') {
    status = 'Half day';
  } else if (isDayComplete && netHours < (rules.shortHoursMinHours ?? 4.5)) {
    status = 'Absent';
    flags.push('Less than 4h 30m logged');
  } else if (isDayComplete && netHours >= (rules.shortHoursMinHours ?? 4.5) && netHours < (rules.fullDayMinHours ?? 8)) {
    status = 'Short hours';
    flags.push('Short hours (< 8h)');
  } else if (lateMin > 0) {
    status = 'Late';
  } else {
    status = 'Present';
  }

  return {
    status,
    grossMs,
    breakMs,
    netMs,
    lateMin,
    earlyMin,
    overtimeMin,
    flags,
    isAutoBreakDeducted,
    netHoursFormatted: formatMsToHoursMins(netMs),
  };
}
