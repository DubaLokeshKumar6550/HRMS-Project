import React from 'react';
import Avatar from './Avatar';
import { shiftTypes, dailyShiftRequirements } from '../data/shifts';

export default function RosterGrid({
  roster = [],
  days = [],
  onCellClick,
  className = '',
}) {
  // Compute coverage per day
  const dailyCoverage = days.map((day) => {
    let general = 0;
    let morning = 0;
    let evening = 0;
    let night = 0;
    let off = 0;
    let leave = 0;

    roster.forEach((person) => {
      const code = person.shifts[day.fullDate] || 'GEN';
      if (code === 'GEN') general++;
      else if (code === 'MOR') morning++;
      else if (code === 'EVE') evening++;
      else if (code === 'NIG') night++;
      else if (code === 'OFF') off++;
      else if (code === 'LV') leave++;
    });

    const isBelowMin =
      !day.isWeekend &&
      (general < dailyShiftRequirements.minGeneral ||
        morning < dailyShiftRequirements.minMorning ||
        evening < dailyShiftRequirements.minEvening ||
        night < dailyShiftRequirements.minNight);

    return {
      day,
      general,
      morning,
      evening,
      night,
      off,
      leave,
      totalWorking: general + morning + evening + night,
      isBelowMin,
    };
  });

  const getShiftMeta = (code) => {
    return shiftTypes.find((s) => s.code === code) || shiftTypes[0];
  };

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {/* Scrollable table container */}
      <div className="overflow-x-auto w-full rounded-2xl border border-line bg-surface/40">
        <table className="w-full border-collapse text-left min-w-[760px]">
          <thead>
            <tr className="border-b border-line bg-surface2/40">
              <th className="py-3 px-4 text-[12px] font-bold text-muted uppercase tracking-wider w-[220px]">
                Team Member (24)
              </th>
              {days.map((day) => (
                <th
                  key={day.fullDate}
                  className={`py-3 px-2 text-center text-[12px] font-bold uppercase tracking-wider ${
                    day.isWeekend ? 'opacity-55' : ''
                  } ${day.isToday ? 'text-accent' : 'text-muted'}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="leading-tight">{day.day}</span>
                    <span
                      className={`text-[11px] font-mono mt-0.5 px-1.5 py-0.2 rounded-md ${
                        day.isToday ? 'bg-accent/20 text-accent font-bold ring-1 ring-accent/40' : 'text-muted'
                      }`}
                    >
                      {day.date}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-line/40">
            {roster.map((person) => (
              <tr
                key={person.employeeId}
                className="hover:bg-surface2/30 transition-colors"
              >
                {/* Person cell */}
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={person.name} size={28} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-semibold text-ink truncate leading-tight">
                        {person.name}
                      </span>
                      <span className="text-[10.5px] text-muted truncate">
                        {person.role?.split(' ')[0] || 'Engineer'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Day cells with Shift chips */}
                {days.map((day) => {
                  const shiftCode = person.shifts[day.fullDate] || (day.isWeekend ? 'OFF' : 'GEN');
                  const meta = getShiftMeta(shiftCode);

                  return (
                    <td
                      key={day.fullDate}
                      className={`py-2 px-1 text-center align-middle ${
                        day.isWeekend ? 'opacity-55' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onCellClick &&
                          onCellClick({
                            person,
                            day,
                            shiftCode,
                          })
                        }
                        title={`${person.name} - ${day.day} ${day.date}: ${meta.name} (${meta.time})`}
                        aria-label={`Change shift for ${person.name} on ${day.day} ${day.date}`}
                        className="w-full max-w-[85px] mx-auto py-1.5 px-2 rounded-lg bg-surface2 border border-line hover:border-accent hover:bg-surface2/90 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-ink transition-all select-none"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: meta.dotColor }}
                        />
                        <span className="font-mono text-[10.5px]">{meta.code}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Daily Coverage Bar (Segmented / Headcount vs minimum) */}
      <div className="p-3.5 rounded-2xl bg-surface2/40 border border-line flex flex-col gap-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-ink uppercase tracking-wider">
              Shift Coverage & Capacity
            </span>
            <span className="text-[11px] text-muted">
              (Targets: Gen ≥10, Mor ≥3, Eve ≥3, Nig ≥2)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-medium text-muted">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              Gen
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--info)' }} />
              Mor
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--warn)' }} />
              Eve
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#a855f7' }} />
              Nig
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent2)' }} />
              Leave
            </span>
          </div>
        </div>

        {/* Coverage Columns Grid */}
        <div className="grid grid-cols-7 gap-2 pt-1 border-t border-line/40">
          {dailyCoverage.map(({ day, general, morning, evening, night, leave, isBelowMin }) => (
            <div
              key={day.fullDate}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border ${
                isBelowMin
                  ? 'border-warn/60 bg-warn/10'
                  : 'border-line/40 bg-surface/30'
              } ${day.isWeekend ? 'opacity-55' : ''}`}
            >
              <div className="flex items-center justify-between w-full text-[10.5px]">
                <span className="font-bold text-muted">{day.day}</span>
                {isBelowMin && (
                  <span
                    className="text-[10px] font-bold text-warn"
                    title="Headcount below minimum required"
                  >
                    At risk
                  </span>
                )}
              </div>

              {/* Segmented bar */}
              <div className="w-full h-2 bg-surface2 rounded-full overflow-hidden flex">
                <div style={{ width: `${(general / 24) * 100}%`, backgroundColor: 'var(--accent)' }} title={`General: ${general}`} />
                <div style={{ width: `${(morning / 24) * 100}%`, backgroundColor: 'var(--info)' }} title={`Morning: ${morning}`} />
                <div style={{ width: `${(evening / 24) * 100}%`, backgroundColor: 'var(--warn)' }} title={`Evening: ${evening}`} />
                <div style={{ width: `${(night / 24) * 100}%`, backgroundColor: '#a855f7' }} title={`Night: ${night}`} />
                <div style={{ width: `${(leave / 24) * 100}%`, backgroundColor: 'var(--accent2)' }} title={`Leave: ${leave}`} />
              </div>

              <div className="text-[10px] text-muted font-mono tabular-nums">
                {general + morning + evening + night}/24 on duty
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

