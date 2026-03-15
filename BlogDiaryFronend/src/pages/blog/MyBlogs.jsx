import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiFileText, FiEdit3, FiCheck, FiFilter, FiX } from 'react-icons/fi';
import Loader from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import BlogCardSelf from '../../components/BlogCardSelf';
import { getMyBlogs } from '../../services/blogApi';

const MyBlogs = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMyBlogs();
      const blogArray = Array.isArray(response.data?.blogs) ? response.data.blogs : [];

      setBlogs(blogArray);
    } catch (err) {
      setError('Failed to load your blogs. Please try again.');
      console.error('Fetch blogs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  const stats = useMemo(() => {
    const safeBlogs = Array.isArray(blogs) ? blogs : [];
    return {
      total: safeBlogs.length,
      published: safeBlogs.filter((b) => b?.status === 'publish').length,
      drafts: safeBlogs.filter((b) => b?.status === 'draft').length,
    };
  }, [blogs]);

  const categories = useMemo(() => {
    const safeBlogs = Array.isArray(blogs) ? blogs : [];
    const cats = new Set(safeBlogs.map((b) => b?.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    const safeBlogs = Array.isArray(blogs) ? blogs : [];
    const query = searchQuery.toLowerCase().trim();

    return safeBlogs.filter((blog) => {
      if (!blog || !blog.title) return false;

      let matches = blog.title.toLowerCase().includes(query);

      if (!matches && blog.createdAt) {
        const created = new Date(blog.createdAt);
        if (!isNaN(created.getTime())) {
          const year = created.getFullYear().toString();
          const month = (created.getMonth() + 1).toString().padStart(2, '0');
          const day = created.getDate().toString().padStart(2, '0');

          const dateStr = `${year}-${month}-${day}`;
          const shortDate = `${year}-${month}`;
          const monthShort = created.toLocaleString('default', { month: 'short' }).toLowerCase();
          const monthLong = created.toLocaleString('default', { month: 'long' }).toLowerCase();

          if (
            dateStr.includes(query) ||
            shortDate.includes(query) ||
            `${day}-${month}-${year}`.includes(query) ||
            `${monthShort} ${year}`.includes(query) ||
            `${monthLong} ${year}`.includes(query) ||
            query.includes(monthShort) ||
            query.includes(monthLong)
          ) {
            matches = true;
          }
        }
      }

      const statusMatch = statusFilter === 'all' || blog.status === statusFilter;
      const categoryMatch = categoryFilter === 'all' || blog.category === categoryFilter;

      return matches && statusMatch && categoryMatch;
    });
  }, [blogs, searchQuery, statusFilter, categoryFilter]);

  const handlePublishSuccess = () => {
    fetchMyBlogs();
  };

  const handleDeleteSuccess = () => {
    fetchMyBlogs();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-50 dark:bg-dark-900 flex items-center justify-center">
        <Loader message="Loading your blogs..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-50 dark:bg-dark-900 flex items-center justify-center p-4">
        <EmptyState
          icon={FiFileText}
          title="Something went wrong"
          description={error}
          actionText="Try Again"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  const hasNoBlogs = filteredBlogs.length === 0;

  return (
    <div className="min-h-screen bg-light-50 dark:bg-dark-900 pb-10 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-7 sm:mb-10 gap-4 sm:gap-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-light-50">
            My Blogs
          </h1>
          <button
            onClick={() => navigate('/my-blogs/create-blog')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition shadow-sm text-sm sm:text-base w-full sm:w-auto"
          >
            <FiPlus size={16} />
            Post New Blog
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-dark-900 dark:text-light-100">Total Blogs</h3>
              <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                <FiFileText className="text-primary-600 dark:text-primary-400" size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark-900 dark:text-light-50">{stats.total}</p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-dark-900 dark:text-light-100">Published</h3>
              <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                <FiCheck className="text-primary-600 dark:text-primary-400" size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark-900 dark:text-light-50">{stats.published}</p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-dark-900 dark:text-light-100">Drafts</h3>
              <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                <FiEdit3 className="text-primary-600 dark:text-primary-400" size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-dark-900 dark:text-light-50">{stats.drafts}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden mb-8 sm:mb-12">
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-dark-900 dark:text-light-50">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              {showFilters ? <FiX size={20} /> : <FiFilter size={20} />}
              {showFilters ? 'Hide' : 'Show Filters'}
            </button>
          </div>

          {(showFilters || window.innerWidth >= 640) && (
            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-end">
                <div className="w-full sm:w-80 lg:w-96">
                  <label className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-1.5">
                    Search
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 dark:text-light-500" size={18} />
                    <input
                      type="text"
                      placeholder="Search by title or date..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-light-50 placeholder-dark-400 dark:placeholder-light-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-5">
                  <div className="w-full sm:w-40">
                    <label className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-1.5">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-light-50 focus:border-primary-500 transition-all text-sm sm:text-base"
                    >
                      <option value="all">All</option>
                      <option value="publish">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="w-full sm:w-64 lg:w-72">
                    <label className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-1.5">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-light-50 focus:border-primary-500 transition-all text-sm sm:text-base"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === 'all' ? 'All Categories' : cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-dark-900 dark:text-light-50">My Blogs</h2>
          </div>

          {hasNoBlogs ? (
            <EmptyState
              icon={FiEdit3}
              title="No blogs found"
              description={
                searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : "You haven't published any blog posts yet."
              }
              actionText="Post Your First Blog"
              onAction={() => navigate('/my-blogs/create-blog')}
            />
          ) : (
            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredBlogs.map((blog) => (
                <BlogCardSelf
                  key={blog._id}
                  blog={blog}
                  onPublishSuccess={handlePublishSuccess}
                  onDeleteSuccess={handleDeleteSuccess}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBlogs;