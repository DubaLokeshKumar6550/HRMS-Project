import React from 'react';
import {
  Home,
  Bell,
  Clock,
  Calendar,
  Users,
  CalendarDays,
  FileText,
  Target,
  CheckSquare,
  Video,
  Megaphone,
  IndianRupee,
  BarChart3,
  User,
  Settings,
} from 'lucide-react';
import Avatar from './Avatar';

const NAV_GROUPS = [
  {
    group: 'MAIN',
    items: [
      { id: 'overview', label: 'Overview', route: '/dashboard', icon: Home },
      { id: 'notifications', label: 'Notifications', route: '/dashboard/notifications', icon: Bell, badgeType: 'violet', badgeKey: 'unreadNotifs' },
    ],
  },
  {
    group: 'PEOPLE',
    items: [
      { id: 'attendance', label: 'Attendance', route: '/dashboard/attendance', icon: Clock },
      { id: 'leave', label: 'Leave Requests', route: '/dashboard/leave', icon: Calendar, badgeType: 'violet', badgeKey: 'leavePending' },
      { id: 'team', label: 'Team', route: '/dashboard/team', icon: Users },
      { id: 'shifts', label: 'Shifts', route: '/dashboard/shifts', icon: CalendarDays },
      { id: 'documents', label: 'Documents', route: '/dashboard/documents', icon: FileText },
    ],
  },
  {
    group: 'WORK',
    items: [
      { id: 'performance', label: 'Performance', route: '/dashboard/performance', icon: Target },
      { id: 'tasks', label: 'Tasks', route: '/dashboard/tasks', icon: CheckSquare },
      { id: 'meetings', label: 'Meetings', route: '/dashboard/meetings', icon: Video },
      { id: 'announcements', label: 'Announcements', route: '/dashboard/announcements', icon: Megaphone },
    ],
  },
  {
    group: 'FINANCE',
    items: [
      { id: 'payroll', label: 'Payroll', route: '/dashboard/payroll', icon: IndianRupee },
      { id: 'reports', label: 'Reports', route: '/dashboard/reports', icon: BarChart3 },
    ],
  },
  {
    group: 'ACCOUNT',
    items: [
      { id: 'profile', label: 'Profile', route: '/dashboard/profile', icon: User },
      { id: 'settings', label: 'Settings', route: '/dashboard/settings', icon: Settings },
    ],
  },
];

export default function Rail({
  activePage,
  onNavigate,
  onOpenUserDetail,
  pendingCounts = { leavePending: 3, unreadNotifs: 7 },
  managerProfile,
}) {
  return (
    <aside
      className="w-full md:w-[236px] md:sticky md:top-0 md:h-screen flex flex-col justify-between py-2 md:py-4 px-3 md:px-0 z-30 shrink-0"
      aria-label="Sidebar Navigation"
    >
      {/* Top Section: Brand + Scrollable Nav */}
      <div className="flex flex-col gap-3 min-h-0 flex-1 overflow-hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-1 shrink-0">
          <div
            className="w-[34px] h-[34px] flex items-center justify-center font-display font-extrabold text-[15px] shrink-0 shadow-md select-none transition-colors"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--on-accent)',
              borderRadius: 'var(--radius)',
            }}
          >
            HR
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-[16px] text-ink leading-tight tracking-tight">
              Manager Desk
            </span>
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted leading-tight mt-0.5">
              HRMS · INDIA
            </span>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <nav
          className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto px-1 pb-2 md:pb-3 flex-1 pr-1 custom-scrollbar"
          aria-label="Main Menu"
        >
          {NAV_GROUPS.map((grp) => (
            <div key={grp.group} className="flex flex-col gap-1 shrink-0 md:shrink">
              <span className="px-3 text-[11px] font-bold tracking-wider uppercase text-muted/70 select-none">
                {grp.group}
              </span>

              <div className="flex md:flex-col gap-1">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  const badgeCount = item.badgeKey ? pendingCounts[item.badgeKey] : null;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 select-none text-left shrink-0 ${
                        isActive
                          ? 'text-ink bg-surface2 border border-line shadow-sm'
                          : 'text-muted hover:text-ink hover:bg-surface2/60 border border-transparent'
                      }`}
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        className={`shrink-0 ${isActive ? 'text-accent' : 'text-muted'}`}
                      />
                      <span className="truncate flex-1">{item.label}</span>

                      {/* Violet Count Badge */}
                      {badgeCount !== null && badgeCount > 0 && (
                        <span
                          className="ml-auto px-2 py-0.5 text-[10.5px] font-bold rounded-full text-white shrink-0 tabular-nums shadow-sm"
                          style={{ backgroundColor: 'var(--accent2)' }}
                          title={`${badgeCount} unread / pending`}
                        >
                          {badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Pinned Bottom User Card */}
      <div className="pt-2 px-1 border-t border-line/40 shrink-0">
        <button
          type="button"
          onClick={() => (onNavigate ? onNavigate('profile') : onOpenUserDetail?.())}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-surface2 transition-colors select-none text-left group"
          title="Open Manager Profile"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {managerProfile?.photoUrl ? (
              <img
                src={managerProfile.photoUrl}
                alt={managerProfile.name || 'Priya Nair'}
                className="w-[32px] h-[32px] rounded-full object-cover ring-1 ring-accent"
              />
            ) : (
              <Avatar name={managerProfile?.name || 'Priya Nair'} size={32} />
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-display font-semibold text-[13px] text-ink truncate leading-tight group-hover:text-accent transition-colors">
                {managerProfile?.name || 'Priya Nair'}
              </span>
              <span className="text-[11px] text-muted truncate mt-0.5">
                {managerProfile?.designation || managerProfile?.title || 'Engineering Manager'}
              </span>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}
