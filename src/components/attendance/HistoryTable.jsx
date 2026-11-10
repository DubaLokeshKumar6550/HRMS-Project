import React from 'react';
import StatusPill from '../StatusPill.jsx';
import Tag from '../Tag.jsx';
import Progress from '../Progress.jsx';
import { evaluateDay, formatMsToHoursMins, minutesTo12Hour, timeStringToMinutes } from '../../utils/attendanceEngine.js';
import { attendanceRules } from '../../config/attendanceRules.js';

export default function HistoryTable({
  records = [],
  onOpenRegularise,
}) {
  return (
    <div className="overflow-x-auto w-full rounded-xl border border-line bg-surface/30">
      <table className="w-full border-collapse text-left min-w-[760px] text-[12.5px]">
        <thead>
          <tr className="border-b border-line bg-surface2/50 text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
            <th className="py-2.5 px-3 sticky left-0 bg-surface2 z-10">Date & Day</th>
            <th className="py-2.5 px-3">Shift</th>
            <th className="py-2.5 px-3 font-mono">Check-in</th>
            <th className="py-2.5 px-3 font-mono">Check-out</th>
            <th className="py-2.5 px-3 font-mono">Break</th>
            <th className="py-2.5 px-3 w-36">Net Hours</th>
            <th className="py-2.5 px-3">Status</th>
            <th className="py-2.5 px-3">Flags</th>
            <th className="py-2.5 px-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-line/40">
          {records.map((rec) => {
            const evalResult = evaluateDay(rec, attendanceRules, { isPastDay: true });
            const totalBreakMin = rec.breaks?.reduce((a, b) => a + (b.durationMin || 0), 0) || 0;
            const netHoursDecimal = evalResult.netMs / (60 * 60 * 1000);

            return (
              <tr key={rec.dateKey} className="hover:bg-surface2/30 transition-colors">
                {/* Sticky Date Column */}
                <td className="py-3 px-3 font-medium text-ink sticky left-0 bg-bg/90 backdrop-blur z-10">
                  <div className="flex flex-col">
                    <span className="font-bold">{rec.date}</span>
                    <span className="text-[11px] text-muted">{rec.dayOfWeek}</span>
                  </div>
                </td>

                <td className="py-3 px-3 text-muted text-[12px]">
                  {rec.shift?.name || 'General'}
                </td>

                <td className="py-3 px-3 font-mono text-ink">
                  {rec.checkIn ? minutesTo12Hour(timeStringToMinutes(rec.checkIn)) : '—'}
                </td>

                <td className="py-3 px-3 font-mono text-ink">
                  {rec.checkOut ? minutesTo12Hour(timeStringToMinutes(rec.checkOut)) : '—'}
                </td>

                <td className="py-3 px-3 font-mono text-muted">
                  {totalBreakMin > 0 ? `${totalBreakMin}m` : '—'}
                </td>

                {/* Net Hours Progress Bar */}
                <td className="py-3 px-3">
                  <div className="flex flex-col gap-1 w-28">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-ink font-semibold">{formatMsToHoursMins(evalResult.netMs)}</span>
                      <span className="text-muted">8h</span>
                    </div>
                    <Progress
                      value={netHoursDecimal}
                      max={8}
                      variant={evalResult.status === 'Short hours' ? 'warn' : 'normal'}
                      height={5}
                    />
                  </div>
                </td>

                {/* Status Pill */}
                <td className="py-3 px-3">
                  <StatusPill
                    status={
                      evalResult.status === 'Present'
                        ? 'approved'
                        : evalResult.status === 'Late' || evalResult.status === 'Short hours'
                        ? 'warn'
                        : evalResult.status === 'Absent' || evalResult.status === 'Missed check-out'
                        ? 'rejected'
                        : 'pending'
                    }
                    text={evalResult.status}
                  />
                </td>

                {/* Flags */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
                    {evalResult.lateMin > 0 && <Tag tone="warn">Late {evalResult.lateMin}m</Tag>}
                    {evalResult.earlyMin > 0 && <Tag tone="warn">Early {evalResult.earlyMin}m</Tag>}
                    {evalResult.overtimeMin > 0 && <Tag tone="accent">OT {evalResult.overtimeMin}m</Tag>}
                    {rec.locationMismatch && <Tag tone="bad">Geo</Tag>}
                    {evalResult.status === 'Missed check-out' && <Tag tone="bad">Missed</Tag>}
                  </div>
                </td>

                {/* Action Column */}
                <td className="py-3 px-3 text-right">
                  {rec.isMissedCheckout ? (
                    <button
                      type="button"
                      onClick={() => onOpenRegularise?.(rec.date, rec.dateKey)}
                      className="px-2.5 py-1 rounded-lg bg-surface2 text-accent border border-line hover:border-accent text-[11.5px] font-semibold transition-colors"
                    >
                      Regularise
                    </button>
                  ) : (
                    <span className="text-muted text-[11px] font-mono">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

