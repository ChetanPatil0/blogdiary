import { useState, useEffect } from 'react';
import { FiSearch, FiChevronLeft, FiChevronRight, FiX, FiFilter } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';

import Loader from '../../components/Loader';
import BlogCard from '../../components/BlogCard';

import { getCategories, getAllBlogs } from '../../services/blogApi';

const AllBlogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'random'); // ← changed default
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '');

  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const blogsPerPage = 12;
  const maxVisibleCategories = 8;

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await getCategories();
        setCategories(res?.data?.categories || res?.data || []);
      } catch (err) {
        console.error('Categories failed:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const isAdmin = false; 

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await getAllBlogs(
          currentPage,
          blogsPerPage,
          selectedCategory,
          search,
          isAdmin,
          sort,
          dateFrom,
          dateTo
        );

        const data = res?.data || res || {};
        setBlogs(data.blogs || []);
        setTotalBlogs(data.total || 0);
        setTotalPages(data.pages || Math.ceil(data.total / blogsPerPage) || 1);
      } catch (err) {
        console.error('Blogs fetch failed:', err);
        setBlogs([]);
        setTotalPages(1);
        setTotalBlogs(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentPage, selectedCategory, search, sort, dateFrom, dateTo]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sort && sort !== 'random') params.set('sort', sort);       // ← don't save default
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    if (currentPage > 1) params.set('page', currentPage);

    setSearchParams(params, { replace: true });
  }, [search, selectedCategory, sort, dateFrom, dateTo, currentPage, setSearchParams]);

  const triggerSearch = () => {
    setSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  const handleCategorySelect = (cat) => {
    const value = typeof cat === 'string' ? cat : cat.name || cat.slug || cat._id || cat;
    setSelectedCategory((prev) => (prev === value ? '' : value));
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFromChange = (e) => {
    const newFrom = e.target.value;
    setDateFrom(newFrom);
    if (dateTo && newFrom > dateTo) setDateTo(newFrom);
    setCurrentPage(1);
  };

  const handleDateToChange = (e) => {
    const newTo = e.target.value;
    setDateTo(newTo);
    if (dateFrom && newTo < dateFrom) setDateFrom(newTo);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setSelectedCategory('');
    setSort('random');           // ← reset to random
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * blogsPerPage + 1;
  const endIndex = Math.min(currentPage * blogsPerPage, totalBlogs);

  const visibleCategories = categories.slice(0, maxVisibleCategories - 1);

  let pageTitle = 'All Articles';

  if (search) {
    pageTitle = `Results for "${search}"`;
  } else if (selectedCategory) {
    pageTitle = `${selectedCategory} Articles`;
  } else if (sort === 'popular') {
    pageTitle = 'Popular Now';
  } else if (sort === 'latest') {
    pageTitle = 'Latest Articles';
  } else if (sort === 'random') {
    pageTitle = 'All Articles';
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 -left-40 w-80 h-80 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-4 lg:px-8 py-6 md:py-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm min-w-[140px]"
              >
                <FiFilter className="w-5 h-5" />
                Filters
                {(selectedCategory || sort !== 'random' || dateFrom || dateTo) && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    {[selectedCategory, sort !== 'random', dateFrom, dateTo].filter(Boolean).length}
                  </span>
                )}
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-5 py-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-base"
                />
                <FiSearch className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              <button
                onClick={triggerSearch}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 min-w-[140px]"
              >
                Search
              </button>
            </div>

            {!categoriesLoading && categories.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider text-left">
                  Filter by Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategorySelect('')}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === ''
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    All
                  </button>

                  {visibleCategories.map((cat) => {
                    const value = typeof cat === 'string' ? cat : cat.name || cat.slug || cat._id || cat;
                    return (
                      <button
                        key={value}
                        onClick={() => handleCategorySelect(value)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                          selectedCategory === value
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}

                  {categories.length > maxVisibleCategories - 1 && (
                    <button
                      onClick={() => setFilterOpen(true)}
                      className="px-4 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      +{categories.length - (maxVisibleCategories - 1)} more
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          filterOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
            <button
              onClick={() => setFilterOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FiX className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex-1 p-6 space-y-8 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort by
              </label>
              <select
                value={sort}
                onChange={handleSortChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="random">All</option>
                <option value="latest">Latest</option>
                <option value="popular">Popular (last 30 days)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={handleDateFromChange}
                    max={dateTo || today}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={handleDateToChange}
                    min={dateFrom}
                    max={today}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {!categoriesLoading && categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategorySelect('')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === ''
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => {
                    const value = typeof cat === 'string' ? cat : cat.name || cat.slug || cat._id || cat;
                    return (
                      <button
                        key={value}
                        onClick={() => handleCategorySelect(value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                          selectedCategory === value
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                handleClearFilters();
                setFilterOpen(false);
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-md"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      {filterOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setFilterOpen(false)}
        />
      )}

      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {pageTitle}
          </h2>

          {totalBlogs > 0 && !loading && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex}–{endIndex} of {totalBlogs} articles
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader message="Loading articles..." />
          </div>
        ) : blogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 md:gap-4 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-lg transition-all ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed bg-gray-100/50 dark:bg-gray-800/30'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-1.5 md:gap-2">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) pageNum = i + 1;
                    else if (currentPage <= 4) pageNum = i + 1;
                    else if (currentPage >= totalPages - 3) pageNum = totalPages - 6 + i;
                    else pageNum = currentPage - 3 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-md text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-3 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed bg-gray-100/50 dark:bg-gray-800/30'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              No articles found
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {search || selectedCategory || dateFrom || dateTo
                ? 'Try different keywords, category or date range'
                : 'No articles available yet — check back soon!'}
            </p>
            {(search || selectedCategory || dateFrom || dateTo || sort !== 'random') && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllBlogs;