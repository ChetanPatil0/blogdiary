import express from 'express';
import { createComment, getComments, updateComment, deleteComment, likeDislikeComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { commentSchema } from '../validations/schemas.js';

const router = express.Router({ mergeParams: true });

router.get('/', getComments);
router.post('/', protect, validateRequest(commentSchema), createComment);
router.put('/:commentId', protect, validateRequest(commentSchema), updateComment);
router.delete('/:commentId', protect, deleteComment);
router.post('/:commentId/like-dislike', protect, likeDislikeComment);

export default router;
