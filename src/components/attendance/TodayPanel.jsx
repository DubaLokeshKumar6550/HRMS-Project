import React, { useState, useMemo } from 'react';
import Card from '../Card.jsx';
import StatusPill from '../StatusPill.jsx';
import Tag from '../Tag.jsx';
import Progress from '../Progress.jsx';
import PunchTimeline from './PunchTimeline.jsx';
import GpsLocationModal from './GpsLocationModal.jsx';
import { useAttendance } from '../../context/AttendanceContext';
import { formatMsToHoursMins, minutesTo12Hour, timeStringToMinutes } from '../../utils/attendanceEngine.js';
import { formatCoordinates } from '../../utils/geoUtils.js';
import {
  Clock,
  LogIn,
  LogOut,
  Coffee,
  AlertTriangle,
  MapPin,
  Laptop,
  Check,
  Calendar,
  AlertCircle,
  HelpCircle,
  Crosshair,
  ShieldCheck,
  Navigation,
} from 'lucide-react';

export default function TodayPanel({
  onTriggerCheckIn,
  onTriggerCheckOut,
  onTriggerBreak,
  onOpenRegularise,
  onTriggerUndoCheckIn,
}) {
  const {
    today,
    isCheckedIn,
    isCheckedOut,
    onBreak,
    liveNetMs,
    evaluatedToday,
    attendanceRules,
    checkIn,
    undoCheckIn,
  } = useAttendance();

  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);

  // Work mode state for check-in
  const [selectedWorkMode, setSelectedWorkMode] = useState(today?.workMode || 'Office');

  // Live ticking clock with seconds
  const [currentTimeStr, setCurrentTimeStr] = useState(() => {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute total break duration taken today
  const totalBreakMs = useMemo(() => {
    if (!today?.breaks) return 0;
    return today.breaks.reduce((acc, b) => acc + (b.durationMin || 0) * 60 * 1000, 0);
  }, [today?.breaks]);

  const totalBreakMin = Math.round(totalBreakMs / 60000);

  // Expected checkout time for a full 8-hour day
  const expectedCheckoutTime = useMemo(() => {
    if (!today?.checkIn) return '6:30 PM';
    const inMin = timeStringToMinutes(today.checkIn);
    // Net 8 hours (480 min) + break taken (at least 60 min mandatory lunch)
    const breakToAdd = Math.max(60, totalBreakMin);
    const expMin = inMin + 480 + breakToAdd;
    return minutesTo12Hour(expMin);
  }, [today?.checkIn, totalBreakMin]);

  // Projected hours by shift end (18:30)
  const isProjectedUnder8h = useMemo(() => {
    if (!today?.checkIn || isCheckedOut) return false;
    const inMin = timeStringToMinutes(today.checkIn);
    const shiftEndMin = timeStringToMinutes(attendanceRules.shift.endTime); // 18:30 (1110 min)
    const grossMin = Math.max(0, shiftEndMin - inMin);
    const netMin = Math.max(0, grossMin - Math.max(60, totalBreakMin));
    return netMin < 480;
  }, [today?.checkIn, isCheckedOut, totalBreakMin, attendanceRules]);

  return (
    <Card
      id="mytoday"
      title="Today"
      subtitle={`Friday, 6 Nov 2026 · ${currentTimeStr} IST`}
      className="col-span-1 md:col-span-2"
    >
      <div className="flex flex-col gap-5 w-full">
        {/* Main 3-Column Today Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          {/* ========================================================= */}
          {/* LEFT BLOCK: Shift, Work Mode & Primary Punch Actions */}
          {/* ========================================================= */}
          <div className="flex flex-col justify-between p-4 rounded-xl bg-surface/30 border border-line gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold text-muted">
                  Assigned Shift
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface2 border border-line text-[11px] font-semibold text-accent font-mono">
                  General 9:30 AM – 6:30 PM
                </span>
              </div>

              {!isCheckedIn ? (
                <div className="flex flex-col gap-1.5 pt-1">
                  <label htmlFor="workMode" className="text-[12px] font-semibold text-muted">
                    Work Location Mode
                  </label>
                  <select
                    id="workMode"
                    value={selectedWorkMode}
                    onChange={(e) => setSelectedWorkMode(e.target.value)}
                    className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="Office">Office (Biometric / Geo)</option>
                    <option value="Work from home">Work from home (WFH)</option>
                    <option value="Remote/Travel">Remote / Travel</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[12.5px] p-2.5 rounded-xl bg-surface2/60 border border-line/60">
                  <span className="text-muted">Working Mode:</span>
                  <span className="font-semibold text-ink flex items-center gap-1.5">
                    {today.workMode === 'Office' ? <MapPin size={13} className="text-accent" /> : <Laptop size={13} className="text-info" />}
                    <span>{today.workMode}</span>
                  </span>
                </div>
              )}

              {/* Mandatory GPS Geofence Status Card */}
              <div className="p-2.5 rounded-xl bg-surface2/50 border border-line flex flex-col gap-1.5 text-[11.5px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono uppercase font-bold text-muted text-[10px] flex items-center gap-1">
                    <Crosshair size={11} className="text-accent" />
                    <span>Mandatory GPS Punch</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsGpsModalOpen(true)}
                    className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View Radar</span>
                  </button>
                </div>

                {today?.punchInGps ? (
                  <div className="flex flex-col gap-0.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-ink">
                      <span>In: {formatCoordinates(today.punchInGps.lat, today.punchInGps.lng)}</span>
                      <span className="text-good font-semibold">±{today.punchInGps.accuracy}m</span>
                    </div>
                    <span className="text-muted text-[10.5px] truncate">
                      {today.punchInGps.geofence?.isInside ? 'Bengaluru HQ · Within 200m Geofence ✅' : 'Remote Location Recorded'}
                    </span>
                    {today?.punchOutGps && (
                      <div className="pt-1 mt-1 border-t border-line/40 flex items-center justify-between text-ink">
                        <span>Out: {formatCoordinates(today.punchOutGps.lat, today.punchOutGps.lng)}</span>
                        <span className="text-good font-semibold">±{today.punchOutGps.accuracy}m</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-muted text-[11px]">
                    <span>Office: Bengaluru HQ (200m geofence)</span>
                    <span className="text-accent font-semibold font-mono">Ready</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              {!isCheckedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onTriggerCheckIn) {
                      onTriggerCheckIn(selectedWorkMode);
                    } else {
                      checkIn({ workMode: selectedWorkMode });
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl font-display font-bold text-[14px] shadow-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--on-accent)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <LogIn size={16} strokeWidth={2.4} />
                  <span>Check in now</span>
                </button>
              ) : !isCheckedOut ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onTriggerBreak}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-[12.5px] border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        onBreak
                          ? 'bg-warn text-black border-warn font-bold hover:brightness-105'
                          : 'bg-surface2 text-ink border-line hover:border-accent'
                      }`}
                    >
                      <Coffee size={14} className={onBreak ? 'animate-pulse' : ''} />
                      <span>{onBreak ? 'End break' : 'Start break'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onTriggerCheckOut}
                      className="py-2.5 px-3 rounded-xl bg-surface2 text-muted hover:text-bad border border-line hover:border-bad/40 font-semibold text-[12.5px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Check out</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={onTriggerUndoCheckIn || undoCheckIn}
                    className="text-[11px] text-muted hover:text-accent underline text-center cursor-pointer mt-0.5"
                    title="Reset punch to test Check-in"
                  >
                    Undo check-in (Reset punch)
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="p-3 rounded-xl bg-good/10 border border-good/30 text-center flex items-center justify-center gap-2 text-good font-semibold text-[13px]">
                    <Check size={16} />
                    <span>Shift Completed Today</span>
                  </div>
                  <button
                    type="button"
                    onClick={onTriggerUndoCheckIn || undoCheckIn}
                    className="text-[11px] text-muted hover:text-accent underline text-center cursor-pointer"
                  >
                    Reset today's punch (Check in again)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* CENTRE BLOCK: Live Working Hours & Progress Against 8h */}
          {/* ========================================================= */}
          <div className="flex flex-col justify-between p-4 rounded-xl bg-surface/30 border border-line gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono uppercase font-bold text-muted">
                Working Hours Today
              </span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-display font-extrabold text-[36px] text-ink tracking-tight tabular-nums leading-none">
                  {isCheckedIn ? formatMsToHoursMins(liveNetMs) : '0h 00m'}
                </span>
                <span className="text-[12px] text-muted font-mono">/ 8h 00m goal</span>
              </div>
            </div>

            {/* Net Hours Progress Bar with Half-Day 4h 30m marker */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted">Net duration progress</span>
                <span className="font-mono font-semibold text-ink">
                  {Math.min(100, Math.round((liveNetMs / (8 * 3600 * 1000)) * 100))}%
                </span>
              </div>

              <div className="relative w-full h-3 bg-surface2 rounded-full overflow-hidden border border-line/60">
                <div
                  className={`h-full transition-all duration-300 ${
                    isProjectedUnder8h ? 'bg-warn' : 'bg-accent'
                  }`}
                  style={{
                    width: `${Math.min(100, (liveNetMs / (8 * 3600 * 1000)) * 100)}%`,
                  }}
                />
                {/* 4h 30m Threshold marker line (56.25% of 8h) */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-line z-10"
                  style={{ left: '56.25%' }}
                  title="Half-day minimum requirement (4h 30m)"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted font-mono pt-0.5">
                <span>0h</span>
                <span className="text-warn">4h 30m (Half-day)</span>
                <span>8h (Full day)</span>
              </div>
            </div>

            <p className="text-[11.5px] text-muted mt-auto">
              Expected check-out for a full day:{' '}
              <strong className="text-ink font-semibold">{expectedCheckoutTime}</strong>
            </p>
          </div>

          {/* ========================================================= */}
          {/* RIGHT BLOCK: 4-Row Punch Details List */}
          {/* ========================================================= */}
          <div className="flex flex-col justify-between p-4 rounded-xl bg-surface/30 border border-line">
            <span className="text-[11px] font-mono uppercase font-bold text-muted mb-2">
              Punch Record Details
            </span>

            <div className="flex flex-col divide-y divide-dashed divide-line text-[12px]">
              {/* Row 1: Check-in Time */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-muted">Check-in</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink">
                    {today?.checkIn ? minutesTo12Hour(timeStringToMinutes(today.checkIn)) : '—'}
                  </span>
                  {today?.checkIn && (
                    <StatusPill
                      status={evaluatedToday?.lateMin > 0 ? 'late' : 'approved'}
                      text={evaluatedToday?.lateMin > 0 ? `Late by ${evaluatedToday.lateMin}m` : 'On time'}
                    />
                  )}
                </div>
              </div>

              {/* Row 2: Check-out Time */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-muted">Check-out</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink">
                    {today?.checkOut ? minutesTo12Hour(timeStringToMinutes(today.checkOut)) : '— (Active)'}
                  </span>
                  {evaluatedToday?.earlyMin > 0 && (
                    <StatusPill status="warn" text={`Early by ${evaluatedToday.earlyMin}m`} />
                  )}
                </div>
              </div>

              {/* Row 3: Break Taken */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-muted">Break taken</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-ink font-semibold">
                    {formatMsToHoursMins(totalBreakMs)}
                  </span>
                  <span className="text-[11px] text-muted font-mono">
                    / {attendanceRules.allowedBreakTotalMin}m max
                  </span>
                  {totalBreakMin > attendanceRules.allowedBreakTotalMin && (
                    <Tag tone="bad">Exceeded</Tag>
                  )}
                </div>
              </div>

              {/* Row 4: Mode & Location */}
              <div className="py-2 flex items-center justify-between">
                <span className="text-muted">Location / Mode</span>
                <div className="flex items-center gap-1.5">
                  <Tag>{today?.workMode || 'Office'}</Tag>
                  {today?.locationMismatch && (
                    <Tag tone="warn">Location mismatch</Tag>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INLINE ALERTS STRIP (Shows only when relevant) */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-2">
          {evaluatedToday?.lateMin > 0 && (
            <div className="p-3 rounded-xl bg-warn/10 border border-warn/30 text-warn text-[12px] flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>
                  You checked in late by <strong>{evaluatedToday.lateMin} minutes</strong> today. This counts as your 2nd late mark this month (3 allowed free).
                </span>
              </div>
            </div>
          )}

          {totalBreakMin > attendanceRules.allowedBreakTotalMin && (
            <div className="p-3 rounded-xl bg-bad/10 border border-bad/30 text-bad text-[12px] flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={15} className="shrink-0" />
              <span>
                Break allowance exceeded by <strong>{totalBreakMin - attendanceRules.allowedBreakTotalMin} minutes</strong>. Please ensure sprint work hours are compensated.
              </span>
            </div>
          )}

          {/* Missed check-out reminder for yesterday (5 Nov 2026) */}
          <div className="p-3 rounded-xl bg-surface2 border border-line text-[12px] text-muted flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-bad shrink-0" />
              <span>
                You have an unrecorded exit punch for <strong>Thursday, 5 Nov 2026</strong>. Regularise within 3 days to avoid an absent mark.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onOpenRegularise?.('5 Nov 2026', '2026-11-05')}
              className="text-accent hover:underline font-semibold text-[12px] shrink-0"
            >
              Regularise punch
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PUNCH TIMELINE SVG STRIP */}
        {/* ========================================================= */}
        <PunchTimeline
          shiftStart={attendanceRules.shift.startTime}
          shiftEnd={attendanceRules.shift.endTime}
          checkIn={today?.checkIn}
          checkOut={today?.checkOut}
          breaks={today?.breaks || []}
          currentTime={currentTimeStr.slice(0, 5)}
        />
      </div>

      {/* GPS Location & Radar Modal */}
      <GpsLocationModal
        isOpen={isGpsModalOpen}
        onClose={() => setIsGpsModalOpen(false)}
        employee={{
          name: 'Lokesh Kumar (Manager)',
          id: 'EMP-101',
          role: 'Engineering Manager',
          department: 'Engineering',
          location: 'Bengaluru',
          status: isCheckedIn ? 'in-office' : 'not-punched',
          punchIn: today?.checkIn || '09:30',
          punchOut: today?.checkOut || '—',
          punchInGps: today?.punchInGps,
          punchOutGps: today?.punchOutGps,
        }}
      />
    </Card>
  );
}
