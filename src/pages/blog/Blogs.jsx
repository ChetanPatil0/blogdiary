import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import Loader from '../../components/Loader';
import BlogCard from '../../components/BlogCard';
import {
  getFeaturedBlogs,
  getPopularBlogs,
  getLatestBlogs,
  getCategories,
  getBlogsByCategory,
} from '../../services/blogApi';

const Blogs = () => {
  const navigate = useNavigate(); 

  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const [latest, setLatest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryBlogs, setCategoryBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState({
    featured: true,
    popular: true,
    latest: true,
    categories: true,
    categoryBlogs: false,
  });

  const featuredRef = useRef(null);
  const popularRef = useRef(null);

  const scroll = (ref, direction) => {
    if (!ref.current) return;
    const scrollAmount = ref.current.clientWidth * 0.75;
    ref.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading((prev) => ({ ...prev, categories: true }));
        const res = await getCategories();
        setCategories(res?.data?.categories || res?.data || []);
      } catch (err) {
        console.error('Categories failed:', err);
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    };
    fetchCategories();
  }, []);

  // Fetch featured, popular, latest
  useEffect(() => {
    const fetchHighlighted = async () => {
      try {
        const [fRes, pRes, lRes] = await Promise.all([
          getFeaturedBlogs(),
          getPopularBlogs(8),
          getLatestBlogs(9),
        ]);
        setFeatured(fRes?.data?.blogs || fRes?.data || []);
        setPopular(pRes?.data?.blogs || pRes?.data || []);
        setLatest(lRes?.data?.blogs || lRes?.data || []);
      } catch (err) {
        console.error('Highlighted failed:', err);
      } finally {
        setLoading((prev) => ({
          ...prev,
          featured: false,
          popular: false,
          latest: false,
        }));
      }
    };
    fetchHighlighted();
  }, []);

  // Fetch blogs by selected category
  useEffect(() => {
    if (selectedCategory) {
      const fetchCategoryBlogs = async () => {
        try {
          setLoading((prev) => ({ ...prev, categoryBlogs: true }));
          const res = await getBlogsByCategory(selectedCategory, 1, 20);
          setCategoryBlogs(res?.data?.blogs || []);
        } catch (err) {
          console.error('Category blogs failed:', err);
          setCategoryBlogs([]);
        } finally {
          setLoading((prev) => ({ ...prev, categoryBlogs: false }));
        }
      };
      fetchCategoryBlogs();
    } else {
      setCategoryBlogs([]);
    }
  }, [selectedCategory]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory((prev) => (prev === cat ? '' : cat));
  };

  const handleSearch = () => {
    const searchParams = new URLSearchParams();

    if (search.trim()) {
      searchParams.set('search', search.trim());
    }
    if (selectedCategory) {
      searchParams.set('category', selectedCategory);
    }

    navigate({
      pathname: '/blogs/all-blogs',
      search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    // Optional: remove query params from URL
    // navigate('/blogs', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 -left-40 w-80 h-80 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Articles
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Discover guides, tutorials, insights and stories from our community
          </p>

          <div className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
                <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 min-w-[140px]"
              >
                Search
                <FiArrowRight className="w-5 h-5" />
              </button>
            </div>

            {(search || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
              >
                ✕ Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-16">
        {!loading.categories && categories.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Explore Topics
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleCategorySelect('')}
                className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All Topics
              </button>
              {categories.map((cat) => {
                const value = typeof cat === 'string' ? cat : cat.name || cat.slug || cat._id || cat;
                return (
                  <button
                    key={value}
                    onClick={() => handleCategorySelect(value)}
                    className={`px-6 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                      selectedCategory === value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {selectedCategory && (
          <section className="mb-20">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedCategory} Articles
              </h2>
            </div>

            {loading.categoryBlogs ? (
              <div className="flex justify-center py-20">
                <Loader message="Loading articles..." />
              </div>
            ) : categoryBlogs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryBlogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No articles found in this category
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back later for new content
                </p>
              </div>
            )}
          </section>
        )}

        {featured.length > 0 && !loading.featured && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Featured
            </h2>
            <div className="relative">
              <button
                onClick={() => scroll(featuredRef, 'left')}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hidden sm:flex"
              >
                <FiChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>

              <div
                ref={featuredRef}
                className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
              >
                {featured.map((blog) => (
                  <div key={blog._id} className="flex-shrink-0 w-80 md:w-96 snap-start">
                    <BlogCard blog={blog} />
                  </div>
                ))}
              </div>

              <button
                onClick={() => scroll(featuredRef, 'right')}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hidden sm:flex"
              >
                <FiChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </section>
        )}

        {popular.length > 0 && !loading.popular && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Popular Right Now
            </h2>
            <div className="relative">
              <button
                onClick={() => scroll(popularRef, 'left')}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hidden sm:flex"
              >
                <FiChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>

              <div
                ref={popularRef}
                className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
              >
                {popular.map((blog) => (
                  <div key={blog._id} className="flex-shrink-0 w-80 md:w-96 snap-start">
                    <BlogCard blog={blog} />
                  </div>
                ))}
              </div>

              <button
                onClick={() => scroll(popularRef, 'right')}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hidden sm:flex"
              >
                <FiChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </section>
        )}

        {latest.length > 0 && !loading.latest && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Latest Posts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {latest.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Blogs;