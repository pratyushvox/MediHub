// import React, { useState, useRef, useEffect } from 'react';
// import { useNotifications } from '../../Context/Notificationcontext';
// import { FaBell } from 'react-icons/fa';
// import { formatDistanceToNow } from 'date-fns';

// const NotificationDropdown = () => {
//   const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   // Format the timestamp to a relative time string
//   const formatTimeAgo = (timestamp) => {
//     try {
//       const date = new Date(timestamp);
//       return formatDistanceToNow(date, { addSuffix: true });
//     } catch (error) {
//       return 'unknown time';
//     }
//   };

//   // Format the date to a readable string
//   const formatDate = (timestamp) => {
//     try {
//       const date = new Date(timestamp);
//       return date.toLocaleDateString('en-US', {
//         day: 'numeric',
//         month: 'short',
//         year: 'numeric'
//       });
//     } catch (error) {
//       return 'unknown date';
//     }
//   };

//   // Handle clicking outside to close dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Handle notification click
//   const handleNotificationClick = (id) => {
//     markAsRead(id);
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         className="p-2 rounded-full hover:bg-gray-200 focus:outline-none relative"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <FaBell className="text-gray-600 text-xl" />
//         {unreadCount > 0 && (
//           <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
//             {unreadCount}
//           </span>
//         )}
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
//           <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
//             <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
//             {unreadCount > 0 && (
//               <button
//                 onClick={markAllAsRead}
//                 className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none"
//               >
//                 Mark all as read
//               </button>
//             )}
//           </div>

//           <div className="divide-y divide-gray-200">
//             {isLoading ? (
//               <div className="p-4 text-center text-gray-500">Loading notifications...</div>
//             ) : notifications.length === 0 ? (
//               <div className="p-4 text-center text-gray-500">No notifications yet</div>
//             ) : (
//               notifications.map((notification) => (
//                 <div
//                   key={notification.id}
//                   className={`p-4 ${!notification.read ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 cursor-pointer`}
//                   onClick={() => handleNotificationClick(notification.id)}
//                 >
//                   <div className="flex items-start">
//                     <div className={`flex-shrink-0 h-2 w-2 mt-1.5 mr-3 rounded-full ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
//                     <div className="flex-1">
//                       <p className={`text-sm ${!notification.read ? 'font-medium' : 'text-gray-700'}`}>
//                         {notification.message}
//                       </p>
//                       <p className="text-xs text-gray-500 mt-1">{formatDate(notification.timestamp)}</p>
//                     </div>
//                     <div className="ml-3 text-xs text-gray-400">
//                       {formatTimeAgo(notification.timestamp)}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationDropdown;