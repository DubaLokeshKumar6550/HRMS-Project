import React from 'react';
import Tag from './Tag';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Bell,
  Check,
  X,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';

const CATEGORY_ICONS = {
  Approvals: Calendar,
  Attendance: Clock,
  Performance: CheckCircle2,
  Tasks: FileText,
  Meetings: Users,
  System: Bell,
};

export default function NotificationRow({
  notification,
  onNavigate,
  onMarkRead,
  onMarkUnread,
  onDismiss,
  onApprove,
  onReject,
  showActions = true,
  className = '',
}) {
  const Icon = CATEGORY_ICONS[notification.category] || Bell;

  const handleRowClick = () => {
    if (notification.unread && onMarkRead) {
      onMarkRead(notification.id);
    }
    if (notification.targetRoute && onNavigate) {
      onNavigate(notification.targetRoute);
    }
  };

  return (
    <div
      role="listitem"
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-150 ${
        notification.unread
          ? 'bg-surface2/70 border-line hover:border-accent/50'
          : 'bg-surface2/30 border-transparent hover:border-line hover:bg-surface2/50'
      } ${className}`}
    >
      {/* Left content tile & text */}
      <div
        className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
        onClick={handleRowClick}
      >
        {/* 34px icon tile */}
        <div
          className="w-[34px] h-[34px] rounded-xl bg-surface2 border border-line flex items-center justify-center shrink-0 text-muted group-hover:text-accent transition-colors relative"
          style={{ borderRadius: '12px' }}
        >
          <Icon size={16} strokeWidth={1.8} />
          {notification.unread && (
            <span
              className="absolute -top-1 -right-1 w-[7px] h-[7px] rounded-full bg-accent ring-2 ring-bg"
              title="Unread notification"
            />
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`text-[13px] leading-tight truncate ${
                notification.unread ? 'font-bold text-ink' : 'font-medium text-ink/90'
              }`}
            >
              {notification.title}
            </h4>
            <Tag variant={notification.category === 'Approvals' ? 'accent' : 'default'}>
              {notification.category}
            </Tag>
          </div>

          <p className="text-[12px] text-muted line-clamp-1 mt-0.5 leading-normal">
            {notification.detail}
          </p>

          <span className="text-[10.5px] font-mono text-muted/70 mt-1">
            {notification.time}
          </span>
        </div>
      </div>

      {/* Actions (Approvals quick buttons or row controls) */}
      {showActions && (
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {notification.actionable && notification.unread ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onApprove) onApprove(notification.id);
                }}
                className="px-2.5 py-1 text-[11.5px] font-bold rounded-lg bg-accent text-on-accent hover:opacity-90 flex items-center gap-1 shadow-sm transition-all"
                title="Approve request"
              >
                <Check size={13} strokeWidth={2.2} />
                <span>Approve</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onReject) onReject(notification.id);
                }}
                className="px-2.5 py-1 text-[11.5px] font-bold rounded-lg bg-surface2 text-muted hover:text-bad border border-line hover:border-bad/40 flex items-center gap-1 transition-all"
                title="Reject request"
              >
                <X size={13} strokeWidth={2.2} />
                <span>Reject</span>
              </button>
            </div>
          ) : null}

          {/* Read / Unread toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (notification.unread) {
                if (onMarkRead) onMarkRead(notification.id);
              } else {
                if (onMarkUnread) onMarkUnread(notification.id);
              }
            }}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface2 transition-colors"
            title={notification.unread ? 'Mark as read' : 'Mark as unread'}
          >
            {notification.unread ? (
              <Eye size={15} strokeWidth={1.8} />
            ) : (
              <EyeOff size={15} strokeWidth={1.8} />
            )}
          </button>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onDismiss) onDismiss(notification.id);
            }}
            className="p-1.5 rounded-lg text-muted hover:text-bad hover:bg-surface2 transition-colors"
            title="Dismiss notification"
          >
            <Trash2 size={15} strokeWidth={1.8} />
          </button>
        </div>
      )}
    </div>
  );
}

