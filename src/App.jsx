import React, { useState, useEffect } from 'react';
import Rail from './components/Rail';
import Header from './components/Header';
import Drawer from './components/Drawer';
import Toast from './components/Toast';
import Avatar from './components/Avatar';
import StatusPill from './components/StatusPill';
import Tag from './components/Tag';
import Progress from './components/Progress';

// Modals & Drawers
import Schedule1on1Modal from './components/Schedule1on1Modal';
import UanModal from './components/UanModal';
import OkrCheckinModal from './components/OkrCheckinModal';
import NotificationsModal from './components/NotificationsModal';
import ExportModal from './components/ExportModal';
import PtSlabsModal from './components/PtSlabsModal';
import KeyboardShortcutsDrawer from './components/KeyboardShortcutsDrawer';

// Context
import { NotificationProvider, useNotifications } from './store/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext.jsx';

// Utilities
import { exportAttendanceCSV } from './utils/exportUtils';

// Existing Pages
import Overview from './pages/Overview';
import Attendance from './pages/Attendance';
import LeaveRequests from './pages/LeaveRequests';
import Payroll from './pages/Payroll';
import Team from './pages/Team';
import Reports from './pages/Reports';

// New & Expanded Pages
import Performance from './pages/Performance';
import Shifts from './pages/Shifts';
import Tasks from './pages/Tasks';
import Meetings from './pages/Meetings';
import Announcements from './pages/Announcements';
import Documents from './pages/Documents';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Sample data
import {
  managerProfile,
  initialKpis,
  initialEmployees,
  initialPendingRequests,
  initialApprovedRequests,
  initialRejectedRequests,
  initialOkrs,
  initialTasksSummary,
  initialReviewCycle,
  initialPayrollCycle,
  calendarDaysNov2026,
  initialTeamLife,
  attendanceTrendData,
  reportAnalyticsData,
} from './data/manager';

import { Calendar, Phone, Mail, Clock, Award, ShieldAlert, Sparkles, Copy, Check } from 'lucide-react';

const PAGE_TITLES = {
  overview: 'Overview',
  notifications: 'Notifications',
  attendance: 'Team attendance',
  leave: 'Leave requests',
  team: 'My team',
  shifts: 'Shifts & Rota',
  documents: 'Documents',
  performance: 'Performance',
  tasks: 'Tasks & Workload',
  meetings: 'Meetings & Calendar',
  announcements: 'Announcements',
  payroll: 'Payroll and compliance',
  reports: 'Reports and analytics',
  profile: 'My profile',
  settings: 'Settings',
};

const ROUTE_MAP = {
  '/dashboard': 'overview',
  '/dashboard/notifications': 'notifications',
  '/dashboard/attendance': 'attendance',
  '/dashboard/leave': 'leave',
  '/dashboard/team': 'team',
  '/dashboard/shifts': 'shifts',
  '/dashboard/documents': 'documents',
  '/dashboard/performance': 'performance',
  '/dashboard/tasks': 'tasks',
  '/dashboard/meetings': 'meetings',
  '/dashboard/announcements': 'announcements',
  '/dashboard/payroll': 'payroll',
  '/dashboard/reports': 'reports',
  '/dashboard/profile': 'profile',
  '/dashboard/settings': 'settings',
};

