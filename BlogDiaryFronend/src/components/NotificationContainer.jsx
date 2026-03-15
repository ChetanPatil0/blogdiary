import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { useNotificationStore } from '../store/notificationStore';

const Notification = ({ notification }) => {
  const { removeNotification } = useNotificationStore();
  const { id, message, type } = notification;

  const typeConfig = {
    success: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: FaCheckCircle, color: 'text-green-600' },
    error: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: FaExclamationCircle, color: 'text-red-600' },
    info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: FaInfoCircle, color: 'text-blue-600' },
    warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', icon: FaExclamationCircle, color: 'text-yellow-600' },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 flex items-start gap-3 animate-slide-up`}>
      <Icon className={`${config.color} flex-shrink-0 mt-0.5`} />
      <p className="flex-1 text-gray-800 dark:text-gray-200">{message}</p>
      <button
        onClick={() => removeNotification(id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
      >
        <FaTimes />
      </button>
    </div>
  );
};

const NotificationContainer = () => {
  const { notifications } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-400 space-y-2 max-w-md">
      {notifications.map(notification => (
        <Notification key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationContainer;
