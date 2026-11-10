// Unit tests for Attendance Rules Engine
// Validates 14 distinct real-world attendance evaluation cases

import assert from 'node:assert';
import { test } from 'node:test';
import {
  evaluateDay,
  timeStringToMinutes,
  minutesTo12Hour,
  formatMsToHoursMins,
} from './attendanceEngine.js';
import { attendanceRules } from '../config/attendanceRules.js';

test('1. On time arrival (9:30 AM to 6:30 PM with 1h break) resolves to Present', () => {
  const day = {
    checkIn: '09:30',
    checkOut: '18:30',
    breaks: [{ start: '13:00', end: '14:00', durationMin: 60 }],
    workMode: 'Office',
  };
  const result = evaluateDay(day, attendanceRules);
  assert.strictEqual(result.status, 'Present');
  assert.strictEqual(result.lateMin, 0);
  assert.strictEqual(result.earlyMin, 0);
  assert.strictEqual(result.netMs, 8 * 60 * 60 * 1000); // 8h
});

test('2. Arrival exactly at grace limit (9:45 AM) is On time', () => {
  const day = {
    checkIn: '09:45',
    checkOut: '18:45',
    breaks: [{ start: '13:00', end: '14:00', durationMin: 60 }],
    workMode: 'Office',
  };
  const result = evaluateDay(day, attendanceRules);
  assert.strictEqual(result.lateMin, 0);
  assert.strictEqual(result.status, 'Present');
});

test('3. Arrival after grace (9:52 AM) resolves to Late by 22 min', () => {
  const day = {
    checkIn: '09:52',
    checkOut: '18:52',
    breaks: [{ start: '13:00', end: '14:00', durationMin: 60 }],
    workMode: 'Office',
  };
  const result = evaluateDay(day, attendanceRules);
  assert.strictEqual(result.status, 'Late');
  assert.strictEqual(result.lateMin, 22);
  assert.ok(result.flags.some((f) => f.includes('Late by 22 min')));
});

test('4. Short hours (net hours between 4h 30m and 8h)', () => {
  const day = {
    checkIn: '09:30',
    checkOut: '15:30', // 6h gross - 1h break = 5h net
    breaks: [{ start: '13:00', end: '14:00', durationMin: 60 }],
    workMode: 'Office',
  };
  const result = evaluateDay(day, attendanceRules);
  assert.strictEqual(result.status, 'Short hours');
  assert.ok(result.flags.some((f) => f.includes('Short hours')));
});

test('5. Early departure before 6:15 PM with net hours < 8h', () => {
  const day = {
    checkIn: '09:30',
    checkOut: '17:30', // left at 5:30 PM (60 min before shift end 18:30)
    breaks: [{ start: '13:00', end: '14:00', durationMin: 60 }],
    workMode: 'Office',
  };
  const result = evaluateDay(day, attendanceRules);
  assert.strictEqual(result.earlyMin, 60);
  assert.ok(result.flags.some((f) => f.includes('Early departure by 60 min')));
});

test('6. Break exceeded total allowed 75 min', () => {
  const day = {
    checkIn: '09:30',
    checkOut: '18:45',
    breaks: [
      { start: '13:00', end: '14:15', durationMin: 75, type: 'Lunch' },
      { start: '16:00', end: '16:15', durationMin: 15, type: 'Tea' },
    ], // 90 min total -> exceeded by 15 min
    workMode: 'Office',
  };
  const result = evaluateDay(day, attendanceRules);
  assert.ok(result.flags.some((f) => f.includes('Break exceeded by 15 min')));
});

test('7. Overtime when net hours exceed 9h', () => {
  const day = {
    checkIn: '09:00',
    checkOut: '19:30', // 10h 30m gross - 1h break = 9h 30m net (30m OT)
    breaks: [{ start: '13:00', end: '14:00', durationMin: 60 }],
    workMode: 'Office',
  };
  const result = evaluateDay(day, attendanceRules);
  assert.strictEqual(result.overtimeMin, 30);
  assert.ok(result.flags.some((f) => f.includes('Overtime')));
});

test('8. Missed check-out on past day', () => {
  const day = {
    checkIn: '09:30',
    checkOut: null,
    isMissedCheckout: true,
  };
  const result = evaluateDay(day, attendanceRules, { isPastDay: true });
  assert.strictEqual(result.status, 'Missed check-out');
  assert.strictEqual(result.netMs, 0);
  assert.ok(result.flags.includes('Missed check-out'));
});

test('9. Weekly off without check-in', () => {
  const day = {
    checkIn: null,
    isWeeklyOff: true,
  };
  const result = evaluateDay(day, attendanceRules);
  assert.strictEqual(result.status, 'Weekly off');
  assert.strictEqual(result.netMs, 0);
});

test('10. Holiday', () => {
  const day = {
    isHoliday: true,
  };
  const result = evaluateDay(day, attendanceRules);
  assert.strictEqual(result.status, 'Holiday');
});

test('11. Approved full-day leave', () => {
  const day = {
    leaveApplied: 'Casual leave',
    checkIn: null,
  };
  const result = evaluateDay(day, attendanceRules);
  assert.strictEqual(result.status, 'On leave');
});

test('12. Location mismatch when office check-in outside 200m radius', () => {
  const day = {
    checkIn: '09:30',
    checkOut: '18:30',
    breaks: [{ start: '13:00', end: '14:00', durationMin: 60 }],
    workMode: 'Office',
    locationMismatch: true,
  };
  const result = evaluateDay(day, attendanceRules);
  assert.ok(result.flags.includes('Location mismatch'));
});

test('13. Half day leave applied with 5h net work', () => {
  const day = {
    checkIn: '09:30',
    checkOut: '15:30',
    breaks: [{ start: '13:00', end: '14:00', durationMin: 60 }],
    leaveApplied: 'Half day',
  };
  const result = evaluateDay(day, attendanceRules);
  assert.strictEqual(result.status, 'Half day');
});

test('14. Less than 4h 30m worked resolves to Absent', () => {
  const day = {
    checkIn: '09:30',
    checkOut: '13:00', // 3h 30m gross
    breaks: [],
    workMode: 'Office',
  };
  const result = evaluateDay(day, attendanceRules);
  assert.strictEqual(result.status, 'Absent');
  assert.ok(result.flags.some((f) => f.includes('Less than 4h 30m logged')));
});

