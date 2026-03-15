
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiFileText, FiHeart, FiEye, FiArrowLeft } from "react-icons/fi";

import Loader from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import Avatar from "../../components/Avatar";
import BlogCard from "../../components/BlogCard";

import { getUserDetails } from "../../services/authApi";
import { useAuthStore } from "../../store/authStore";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchUserDetails = async () => {
    try {
      const res = await getUserDetails(id);
      setData(res.data);
    } catch (error) {
      console.error(error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  if (loading) return <Loader fullScreen message="Loading user..." />;

  if (!data)
    return (
      <EmptyState
        title="User not found"
        description="This user does not exist."
        showBack
        onBack={() => navigate(-1)}
      />
    );

  const { user, stats, blogs } = data;

  const isSuperAdmin = currentUser?.role === "superadmin";

  let filteredBlogs = blogs;

  if (!isSuperAdmin) {
    filteredBlogs = blogs.filter((blog) => blog.status !== "draft");
  } else {
    if (filter === "published") {
      filteredBlogs = blogs.filter((blog) => blog.status !== "draft");
    }
    if (filter === "draft") {
      filteredBlogs = blogs.filter((blog) => blog.status === "draft");
    }
  }

  return (
    <div className="p-4  sm:p-2 max-w-7xl mx-auto space-y-4">

      <div className="flex gap-4 ">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition"
        >
          <FiArrowLeft size={18} />
          Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Details
        </h1>

        <div className="w-[70px]" />

      </div>

      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl p-6">

        <div className="flex items-center gap-6">

          <Avatar
            name={user.fullName}
            url={user.profileImage?.url}
            size="profile"
          />

          <div className="space-y-1">

            <div className="flex items-center gap-2">

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user.fullName}
              </h2>

              {user.isVerified && (
                <FiCheckCircle className="text-blue-500" />
              )}

            </div>

            <p className="text-gray-500">@{user.username}</p>

            <p className="text-sm text-gray-500">
              Joined at {new Date(user.createdAt).toLocaleDateString()}
            </p>

          </div>

        </div>

        {user.bio && (
          <p className="mt-5 text-gray-600 dark:text-gray-300 max-w-3xl">
            {user.bio}
          </p>
        )}

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-200 dark:border-dark-700 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <FiFileText size={22} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Blogs</p>
            <h3 className="text-xl font-semibold">{stats.totalBlogs}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-200 dark:border-dark-700 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30">
            <FiHeart size={22} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Likes</p>
            <h3 className="text-xl font-semibold">{stats.totalLikes}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-200 dark:border-dark-700 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30">
            <FiEye size={22} className="text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Views</p>
            <h3 className="text-xl font-semibold">{stats.totalViews}</h3>
          </div>
        </div>

      </div>

      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl p-6 space-y-6">

        <div className="flex items-center justify-between">

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Blogs
          </h2>

          {isSuperAdmin && (
            <div className="flex gap-2">

              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === "all"
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setFilter("published")}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === "published"
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                Published
              </button>

              <button
                onClick={() => setFilter("draft")}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === "draft"
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                Draft
              </button>

            </div>
          )}

        </div>

        {!filteredBlogs.length ? (
          <EmptyState
            title="No blogs found"
            description="There are no blogs in this category."
          />
        ) : (

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>

        )}

      </div>

    </div>
  );
};

export default UserDetails;

