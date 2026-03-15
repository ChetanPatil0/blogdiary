import { create } from 'zustand';
import { blogAPI } from '../services/api';

export const useBlogStore = create((set, get) => ({
  blogs: [],
  featuredBlogs: [],
  currentBlog: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0 },

  fetchBlogs: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await blogAPI.getAll(page, limit);
      set({
        blogs: response.data.data,
        pagination: {
          page,
          limit,
          total: response.data.pagination?.total || 0,
        },
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch blogs', loading: false });
      throw error;
    }
  },

  fetchFeaturedBlogs: async () => {
    set({ loading: true });
    try {
      const response = await blogAPI.getFeatured();
      set({ featuredBlogs: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch featured blogs', loading: false });
    }
  },

  fetchBlogById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await blogAPI.getById(id);
      set({ currentBlog: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch blog', loading: false });
      throw error;
    }
  },

  fetchLatestBlogs: async (limit = 10) => {
    try {
      const response = await blogAPI.getLatest(limit);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  fetchPopularBlogs: async (limit = 10) => {
    try {
      const response = await blogAPI.getPopular(limit);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  fetchByCategory: async (category, page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await blogAPI.getByCategory(category, page);
      set({
        blogs: response.data.data,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch blogs', loading: false });
      throw error;
    }
  },

  createBlog: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await blogAPI.create(formData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create blog', loading: false });
      throw error;
    }
  },

  updateBlog: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const response = await blogAPI.update(id, formData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update blog', loading: false });
      throw error;
    }
  },

  deleteBlog: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await blogAPI.delete(id);
      set((state) => ({
        blogs: state.blogs.filter(b => b._id !== id),
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete blog', loading: false });
      throw error;
    }
  },

  likeBlog: async (id) => {
    try {
      const response = await blogAPI.like(id);
      set((state) => ({
        currentBlog: state.currentBlog?._id === id 
          ? { ...state.currentBlog, ...response.data.data }
          : state.currentBlog,
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
