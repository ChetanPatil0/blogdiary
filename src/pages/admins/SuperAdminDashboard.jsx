import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiFileText,
  FiEye,
  FiAlertCircle,
  FiSettings,
  FiClock,
} from "react-icons/fi";

import { getAdminDashboard } from "../../services/adminApi";
import Loader from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";

const SuperAdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const response = await getAdminDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loader fullScreen message="Loading dashboard..." />;
  }

  if (!dashboard) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        description="Unable to load admin dashboard data."
        actionText="Retry"
        onAction={fetchDashboard}
      />
    );
  }

  const { stats, recentActivities } = dashboard;

  const statsData = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: <FiUsers size={22} />,
      color: "bg-blue-500",
    },
    {
      title: "Total Blogs",
      value: stats?.totalBlogs || 0,
      icon: <FiFileText size={22} />,
      color: "bg-green-500",
    },
    {
      title: "Total Views",
      value: stats?.totalViews || 0,
      icon: <FiEye size={22} />,
      color: "bg-purple-500",
    },
    {
      title: "Pending Users",
      value: stats?.pendingTempUsers || 0,
      icon: <FiAlertCircle size={22} />,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="p-6 space-y-8">

      
      <div>
        <h1 className="text-3xl font-bold text-dark-900 dark:text-light-50">
          Super Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage platform activity, users, and content
        </p>
      </div>

    
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-dark-800 rounded-xl p-5 border border-gray-200 dark:border-dark-700 shadow-sm flex items-center gap-4 hover:shadow-md transition"
          >
            <div className={`${stat.color} text-white p-3 rounded-lg`}>
              {stat.icon}
            </div>

            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <h2 className="text-xl font-semibold">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-dark-700 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Admin Actions</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <Link
            to="/users"
            className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
          >
            Manage Users
          </Link>

          <Link
            to="/manage-blogs"
            className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
          >
            Manage Blogs
          </Link>

          <Link
            to="/analytics"
            className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
          >
            View Analytics
          </Link>

          <Link
            to="/blogs"
            className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
          >
            
            View Blogs
          </Link>

        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-dark-700 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

        {!recentActivities || recentActivities.length === 0 ? (
          <EmptyState
            title="No recent activity"
            description="There are no activities yet."
          />
        ) : (
          <ul className="space-y-4">
            {recentActivities.map((activity, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300"
              >
                <FiClock className="mt-1 text-gray-400" />

                <div>
                  <p className="font-medium">{activity.message}</p>

                  <span className="text-xs text-gray-400">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};

export default SuperAdminDashboard;