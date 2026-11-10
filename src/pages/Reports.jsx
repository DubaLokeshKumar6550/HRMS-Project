import React, { useState } from 'react';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import SegBar from '../components/SegBar';
import Progress from '../components/Progress';
import Tag from '../components/Tag';
import Avatar from '../components/Avatar';
import { Download, FileText, Check, Calendar, TrendingUp, BarChart2 } from 'lucide-react';

export default function Reports({
  reportData,
  employees,
  onExportCsv,
  onExportPdf,
  onTriggerToast,
}) {
  const [dateRange, setDateRange] = useState('this-month');
  const [scheduledReports, setScheduledReports] = useState(reportData.scheduledReports);

  const rangeTabs = [
    { id: 'this-month', label: 'This Month' },
    { id: 'last-month', label: 'Last Month' },
    { id: 'q3', label: 'Q3 FY26–27' },
  ];

  const handleToggleReport = (id) => {
    setScheduledReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newState = !r.enabled;
          if (onTriggerToast) {
            onTriggerToast(`${newState ? 'Enabled' : 'Disabled'} automated report: "${r.title}"`);
          }
          return { ...r, enabled: newState };
        }
        return r;
      })
    );
  };

  // Segments for leave type split
  const leaveSplitSegments = reportData.leaveTypeSplit.map((s) => ({
    label: s.type,
    value: s.pct,
    color: s.color,
  }));

  // Segments for rating distribution
  const ratingSegments = reportData.ratingDistribution.map((r) => ({
    label: r.label,
    value: r.pct,
    color: r.pct > 50 ? 'var(--good)' : r.pct > 15 ? 'var(--accent)' : 'var(--warn)',
  }));

  return (
    <div className="standard-grid-2col w-full">
      {/* 1. Attendance Analytics Widget (grid-col-span-1) */}
      <div className="grid-col-span-1">
        <Card
          dataW="rep-att"
          title="Attendance & leave analytics"
          subtitle="Monthly consistency, weekday delay distribution, and leave utilization"
          headerAction={
            <div className="flex items-center gap-2">
              <Tabs
                tabs={rangeTabs}
                activeId={dateRange}
                onChange={setDateRange}
                size="sm"
              />
            </div>
          }
        >
          {/* Trend line */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Monthly Attendance % Trend
            </span>
            <LineChart
              data={reportData.attendanceTrend.map((d) => ({ day: d.month, rate: d.rate }))}
              height={140}
              yMin={90}
              yMax={100}
              unit="%"
              ariaLabel="Monthly attendance percentage trend"
            />
          </div>

          {/* Late arrivals weekday breakdown */}
          <div className="flex flex-col gap-1.5 pt-3 border-t border-line/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Late Arrivals by Weekday (Nov 2026)
              </span>
              <span className="text-[11px] text-muted">Peak: Mondays (8 instances)</span>
            </div>
            <BarChart
              data={reportData.lateArrivalsByDay}
              height={120}
              maxVal={10}
              barColor="var(--warn)"
              ariaLabel="Late arrivals by weekday bar chart"
            />
          </div>

          {/* Leave type split */}
          <div className="flex flex-col gap-2 pt-3 border-t border-line/40">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Leave Type Utilization Split
            </span>
            <SegBar segments={leaveSplitSegments} height={14} showLegend={true} />
          </div>

          {/* Shift Coverage Chart */}
          <div className="flex flex-col gap-2 pt-3 border-t border-line/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Weekly Shift Coverage & Headcount Fulfillment
              </span>
              <span className="text-[11px] font-mono text-good font-bold">98.4% target met</span>
            </div>
            <BarChart
              data={[
                { label: 'Mon', value: 24 },
                { label: 'Tue', value: 24 },
                { label: 'Wed', value: 23 },
                { label: 'Thu', value: 24 },
                { label: 'Fri', value: 24 },
                { label: 'Sat', value: 6 },
                { label: 'Sun', value: 5 },
              ]}
              height={100}
              maxVal={25}
              barColor="var(--accent)"
              ariaLabel="Weekly shift coverage headcount fulfillment"
            />
          </div>

          {/* Export Action Strip */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line/40">
            <button
              type="button"
              onClick={onExportCsv}
              className="py-1.5 px-3 rounded-tpl text-[12px] font-semibold bg-surface2 border border-line hover:border-accent text-ink flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onExportPdf}
              className="py-1.5 px-3 rounded-tpl text-[12px] font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-sm"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--on-accent)',
                borderRadius: 'var(--radius)',
              }}
            >
              <FileText size={13} />
              <span>Export PDF Report</span>
            </button>
          </div>
        </Card>
      </div>

      {/* 2. Performance & Scheduled Reports Widget (grid-col-span-1) */}
      <div className="grid-col-span-1">
        <Card
          dataW="rep-perf"
          title="Performance analytics & schedules"
          subtitle="Sprint velocity throughput, rating distributions, and automated reports"
        >
          {/* Goal completion by team member */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Goal Completion by Engineer (Top Directs)
            </span>

            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
              {employees.slice(0, 5).map((emp) => (
                <div key={emp.id} className="flex items-center justify-between text-[12px] gap-3">
                  <div className="flex items-center gap-2 w-36 truncate">
                    <Avatar name={emp.name} size={22} />
                    <span className="font-semibold text-ink truncate">{emp.name}</span>
                  </div>
                  <div className="flex-1">
                    <Progress value={emp.goalsProgress} max={100} height={6} />
                  </div>
                  <span className="font-mono font-bold text-ink w-10 text-right tabular-nums">
                    {emp.goalsProgress}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating distribution segmented bar */}
          <div className="flex flex-col gap-2 pt-3 border-t border-line/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Q3 Appraisal Rating Distribution
              </span>
              <span className="text-[11px] font-mono text-muted">24 Total Appraisals</span>
            </div>
            <SegBar segments={ratingSegments} height={14} showLegend={true} />
          </div>

          {/* Task Throughput & Task Completion Chart */}
          <div className="flex flex-col gap-1.5 pt-3 border-t border-line/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Task Completion Rate & Throughput
              </span>
              <span className="text-[11px] text-good font-mono font-semibold">+18% sprint velocity · 94% completed</span>
            </div>
            <LineChart
              data={[
                { day: 'Sprint 40', rate: 88 },
                { day: 'Sprint 41', rate: 91 },
                { day: 'Sprint 42', rate: 89 },
                { day: 'Sprint 43', rate: 95 },
                { day: 'Sprint 44', rate: 94 },
              ]}
              height={110}
              yMin={80}
              yMax={100}
              unit="%"
              ariaLabel="Sprint task completion rate trend"
            />
          </div>

          {/* Scheduled Automated Reports */}
          <div className="flex flex-col gap-2 pt-3 border-t border-line/40">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Scheduled Automated Reports
            </span>

            <div className="flex flex-col divide-y divide-dashed divide-line text-[12.5px]">
              {scheduledReports.map((rep) => (
                <div key={rep.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-ink">{rep.title}</span>
                    <span className="text-[11px] text-muted">{rep.frequency}</span>
                  </div>

                  {/* Toggle switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleReport(rep.id)}
                    aria-label={`Toggle ${rep.title}`}
                    className={`w-10 h-5 rounded-full transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      rep.enabled ? 'bg-accent' : 'bg-surface2 border border-line'
                    }`}
                  >
                    <span
                      className={`block w-3.5 h-3.5 rounded-full transition-transform ${
                        rep.enabled
                          ? 'translate-x-5 bg-on-accent'
                          : 'translate-x-1 bg-muted'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

