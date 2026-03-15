import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEye,
  FiHeart,
  FiFileText,
  FiCheck,
  FiEdit3,
  FiBarChart2,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Loader from "../components/Loader";
import { EmptyState } from "../components/EmptyState";
import { getBlogAnalytics } from "../services/blogApi";
import { formatDate } from "../utils";
import { MEDIA_BASE_URL } from "../services/api";

const Analytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [chartPeriod, setChartPeriod] = useState("all");
  const [topBlogsTab, setTopBlogsTab] = useState("overall");
  const [mostLikedTab, setMostLikedTab] = useState("overall");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await getBlogAnalytics();
        console.log("Analytics data:", res.data);
        setAnalytics(res.data);
      } catch (err) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const chartData = useMemo(() => {
    if (!analytics?.viewTrend || chartPeriod === "all") {
      return analytics?.viewTrend || [];
    }

    const now = new Date();
    let startDate;

    if (chartPeriod === "week") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (chartPeriod === "month") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
    } else if (chartPeriod === "year") {
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    return (analytics.viewTrend || []).filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  }, [analytics, chartPeriod]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader message="Loading analytics..." />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <EmptyState
        icon={FiBarChart2}
        title="Error"
        description={error || "No analytics data available"}
        actionText="Reload"
        onAction={() => window.location.reload()}
      />
    );
  }

  const stats = analytics.stats || {};
  const topBlogs = analytics.topBlogs?.[topBlogsTab] || [];
  const mostLiked = analytics.mostLiked?.[mostLikedTab] || [];

  return (
    <div className="min-h-screen bg-light-50 dark:bg-dark-900 p-4 sm:p-6 pb-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-dark-900 dark:text-light-50">
        Analytics Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md transition p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-dark-900 dark:text-light-100">Total Blogs</h3>
            <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <FiFileText className="text-primary-600 dark:text-primary-400" size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-dark-900 dark:text-light-50">
            {stats.totalBlogs ?? 0}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md transition p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-dark-900 dark:text-light-100">Published</h3>
            <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <FiCheck className="text-primary-600 dark:text-primary-400" size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-dark-900 dark:text-light-50">
            {stats.totalPublished ?? 0}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md transition p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-dark-900 dark:text-light-100">Drafts</h3>
            <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <FiEdit3 className="text-primary-600 dark:text-primary-400" size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-dark-900 dark:text-light-50">
            {stats.totalDrafts ?? 0}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md transition p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-dark-900 dark:text-light-100">Total Views</h3>
            <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <FiEye className="text-primary-600 dark:text-primary-400" size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-dark-900 dark:text-light-50">
            {stats.totalViews ?? 0}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md transition p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-dark-900 dark:text-light-100">Total Likes</h3>
            <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <FiHeart className="text-primary-600 dark:text-primary-400" size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-dark-900 dark:text-light-50">
            {stats.totalLikes ?? 0}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-5 sm:p-6 mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 sm:mb-6 gap-4">
          <h2 className="text-lg sm:text-xl font-semibold">Views Trend</h2>
          <div className="flex flex-wrap gap-2">
            {["all", "week", "month", "year"].map((period) => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition ${
                  chartPeriod === period
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {period === "all" ? "All Time" : `This ${period.charAt(0).toUpperCase() + period.slice(1)}`}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Section
        title="Top Performing Blogs"
        tabs={["overall", "thisWeek", "thisMonth", "thisYear"]}
        activeTab={topBlogsTab}
        onTabChange={setTopBlogsTab}
      >
        {topBlogs.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No data available for this period
          </p>
        ) : (
          topBlogs.map((blog) => <BlogRow key={blog._id} blog={blog} />)
        )}
      </Section>

      <Section
        title="Most Liked Blogs"
        tabs={["overall", "thisMonth", "thisYear"]}
        activeTab={mostLikedTab}
        onTabChange={setMostLikedTab}
      >
        {mostLiked.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No data available for this period
          </p>
        ) : (
          mostLiked.map((blog) => <BlogRow key={blog._id} blog={blog} />)
        )}
      </Section>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm hover:shadow-md transition p-5">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base font-semibold text-dark-900 dark:text-light-100">{label}</h3>
      <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
        <Icon className="text-primary-600 dark:text-primary-400" size={18} />
      </div>
    </div>
    <p className="text-3xl font-bold text-dark-900 dark:text-light-50">{value ?? 0}</p>
  </div>
);

const Section = ({ title, tabs, activeTab, onTabChange, children }) => (
  <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-5 sm:p-6 mb-8 sm:mb-10">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 sm:mb-6 gap-4">
      <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
      {tabs && (
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition ${
                activeTab === tab
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {tab === "overall"
                ? "Overall"
                : tab === "thisWeek"
                ? "This Week"
                : tab === "thisMonth"
                ? "This Month"
                : "This Year"}
            </button>
          ))}
        </div>
      )}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const BlogRow = ({ blog }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0 w-full sm:w-auto">
        <div className="w-14 h-10 sm:w-16 sm:h-12 rounded overflow-hidden flex-shrink-0">
          <img
            src={MEDIA_BASE_URL + blog.coverImage?.url || "https://via.placeholder.com/64x48"}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            onClick={() => navigate(`/blogs/${blog._id}`)}
            className="font-medium text-dark-900 dark:text-light-100 line-clamp-1 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition text-base sm:text-lg"
          >
            {blog.title}
          </h4>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {formatDate(blog.displayDate)}
          </p>
        </div>
      </div>
      <div className="flex gap-5 sm:gap-6 text-xs sm:text-sm shrink-0">
        <div className="flex items-center gap-1">
          <FiEye size={14} className="text-gray-500" />
          <span>{blog.views}</span>
        </div>
        <div className="flex items-center gap-1">
          <FiHeart size={14} className="text-gray-500" />
          <span>{blog.likesCount}</span>
        </div>
      </div>
    </div>
  );
};

export default Analytics;