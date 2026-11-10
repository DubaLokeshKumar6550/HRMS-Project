import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import Kpi from '../components/Kpi';
import Tabs from '../components/Tabs';
import Tag from '../components/Tag';
import Avatar from '../components/Avatar';
import SegBar from '../components/SegBar';
import LineChart from '../components/LineChart';
import StatusPill from '../components/StatusPill';
import { Check, X, ArrowUpRight, AlertCircle, Clock, ChevronRight, Layers, Users, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { getAllTeamsWithStats } from '../data/teams';

export default function Overview({
  kpis,
  pendingRequests,
  onApprove,
  onReject,
  onNavigate,
  onSelectEmployee,
  employees,
  attendanceTrend,
  onPingEmployee,
}) {
  const [inboxTab, setInboxTab] = useState('all');
  const [trendRange, setTrendRange] = useState('30D');

  const { user, settings } = useAuth();
  const { today, isCheckedIn, isCheckedOut, evaluatedToday, checkIn, undoCheckIn } = useAttendance();
  const managerDisplayName = user?.preferredName || user?.name?.split(' ')?.[0] || 'Lokesh';

  let managerPunchSentence = 'You have not checked in yet today.';
  if (isCheckedOut) {
    managerPunchSentence = `You completed your day (checked out at ${today?.checkOut || '6:30 PM'}).`;
  } else if (isCheckedIn) {
    if (evaluatedToday?.lateMin > 0) {
      managerPunchSentence = `You checked in at ${today.checkIn}, late by ${evaluatedToday.lateMin} min.`;
    } else {
      managerPunchSentence = `You checked in at ${today.checkIn} on time.`;
    }
  }

  // Live ticking clock
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const trendDataMap = {
    '7D': [
      { day: '31 Oct', rate: 93.2 },
      { day: '2 Nov', rate: 95.0 },
      { day: '3 Nov', rate: 94.8 },
      { day: '4 Nov', rate: 92.5 },
      { day: '5 Nov', rate: 94.2 },
      { day: '6 Nov', rate: 94.6 },
    ],
    '30D': attendanceTrend,
    '90D': [
      { day: 'Aug', rate: 92.0 },
      { day: 'Sep W1', rate: 91.5 },
      { day: 'Sep W3', rate: 93.8 },
      { day: 'Oct W1', rate: 93.5 },
      { day: 'Oct W3', rate: 95.5 },
      { day: 'Nov W1', rate: 94.6 },
    ],
  };

  const activeTrendData = trendDataMap[trendRange] || attendanceTrend;

  // Filter pending requests by tab
  const filteredRequests = pendingRequests.filter((req) => {
    if (inboxTab === 'all') return true;
    return req.badgeType.toLowerCase() === inboxTab.toLowerCase();
  });

  // Calculate live counts
  const leaveCount = pendingRequests.filter((r) => r.badgeType === 'leave').length;
  const regCount = pendingRequests.filter((r) => r.badgeType === 'regular').length;
  const otCount = pendingRequests.filter((r) => r.badgeType === 'overtime').length;
  const expCount = pendingRequests.filter((r) => r.badgeType === 'expense').length;

  const inboxTabs = [
    { id: 'all', label: 'All', count: pendingRequests.length },
    { id: 'leave', label: 'Leave', count: leaveCount },
    { id: 'regular', label: 'Regularisation', count: regCount },
    { id: 'overtime', label: 'Overtime', count: otCount },
    { id: 'expense', label: 'Expense', count: expCount },
  ];

  // Team composition counts
  const inOfficeCount = employees.filter((e) => e.status === 'in-office').length;
  const remoteCount = employees.filter((e) => e.status === 'remote').length;
  const lateCount = employees.filter((e) => e.flags?.some(f => f.includes('Late'))).length;
  const onLeaveCount = employees.filter((e) => e.status === 'on-leave').length;
  const notPunchedCount = employees.filter((e) => e.status === 'not-punched').length;

  const compSegments = [
    { label: 'In office', value: inOfficeCount, color: 'var(--good)' },
    { label: 'Remote', value: remoteCount, color: 'var(--info)' },
    { label: 'On leave', value: onLeaveCount, color: 'var(--accent2)' },
    { label: 'Not punched', value: notPunchedCount, color: 'var(--bad)' },
  ];

  // Needs attention list
  const notPunchedEmployees = employees.filter((e) => e.status === 'not-punched');
  const probationAlerts = employees.filter((e) => e.isProbation);

  // Teams & Pods breakdown
  const allTeams = useMemo(() => {
    return getAllTeamsWithStats(employees);
  }, [employees]);

  const [teamViewTab, setTeamViewTab] = useState('pods');

  return (
    <div className="overview-grid w-full">
      {/* Out of Office Active Banner */}
      {settings?.delegation?.outOfOfficeEnabled && (
        <div
          className="p-3.5 mb-1 rounded-2xl bg-surface2/80 border border-line flex items-center justify-between gap-3 text-[13px] text-muted animate-in fade-in"
          style={{ gridColumn: '1 / -1' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-warn shrink-0" />
            <span className="truncate">
              <strong className="text-ink">Out of office active:</strong> {settings.delegation.outOfOfficeMessage || 'Approvals delegated'} ({settings.delegation.outOfOfficeFrom} – {settings.delegation.outOfOfficeTo})
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="text-accent hover:underline text-[12px] font-semibold shrink-0"
          >
            Manage
          </button>
        </div>
      )}

      {/* 1. Hero Widget (data-w="hello") */}
      <div data-w="hello" className="glass-card">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5 items-center">
          {/* Left Hero info */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Friday, 6 Nov 2026 · {currentTime} IST
            </span>

            <h2
              className="font-display font-extrabold text-ink tracking-tight leading-tight"
              style={{ fontSize: 'clamp(26px, 3.2vw, 38px)' }}
            >
              Good morning, {managerDisplayName}
            </h2>

            <p className="text-[14px] text-muted max-w-[65ch] leading-relaxed font-body">
              <strong className="text-ink font-semibold">{pendingRequests.length} requests</strong> need your approval, and{' '}
              <strong className="text-warn font-semibold">{notPunchedCount} team members</strong> have not punched in today.{' '}
              <span className="text-ink/90 font-medium">{managerPunchSentence}</span>
            </p>

            {/* Manager Attendance Punch Action */}
            <div className="flex items-center gap-2.5 pt-1">
              {!isCheckedIn ? (
                <button
                  type="button"
                  onClick={async () => {
                    const now = new Date();
                    const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    await checkIn({ time: nowStr, workMode: 'Office' });
                  }}
                  className="py-1.5 px-4 rounded-xl font-display font-bold text-[13px] shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--on-accent)',
                  }}
                >
                  <LogIn size={14} strokeWidth={2.4} />
                  <span>Check in now</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="px-2.5 py-1 rounded-full bg-surface2 border border-line text-ink font-mono font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-good shrink-0 animate-pulse" />
                    <span>Checked in ({today?.checkIn})</span>
                    {today?.punchInGps && (
                      <span className="text-good text-[11px] font-medium border-l border-line/60 pl-1.5">
                        📍 GPS Verified
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('attendance?view=mine')}
                    className="text-accent hover:underline font-semibold"
                  >
                    View my attendance →
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await undoCheckIn();
                    }}
                    className="text-muted hover:text-bad underline text-[11px] ml-1 cursor-pointer"
                    title="Undo check-in to punch again"
                  >
                    Undo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Hero actions & mini segmented preview */}
          <div className="flex flex-col gap-3.5 bg-surface2/40 p-4 rounded-xl border border-line/60">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted font-medium">Today's Team Distribution</span>
              <span className="font-mono text-ink font-semibold">
                {inOfficeCount + remoteCount} / {employees.length} Active
              </span>
            </div>

            <SegBar segments={compSegments} height={12} showLegend={false} />

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  const inboxEl = document.querySelector('[data-w="inbox"]');
                  if (inboxEl) inboxEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 py-2 px-3 rounded-tpl font-display font-bold text-[12.5px] shadow-sm hover:brightness-110 active:scale-95 transition-all text-center"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--on-accent)',
                  borderRadius: 'var(--radius)',
                }}
              >
                Review approvals ({pendingRequests.length})
              </button>

              <button
                type="button"
                onClick={() => onNavigate('attendance')}
                className="py-2 px-3 rounded-tpl bg-surface2 border border-line hover:border-accent text-ink text-[12.5px] font-semibold transition-all flex items-center gap-1.5 active:scale-95"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <span>Team attendance</span>
                <ArrowUpRight size={14} className="text-muted" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI Tiles Widget (data-w="kpis") */}
      <div data-w="kpis" className="w-full">
        <div
          className="grid gap-[var(--gap)]"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
        >
          <Kpi
            label="Total employees"
            value={kpis.totalEmployees.value}
            delta={kpis.totalEmployees.delta}
            onClick={() => onNavigate('team')}
          />
          <Kpi
            label="Present today"
            value={kpis.presentToday.value}
            delta={kpis.presentToday.delta}
            deltaType="good"
            onClick={() => onNavigate('attendance')}
          />
          <Kpi
            label="Not punched"
            value={kpis.notPunched.value}
            delta={kpis.notPunched.delta}
            deltaType="bad"
            onClick={() => onNavigate('attendance')}
          />
          <Kpi
            label="On leave"
            value={kpis.onLeave.value}
            delta={kpis.onLeave.delta}
            deltaType="warn"
            onClick={() => onNavigate('leave')}
          />
          <Kpi
            label="Tasks overdue"
            value={4}
            delta="4 delayed tickets"
            deltaType="bad"
            onClick={() => onNavigate('tasks')}
          />
          <Kpi
            label="Pending approvals"
            value={pendingRequests.length}
            delta={`${pendingRequests.length} items remaining`}
            deltaType="warn"
          />
          <Kpi
            label="Avg hours"
            value={kpis.avgHours.value}
            delta={kpis.avgHours.delta}
            deltaType="good"
          />
        </div>
      </div>

      {/* 3. Approvals Inbox Widget (data-w="inbox") */}
      <Card
        dataW="inbox"
        title="Pending approvals"
        subtitle="Review, approve, or reject team requests with one-click undo"
        headerAction={
          <Tabs
            tabs={inboxTabs}
            activeId={inboxTab}
            onChange={setInboxTab}
            size="sm"
          />
        }
      >
        <div className="flex flex-col divide-y divide-dashed divide-line">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors hover:bg-surface2/30 px-2 rounded-lg"
            >
              <div className="flex items-start gap-3 min-w-0">
                <Avatar name={req.name} size={36} customBg={req.avatarBg} />
                <div className="flex flex-col min-w-0 gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const emp = employees.find((e) => e.name === req.name);
                        if (emp) onSelectEmployee(emp);
                      }}
                      className="text-[14px] font-bold text-ink hover:text-accent transition-colors text-left"
                    >
                      {req.name}
                    </button>
                    <Tag>{req.type}</Tag>
                    {req.overlapWarning && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warn/20 text-warn border border-warn/40">
                        Team Overlap Warning
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] text-muted font-body">
                    {req.dates} · <strong className="text-ink font-semibold">{req.days}</strong>
                  </span>
                  <p className="text-[12px] text-muted/90 italic truncate max-w-[480px]">
                    "{req.reason}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onApprove(req)}
                  aria-label={`Approve request for ${req.name}`}
                  className="py-1.5 px-3 rounded-tpl text-[12px] font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--on-accent)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <Check size={14} strokeWidth={2.5} />
                  <span>Approve</span>
                </button>

                <button
                  type="button"
                  onClick={() => onReject(req)}
                  aria-label={`Reject request for ${req.name}`}
                  className="py-1.5 px-3 rounded-tpl text-[12px] font-semibold bg-surface2 border border-line hover:border-bad/60 hover:text-bad text-muted flex items-center gap-1.5 transition-all active:scale-95"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <X size={14} strokeWidth={2} />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="py-12 text-center text-muted flex flex-col items-center gap-2">
              <Check size={28} className="text-accent opacity-80" />
              <span className="text-[14px] font-medium text-ink">All caught up!</span>
              <span className="text-[12px] text-muted">No pending approvals under "{inboxTab}".</span>
            </div>
          )}
        </div>
      </Card>

      {/* 4. 30-Day Attendance Trend (data-w="trend") */}
      <Card
        dataW="trend"
        title="Attendance trend"
        subtitle="30-day team attendance consistency rate"
        headerAction={
          <Tabs
            tabs={[
              { id: '7D', label: '7D' },
              { id: '30D', label: '30D' },
              { id: '90D', label: '90D' },
            ]}
            activeId={trendRange}
            onChange={setTrendRange}
            size="sm"
          />
        }
      >
        <LineChart data={activeTrendData} height={150} yMin={88} yMax={100} unit="%" />
        <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-line/40">
          <span>Weekly Target: 92.0%</span>
          <span className="text-good font-semibold font-mono">Current: 94.6% (+2.6% above goal)</span>
        </div>
      </Card>

      {/* 5. Team Composition & Pods Breakdown (data-w="comp") */}
      <Card
        dataW="comp"
        title="Teams, Pods & Status"
        subtitle="Live capacity across 6 functional teams · Click team to view details"
        headerAction={
          <div className="flex items-center gap-2">
            <Tabs
              tabs={[
                { id: 'pods', label: 'Teams (6)' },
                {
                  id: 'attention',
                  label: 'Alerts',
                  count: notPunchedEmployees.length + probationAlerts.length,
                },
              ]}
              activeId={teamViewTab}
              onChange={setTeamViewTab}
              size="sm"
            />
            <button
              type="button"
              onClick={() => onNavigate('team')}
              className="text-[11.5px] font-semibold text-accent hover:underline flex items-center gap-0.5 ml-1 cursor-pointer"
            >
              <span>All teams</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        }
      >
        {/* Stacked Composition Bar */}
        <div className="flex flex-col gap-2">
          <SegBar segments={compSegments} height={14} showLegend={true} />
        </div>

        {/* TAB 1: Teams & Functional Pods List */}
        {teamViewTab === 'pods' ? (
          <div className="flex flex-col divide-y divide-dashed divide-line pt-2 text-[12.5px]">
            {allTeams.map((t) => (
              <div
                key={t.id}
                onClick={() => onNavigate(`team?team=${t.id}`)}
                className="py-2.5 px-2 flex items-center justify-between hover:bg-surface2/50 rounded-lg cursor-pointer transition-colors group"
                title={`Click to view ${t.name} details`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-surface2 border border-line flex items-center justify-center text-accent shrink-0 group-hover:border-accent">
                    <Users size={14} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-ink group-hover:text-accent transition-colors truncate">
                      {t.name}
                    </span>
                    <span className="text-[11px] text-muted truncate">
                      Lead: {t.leadName} · {t.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-good" />
                    <span className="text-ink font-semibold">{t.stats.activeCount}</span>
                    <span className="text-muted">/ {t.stats.total}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-accent flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Details</span>
                    <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* TAB 2: Needs Attention Strip */
          <div className="flex flex-col gap-2 pt-2 border-t border-line/40">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              Needs immediate attention
            </span>

            <div className="flex flex-col gap-2">
              {/* Not Punched alert */}
              {notPunchedEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface2/60 border border-bad/30 hover:border-bad/60 transition-colors"
                >
                  <div
                    onClick={() => onSelectEmployee(emp)}
                    className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                  >
                    <Avatar name={emp.name} size={28} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12.5px] font-bold text-ink truncate hover:text-accent">
                        {emp.name}
                      </span>
                      <span className="text-[11px] text-bad">Not punched in today</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onPingEmployee) onPingEmployee(emp);
                      }}
                      className="px-2 py-1 rounded bg-bad/20 hover:bg-bad/30 border border-bad/40 text-[10.5px] font-bold text-bad transition-colors active:scale-95"
                    >
                      Ping Punch
                    </button>
                    <Tag>Follow-up</Tag>
                  </div>
                </div>
              ))}

              {/* Probation alert */}
              {probationAlerts.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface2/60 border border-warn/30 hover:border-warn/60 transition-colors"
                >
                  <div
                    onClick={() => onSelectEmployee(emp)}
                    className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                  >
                    <Avatar name={emp.name} size={28} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12.5px] font-bold text-ink truncate hover:text-accent">
                        {emp.name} ({emp.role})
                      </span>
                      <span className="text-[11px] text-warn">
                        Probation ending in 9 days ({emp.probationEnd})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEmployee(emp);
                      }}
                      className="px-2 py-1 rounded bg-warn/20 hover:bg-warn/30 border border-warn/40 text-[10.5px] font-bold text-warn transition-colors active:scale-95"
                    >
                      Review Profile
                    </button>
                    <Tag>Review Due</Tag>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

