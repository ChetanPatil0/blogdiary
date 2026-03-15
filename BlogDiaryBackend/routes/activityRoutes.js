import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getActivities,
  markActivityAsRead,
  clearActivities,
  getUnreadActivitiesCount,
} from '../controllers/activityController.js';

const router = express.Router();

router.get('/', protect, getActivities);
router.get('/unread-count', protect, getUnreadActivitiesCount);
router.patch('/:id/read', protect, markActivityAsRead);
router.delete('/clear-all', protect, clearActivities);

export default router;
