import { useState, useEffect } from 'react';
import { FiTrash2, FiAlertCircle, FiLoader, FiBell } from 'react-icons/fi';

import Loader from '../components/Loader';
import { EmptyState } from '../components/EmptyState';
import Modal from '../components/Modal';
import { getActivities, markActivityAsRead, clearActivities } from '../services/activitiesApi';
import { formatDate } from '../utils';

const PAGE_LIMIT = 20;

const Notifications = () => {
  const [activities, setActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getActivities(PAGE_LIMIT, pageNum);

      const data = response?.data || {};
      const newActivities = Array.isArray(data.activities) ? data.activities : [];
      const serverUnread = typeof data.unreadCount === 'number' ? data.unreadCount : null;

      setActivities(prev => 
        append ? [...prev, ...newActivities] : newActivities
      );

      setUnreadCount(serverUnread ?? 
        (append 
          ? activities.filter(a => !a.read).length + newActivities.filter(a => !a.read).length 
          : newActivities.filter(a => !a.read).length)
      );

      setHasMore(newActivities.length === PAGE_LIMIT);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, false);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  };

  const handleMarkAsRead = async (id) => {
    if (markingId === id) return;
    setMarkingId(id);

    try {
      await markActivityAsRead(id);
      setActivities(prev => prev.map(act => 
        act._id === id ? { ...act, read: true } : act
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    } finally {
      setMarkingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearActivities();
      setActivities([]);
      setUnreadCount(0);
      setPage(1);
      setHasMore(false);
      setClearModalOpen(false);
    } catch (err) {
      console.error('Failed to clear activities:', err);
    }
  };

  const getActivityBadge = (type) => {
    switch (type) {
      case 'blog_created':
        return { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-300', label: 'New Blog' };
      case 'blog_updated':
        return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-800/40 dark:text-blue-300', label: 'Updated' };
      case 'blog_deleted':
        return { color: 'bg-rose-100 text-rose-700 dark:bg-rose-800/40 dark:text-rose-300', label: 'Deleted' };
      case 'like':
        return { color: 'bg-red-100 text-red-600 dark:bg-red-800/40 dark:text-red-300', label: 'Like' };
      case 'comment':
        return { color: 'bg-primary-100 text-primary-700 dark:bg-primary-800/40 dark:text-primary-300', label: 'Comment' };
      case 'view':
        return { color: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300', label: 'View' };
      default:
        return { color: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400', label: 'Activity' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader message="Loading notifications..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <EmptyState
          icon={FiAlertCircle}
          title="Something went wrong"
          description={error}
          actionText="Try Again"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      
      <div className="max-full mx-auto px-4 sm:px-4 lg:px-4 py-4">

         
        <div className="flex items-center justify-between mb-8">
        
 <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="bg-primary-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {activities.length > 0 && (
            <button
              onClick={() => setClearModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-950/40 rounded-lg transition"
            >
              <FiTrash2 size={16} />
              Clear all
            </button>
          )}
        </div>

        {activities.length === 0 ? (
          <EmptyState
            icon={FiBell}
            title="No notifications yet"
            description="You'll see updates here when someone interacts with your content."
            className="py-20"
          />
        ) : (
          <>
            <div className="space-y-3">
              {activities.map((activity) => {
                const badge = getActivityBadge(activity.type);
                const isUnread = !activity.read;
                const isMarking = markingId === activity._id;

                return (
                  <div
                    key={activity._id}
                    onClick={() => isUnread && !isMarking && handleMarkAsRead(activity._id)}
                    className={`
                      relative flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-all duration-150
                      ${isUnread 
                        ? 'bg-primary-50/70 dark:bg-primary-950/25 border-l-4 border-l-primary-500 shadow-sm hover:shadow-md hover:bg-primary-100/60 dark:hover:bg-primary-950/35' 
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850'}
                      ${isMarking ? 'opacity-70 pointer-events-none' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span 
                        className={`
                          inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                          ${badge.color}
                        `}
                      >
                        {badge.label}
                      </span>

                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(activity.createdAt)}
                      </span>
                    </div>

                    <div className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      {activity.type.includes('blog_') ? (
                        <>
                          <span className="font-semibold">
                            {activity.user?.fullName || 'Someone'}
                          </span>{' '}
                          {activity.type === 'blog_created' ? 'published' : 
                           activity.type === 'blog_updated' ? 'updated' : 'deleted'}{' '}
                          the blog{' '}
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            "{activity.title || activity.blog?.title || 'a post'}"
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">
                            {activity.user?.fullName || 'Someone'}
                          </span>{' '}
                          {activity.description || 'interacted with your content'}
                        </>
                      )}
                    </div>

                    {isMarking && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 rounded-xl">
                        <FiLoader className="animate-spin text-primary-600" size={20} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <FiLoader className="animate-spin" size={18} />
                      Loading more...
                    </>
                  ) : (
                    'Load more'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={clearModalOpen}
        title="Clear All Notifications?"
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearAll}
        confirmText="Clear All"
        cancelText="Cancel"
        isDangerous={true}
      >
        <p className="text-gray-600 dark:text-gray-400">
          This will permanently remove all notifications. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Notifications;