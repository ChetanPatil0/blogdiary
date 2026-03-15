import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { FiEye, FiHeart, FiMessageSquare, FiAlertCircle, FiPlus, FiEdit, FiInbox, FiFileText } from 'react-icons/fi';
import { EmptyState } from '../components/EmptyState';
import {  getBlogDashboardAnalytics, getFeaturedBlogs, getLatestBlogs } from '../services/blogApi';
import { useAuthStore } from '../store/authStore';
import BlogCardSelf from '../components/BlogCardSelf';
import BlogCard from '../components/BlogCard';   

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [myBlogs, setMyBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const analyticsRes = await getBlogDashboardAnalytics();
      console.log('analyticsRes', analyticsRes.data);
      if (analyticsRes?.success) {
        setAnalytics(analyticsRes.data);
        setMyBlogs(analyticsRes.data.blogs || []);
      }

      const featuredRes = await getFeaturedBlogs();
      setFeaturedBlogs(Array.isArray(featuredRes) ? featuredRes : featuredRes?.data || []);

      const latestRes = await getLatestBlogs(10);
      setLatestBlogs(Array.isArray(latestRes) ? latestRes : latestRes?.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-50 dark:bg-dark-900 flex items-center justify-center">
        <Loader message="Loading your dashboard..." />
      </div>
    );
  }

  if (error && !analytics && !featuredBlogs.length && !myBlogs.length && !latestBlogs.length) {
    return (
      <div className="min-h-screen bg-light-50 dark:bg-dark-900 flex items-center justify-center p-4">
        <EmptyState
          icon={FiAlertCircle}
          title="Something went wrong"
          description={error}
          actionText="Try Again"
          onAction={fetchData}
        />
      </div>
    );
  }

  const hasNoMyBlogs   = myBlogs.length === 0;
  const hasNoFeatured  = featuredBlogs.length === 0;
  const hasNoLatest    = latestBlogs.length === 0;
  const hasNoAnalytics = !analytics || analytics.totalBlogs === 0;

  return (
    <div className="min-h-screen bg-light-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-dark-900 dark:text-light-50">
              {getGreeting()}, {user?.fullName || 'User'}!
            </h1>
            <p className="text-dark-600 dark:text-light-400 mt-1 text-sm">
              {getCurrentDateTime()}
            </p>
          </div>

          <button
            onClick={() => navigate('/my-blogs/create-blog')}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition shadow-sm text-sm mx-auto sm:mx-0"
          >
            <FiPlus size={16} />
            Post New Blog
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md transition p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-dark-900 dark:text-light-100">Total Blogs</h3>
              <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                <FiFileText className="text-primary-600 dark:text-primary-400" size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark-900 dark:text-light-50">
              {analytics?.totalBlogs ?? 0}
            </p>
            {hasNoAnalytics && (
              <p className="text-xs text-dark-500 dark:text-light-500 mt-1">No blogs published yet</p>
            )}
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md transition p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-dark-900 dark:text-light-100">Total Views</h3>
              <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                <FiEye className="text-primary-600 dark:text-primary-400" size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark-900 dark:text-light-50">
              {analytics?.totalViews ?? 0}
            </p>
            {hasNoAnalytics && (
              <p className="text-xs text-dark-500 dark:text-light-500 mt-1">No views yet</p>
            )}
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md transition p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-dark-900 dark:text-light-100">Total Likes</h3>
              <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                <FiHeart className="text-primary-600 dark:text-primary-400" size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark-900 dark:text-light-50">
              {analytics?.totalLikes ?? 0}
            </p>
            {hasNoAnalytics && (
              <p className="text-xs text-dark-500 dark:text-light-500 mt-1">No likes yet</p>
            )}
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md transition p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-dark-900 dark:text-light-100">Total Comments</h3>
              <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                <FiMessageSquare className="text-primary-600 dark:text-primary-400" size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark-900 dark:text-light-50">
              {analytics?.totalComments ?? 0}
            </p>
            {hasNoAnalytics && (
              <p className="text-xs text-dark-500 dark:text-light-500 mt-1">No comments yet</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden mb-12">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-dark-900 dark:text-light-50">My Blogs</h2>
          </div>

          {hasNoMyBlogs ? (
            <EmptyState
              icon={FiEdit}
              title="No blogs yet"
              description="You haven't published any blog posts yet."
              actionText="Post Your First Blog"
              onAction={() => navigate('/my-blogs/create-blog')}
            />
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBlogs.map((blog) => (
                <BlogCardSelf key={blog._id} blog={blog} />
              ))}
            </div>
          )}
        </div>

       
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden mb-12">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-dark-900 dark:text-light-50">Featured Blogs</h2>
          </div>

          {hasNoFeatured ? (
            <EmptyState
              icon={FiStar}   
              title="No featured blogs yet"
              description="Featured posts will appear here when available."
            />
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredBlogs.map((blog) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  layout="vertical"     
                  width="w-full"
                  imageHeight="h-52"    
                  className="hover:shadow-xl transition-shadow duration-300"
                />
              ))}
            </div>
          )}
        </div>

      
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-dark-900 dark:text-light-50">Latest Blogs</h2>
          </div>

          {hasNoLatest ? (
            <EmptyState
              icon={FiInbox}
              title="No latest blogs"
              description="New posts from the community will appear here."
            />
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              {latestBlogs.map((blog) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  layout="horizontal"
                  width="w-full"
                  imageHeight="h-52"
                  className="hover:shadow-xl transition-shadow duration-300"
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;