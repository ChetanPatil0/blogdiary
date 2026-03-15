import api from "./api";




export const getAllBlogs = async (page = 1, limit = 10, category = '', search = '',isAdmin = false) => {
  const response = await api.get('/blogs', { params: { page, limit, category, search ,isAdmin} });
  return response.data;
};

export const getBlogById = async (id, userId) => {
  const response = await api.get(`/blogs/${id}`, {
    params: userId ? { userId } : {}
  });

  return response.data;
};




export const getFeaturedBlogs = async () => {
  const response = await api.get('/blogs/featured');
  return response.data;
};

export const getLatestBlogs = async (limit = 10) => {
  const response = await api.get('/blogs/latest', { params: { limit } });
  return response.data;
};

export const getMyBlogs = async () => {
  const response = await api.get('/blogs/my-blogs');
  return response.data;
};


export const getPopularBlogs = async (limit = 10) => {
  const response = await api.get('/blogs/popular', { params: { limit } });
  return response.data;
};


export const getBlogsByCategory = async (category, page = 1, limit = 10) => {
  const response = await api.get(`/blogs/category/${category}`, { params: { page, limit } });
  return response.data;
};


export const getCategories = async () => {
  const response = await api.get('/blogs/categories');
  return response.data;
};




export const getRelatedBlogs = async (params = {}) => {
  const response = await api.get('/blogs/related', { params });
  return response.data;
};


export const createBlog = async (formData) => {
  const response = await api.post('/blogs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const publishBlog = async (blogId) => {
  const response = await api.patch(`/blogs/${blogId}/publish`);
  return response.data;
};


export const updateBlog = async (id, formData) => {
  const response = await api.put(`/blogs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteBlog = async (id) => {
  const response = await api.delete(`/blogs/${id}`);
  return response.data;
};


export const likeBlog = async (id) => {
  const response = await api.post(`/blogs/${id}/like`);
  return response.data;
};


export const getBlogAnalytics = async () => {
  const response = await api.get('/blogs/analytics');
  return response.data;
};


export const getBlogDashboardAnalytics = async () => {
  const response = await api.get('/blogs/dashboard-analytics');
  return response.data;
};

export const recordBlogView = async (blogId, userId = null) => {
  const response = await api.post(`/blogs/${blogId}/mark-view`, {
    userId
  });

  return response.data;
};