function AppContent() {
  const { user, settings } = useAuth();
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    setIsDrawerOpen,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    dismissNotification,
    approveNotification,
    rejectNotification,
    addNotification,
  } = useNotifications();

  // Route state
  const [activePage, setActivePage] = useState(() => {
    const path = window.location.pathname.replace(/\/$/, '');
    if (ROUTE_MAP[path]) return ROUTE_MAP[path];
    const hash = window.location.hash.replace('#', '');
    if (PAGE_TITLES[hash]) return hash;
    return 'overview';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isCompact, setIsCompact] = useState(false);
  const [accentTheme, setAccentTheme] = useState('amber'); // 'amber' (screenshot) or 'mint' (spec)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Live state for dashboard
  const [employees, setEmployees] = useState(initialEmployees);
  const [pendingRequests, setPendingRequests] = useState(initialPendingRequests);
  const [approvedRequests, setApprovedRequests] = useState(initialApprovedRequests);
  const [rejectedRequests, setRejectedRequests] = useState(initialRejectedRequests);
  const [payrollCycle, setPayrollCycle] = useState(initialPayrollCycle);
  const [kpis, setKpis] = useState(initialKpis);
  const [okrs, setOkrs] = useState(initialOkrs);

  // Drawers & Modals State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [scheduled1on1Target, setScheduled1on1Target] = useState(null);
  const [uanModalTarget, setUanModalTarget] = useState(null);
  const [okrCheckinTarget, setOkrCheckinTarget] = useState(null);
  const [isPtSlabsOpen, setIsPtSlabsOpen] = useState(false);

  // Toast with Undo state
  const [toast, setToast] = useState(null);

  // Compact density toggle effect
  useEffect(() => {
    if (isCompact) {
      document.documentElement.setAttribute('data-density', 'compact');
    } else {
      document.documentElement.removeAttribute('data-density');
    }
  }, [isCompact]);

  // Accent theme toggle effect
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentTheme);
  }, [accentTheme]);

  // Page navigation handler with scroll-to-top & URL history sync
  const handleNavigate = (pageIdOrRoute) => {
    const query = pageIdOrRoute.includes('?') ? `?${pageIdOrRoute.split('?')[1]}` : '';
    const clean = pageIdOrRoute.split('?')[0];
    let targetId = clean;
    if (clean.startsWith('/dashboard')) {
      targetId = ROUTE_MAP[clean] || 'overview';
    }

    setActivePage(targetId);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sync route in browser history
    const targetRoute = Object.entries(ROUTE_MAP).find(([, id]) => id === targetId)?.[0] || '/dashboard';
    window.history.pushState(null, '', `${targetRoute}${query}`);
  };

  // Trigger quick toast helper
  const triggerToast = (message, undoAction = null) => {
    setToast({ message, undoAction });
  };

  // Approve action handler
  const handleApproveRequest = (req) => {
    const prevPending = [...pendingRequests];
    const prevEmployees = [...employees];

    setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
    setApprovedRequests((prev) => [
      { ...req, approvedOn: '6 Nov 2026' },
      ...prev,
    ]);

    if (req.badgeType === 'regular') {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.name === req.name
            ? {
                ...emp,
                status: 'in-office',
                punchOut: req.dates?.includes('Punch-out') ? '18:30' : emp.punchOut,
                flags: emp.flags.filter((f) => !f.includes('pending')),
              }
            : emp
        )
      );
    }

    setToast({
      message: `Approved ${req.type?.toLowerCase() || 'request'} for ${req.name}`,
      undoAction: () => {
        setPendingRequests(prevPending);
        setEmployees(prevEmployees);
        setApprovedRequests((prev) => prev.filter((r) => r.id !== req.id));
        setToast(null);
      },
    });
  };

  // Reject action handler
  const handleRejectRequest = (req) => {
    const prevPending = [...pendingRequests];
    setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
    setRejectedRequests((prev) => [
      { ...req, rejectedOn: '6 Nov 2026', reason: req.customReason || req.reason },
      ...prev,
    ]);

    setToast({
      message: `Rejected ${req.type?.toLowerCase() || 'request'} for ${req.name}`,
      undoAction: () => {
        setPendingRequests(prevPending);
        setRejectedRequests((prev) => prev.filter((r) => r.id !== req.id));
        setToast(null);
      },
    });
  };

  // Approve all notifications in one click
  const handleApproveAllRequests = () => {
    const prevPending = [...pendingRequests];
    setApprovedRequests((prev) => [
      ...prevPending.map((r) => ({ ...r, approvedOn: '6 Nov 2026' })),
      ...prev,
    ]);
    setPendingRequests([]);
    markAllAsRead();
    setIsDrawerOpen(false);
    setToast({
      message: `Approved all ${prevPending.length} pending requests`,
      undoAction: () => {
        setPendingRequests(prevPending);
        setApprovedRequests((prev) =>
          prev.filter((r) => !prevPending.some((p) => p.id === r.id))
        );
        setToast(null);
      },
    });
  };

  // Regularisation requests
  const regularisationRequests = pendingRequests.filter(
    (r) => r.badgeType === 'regular'
  );

  // Leave requests
  const pendingLeaves = pendingRequests.filter((r) => r.badgeType === 'leave');

  // Checklist toggle for payroll
  const handleToggleChecklist = (id) => {
    setPayrollCycle((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    }));
  };

  // Submit inputs to HR
  const handleSubmitToHr = () => {
    setPayrollCycle((prev) => ({ ...prev, state: 'Reviewed' }));
    setToast({
      message: 'Payroll inputs submitted to HR operations successfully',
      undoAction: () => {
        setPayrollCycle((prev) => ({ ...prev, state: 'Draft' }));
        setToast(null);
      },
    });
  };

  // Ping employee who has not punched in
  const handlePingEmployee = (emp) => {
    setToast({
      message: `Punch-in reminder notification dispatched to ${emp.name} via Slack & SMS`,
      undoAction: null,
    });
  };

  // Schedule 1:1 meeting
  const handleConfirmSchedule1on1 = (details) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === details.employeeId
          ? { ...emp, last1on1: `${details.date} (${details.time})` }
          : emp
      )
    );
    setToast({
      message: `Scheduled 1:1 with ${details.employeeName} on ${details.date} at ${details.time}`,
      undoAction: null,
    });
  };

  // Save UAN & resolve compliance
  const handleSaveUan = (employeeId, uanNumber) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              uan: uanNumber,
              complianceIssues: emp.complianceIssues?.filter(
                (c) => !c.includes('UAN')
              ),
            }
          : emp
      )
    );
    setToast({
      message: `UAN verified & linked successfully: ${uanNumber}`,
      undoAction: null,
    });
  };

  // OKR check-in submit
  const handleSaveOkrCheckin = (okrId, newProgress, note) => {
    setOkrs((prev) =>
      prev.map((okr) =>
        okr.id === okrId
          ? { ...okr, progress: newProgress, lastCheckin: 'Today' }
          : okr
      )
    );
    setToast({
      message: `OKR check-in saved! Progress updated to ${newProgress}%`,
      undoAction: null,
    });
  };

  // Export CSV handler
  const handleExportAttendanceCsv = () => {
    exportAttendanceCSV(employees, '6 Nov 2026');
    setToast({
      message: 'Attendance register CSV exported successfully',
      undoAction: null,
    });
  };

  // Filtered employees by search
  const displayedEmployees = employees.filter((emp) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.id.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-ink antialiased selection:bg-accent selection:text-on-accent">
      {/* 1. Left Navigation Rail (width 236px, sticky, grouped items) */}
      <Rail
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenUserDetail={() => handleNavigate('profile')}
        pendingCounts={{
          leavePending: pendingLeaves.length,
          unreadNotifs: unreadCount,
        }}
        managerProfile={user || managerProfile}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 min-w-0 flex flex-col px-3 sm:px-6 md:px-8 py-4 md:py-6 gap-[var(--gap)]">
        <Header
          pageTitle={PAGE_TITLES[activePage] || 'Manager Desk'}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isCompact={isCompact}
          onToggleCompact={() => setIsCompact(!isCompact)}
          accentTheme={accentTheme}
          onToggleAccent={() =>
            setAccentTheme(accentTheme === 'amber' ? 'mint' : 'amber')
          }
          pendingCount={unreadCount}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onToggleNotifications={() => setIsDrawerOpen(!isDrawerOpen)}
          isNotificationsOpen={isDrawerOpen}
          user={user}
          onNavigate={handleNavigate}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onSignOut={() => triggerToast('Signed out of manager session (demo).')}
          employees={employees}
          onSelectEmployee={(emp) => setSelectedEmployee(emp)}
          pendingRequests={pendingRequests}
        />

        {/* Header Bell Drawer: 400px fixed right */}
        <NotificationsModal
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={markAsRead}
          onMarkUnread={markAsUnread}
          onMarkAllAsRead={markAllAsRead}
          onDismiss={dismissNotification}
          onApprove={approveNotification}
          onReject={rejectNotification}
          onNavigate={handleNavigate}
        />

        {/* 3. Page Routing View */}
        <main className="w-full min-w-0 flex-1">
          {activePage === 'overview' && (
            <Overview
              kpis={kpis}
              pendingRequests={pendingRequests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onNavigate={handleNavigate}
              onSelectEmployee={(emp) => setSelectedEmployee(emp)}
              employees={employees}
              attendanceTrend={attendanceTrendData}
              onPingEmployee={handlePingEmployee}
            />
          )}

          {activePage === 'notifications' && (
            <Notifications onNavigate={handleNavigate} />
          )}

          {activePage === 'attendance' && (
            <Attendance
              employees={employees}
              onSelectEmployee={(emp) => setSelectedEmployee(emp)}
              regularisationRequests={regularisationRequests}
              onApproveRegularisation={handleApproveRequest}
              onRejectRegularisation={handleRejectRequest}
              onExportCsv={handleExportAttendanceCsv}
              searchQuery={searchQuery}
            />
          )}

          {activePage === 'leave' && (
            <LeaveRequests
              pendingLeaves={pendingLeaves}
              approvedLeaves={approvedRequests.filter((r) => r.type === 'Leave')}
              rejectedLeaves={rejectedRequests.filter((r) => r.type === 'Leave')}
              onApproveLeave={handleApproveRequest}
              onRejectLeave={handleRejectRequest}
              calendarDays={calendarDaysNov2026}
              onSelectEmployee={(emp) => setSelectedEmployee(emp)}
              employees={employees}
            />
          )}

          {activePage === 'team' && (
            <Team
              employees={displayedEmployees}
              onSelectEmployee={(emp) => setSelectedEmployee(emp)}
              teamLife={initialTeamLife}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onTriggerToast={triggerToast}
            />
          )}

          {activePage === 'shifts' && (
            <Shifts
              employees={employees}
              onTriggerToast={triggerToast}
            />
          )}

          {activePage === 'documents' && (
            <Documents
              employees={employees}
              onTriggerToast={triggerToast}
            />
          )}

          {activePage === 'performance' && (
            <Performance
              employees={employees}
              onTriggerToast={triggerToast}
            />
          )}

          {activePage === 'tasks' && (
            <Tasks
              employees={employees}
              onTriggerToast={triggerToast}
            />
          )}

          {activePage === 'meetings' && (
            <Meetings
              employees={employees}
              onTriggerToast={triggerToast}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'announcements' && (
            <Announcements
              employees={employees}
              onTriggerToast={triggerToast}
            />
          )}

          {activePage === 'payroll' && (
            <Payroll
              payrollCycle={payrollCycle}
              employees={employees}
              onToggleChecklist={handleToggleChecklist}
              onSubmitToHr={handleSubmitToHr}
              onSelectEmployee={(emp) => setSelectedEmployee(emp)}
              onResolveUan={() => {
                const arjun = employees.find((e) => e.name === 'Arjun Das');
                if (arjun) setUanModalTarget(arjun);
              }}
              onViewPtSlabs={() => setIsPtSlabsOpen(true)}
            />
          )}

          {activePage === 'reports' && (
            <Reports
              reportData={reportAnalyticsData}
              employees={employees}
              onExportCsv={handleExportAttendanceCsv}
              onExportPdf={() => window.print()}
              onTriggerToast={triggerToast}
            />
          )}

          {activePage === 'profile' && (
            <Profile onTriggerToast={triggerToast} />
          )}

          {activePage === 'settings' && (
            <Settings
              onTriggerToast={triggerToast}
              onSendTestNotification={() => {
                addNotification({
                  title: 'System Test Notification',
                  detail: 'Notification channels and bell drawer delivery verified.',
                  category: 'System',
                  time: 'Just now',
                  unread: true,
                });
              }}
            />
          )}
        </main>

        {/* Footer Note */}
        <footer className="text-[12px] text-muted text-center pt-6 pb-4 border-t border-line/30 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            HRMS India · Engineering Division · Manager Desk v2.4 (Monsoon Glass)
          </span>
          <span className="font-mono text-[11px] text-muted/80">
            Individual salaries hidden · Statutory values: configurable example, to be validated
          </span>
        </footer>
      </div>

      {/* ======================================================== */}
      {/* DRAWERS: Employee Profile with 3 Section 10 Shortcuts */}
      {/* ======================================================== */}
      <Drawer
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title={selectedEmployee?.name || 'Employee Profile'}
        subtitle={`${selectedEmployee?.id} · ${selectedEmployee?.role}`}
      >
        {selectedEmployee && (
          <div className="flex flex-col gap-4 text-[13px]">
            {/* Avatar & Header details */}
            <div className="flex items-center gap-3 pb-3 border-b border-line">
              <Avatar name={selectedEmployee.name} size={48} />
              <div className="flex flex-col">
                <h3 className="font-display font-bold text-[16px] text-ink">
                  {selectedEmployee.name}
                </h3>
                <span className="text-[12px] text-muted">
                  {selectedEmployee.department} · {selectedEmployee.location}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <StatusPill status={selectedEmployee.status} />
                  <Tag>{selectedEmployee.reporting} Report</Tag>
                </div>
              </div>
            </div>

            {/* Quick Contact & Details */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
                Contact & Records
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                <div className="flex items-center gap-2 text-muted">
                  <Mail size={13} />
                  <span>{selectedEmployee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <Phone size={13} />
                  <span className="font-mono">{selectedEmployee.phone}</span>
                </div>
              </div>
            </div>

            {/* Tenure & 1:1 Date */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface2/40 border border-line">
              <div>
                <span className="text-[11px] text-muted uppercase font-mono">Join Date</span>
                <span className="font-bold text-ink mt-0.5 block">{selectedEmployee.joinDate}</span>
                <span className="text-[11px] text-muted font-mono">{selectedEmployee.tenure} tenure</span>
              </div>
              <div>
                <span className="text-[11px] text-muted uppercase font-mono">Last 1:1</span>
                <span className="font-bold text-ink mt-0.5 block">{selectedEmployee.last1on1}</span>
              </div>
            </div>

            {/* Attendance & Hours Worked */}
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface2/40 border border-line">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted font-medium">
                  In: {selectedEmployee.punchIn} | Out: {selectedEmployee.punchOut}
                </span>
                <span className="font-mono font-bold text-ink">{selectedEmployee.hoursWorked}</span>
              </div>
              <Progress value={selectedEmployee.hoursDecimal} max={9} height={6} />
            </div>

            {/* Leave Balance */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
                Leave Balances (Days)
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-surface2 border border-line">
                  <span className="text-[10px] text-muted block">Casual</span>
                  <span className="font-mono font-bold text-ink">{selectedEmployee.leaveBalance?.casual || 0}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface2 border border-line">
                  <span className="text-[10px] text-muted block">Sick</span>
                  <span className="font-mono font-bold text-ink">{selectedEmployee.leaveBalance?.sick || 0}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface2 border border-line">
                  <span className="text-[10px] text-muted block">Earned</span>
                  <span className="font-mono font-bold text-ink">{selectedEmployee.leaveBalance?.earned || 0}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface2 border border-line">
                  <span className="text-[10px] text-muted block">Comp-off</span>
                  <span className="font-mono font-bold text-ink">{selectedEmployee.leaveBalance?.compOff || 0}</span>
                </div>
              </div>
            </div>

            {/* Goals Progress */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted font-medium">Q3 Goals Progress</span>
                <span className="font-mono font-bold text-ink">{selectedEmployee.goalsProgress}%</span>
              </div>
              <Progress value={selectedEmployee.goalsProgress} max={100} height={7} />
            </div>

            {/* Section 10 Shortcut buttons: Set goal, Give feedback, Assign shift */}
            <div className="flex flex-col gap-2 pt-2 border-t border-line/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
                Manager Actions
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleNavigate('performance');
                    window.history.replaceState(null, '', '?tab=goals');
                    setSelectedEmployee(null);
                  }}
                  className="py-2 px-2 rounded-xl bg-surface2 border border-line hover:border-accent text-ink text-[12px] font-semibold text-center transition-colors shadow-sm"
                >
                  Set goal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleNavigate('performance');
                    window.history.replaceState(null, '', '?tab=feedback');
                    setSelectedEmployee(null);
                  }}
                  className="py-2 px-2 rounded-xl bg-surface2 border border-line hover:border-accent text-ink text-[12px] font-semibold text-center transition-colors shadow-sm"
                >
                  Give feedback
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleNavigate('shifts');
                    setSelectedEmployee(null);
                  }}
                  className="py-2 px-2 rounded-xl bg-surface2 border border-line hover:border-accent text-ink text-[12px] font-semibold text-center transition-colors shadow-sm"
                >
                  Assign shift
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setScheduled1on1Target(selectedEmployee);
                  setSelectedEmployee(null);
                }}
                className="w-full py-2 px-3 rounded-xl text-[12.5px] font-bold shadow-md hover:brightness-110 active:scale-95 transition-all text-center mt-1"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--on-accent)',
                }}
              >
                Schedule 1:1 check-in
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Lokesh Kumar Manager Profile Drawer */}
      <Drawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Manager Profile"
        subtitle="Role & Team Scope"
      >
        <div className="flex flex-col gap-5 text-[13px]">
          <div className="flex items-center gap-3 pb-3 border-b border-line">
            <Avatar name={managerProfile?.name || 'Lokesh Kumar'} size={52} />
            <div className="flex flex-col">
              <h3 className="font-display font-bold text-[17px] text-ink">
                {managerProfile?.name || 'Lokesh Kumar'}
              </h3>
              <span className="text-[12.5px] text-muted">
                {managerProfile?.title || 'Engineering Manager'} · {managerProfile?.department || 'Platform Engineering'}
              </span>
              <span className="text-[11px] font-mono text-accent mt-0.5">
                Employee ID: {managerProfile?.id || 'EMP-MGR-01'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="p-3 rounded-xl bg-surface2/40 border border-line">
              <span className="text-[10.5px] text-muted uppercase font-mono">Team Headcount</span>
              <span className="font-display font-extrabold text-[20px] text-ink block mt-0.5">
                {employees.length} Engineers
              </span>
              <span className="text-[11px] text-muted font-mono">18 Direct · 6 Indirect</span>
            </div>
            <div className="p-3 rounded-xl bg-surface2/40 border border-line">
              <span className="text-[10.5px] text-muted uppercase font-mono">Location</span>
              <span className="font-display font-extrabold text-[15px] text-ink block mt-1">
                Bengaluru HQ
              </span>
              <span className="text-[11px] text-muted font-mono">South Tower, Floor 4</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-line/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
              Role & Compliance Permissions
            </span>
            <div className="p-3 rounded-xl bg-surface2/20 border border-line flex flex-col gap-1.5 text-[12px] text-ink/90">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-good" />
                <span>Full access to team attendance, leave, and shift roster</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-good" />
                <span>Performance evaluation and OKR goal management</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-good" />
                <span>Encrypted compliance documents view (view logged)</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <ShieldAlert size={14} className="text-warn" />
                <span>Individual salary, bank details, and personal tax data restricted</span>
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        employees={employees}
        onTriggerToast={triggerToast}
      />

      {/* Schedule 1:1 Modal */}
      <Schedule1on1Modal
        isOpen={Boolean(scheduled1on1Target)}
        onClose={() => setScheduled1on1Target(null)}
        employee={scheduled1on1Target}
        onConfirm={handleConfirmSchedule1on1}
      />

      {/* UAN Compliance Modal */}
      <UanModal
        isOpen={Boolean(uanModalTarget)}
        onClose={() => setUanModalTarget(null)}
        employee={uanModalTarget}
        onSave={handleSaveUan}
      />

      {/* OKR Check-in Modal */}
      <OkrCheckinModal
        isOpen={Boolean(okrCheckinTarget)}
        onClose={() => setOkrCheckinTarget(null)}
        okr={okrCheckinTarget}
        onSave={handleSaveOkrCheckin}
      />

      {/* PT Slabs Modal */}
      <PtSlabsModal
        isOpen={isPtSlabsOpen}
        onClose={() => setIsPtSlabsOpen(false)}
      />

      {/* Keyboard Shortcuts Drawer */}
      <KeyboardShortcutsDrawer
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Global Toast with Undo */}
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default function App() {
  const [toast, setToast] = useState(null);

  const handleToast = (msg, undo) => setToast({ message: msg, undoAction: undo });

  return (
    <AuthProvider>
      <NotificationProvider onTriggerToast={handleToast}>
        <AttendanceProvider onTriggerToast={handleToast}>
          <AppContent />
          <Toast toast={toast} onClose={() => setToast(null)} />
        </AttendanceProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
