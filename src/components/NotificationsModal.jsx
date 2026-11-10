import React, { useEffect, useRef } from 'react';
import { Bell, Check, X, CheckCheck, ExternalLink } from 'lucide-react';
import NotificationRow from './NotificationRow';

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkUnread,
  onMarkAllAsRead,
  onDismiss,
  onApprove,
  onReject,
  onNavigate,
}) {
  const drawerRef = useRef(null);

  // Esc closes drawer
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const recent8 = notifications.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="drawer-notif-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer: fixed right, 400px, background #0a222b, 1px line border */}
      <div
        ref={drawerRef}
        className="fixed inset-y-0 right-0 w-[400px] max-w-full bg-[#0a222b] border-l border-line p-5 shadow-2xl flex flex-col justify-between text-ink z-50 animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="flex flex-col gap-3 pb-3 border-b border-line/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-surface2 border border-line flex items-center justify-center text-accent">
                <Bell size={16} />
              </div>
              <h2 id="drawer-notif-title" className="font-display font-bold text-[16px] text-ink">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span
                  className="px-2 py-0.5 text-[10.5px] font-bold rounded-full text-white tabular-nums shadow-sm"
                  style={{ backgroundColor: 'var(--accent2)' }}
                >
                  {unreadCount}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface2 transition-colors"
              aria-label="Close notifications drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Secondary "Mark all as read" button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11.5px] text-muted">
              8 most recent alerts
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11.5px] font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <CheckCheck size={13} />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable list of 8 most recent notifications */}
        <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5 pr-1">
          {recent8.length === 0 ? (
            <div className="py-16 text-center text-muted italic text-[12.5px]">
              You're all caught up
            </div>
          ) : (
            recent8.map((notif) => (
              <NotificationRow
                key={notif.id}
                notification={notif}
                onNavigate={(route) => {
                  if (onNavigate) onNavigate(route);
                  onClose();
                }}
                onMarkRead={onMarkRead}
                onMarkUnread={onMarkUnread}
                onDismiss={onDismiss}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))
          )}
        </div>

        {/* Drawer Footer: "View all" link to Notifications page */}
        <div className="pt-3 border-t border-line/50 flex items-center justify-between text-[12px] shrink-0">
          <span className="text-muted text-[11px] font-mono">
            Synced with team roster
          </span>
          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate('/dashboard/notifications');
              onClose();
            }}
            className="flex items-center gap-1.5 text-accent font-bold hover:underline"
          >
            <span>View all notifications</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
