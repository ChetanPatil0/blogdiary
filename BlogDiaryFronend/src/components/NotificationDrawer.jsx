import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiBell } from 'react-icons/fi';
import { getActivities } from '../services/activitiesApi';
import { formatDate } from '../utils';
import Loader from './Loader';

const getActivityBadge = (type) => {
  const map = {
    blog_created: {
      label: 'New Blog',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    },
    blog_updated: {
      label: 'Blog Update',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    },
    blog_deleted: {
      label: 'Blog Removed',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    },
    like: {
      label: 'Like',
      color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
    },
    comment: {
      label: 'Comment',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    },
    reply: {
      label: 'Reply',
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    },
    follow: {
      label: 'New Follower',
      color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
    },
    mention: {
      label: 'Mention',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    },
    welcome: {
      label: 'Welcome',
      color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    },
    system: {
      label: 'System',
      color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    },
  };

  return (
    map[type] || {
      label: type
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    }
  );
};

const NotificationDrawer = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchRecent = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getActivities(12, 1);
        setNotifications(res?.data?.activities || []);
      } catch (err) {
        console.error(err);
        setError('Could not load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, [isOpen]);

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 " onClick={onClose} />

      <div
        ref={drawerRef}
        className={`
          absolute top-0 right-0 h-full w-full max-w-md 
          bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <FiBell size={20} className="text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader size="sm" message="Loading..." />
              </div>
            ) : error ? (
              <div className="text-center text-red-600 dark:text-red-400 py-8">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No recent notifications
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.read;
                const badge = getActivityBadge(notif.type);

                return (
                  <div
                    key={notif._id}
                    className={`
                      p-3.5 rounded-xl border text-sm
                      ${isUnread
                        ? 'bg-primary-50/70 dark:bg-primary-950/30 border-l-4 border-l-primary-500'
                        : 'bg-gray-50 dark:bg-gray-850 border-gray-200 dark:border-gray-800'}
                    `}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>

                    <div className="text-gray-800 dark:text-gray-200 leading-snug">
                      {notif.type.includes('blog_') ? (
                        <>
                          <strong>{notif.user?.fullName || 'Someone'}</strong>{' '}
                          {notif.type === 'blog_created' ? 'published' :
                           notif.type === 'blog_updated' ? 'updated' : 'deleted'}{' '}
                          "{notif.title || notif.blog?.title || 'a post'}"
                        </>
                      ) : (
                        <>
                          <strong>{notif.user?.fullName || 'Someone'}</strong>{' '}
                          {notif.description || 'interacted with your content'}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <button
              onClick={handleViewAll}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition"
            >
              View all notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;