import React from 'react';
import { Bell, Check, X, AlertCircle, Heart, MessageCircle, MapPin } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: 'match' | 'message' | 'trip' | 'alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const notificationIcons = {
  match: Heart,
  message: MessageCircle,
  trip: MapPin,
  alert: AlertCircle,
  system: Bell,
};

const notificationColors = {
  match: 'text-accent',
  message: 'text-primary',
  trip: 'text-blue-600',
  alert: 'text-destructive',
  system: 'text-muted-foreground',
};

export default function NotificationModal({
  open,
  onOpenChange,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
}: NotificationModalProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:w-105 flex flex-col">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-xl">Notifications</SheetTitle>
                <SheetDescription className="text-sm">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    : 'All caught up!'}
                </SheetDescription>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex gap-2 pt-3">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Clear all
              </Button>
            </div>
          )}
        </SheetHeader>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2 px-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 px-2">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">No notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll notify you when something important happens
                </p>
              </div>
            </div>
          ) : (
            <>
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                const iconColor = notificationColors[notification.type];

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'w-full text-left p-4 rounded-lg transition-all border hover:shadow-md',
                      notification.read
                        ? 'bg-background border-border'
                        : 'bg-accent/5 border-accent/20 shadow-sm'
                    )}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className={cn('shrink-0 mt-1', iconColor)}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={cn(
                              'font-semibold text-sm',
                              notification.read
                                ? 'text-foreground'
                                : 'text-foreground'
                            )}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
