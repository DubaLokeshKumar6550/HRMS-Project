import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import Table from '../components/Table';
import StatusPill from '../components/StatusPill';
import Tag from '../components/Tag';
import Avatar from '../components/Avatar';
import Progress from '../components/Progress';
import MyAttendanceView from '../components/attendance/MyAttendanceView.jsx';
import GpsLocationModal from '../components/attendance/GpsLocationModal.jsx';
import { useAttendance } from '../context/AttendanceContext';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Check,
  X,
  Clock,
  AlertTriangle,
  UserCheck,
  Users,
  LogIn,
  Coffee,
  LogOut,
  CheckCircle2,
  MapPin,
  Crosshair,
  Navigation,
} from 'lucide-react';

export default function Attendance({
  employees,
  onSelectEmployee,
  regularisationRequests,
  onApproveRegularisation,
  onRejectRegularisation,
  onExportCsv,
  onTriggerToast,
  searchQuery = '',
}) {
  const {
    today,
    isCheckedIn,
    isCheckedOut,
    onBreak,
    checkIn,
    undoCheckIn,
    startBreak,
    endBreak,
  } = useAttendance();
  const [managerMode, setManagerMode] = useState('Office');
  const [selectedGpsEmployee, setSelectedGpsEmployee] = useState(null);
  const [activeView, setActiveView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    return v === 'mine' ? 'mine' : 'team';
  });

  const handleSelectView = (v) => {
    setActiveView(v);
    const url = new URL(window.location);
    url.searchParams.set('view', v);
    window.history.pushState(null, '', url.toString());
  };

  const [filterStatus, setFilterStatus] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const DATES = ['3 Nov 2026', '4 Nov 2026', '5 Nov 2026', '6 Nov 2026 (Today)', '7 Nov 2026'];
  const [dateIdx, setDateIdx] = useState(3);
  const selectedDate = DATES[dateIdx];

  const handlePrevDay = () => {
    setDateIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNextDay = () => {
    setDateIdx((prev) => Math.min(DATES.length - 1, prev + 1));
  };

  // Counts for tabs
  const presentCount = employees.filter((e) => e.status === 'in-office' || e.status === 'remote').length;
  const lateCount = employees.filter((e) => e.flags?.some(f => f.includes('Late'))).length;
  const absentCount = employees.filter((e) => e.status === 'not-punched').length;
  const leaveCount = employees.filter((e) => e.status === 'on-leave').length;

  const attendanceTabs = [
    { id: 'all', label: 'All', count: employees.length },
    { id: 'present', label: 'Present', count: presentCount },
    { id: 'late', label: 'Late', count: lateCount },
    { id: 'absent', label: 'Not Punched', count: absentCount },
    { id: 'leave', label: 'On Leave', count: leaveCount },
  ];

  // Filtered employees list
  const filteredEmployees = employees.filter((emp) => {
    if (teamFilter !== 'all' && emp.department !== teamFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchRole = emp.role.toLowerCase().includes(q);
      const matchLoc = emp.location.toLowerCase().includes(q);
      const matchDept = emp.department.toLowerCase().includes(q);
      const matchId = emp.id.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchLoc && !matchDept && !matchId) return false;
    }
    if (filterStatus === 'present') return emp.status === 'in-office' || emp.status === 'remote';
    if (filterStatus === 'late') return emp.flags?.some(f => f.includes('Late'));
    if (filterStatus === 'absent') return emp.status === 'not-punched';
    if (filterStatus === 'leave') return emp.status === 'on-leave';
    return true;
  });

  // Table columns definition
  const columns = [
    {
      header: 'Employee',
      key: 'name',
      sticky: true,
      render: (row) => (
        <div className="flex items-center gap-2.5 min-w-[200px]">
          <Avatar name={row.name} size={32} />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-ink hover:text-accent transition-colors truncate">
              {row.name}
            </span>
            <span className="text-[11px] text-muted truncate">
              {row.role} · {row.location}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      header: 'Punch In',
      key: 'punchIn',
      render: (row) => (
        <span className="font-mono text-[12.5px] tabular-nums text-ink">
          {row.punchIn}
        </span>
      ),
    },
    {
      header: 'Punch Out',
      key: 'punchOut',
      render: (row) => (
        <span className="font-mono text-[12.5px] tabular-nums text-muted">
          {row.punchOut}
        </span>
      ),
    },
    {
      header: 'Working Hours (vs 9h)',
      key: 'hours',
      width: '200px',
      render: (row) => {
        const isLate = row.flags?.some(f => f.includes('Late'));
        return (
          <div className="flex flex-col gap-1 w-full max-w-[180px]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono font-semibold text-ink">{row.hoursWorked}</span>
              <span className="text-muted">9h goal</span>
            </div>
            <Progress
              value={row.hoursDecimal}
              max={9}
              variant={isLate ? 'warn' : 'normal'}
              height={6}
            />
          </div>
        );
      },
    },
    {
      header: 'Mode',
      key: 'mode',
      render: (row) => (
        <Tag>{row.status === 'remote' ? 'Remote' : 'Office'}</Tag>
      ),
    },
    {
      header: 'GPS & Geofence',
      key: 'gps',
      render: (row) => {
        if (!row.punchInGps) {
          return <span className="font-mono text-[11px] text-muted/60">—</span>;
        }

        const isInside = row.punchInGps.geofence?.isInside;
        const isRemote = row.status === 'remote';
        const dist = row.punchInGps.geofence?.distanceMeters ?? 0;

        return (
          <button
            type="button"
            onClick={() => setSelectedGpsEmployee(row)}
            title="Click to view GPS coordinates, geofence radius & radar analysis"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${
              isInside
                ? 'bg-good/10 text-good border-good/30 hover:bg-good/20'
                : isRemote
                ? 'bg-accent/10 text-accent border-accent/30 hover:bg-accent/20'
                : 'bg-warn/15 text-warn border-warn/40 hover:bg-warn/25'
            }`}
          >
            {isInside ? (
              <MapPin size={12} className="text-good" />
            ) : isRemote ? (
              <Navigation size={12} className="text-accent" />
            ) : (
              <AlertTriangle size={12} className="text-warn animate-pulse" />
            )}
            <span>
              {isInside
                ? `HQ (${dist}m)`
                : isRemote
                ? 'Remote GPS'
                : `Mismatch (${(dist / 1000).toFixed(1)}km)`}
            </span>
          </button>
        );
      },
    },
  ];

  // Overtime rankings (cap 20h, warn > 15h)
  const overtimeEmployees = employees
    .filter((e) => e.overtimeHours > 0)
    .sort((a, b) => b.overtimeHours - a.overtimeHours);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top-Level Attendance View Tabs (?view=team|mine) */}
      <div
        role="tablist"
        aria-label="Attendance view mode"
        className="flex items-center gap-2 border-b border-line/40 pb-2 select-none"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'team'}
          aria-pressed={activeView === 'team'}
          onClick={() => handleSelectView('team')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all border ${
            activeView === 'team'
              ? 'bg-surface2 text-ink border-line shadow-sm'
              : 'text-muted border-transparent hover:text-ink hover:bg-surface2/60'
          }`}
        >
          <Users size={14} className={activeView === 'team' ? 'text-accent' : 'text-muted'} />
          <span>Team attendance</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'mine'}
          aria-pressed={activeView === 'mine'}
          onClick={() => handleSelectView('mine')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all border ${
            activeView === 'mine'
              ? 'bg-surface2 text-ink border-line shadow-sm'
              : 'text-muted border-transparent hover:text-ink hover:bg-surface2/60'
          }`}
        >
          <UserCheck size={14} className={activeView === 'mine' ? 'text-accent' : 'text-muted'} />
          <span>My attendance</span>
        </button>
      </div>

      {/* Manager Attendance Quick Punch Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface/50 border border-line">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
            isCheckedIn ? 'bg-good/15 border-good/30 text-good' : 'bg-warn/15 border-warn/30 text-warn'
          }`}>
            {isCheckedIn ? <CheckCircle2 size={18} /> : <LogIn size={18} />}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-ink">Manager Attendance (You)</span>
              {isCheckedIn ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-good/20 text-good border border-good/30">
                  {isCheckedOut ? 'Checked Out' : onBreak ? 'On Break' : 'Checked In'}
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warn/20 text-warn border border-warn/30">
                  Not Checked In
                </span>
              )}
            </div>
            <span className="text-[11.5px] text-muted">
              {isCheckedIn
                ? `Punched in at ${today?.checkIn || '09:30'} · Shift: 9:30 AM – 6:30 PM`
                : 'General Shift: 9:30 AM – 6:30 PM · Grace arrival till 9:45 AM'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          {!isCheckedIn ? (
            <>
              <select
                value={managerMode}
                onChange={(e) => setManagerMode(e.target.value)}
                className="bg-surface2 border border-line rounded-lg px-2.5 py-1.5 text-[12px] text-ink focus:outline-none focus:border-accent"
              >
                <option value="Office">Office</option>
                <option value="Work from home">WFH</option>
                <option value="Remote/Travel">Remote</option>
              </select>

              <button
                type="button"
                onClick={async () => {
                  await checkIn({ workMode: managerMode });
                  onTriggerToast?.(`Checked in successfully (${managerMode})`);
                }}
                className="px-3.5 py-1.5 rounded-lg text-[12px] font-bold text-on-accent bg-accent hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <LogIn size={14} />
                <span>Check in now</span>
              </button>
            </>
          ) : !isCheckedOut ? (
            <>
              <button
                type="button"
                onClick={async () => {
                  if (onBreak) {
                    await endBreak();
                    onTriggerToast?.('Break ended.');
                  } else {
                    await startBreak('Lunch');
                    onTriggerToast?.('Started Lunch break.');
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-surface2 border border-line hover:border-accent text-ink flex items-center gap-1 cursor-pointer"
              >
                <Coffee size={13} className={onBreak ? 'text-warn animate-pulse' : 'text-muted'} />
                <span>{onBreak ? 'End break' : 'Break'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectView('mine')}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-surface2 border border-line hover:border-accent text-ink flex items-center gap-1 cursor-pointer"
              >
                <span>My Attendance details →</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedGpsEmployee({
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
                  })
                }
                className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-surface2 border border-line hover:border-accent text-ink flex items-center gap-1.5 cursor-pointer"
                title="Inspect Manager GPS Geofence Radar"
              >
                <Crosshair size={13} className="text-accent" />
                <span>GPS Radar</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await undoCheckIn();
                  onTriggerToast?.('Punch reset. You can check in again.');
                }}
                className="text-[11px] text-muted hover:text-accent underline cursor-pointer ml-1"
                title="Reset punch to test check-in"
              >
                Undo punch
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleSelectView('mine')}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-surface2 border border-line hover:border-accent text-ink flex items-center gap-1 cursor-pointer"
              >
                <span>View summary →</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  await undoCheckIn();
                  onTriggerToast?.('Punch reset. You can check in again.');
                }}
                className="text-[11px] text-muted hover:text-accent underline cursor-pointer ml-1"
              >
                Reset punch
              </button>
            </>
          )}
        </div>
      </div>

      {activeView === 'mine' ? (
        <MyAttendanceView onTriggerToast={onTriggerToast} />
      ) : (
        <div className="standard-grid-2col w-full">
          {/* 1. Attend Widget (grid-col-span-2) */}
          <div className="grid-col-span-2">
            <Card
              dataW="attend"
              title="Team daily attendance"
          subtitle="Real-time punch records, shifts, and hours worked today"
          headerAction={
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => handleSelectView('mine')}
                className="text-[12px] font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer mr-1"
              >
                <span>View My attendance →</span>
              </button>

              {/* Date Nav */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface2 border border-line text-[12px] font-mono">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  disabled={dateIdx === 0}
                  className="hover:text-accent p-0.5 disabled:opacity-30 disabled:hover:text-muted cursor-pointer"
                  aria-label="Previous day"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-1 text-ink font-semibold">{selectedDate}</span>
                <button
                  type="button"
                  onClick={handleNextDay}
                  disabled={dateIdx === DATES.length - 1}
                  className="hover:text-accent p-0.5 disabled:opacity-30 disabled:hover:text-muted cursor-pointer"
                  aria-label="Next day"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Export CSV button */}
              <button
                type="button"
                onClick={onExportCsv}
                className="py-1.5 px-3 rounded-tpl text-[12px] font-semibold bg-surface2 border border-line hover:border-accent text-ink flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          }
        >
          {/* Summary Filter Tabs & Team Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2">
            <Tabs
              tabs={attendanceTabs}
              activeId={filterStatus}
              onChange={setFilterStatus}
            />

            {/* Team / Department filter pill */}
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className="text-muted font-mono text-[11px] uppercase tracking-wider">Team:</span>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                aria-label="Filter attendance by team"
                className="bg-surface2 border border-line rounded-lg px-2.5 py-1 text-ink text-[12px] focus:outline-none focus:border-accent transition-colors cursor-pointer"
              >
                <option value="all">All Teams ({employees.length})</option>
                <option value="Engineering">Engineering (11)</option>
                <option value="Platform">Platform & DevOps (3)</option>
                <option value="Quality Assurance">QA (3)</option>
                <option value="Product Design">Product Design (3)</option>
                <option value="Data & BI">Data & Analytics (3)</option>
                <option value="Product">Product Management (1)</option>
              </select>
            </div>
          </div>

          {/* Person-by-Person Attendance Table */}
          <Table
            columns={columns}
            data={filteredEmployees}
            onRowClick={onSelectEmployee}
          />
        </Card>
      </div>

      {/* 2. Regularisation Requests Widget (grid-col-span-1) */}
      <div className="grid-col-span-1">
        <Card
          dataW="regular"
          title="Attendance regularisation"
          subtitle="Missed punches, late arrivals, and WFH requests"
        >
          <div className="flex flex-col divide-y divide-dashed divide-line">
            {regularisationRequests.map((req) => (
              <div
                key={req.id}
                className="py-3 flex flex-col gap-2 group hover:bg-surface2/30 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={req.name} size={30} />
                    <span className="font-bold text-[13.5px] text-ink">{req.name}</span>
                    <Tag>{req.type}</Tag>
                  </div>
                  <span className="text-[11px] text-muted font-mono">{req.timestamp}</span>
                </div>

                <div className="text-[12px] text-muted flex flex-col gap-0.5">
                  <span className="text-ink font-semibold">{req.dates}</span>
                  <span className="italic">"{req.reason}"</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onApproveRegularisation(req)}
                    aria-label={`Approve regularisation for ${req.name}`}
                    className="py-1 px-3 rounded-tpl text-[11.5px] font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'var(--on-accent)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    <Check size={13} strokeWidth={2.5} />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRejectRegularisation(req)}
                    aria-label={`Reject regularisation for ${req.name}`}
                    className="py-1 px-3 rounded-tpl text-[11.5px] font-semibold bg-surface2 border border-line hover:border-bad/60 hover:text-bad text-muted flex items-center gap-1.5 transition-all"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <X size={13} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}

            {regularisationRequests.length === 0 && (
              <div className="py-8 text-center text-muted text-[13px] italic">
                All regularisation requests processed.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 3. Overtime Approvals Widget (grid-col-span-1) */}
      <div className="grid-col-span-1">
        <Card
          dataW="overtime"
          title="Overtime hours (Nov 2026)"
          subtitle="Monthly cap 20h · Warning flag triggered above 15h"
        >
          <div className="flex flex-col gap-3">
            {overtimeEmployees.slice(0, 5).map((emp) => {
              const isOverLimit = emp.overtimeHours > 15;
              return (
                <div
                  key={emp.id}
                  className="flex flex-col gap-1.5 p-2 rounded-lg bg-surface2/40 border border-line/40 hover:border-line transition-colors"
                >
                  <div className="flex items-center justify-between text-[12.5px]">
                    <div className="flex items-center gap-2">
                      <Avatar name={emp.name} size={24} />
                      <span className="font-bold text-ink">{emp.name}</span>
                      {isOverLimit && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-warn/20 text-warn border border-warn/40 flex items-center gap-1">
                          <AlertTriangle size={10} />
                          Over 15h Cap
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-ink">
                      {emp.overtimeHours}h / 20h
                    </span>
                  </div>

                  <Progress
                    value={emp.overtimeHours}
                    max={20}
                    variant={isOverLimit ? 'warn' : 'normal'}
                    height={7}
                  />
                </div>
              );
            })}

            <div className="p-3 rounded-xl bg-surface2/60 border border-line/60 flex items-center justify-between mt-1">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-muted uppercase">
                  Pending OT Approvals
                </span>
                <span className="text-[14px] font-display font-bold text-ink">
                  7.5h across 1 request
                </span>
              </div>
              <button
                type="button"
                onClick={() => onApproveRegularisation({ id: 'REQ-OT-BULK', name: 'Rohan Gupta', type: 'Overtime' })}
                className="py-1.5 px-3 rounded-tpl text-[12px] font-bold hover:brightness-110 active:scale-95 transition-all"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--on-accent)',
                  borderRadius: 'var(--radius)',
                }}
              >
                Approve Overtime
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
      )}

      {/* Mandatory GPS Location & Geofence Inspection Modal */}
      <GpsLocationModal
        isOpen={Boolean(selectedGpsEmployee)}
        onClose={() => setSelectedGpsEmployee(null)}
        employee={selectedGpsEmployee}
      />
    </div>
  );
}

