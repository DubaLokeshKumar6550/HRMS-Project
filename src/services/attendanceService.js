// Mock Attendance Service for Manager Desk
// Mock only. Use server time and server-side rule validation in production.
// Stores state in localStorage under key: hrms_my_attendance

import { initialAttendanceHistory, initialRegularisations } from '../data/myAttendance.js';
import { timeStringToMinutes } from '../utils/attendanceEngine.js';
import { acquireDeviceLocation } from '../utils/geoUtils.js';

const STORAGE_KEY = 'hrms_my_attendance';

function delay(min = 300, max = 600) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure today's record is fresh if user hasn't actively punched in yet
      const today = parsed.history?.find((d) => d.dateKey === '2026-11-06');
      if (today && today.checkIn === '09:52' && !parsed.hasUserCheckedIn) {
        today.checkIn = null;
        today.checkOut = null;
        today.breaks = [];
        today.activeBreak = null;
        saveStoredData(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse hrms_my_attendance from localStorage:', err);
  }

  const initial = {
    history: initialAttendanceHistory,
    regularisations: initialRegularisations,
    lastUpdated: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch (err) {
    console.warn('Could not initialize localStorage:', err);
  }
  return initial;
}

function saveStoredData(data) {
  try {
    data.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to hrms_my_attendance:', err);
  }
}

export const attendanceService = {
  // 1. Get Today's Record (2026-11-06)
  async getToday() {
    await delay();
    const data = getStoredData();
    const today = data.history.find((d) => d.dateKey === '2026-11-06');
    return today || null;
  },

  // 2. Check in
  async checkIn({ time, workMode = 'Office', notes = '', locationMismatch = false, gpsLocation = null } = {}) {
    await delay();
    const data = getStoredData();
    let today = data.history.find((d) => d.dateKey === '2026-11-06');

    const now = new Date();
    const currentPunchTime =
      time ||
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Acquire mandatory GPS if not provided
    const capturedGps = gpsLocation || (await acquireDeviceLocation('bengaluru'));

    // Check geofence mismatch
    let isMismatch = locationMismatch;
    if (workMode === 'Office' && capturedGps?.geofence && !capturedGps.geofence.isInside) {
      isMismatch = true;
    }

    if (!today) {
      today = {
        date: '6 Nov 2026',
        dateKey: '2026-11-06',
        dayOfWeek: 'Friday',
        shift: { name: 'General', startTime: '09:30', endTime: '18:30' },
        checkIn: currentPunchTime,
        checkOut: null,
        breaks: [],
        activeBreak: null,
        workMode,
        locationMismatch: isMismatch,
        punchInGps: capturedGps,
        punchOutGps: null,
        notes,
      };
      data.history.unshift(today);
    } else {
      today.checkIn = currentPunchTime;
      today.workMode = workMode;
      today.locationMismatch = isMismatch;
      today.punchInGps = capturedGps;
      today.punchOutGps = null;
      today.notes = notes;
      today.checkOut = null;
      today.breaks = [];
      today.activeBreak = null;
    }

    data.hasUserCheckedIn = true;
    saveStoredData(data);
    return today;
  },

  // Undo Check in (Resets back to ready-to-check-in state)
  async undoCheckIn() {
    await delay();
    const data = getStoredData();
    const today = data.history.find((d) => d.dateKey === '2026-11-06');
    if (today) {
      today.checkIn = null;
      today.checkOut = null;
      today.breaks = [];
      today.activeBreak = null;
      today.punchInGps = null;
      today.punchOutGps = null;
      data.hasUserCheckedIn = false;
    }
    saveStoredData(data);
    return today;
  },

  // 3. Start Break
  async startBreak(type = 'Lunch', startTime) {
    await delay();
    const data = getStoredData();
    const today = data.history.find((d) => d.dateKey === '2026-11-06');
    if (!today || !today.checkIn) throw new Error('Must be checked in to start break');

    const breakId = `brk-${Date.now()}`;
    const start = startTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const newBreak = {
      id: breakId,
      start,
      type,
      startMs: Date.now(),
    };

    today.activeBreak = newBreak;
    saveStoredData(data);
    return today;
  },

  // 4. End Break
  async endBreak(endTime) {
    await delay();
    const data = getStoredData();
    const today = data.history.find((d) => d.dateKey === '2026-11-06');
    if (!today || !today.activeBreak) throw new Error('No active break found');

    const end = endTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const startMin = timeStringToMinutes(today.activeBreak.start);
    const endMin = timeStringToMinutes(end);
    const durationMin = Math.max(1, endMin - startMin);

    const completedBreak = {
      id: today.activeBreak.id,
      start: today.activeBreak.start,
      end,
      durationMin,
      type: today.activeBreak.type,
    };

    today.breaks = [...(today.breaks || []), completedBreak];
    today.activeBreak = null;
    saveStoredData(data);
    return today;
  },

  // 5. Check out
  async checkOut({ time, earlyReason = '', gpsLocation = null } = {}) {
    await delay();
    const data = getStoredData();
    const today = data.history.find((d) => d.dateKey === '2026-11-06');
    if (!today || !today.checkIn) throw new Error('Cannot check out without prior check-in');

    // Auto-end active break if on break
    if (today.activeBreak) {
      const end = time || '18:30';
      const startMin = timeStringToMinutes(today.activeBreak.start);
      const endMin = timeStringToMinutes(end);
      const durationMin = Math.max(1, endMin - startMin);
      today.breaks.push({
        id: today.activeBreak.id,
        start: today.activeBreak.start,
        end,
        durationMin,
        type: today.activeBreak.type,
      });
      today.activeBreak = null;
    }

    const capturedGps = gpsLocation || (await acquireDeviceLocation('bengaluru'));

    today.checkOut = time || '18:30';
    today.punchOutGps = capturedGps;
    if (earlyReason) {
      today.earlyDepartureReason = earlyReason;
    }

    saveStoredData(data);
    return today;
  },

  // 6. Undo Check Out (Reversible within window)
  async undoCheckOut() {
    await delay();
    const data = getStoredData();
    const today = data.history.find((d) => d.dateKey === '2026-11-06');
    if (!today) throw new Error('Today record not found');

    today.checkOut = null;
    today.punchOutGps = null;
    delete today.earlyDepartureReason;

    saveStoredData(data);
    return today;
  },

  // 7. Get Month Records
  async getMonth(year = 2026, month = 11) {
    await delay();
    const data = getStoredData();
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    return data.history.filter((d) => d.dateKey.startsWith(monthPrefix));
  },

  // 8. Submit Regularisation
  async regularise(payload) {
    await delay();
    const data = getStoredData();
    const newReg = {
      id: `REG-${Math.floor(100 + Math.random() * 900)}`,
      date: payload.date,
      dateKey: payload.dateKey,
      issueType: payload.issueType,
      requestedCheckIn: payload.requestedCheckIn,
      requestedCheckOut: payload.requestedCheckOut,
      breakMin: payload.breakMin || 60,
      reason: payload.reason,
      attachmentName: payload.attachmentName || null,
      status: 'Pending',
      submittedAt: 'Just now',
      decidedBy: 'Rahul Menon (Director, Engineering)',
      decisionNote: null,
    };

    data.regularisations = [newReg, ...(data.regularisations || [])];
    saveStoredData(data);
    return newReg;
  },

  // 9. Withdraw Regularisation
  async withdrawRegularisation(id) {
    await delay();
    const data = getStoredData();
    data.regularisations = (data.regularisations || []).filter((r) => r.id !== id);
    saveStoredData(data);
    return id;
  },

  // 10. List Regularisations
  async listRegularisations() {
    await delay();
    const data = getStoredData();
    return data.regularisations || [];
  },
};

