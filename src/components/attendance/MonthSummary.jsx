import React, { useMemo } from 'react';
import Card from '../Card.jsx';
import Kpi from '../Kpi.jsx';
import { useAttendance } from '../../context/AttendanceContext';
import { evaluateDay, formatMsToHoursMins } from '../../utils/attendanceEngine.js';

export default function MonthSummary() {
  const { history, attendanceRules } = useAttendance();

  // Compute month statistics from history
  const stats = useMemo(() => {
    let presentCount = 0;
    let lateCount = 0;
    let earlyCount = 0;
    let shortHoursCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let totalNetMs = 0;
    let daysWithWork = 0;
    let overtimeMs = 0;

    history.forEach((day) => {
      const evalDay = evaluateDay(day, attendanceRules, { isPastDay: true });
      if (evalDay.status === 'Present' || evalDay.status === 'Late' || evalDay.status === 'Work from home') {
        presentCount++;
      }
      if (evalDay.lateMin > 0) {
        lateCount++;
      }
      if (evalDay.earlyMin > 0) {
        earlyCount++;
      }
      if (evalDay.status === 'Short hours') {
        shortHoursCount++;
      }
      if (evalDay.status === 'Absent') {
        absentCount++;
      }
      if (evalDay.status === 'On leave' || day.leaveApplied) {
        leaveCount++;
      }
      if (evalDay.netMs > 0) {
        totalNetMs += evalDay.netMs;
        daysWithWork++;
      }
      if (evalDay.overtimeMin > 0) {
        overtimeMs += evalDay.overtimeMin * 60 * 1000;
      }
    });

    const avgNetMs = daysWithWork > 0 ? Math.round(totalNetMs / daysWithWork) : 0;

    return {
      presentDays: presentCount,
      lateArrivals: lateCount,
      earlyDepartures: earlyCount,
      shortHoursDays: shortHoursCount,
      absentDays: absentCount,
      leaveDays: leaveCount,
      avgHours: formatMsToHoursMins(avgNetMs),
      overtime: formatMsToHoursMins(overtimeMs),
    };
  }, [history, attendanceRules]);

  return (
    <Card
      id="mysummary"
      title="This Month Summary"
      subtitle="November 2026 manager metrics"
      className="col-span-1"
    >
      <div
        className="grid gap-3 w-full"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}
      >
        <Kpi
          label="Present days"
          value={stats.presentDays}
          delta="+1 vs last mo"
          deltaType="good"
        />

        <Kpi
          label="Late arrivals"
          value={stats.lateArrivals}
          delta="2 of 3 free"
          deltaType={stats.lateArrivals > 3 ? 'bad' : 'warn'}
        />

        <Kpi
          label="Early departures"
          value={stats.earlyDepartures}
          delta="1 within grace"
          deltaType={stats.earlyDepartures > 0 ? 'warn' : 'good'}
        />

        <Kpi
          label="Short-hours days"
          value={stats.shortHoursDays}
          delta={stats.shortHoursDays > 0 ? 'Needs reg' : '0 this mo'}
          deltaType={stats.shortHoursDays > 0 ? 'warn' : 'good'}
        />

        <Kpi
          label="Absent days"
          value={stats.absentDays}
          delta="0 unexcused"
          deltaType="good"
        />

        <Kpi
          label="Leave days"
          value={stats.leaveDays}
          delta="Planned leaves"
          deltaType="neutral"
        />

        <Kpi
          label="Avg net hours"
          value={stats.avgHours}
          delta="+14m vs target"
          deltaType="good"
        />

        <Kpi
          label="Overtime hours"
          value={stats.overtime}
          delta="Comp-off eligible"
          deltaType="good"
        />
      </div>
    </Card>
  );
}
