import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';

const Notification = ({ id, message, type, duration = 7000 }) => {
  const { removeNotification } = useNotificationStore();

  
  useEffect(() => {
    const timer = setTimeout(() => removeNotification(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, removeNotification]);

  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div className={`${colors[type]} px-6 py-4 rounded-lg shadow-lg flex justify-between items-center animate-fadeIn w-[360px]`}>
      <p className="flex-1 text-base font-medium">{message}</p>
      <div
        onClick={() => removeNotification(id)}
        className="cursor-pointer opacity-70 hover:opacity-100 ml-4 font-bold text-lg"
      >
        ✕
      </div>
    </div>
  );
};

export const NotificationContainer = () => {
  const notifications = useNotificationStore((state) => state.notifications);

  return (
    <div className="fixed top-6 right-6 space-y-3 z-[9999] pointer-events-auto flex flex-col items-end">
      {notifications.map((notif) => (
        <Notification key={notif.id} {...notif} />
      ))}
    </div>
  );
};

export default Notification;
