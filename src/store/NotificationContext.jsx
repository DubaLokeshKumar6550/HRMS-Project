import React, { createContext, useContext, useState } from 'react';
import { initialNotifications } from '../data/notifications';

const NotificationContext = createContext(null);

export function NotificationProvider({ children, onTriggerToast, onApproveLeave, onRejectLeave }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAsUnread = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    if (onTriggerToast) {
      onTriggerToast('Marked all notifications as read');
    }
  };

  const dismissNotification = (id) => {
    const item = notifications.find((n) => n.id === id);
    if (!item) return;
    const prev = [...notifications];
    setNotifications((curr) => curr.filter((n) => n.id !== id));
    if (onTriggerToast) {
      onTriggerToast(`Dismissed: ${item.title}`, () => {
        setNotifications(prev);
      });
    }
  };

  const approveNotification = (id) => {
    const item = notifications.find((n) => n.id === id);
    if (!item) return;
    const prev = [...notifications];

    setNotifications((curr) =>
      curr.map((n) =>
        n.id === id
          ? {
              ...n,
              unread: false,
              actionable: false,
              detail: `${n.detail} — Approved by Lokesh Kumar`,
            }
          : n
      )
    );

    if (item.actionType === 'leave' && onApproveLeave && item.data) {
      onApproveLeave(item.data);
    } else if (onTriggerToast) {
      onTriggerToast(`Approved: ${item.title}`, () => {
        setNotifications(prev);
      });
    }
  };

  const rejectNotification = (id) => {
    const item = notifications.find((n) => n.id === id);
    if (!item) return;
    const prev = [...notifications];

    setNotifications((curr) =>
      curr.map((n) =>
        n.id === id
          ? {
              ...n,
              unread: false,
              actionable: false,
              detail: `${n.detail} — Rejected by Lokesh Kumar`,
            }
          : n
      )
    );

    if (item.actionType === 'leave' && onRejectLeave && item.data) {
      onRejectLeave(item.data);
    } else if (onTriggerToast) {
      onTriggerToast(`Rejected: ${item.title}`, () => {
        setNotifications(prev);
      });
    }
  };

  const addNotification = (notif) => {
    const item = {
      id: `notif-${Date.now()}`,
      category: notif.category || 'System',
      title: notif.title || 'System Notification',
      detail: notif.detail || 'Automated notification',
      time: notif.time || 'Just now',
      unread: true,
      actionable: false,
      ...notif,
    };
    setNotifications((prev) => [item, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

