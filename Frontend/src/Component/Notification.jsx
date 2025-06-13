import React, { useEffect } from 'react';
import { useNotifications } from '../Context/Notificationcontext';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ read, title, date, timeAgo, notificationId, onReadClick }) => (
  <div
    className={`notification-item p-4 border-b ${read ? 'bg-gray-50' : 'bg-white'} cursor-pointer`}
    data-id={notificationId}
    onClick={() => !read && onReadClick(notificationId)}
  >
    <div className="flex items-start">
      <div
        className={`flex-shrink-0 h-5 w-5 rounded-full mt-1 mr-3 ${
          read ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        {read && (
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <p className={`text-sm ${read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{title}</p>
        <p className="text-xs text-gray-500 mt-1">{date}</p>
      </div>
      <div className="ml-4">
        <p className="text-xs text-gray-400">{timeAgo}</p>
      </div>
    </div>
  </div>
);

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, isLoading, clearAllNotifications } = useNotifications();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const notificationId = entry.target.dataset.id;
          markAsRead(notificationId);
        observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    const elements = document.querySelectorAll('.notification-item:not([data-read="true"])');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [notifications, markAsRead]);

  return (
    <div className="flex flex-col max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '80vh' }}>
      {/* Fixed header */}
      <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-gray-500 text-center">Loading...</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">No notifications</div>
            ) : (
              notifications.map(notification => {
                const createdAt = new Date(notification.timestamp);
                const formattedDate = createdAt.toLocaleDateString();
                const timeAgo = formatDistanceToNow(createdAt, {
                  addSuffix: true
                });

                return (
                  <NotificationItem
                    key={notification.id}
                    notificationId={notification.id}
                    read={notification.read}
                    title={notification.message}
                    date={formattedDate}
                    timeAgo={timeAgo}
                    onReadClick={markAsRead}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
      
      {/* Fixed footer with action buttons */}
      {notifications.length > 0 && !isLoading && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
          <button
            className="text-sm font-medium text-red-600 hover:text-red-500"
            onClick={clearAllNotifications}
          >
            Clear all
          </button>
          <button
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;