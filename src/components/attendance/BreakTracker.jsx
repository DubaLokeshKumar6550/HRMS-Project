import React, { useState } from 'react';
import Card from '../Card.jsx';
import Tag from '../Tag.jsx';
import Progress from '../Progress.jsx';
import { useAttendance } from '../../context/AttendanceContext';
import { formatMsToHoursMins, minutesTo12Hour, timeStringToMinutes } from '../../utils/attendanceEngine.js';
import { Coffee, Trash2, Edit2, Plus, Clock, AlertTriangle, Check } from 'lucide-react';

export default function BreakTracker({ onTriggerToast }) {
  const {
    today,
    isCheckedIn,
    isCheckedOut,
    onBreak,
    activeBreakDurationMs,
    startBreak,
    endBreak,
    attendanceRules,
  } = useAttendance();

  const [selectedType, setSelectedType] = useState('Lunch');
  const [editingBreak, setEditingBreak] = useState(null);

  const breaks = today?.breaks || [];
  const totalBreakMs = breaks.reduce((acc, b) => acc + (b.durationMin || 0) * 60 * 1000, 0);
  const totalBreakMin = Math.round(totalBreakMs / 60000);
  const maxAllowedBreakMin = attendanceRules.allowedBreakTotalMin || 75;

  // Live timer for active break
  const activeBreakMins = Math.floor(activeBreakDurationMs / 60000);
  const activeBreakSecs = Math.floor((activeBreakDurationMs % 60000) / 1000);
  const activeBreakFormatted = `${String(activeBreakMins).padStart(2, '0')}:${String(activeBreakSecs).padStart(2, '0')}`;

  const handleStartBreak = async () => {
    try {
      await startBreak(selectedType);
      onTriggerToast?.(`Started ${selectedType} break.`);
    } catch (err) {
      onTriggerToast?.(err.message || 'Failed to start break');
    }
  };

  const handleEndBreak = async () => {
    try {
      await endBreak();
      onTriggerToast?.('Break ended successfully.');
    } catch (err) {
      onTriggerToast?.(err.message || 'Failed to end break');
    }
  };

  const handleDeleteBreak = (breakId) => {
    if (isCheckedOut) {
      onTriggerToast?.('Cannot delete break records after shift check-out.');
      return;
    }
    const target = breaks.find((b) => b.id === breakId);
    if (!target) return;

    // Toast with Undo
    onTriggerToast?.(`Removed ${target.type} break (${target.durationMin}m).`, () => {
      // Undo restoration would re-add the break
      onTriggerToast?.('Break record restored.');
    });
  };

  return (
    <Card
      id="mybreaks"
      title="Break Tracker"
      subtitle={`${breaks.length} breaks recorded today`}
      className="col-span-1"
    >
      <div className="flex flex-col gap-4 w-full">
        {/* Active Break Controls */}
        <div className="p-3.5 rounded-xl bg-surface/30 border border-line flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-muted flex items-center gap-1.5">
              <Coffee size={14} className={onBreak ? 'text-warn animate-pulse' : 'text-accent'} />
              <span>{onBreak ? 'Break In Progress' : 'Start a Break'}</span>
            </span>

            {onBreak && (
              <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                activeBreakMins > maxAllowedBreakMin ? 'bg-bad/20 text-bad' : 'bg-warn/20 text-warn'
              }`}>
                {activeBreakFormatted}
              </span>
            )}
          </div>

          {!isCheckedIn ? (
            <p className="text-[12px] text-muted italic">
              Check in first to record coffee, lunch, or personal breaks.
            </p>
          ) : isCheckedOut ? (
            <p className="text-[12px] text-muted">
              Shift is completed. Today's break logs are finalized.
            </p>
          ) : onBreak ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[12.5px] text-ink font-semibold">
                {today.activeBreak?.type} break running since {today.activeBreak?.start}
              </span>
              <button
                type="button"
                onClick={handleEndBreak}
                className="px-4 py-2 rounded-xl bg-warn text-black font-display font-bold text-[12px] shadow-sm hover:brightness-105 active:scale-95 transition-all"
              >
                End break
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-surface2 border border-line rounded-xl px-3 py-1.5 text-[12px] text-ink focus:outline-none focus:border-accent"
              >
                <option value="Lunch">Lunch break</option>
                <option value="Tea">Tea / Coffee</option>
                <option value="Personal">Personal time</option>
              </select>

              <button
                type="button"
                onClick={handleStartBreak}
                className="flex-1 py-1.5 px-3 rounded-xl bg-surface2 text-ink border border-line hover:border-accent font-semibold text-[12px] transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={13} />
                <span>Start {selectedType}</span>
              </button>
            </div>
          )}
        </div>

        {/* Breaks List */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-mono uppercase font-bold text-muted">
            Today's Logged Breaks
          </span>

          {breaks.length === 0 ? (
            <div className="p-3 rounded-xl bg-surface2/30 border border-dashed border-line text-[12px] text-muted text-center">
              No breaks recorded yet. If none are logged, a mandatory 60m lunch is auto-deducted at check-out.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-dashed divide-line text-[12px]">
              {breaks.map((b) => (
                <div key={b.id} className="py-2.5 flex items-center justify-between gap-2 group">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <span className="font-semibold text-ink">{b.type}</span>
                    <span className="font-mono text-muted text-[11px]">
                      {b.start} – {b.end}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag tone={b.durationMin > 45 ? 'warn' : 'accent'}>
                      {b.durationMin}m
                    </Tag>

                    {!isCheckedOut && (
                      <button
                        type="button"
                        onClick={() => handleDeleteBreak(b.id)}
                        className="text-muted hover:text-bad p-1 rounded transition-colors"
                        title="Delete break entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total Break Summary Progress */}
        <div className="pt-2 border-t border-line flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="text-muted">
              Total break: <strong className="text-ink font-mono">{formatMsToHoursMins(totalBreakMs)}</strong> of {maxAllowedBreakMin}m allowed
            </span>
            <span className="font-mono font-semibold text-ink">
              {Math.min(100, Math.round((totalBreakMin / maxAllowedBreakMin) * 100))}%
            </span>
          </div>

          <Progress
            value={totalBreakMin}
            max={maxAllowedBreakMin}
            variant={totalBreakMin > maxAllowedBreakMin ? 'bad' : 'normal'}
            height={6}
          />

          <span className="text-[10.5px] text-muted italic pt-0.5">
            Note: 60 min lunch is auto-deducted if no breaks are logged.
          </span>
        </div>
      </div>
    </Card>
  );
}
