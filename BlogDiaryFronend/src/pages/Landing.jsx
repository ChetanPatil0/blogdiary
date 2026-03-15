



import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { MEDIA_BASE_URL } from '../services/api';
import { getPopularBlogs, getLatestBlogs } from '../services/blogApi';
import BlogCard from '../components/BlogCard';
import HorizontalBlogCard from '../components/HorizontalBlogCard';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [popularBlogs, setPopularBlogs] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);

  const popularRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [popularRes, latestRes] = await Promise.all([
          getPopularBlogs(12),
          getLatestBlogs(5),
        ]);

        setPopularBlogs(popularRes?.data || popularRes || []);
        setLatestBlogs(latestRes?.data || latestRes || []);
      } catch (err) {
        console.error('Landing fetch error:', err);
      } finally {
        setLoadingPopular(false);
        setLoadingLatest(false);
      }
    };

    fetchData();
  }, []);

  const scrollPopular = (direction) => {
    if (!popularRef.current) return;
    const cardWidth = popularRef.current.children[0]?.offsetWidth + 24 || 360;
    popularRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  };

  const showLatestSection = !loadingLatest && latestBlogs.length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <section className="relative min-h-[80vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 animate-slow-gradient" />

        <div className="relative z-10 max-w-6xl mx-auto px-5 py-12 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight">
            Share Your Story with <span className="text-primary-600">BlogDiary</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            Write, publish, and discover thoughtful content in a clean space.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/create-blog')}
                className="flex items-center gap-2 px-7 py-3.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-md font-semibold"
              >
                Create Post
                <FiArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={() => navigate('/signup')}
                className="flex items-center gap-2 px-7 py-3.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-md font-semibold"
              >
                Get Started Free
                <FiArrowRight size={18} />
              </button>
            )}

            <button
              onClick={() => navigate('/blogs')}
              className="flex items-center gap-2 px-7 py-3.5 border-2 border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-400 rounded-xl hover:bg-primary-50 dark:hover:bg-gray-800/50 transition font-semibold"
            >
              Explore Blogs
              <FiArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
            <Link
              to="/blogs?sort=popular"
              className="text-primary-600 hover:text-primary-700 text-sm md:text-base font-medium flex items-center gap-1.5"
            >
              View All <FiArrowRight size={16} />
            </Link>
          </div>

          <div className="relative">
            <button
              onClick={() => scrollPopular('left')}
              className="absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-2.5 md:p-3 rounded-full shadow-md  hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FiArrowLeft size={20} />
            </button>

            <div
              ref={popularRef}
              className="flex overflow-x-auto gap-5 pb-6 snap-x snap-mandatory scroll-smooth no-scrollbar"
            >
              {loadingPopular ? (
                <div className="w-full text-center py-16 text-gray-500">Loading trending posts...</div>
              ) : popularBlogs.length === 0 ? (
                <div className="w-full text-center py-16 text-gray-500">No trending posts yet</div>
              ) : (
                popularBlogs.map((blog) => (
                  <div key={blog._id} className="min-w-[280px] sm:min-w-[320px] md:min-w-[360px] snap-start">
                    <BlogCard blog={blog} />
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => scrollPopular('right')}
              className="absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-2.5 md:p-3 rounded-full shadow-md  hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FiArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {showLatestSection && (
        <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900/40">
          <div className="max-w-5xl mx-auto px-5">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
              Latest Posts
            </h2>

            <div className="space-y-10 md:space-y-12">
              {latestBlogs.map((blog) => {
                let displayDesc = blog.description?.trim();

                if (!displayDesc && blog.content) {
                  const words = blog.content.split(/\s+/);
                  displayDesc = words.slice(0, 25).join(' ');
                  if (words.length > 25) displayDesc += '...';
                }

                if (!displayDesc) {
                  displayDesc = 'Read this interesting blog post...';
                }

                const enhancedBlog = { ...blog, description: displayDesc };

                return <HorizontalBlogCard key={blog._id} blog={enhancedBlog} />;
              })}
            </div>

           <div className="text-center mt-12 md:mt-16">
  <Link
    to="/blogs/all-blogs"
    className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 transition font-medium text-base"
  >
    View All Posts <FiArrowRight size={18} />
  </Link>
</div>

          </div>
        </section>
      )}

       
      <section className="bg-primary-600 py-16 text-white text-center">
        <div className="max-w-4xl mx-auto px-5">
          <h2 className="text-3xl font-semibold mb-4">Ready to Share Your Voice?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join BlogDiary today — write, connect, and grow your audience.
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? '/create-blog' : '/signup')}
            className="px-10 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
          >
            {isAuthenticated ? 'Create Your Blog' : 'Get Started Free'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;