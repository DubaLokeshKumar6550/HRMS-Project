import React, { useState } from 'react';
import Card from '../components/Card';
import NotificationRow from '../components/NotificationRow';
import { useNotifications } from '../store/NotificationContext';
import { CheckCheck, Filter } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Approvals',
  'Attendance',
  'Performance',
  'Tasks',
  'Meetings',
  'System',
];

export default function Notifications({ onNavigate }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    dismissNotification,
    approveNotification,
    rejectNotification,
  } = useNotifications();

  const [activeCategory, setActiveCategory] = useState('All');
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Filter notifications
  const filtered = notifications.filter((item) => {
    if (unreadOnly && !item.unread) return false;
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    return true;
  });

  // Group by timestamp label
  const groups = [
    { label: 'Today', items: filtered.filter((n) => n.timestamp === 'Today') },
    { label: 'Yesterday', items: filtered.filter((n) => n.timestamp === 'Yesterday') },
    { label: 'Earlier this week', items: filtered.filter((n) => n.timestamp === 'Earlier this week') },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Subtitle & Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12.5px] text-muted">
          Real-time activity, team requests, and action alerts for your 24 engineers
        </p>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[12px] font-semibold transition-all ml-auto"
          >
            <CheckCheck size={14} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Grid: 2 equal columns, widget notif spans 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          id="notif"
          title="Team Alerts & Approvals"
          className="col-span-1 md:col-span-2"
          action={
            <span className="text-[11px] font-mono text-muted tabular-nums">
              {unreadCount} unread · {notifications.length} total
            </span>
          }
        >
          <div className="flex flex-col gap-4">
            {/* Filter pills & Unread toggle */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-line/40">
              <div
                role="tablist"
                aria-label="Notification categories"
                className="flex items-center gap-1.5 flex-wrap"
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-pressed={isSelected}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all select-none border ${
                        isSelected
                          ? 'bg-accent text-on-accent border-accent shadow-sm'
                          : 'bg-surface2 text-muted border-line hover:text-ink hover:border-line/80'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Unread only toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                  className="rounded bg-surface2 border-line text-accent focus:ring-accent/40 w-3.5 h-3.5"
                />
                <span className="text-[12px] font-semibold text-muted">Unread only</span>
              </label>
            </div>

            {/* Notification Groups */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center select-none">
                <div className="w-12 h-12 rounded-2xl bg-surface2 border border-line flex items-center justify-center text-muted mb-3">
                  <CheckCheck size={22} strokeWidth={1.8} />
                </div>
                <h3 className="font-display font-bold text-[15px] text-ink">
                  You're all caught up
                </h3>
                <p className="text-[12.5px] text-muted mt-1 max-w-sm">
                  No notifications match your current filter. Check back later for team updates.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {groups.map((group) => (
                  <div key={group.label} className="flex flex-col gap-2">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono px-1">
                      {group.label}
                    </h3>npm run dev
                    <div role="list" className="flex flex-col gap-2">
                      {group.items.map((item) => (
                        <NotificationRow
                          key={item.id}
                          notification={item}
                          onNavigate={onNavigate}
                          onMarkRead={markAsRead}
                          onMarkUnread={markAsUnread}
                          onDismiss={dismissNotification}
                          onApprove={approveNotification}
                          onReject={rejectNotification}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

