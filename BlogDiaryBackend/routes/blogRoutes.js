import express from 'express';
import {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  likeBlog,
  getFeaturedBlogs,
  getLatestBlogs,
  getPopularBlogs,
  getBlogsByCategory,
  getCategories,
  getBlogById,
  getBlogAnalytics,
  getRelatedBlogs,
  getMyBlogs,
  recordBlogView,
  getBlogDashboardAnalytics,
  publishBlog,        
} from '../controllers/blogController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createBlogSchema } from '../validations/schemas.js';
import { uploadBlogFields } from '../middleware/upload.js';

const router = express.Router();


router.get('/featured', getFeaturedBlogs);
router.get('/latest', getLatestBlogs);
router.get('/popular', getPopularBlogs);
router.get('/categories', getCategories);
router.get('/category/:category', getBlogsByCategory);
router.get('/related', getRelatedBlogs);
router.get('/', getAllBlogs);
router.get('/my-blogs', protect, getMyBlogs);

router.get('/dashboard-analytics', protect, getBlogDashboardAnalytics);  
router.get('/analytics', protect, getBlogAnalytics);   


router.get('/:id', getBlogById);
router.patch("/:id/publish", protect, publishBlog);
router.post('/:id/mark-view', recordBlogView);

router.post('/', protect, uploadBlogFields, validateRequest(createBlogSchema), createBlog);
router.put('/:id', protect, uploadBlogFields, validateRequest(createBlogSchema), updateBlog);
router.delete('/:id', protect, deleteBlog);

router.post('/:id/like', protect, likeBlog);

export default router;