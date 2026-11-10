import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { attendanceService } from '../services/attendanceService.js';
import { attendanceRules } from '../config/attendanceRules.js';
import { evaluateDay, timeStringToMinutes } from '../utils/attendanceEngine.js';
import { useTick } from '../hooks/useTick.js';

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children, onTriggerToast }) {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [regularisations, setRegularisations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Live timer tick every 1000ms
  const currentTimestamp = useTick(1000);

  // Load state from attendanceService / localStorage
  const loadData = useCallback(async () => {
    try {
      const [todayRecord, monthData, regList] = await Promise.all([
        attendanceService.getToday(),
        attendanceService.getMonth(2026, 11),
        attendanceService.listRegularisations(),
      ]);
      setToday(todayRecord);
      setHistory(monthData);
      setRegularisations(regList);
    } catch (err) {
      console.error('Failed to load attendance data in AttendanceProvider:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Multi-tab sync via storage events
    const handleStorageChange = (e) => {
      if (e.key === 'hrms_my_attendance') {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  // Derived current day states
  const isCheckedIn = Boolean(today?.checkIn);
  const isCheckedOut = Boolean(today?.checkOut);
  const onBreak = Boolean(today?.activeBreak);

  // Compute live current minutes in IST for in-progress day
  const nowMinutes = useMemo(() => {
    // Simulated time or real clock
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, [currentTimestamp]);

  // Evaluated record for today
  const evaluatedToday = useMemo(() => {
    if (!today) return null;
    return evaluateDay(today, attendanceRules, { nowMinutes, isPastDay: false });
  }, [today, nowMinutes]);

  // Live Net Milliseconds working today
  const liveNetMs = useMemo(() => {
    if (!today || !today.checkIn) return 0;
    return evaluatedToday?.netMs || 0;
  }, [today, evaluatedToday]);

  // Live active break duration
  const activeBreakDurationMs = useMemo(() => {
    if (!today?.activeBreak) return 0;
    const startMin = timeStringToMinutes(today.activeBreak.start);
    const diffMin = Math.max(0, nowMinutes - startMin);
    return diffMin * 60 * 1000;
  }, [today?.activeBreak, nowMinutes]);

  // Actions
  const handleCheckIn = async (payload) => {
    const updated = await attendanceService.checkIn(payload);
    setToday(updated);
    await loadData();
    return updated;
  };

  const handleStartBreak = async (type = 'Lunch', startTime) => {
    const updated = await attendanceService.startBreak(type, startTime);
    setToday(updated);
    await loadData();
    return updated;
  };

  const handleEndBreak = async (endTime) => {
    const updated = await attendanceService.endBreak(endTime);
    setToday(updated);
    await loadData();
    return updated;
  };

  const handleCheckOut = async (payload) => {
    const updated = await attendanceService.checkOut(payload);
    setToday(updated);
    await loadData();
    return updated;
  };

  const handleUndoCheckOut = async () => {
    const updated = await attendanceService.undoCheckOut();
    setToday(updated);
    await loadData();
    return updated;
  };

  const handleUndoCheckIn = async () => {
    const updated = await attendanceService.undoCheckIn();
    setToday(updated);
    await loadData();
    return updated;
  };

  const handleRegularise = async (payload) => {
    const created = await attendanceService.regularise(payload);
    await loadData();
    return created;
  };

  const handleWithdrawRegularisation = async (id) => {
    await attendanceService.withdrawRegularisation(id);
    await loadData();
  };

  return (
    <AttendanceContext.Provider
      value={{
        today,
        history,
        regularisations,
        isLoading,
        isCheckedIn,
        isCheckedOut,
        onBreak,
        activeBreakDurationMs,
        liveNetMs,
        evaluatedToday,
        currentTimestamp,
        checkIn: handleCheckIn,
        undoCheckIn: handleUndoCheckIn,
        startBreak: handleStartBreak,
        endBreak: handleEndBreak,
        checkOut: handleCheckOut,
        undoCheckOut: handleUndoCheckOut,
        regularise: handleRegularise,
        withdrawRegularisation: handleWithdrawRegularisation,
        refreshData: loadData,
        attendanceRules,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}

