// import React from 'react';
// import { Bell, MessageCircle, UserPlus, DollarSign } from 'lucide-react';
// import { Card, CardBody } from '../../components/ui/Card';
// import { Avatar } from '../../components/ui/Avatar';
// import { Badge } from '../../components/ui/Badge';
// import { Button } from '../../components/ui/Button';

// const notifications = [
//   {
//     id: 1,
//     type: 'message',
//     user: {
//       name: 'Sarah Johnson',
//       avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
//     },
//     content: 'sent you a message about your startup',
//     time: '5 minutes ago',
//     unread: true
//   },
//   {
//     id: 2,
//     type: 'connection',
//     user: {
//       name: 'Michael Rodriguez',
//       avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
//     },
//     content: 'accepted your connection request',
//     time: '2 hours ago',
//     unread: true
//   },
//   {
//     id: 3,
//     type: 'investment',
//     user: {
//       name: 'Jennifer Lee',
//       avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
//     },
//     content: 'showed interest in investing in your startup',
//     time: '1 day ago',
//     unread: false
//   }
// ];

// export const NotificationsPage: React.FC = () => {
//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case 'message':
//         return <MessageCircle size={16} className="text-primary-600" />;
//       case 'connection':
//         return <UserPlus size={16} className="text-secondary-600" />;
//       case 'investment':
//         return <DollarSign size={16} className="text-accent-600" />;
//       default:
//         return <Bell size={16} className="text-gray-600" />;
//     }
//   };
  
//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
//           <p className="text-gray-600">Stay updated with your network activity</p>
//         </div>
        
//         <Button variant="outline" size="sm">
//           Mark all as read
//         </Button>
//       </div>
      
//       <div className="space-y-4">
//         {notifications.map(notification => (
//           <Card
//             key={notification.id}
//             className={`transition-colors duration-200 ${
//               notification.unread ? 'bg-primary-50' : ''
//             }`}
//           >
//             <CardBody className="flex items-start p-4">
//               <Avatar
//                 src={notification.user.avatar}
//                 alt={notification.user.name}
//                 size="md"
//                 className="flex-shrink-0 mr-4"
//               />
              
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-2">
//                   <span className="font-medium text-gray-900">
//                     {notification.user.name}
//                   </span>
//                   {notification.unread && (
//                     <Badge variant="primary" size="sm" rounded>New</Badge>
//                   )}
//                 </div>
                
//                 <p className="text-gray-600 mt-1">
//                   {notification.content}
//                 </p>
                
//                 <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
//                   {getNotificationIcon(notification.type)}
//                   <span>{notification.time}</span>
//                 </div>
//               </div>
//             </CardBody>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// };

import React, { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle,
  CreditCard,
  FileText,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { NexusNotification } from "../../types";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";

const getNotificationIcon = (type: NexusNotification["type"]) => {
  if (type.startsWith("meeting")) return <CalendarDays size={20} />;
  if (type.startsWith("document")) return <FileText size={20} />;
  if (type.startsWith("payment")) return <CreditCard size={20} />;
  return <Bell size={20} />;
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleString();
};

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NexusNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getNotifications();

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      await loadNotifications();
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to update notifications");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      await loadNotifications();
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Notifications
            </h1>

            {unreadCount > 0 && (
              <Badge variant="primary">{unreadCount} unread</Badge>
            )}
          </div>

          <p className="text-gray-600">
            Stay updated with your network activity
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadNotifications}>
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          {isLoading && (
            <p className="text-sm text-gray-500">Loading notifications...</p>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="text-center py-16">
              <Bell className="mx-auto text-gray-300 mb-4" size={48} />
              <h2 className="text-xl font-semibold text-gray-900">
                No notifications yet
              </h2>
              <p className="text-gray-500 mt-2">
                Meeting, document, and payment updates will appear here.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border transition ${
                  notification.isRead
                    ? "bg-white border-gray-100"
                    : "bg-primary-50 border-primary-100"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-white text-primary-600 border">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>

                      {!notification.isRead && (
                        <Badge variant="primary" size="sm">
                          New
                        </Badge>
                      )}

                      <Badge variant="secondary" size="sm">
                        {notification.type.replaceAll("_", " ")}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700 mt-1">
                      {notification.message}
                    </p>

                    {notification.sender && (
                      <p className="text-xs text-gray-500 mt-2">
                        From: {notification.sender.name}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkRead(notification._id)}
                        className="p-2"
                        aria-label="Mark as read"
                      >
                        <CheckCircle size={18} />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification._id)}
                      className="p-2 text-error-600 hover:text-error-700"
                      aria-label="Delete notification"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};