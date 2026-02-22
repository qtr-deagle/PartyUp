import { useState } from 'react';
import type { Notification } from '@/components/NotificationModal';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'match',
      title: 'New Match!',
      message: 'Sarah wants to travel with you to Bali',
      timestamp: '5 minutes ago',
      read: false,
      actionUrl: '/match',
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'Mike: Hey! Are you still going to Tokyo?',
      timestamp: '1 hour ago',
      read: false,
      actionUrl: '/chat',
    },
    {
      id: '3',
      type: 'trip',
      title: 'Trip Reminder',
      message: 'Your trip to Paris starts in 3 days',
      timestamp: '2 hours ago',
      read: true,
      actionUrl: '/trips',
    },
    {
      id: '4',
      type: 'alert',
      title: 'Safety Check',
      message: 'Your trusted circle is requesting your location',
      timestamp: '1 day ago',
      read: true,
      actionUrl: '/trusted-circle',
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
  };
}
