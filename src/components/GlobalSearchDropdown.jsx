import React, { useMemo } from 'react';
import Avatar from './Avatar';
import StatusPill from './StatusPill';
import Tag from './Tag';
import { teamsData } from '../data/teams';
import {
  Users,
  Layout,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  CheckSquare,
  Volume2,
  DollarSign,
  PieChart,
  User,
  Settings,
  Bell,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react';

const SEARCHABLE_PAGES = [
  { id: 'overview', title: 'Overview', route: '/dashboard', icon: Layout, keywords: 'home dashboard kpis summary overview' },
  { id: 'attendance', title: 'Team Attendance', route: '/dashboard/attendance', icon: Clock, keywords: 'attendance punch checkin checkout presence hours biometric late' },
  { id: 'attendance-mine', title: 'My Attendance & Punches', route: '/dashboard/attendance?view=mine', icon: Clock, keywords: 'my attendance punch check in check out break timer' },
  { id: 'leave', title: 'Leave Requests', route: '/dashboard/leave', icon: Calendar, keywords: 'leave vacation timeoff sick casual maternity holiday balance' },
  { id: 'team', title: 'My Team & Pods', route: '/dashboard/team', icon: Users, keywords: 'team members employees pods staff directory organization lead' },
  { id: 'shifts', title: 'Shifts & Rota', route: '/dashboard/shifts', icon: Clock, keywords: 'shifts rota schedule roster timing hours morning night rotation' },
  { id: 'documents', title: 'Documents & Letters', route: '/dashboard/documents', icon: FileText, keywords: 'documents policy letter payslip contract appraisal id form proof' },
  { id: 'performance', title: 'Performance & OKRs', route: '/dashboard/performance', icon: TrendingUp, keywords: 'performance goals okrs review appraisals ratings feedback 1on1' },
  { id: 'tasks', title: 'Tasks & Workload', route: '/dashboard/tasks', icon: CheckSquare, keywords: 'tasks workload backlog kanban tickets sprint delayed overdue' },
  { id: 'meetings', title: 'Meetings & Calendar', route: '/dashboard/meetings', icon: Calendar, keywords: 'meetings calendar sync 1:1 one on one standup schedule room' },
  { id: 'announcements', title: 'Announcements', route: '/dashboard/announcements', icon: Volume2, keywords: 'announcements notice broadcast bulletin hr updates policy townhall' },
  { id: 'payroll', title: 'Payroll & Compliance', route: '/dashboard/payroll', icon: DollarSign, keywords: 'payroll salary compliance pf esi tds form16 pt payslip statutory tax' },
  { id: 'reports', title: 'Reports & Analytics', route: '/dashboard/reports', keywords: 'reports analytics graphs export csv metrics audit attrition' },
  { id: 'profile', title: 'My Profile', route: '/dashboard/profile', keywords: 'profile account personal details contact manager photo designation' },
  { id: 'settings', title: 'Settings', route: '/dashboard/settings', keywords: 'settings preferences delegation notification theme security' },
  { id: 'notifications', title: 'Notifications', route: '/dashboard/notifications', icon: Bell, keywords: 'notifications alerts inbox requests unread bell updates' },
];

export default function GlobalSearchDropdown({
  searchQuery,
  onSearchChange,
  isOpen,
  onClose,
  employees = [],
  onSelectEmployee,
  onNavigate,
  pendingRequests = [],
}) {
  const query = (searchQuery || '').trim().toLowerCase();

  // 1. Matching Employees
  const matchingEmployees = useMemo(() => {
    if (!query) return [];
    return employees
      .filter((emp) => {
        const matchName = emp.name.toLowerCase().includes(query);
        const matchRole = emp.role.toLowerCase().includes(query);
        const matchDept = emp.department.toLowerCase().includes(query);
        const matchLoc = emp.location.toLowerCase().includes(query);
        const matchId = emp.id.toLowerCase().includes(query);
        return matchName || matchRole || matchDept || matchLoc || matchId;
      })
      .slice(0, 6);
  }, [query, employees]);

  // 2. Matching Teams & Pods
  const matchingTeams = useMemo(() => {
    if (!query) return [];
    return teamsData
      .filter((team) => {
        const matchName = team.name.toLowerCase().includes(query);
        const matchShort = team.shortName.toLowerCase().includes(query);
        const matchLead = team.leadName.toLowerCase().includes(query);
        const matchDept = team.department.toLowerCase().includes(query);
        const matchProj = team.activeProjects.some((p) => p.toLowerCase().includes(query));
        return matchName || matchShort || matchLead || matchDept || matchProj;
      })
      .slice(0, 4);
  }, [query]);

  // 3. Matching Navigation Pages
  const matchingPages = useMemo(() => {
    if (!query) return [];
    return SEARCHABLE_PAGES.filter((page) => {
      const matchTitle = page.title.toLowerCase().includes(query);
      const matchKeywords = page.keywords.toLowerCase().includes(query);
      return matchTitle || matchKeywords;
    }).slice(0, 4);
  }, [query]);

  // 4. Matching Pending Approvals
  const matchingApprovals = useMemo(() => {
    if (!query) return [];
    return pendingRequests
      .filter((req) => {
        const matchName = req.name.toLowerCase().includes(query);
        const matchType = req.type?.toLowerCase().includes(query) || req.badgeType?.toLowerCase().includes(query);
        const matchReason = req.reason?.toLowerCase().includes(query);
        return matchName || matchType || matchReason;
      })
      .slice(0, 3);
  }, [query, pendingRequests]);

  const totalResults =
    matchingEmployees.length +
    matchingTeams.length +
    matchingPages.length +
    matchingApprovals.length;

  if (!isOpen || !query) {
    return null;
  }

  return (
    <div
      role="listbox"
      aria-label="Global search results"
      className="absolute left-0 right-0 sm:right-auto top-full mt-2 w-full sm:w-[480px] max-h-[520px] overflow-y-auto rounded-2xl bg-[#091f28]/95 backdrop-blur-2xl border border-line p-2.5 shadow-2xl z-50 flex flex-col gap-3 animate-in fade-in zoom-in-95 text-left"
      style={{
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--line)',
      }}
    >
      {/* Header bar: Result summary */}
      <div className="flex items-center justify-between px-2 pt-1 pb-1 text-[11px] text-muted font-mono border-b border-line/40">
        <span>
          {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
        </span>
        <span>Press ESC to close</span>
      </div>

      {/* SECTION 1: Matching Employees */}
      {matchingEmployees.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="px-2 text-[10px] uppercase font-bold tracking-wider text-muted font-mono flex items-center gap-1.5">
            <Users size={11} className="text-accent" />
            Employees ({matchingEmployees.length})
          </span>
          <div className="flex flex-col gap-1">
            {matchingEmployees.map((emp) => (
              <div
                key={emp.id}
                role="option"
                aria-selected="false"
                onClick={() => {
                  if (onSelectEmployee) onSelectEmployee(emp);
                  onClose();
                  onSearchChange('');
                }}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-surface2/60 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={emp.name} size={30} />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-ink group-hover:text-accent transition-colors truncate">
                        {emp.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted/70">({emp.id})</span>
                    </div>
                    <span className="text-[11px] text-muted truncate">
                      {emp.role} · {emp.department} · {emp.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusPill status={emp.status} />
                  <ChevronRight size={13} className="text-muted/60 group-hover:text-accent transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Matching Teams & Pods */}
      {matchingTeams.length > 0 && (
        <div className="flex flex-col gap-1 pt-1 border-t border-line/40">
          <span className="px-2 text-[10px] uppercase font-bold tracking-wider text-muted font-mono flex items-center gap-1.5">
            <Sparkles size={11} className="text-accent2" />
            Teams & Pods ({matchingTeams.length})
          </span>
          <div className="flex flex-col gap-1">
            {matchingTeams.map((team) => (
              <div
                key={team.id}
                role="option"
                aria-selected="false"
                onClick={() => {
                  if (onNavigate) onNavigate(`/dashboard/team?team=${team.id}`);
                  onClose();
                  onSearchChange('');
                }}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-surface2/60 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-surface2 border border-line flex items-center justify-center text-accent shrink-0 group-hover:border-accent">
                    <Users size={14} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-bold text-ink group-hover:text-accent transition-colors truncate">
                      {team.name}
                    </span>
                    <span className="text-[11px] text-muted truncate">
                      Lead: {team.leadName} · {team.department} · {team.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Tag>{team.memberIds.length} members</Tag>
                  <ArrowRight size={13} className="text-muted/60 group-hover:text-accent transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Matching Pages & Features */}
      {matchingPages.length > 0 && (
        <div className="flex flex-col gap-1 pt-1 border-t border-line/40">
          <span className="px-2 text-[10px] uppercase font-bold tracking-wider text-muted font-mono flex items-center gap-1.5">
            <Layout size={11} className="text-info" />
            Navigation & Modules ({matchingPages.length})
          </span>
          <div className="flex flex-col gap-1">
            {matchingPages.map((page) => {
              const IconComp = page.icon || Layout;
              return (
                <div
                  key={page.id}
                  role="option"
                  aria-selected="false"
                  onClick={() => {
                    if (onNavigate) onNavigate(page.route);
                    onClose();
                    onSearchChange('');
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-surface2/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-surface2/80 border border-line flex items-center justify-center text-muted group-hover:text-ink shrink-0">
                      <IconComp size={14} />
                    </div>
                    <span className="text-[13px] font-semibold text-ink group-hover:text-accent transition-colors truncate">
                      {page.title}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-muted flex items-center gap-1 group-hover:text-accent">
                    <span>Jump</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: Matching Pending Approvals */}
      {matchingApprovals.length > 0 && (
        <div className="flex flex-col gap-1 pt-1 border-t border-line/40">
          <span className="px-2 text-[10px] uppercase font-bold tracking-wider text-muted font-mono flex items-center gap-1.5">
            <CheckSquare size={11} className="text-warn" />
            Pending Approvals ({matchingApprovals.length})
          </span>
          <div className="flex flex-col gap-1">
            {matchingApprovals.map((req) => (
              <div
                key={req.id}
                role="option"
                aria-selected="false"
                onClick={() => {
                  if (onNavigate) onNavigate(req.targetRoute || '/dashboard');
                  onClose();
                  onSearchChange('');
                }}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-surface2/60 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={req.name} size={28} />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-ink truncate group-hover:text-accent">
                        {req.name}
                      </span>
                      <Tag>{req.type}</Tag>
                    </div>
                    <span className="text-[11px] text-muted italic truncate">
                      "{req.reason || req.dates}"
                    </span>
                  </div>
                </div>

                <span className="text-[11px] text-accent font-semibold shrink-0">Review →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {totalResults === 0 && (
        <div className="py-8 px-4 text-center flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-surface2 border border-line flex items-center justify-center text-muted">
            <Search size={18} />
          </div>
          <span className="text-[13px] font-semibold text-ink">
            No matches found for "{searchQuery}"
          </span>
          <p className="text-[11.5px] text-muted max-w-[320px] leading-relaxed">
            Try searching for an employee (e.g. <em>Sneha</em>, <em>Karthik</em>), a functional pod (e.g. <em>Frontend</em>, <em>DevOps</em>), or a feature (e.g. <em>Leave</em>, <em>Shifts</em>).
          </p>
        </div>
      )}
    </div>
  );
}

