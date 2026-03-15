import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sendCommentNotificationEmail } from '../utils/emailService.js';

export const getComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const comments = await Comment.find({ 
      blog: blogId,
      isDeleted: false 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'fullName profileImage isVerified')
      .populate({
        path: 'parent',
        select: 'content author createdAt depth',
        populate: {
          path: 'author',
          select: 'fullName profileImage isVerified'
        }
      })
      .lean();

    const total = await Comment.countDocuments({ 
      blog: blogId,
      isDeleted: false 
    });

    sendSuccess(res, 200, {
      comments,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch comments');
  }
};

export const createComment = async (req, res) => {

  console.log('req.body : ',req.body)
  try {
    const { content, parent } = req.body;
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return sendError(res, 404, 'Blog not found');
    }

    let parentComment = null;
    let depth = 0;

    if (parent) {
      parentComment = await Comment.findById(parent);
      if (!parentComment || parentComment.blog.toString() !== blogId || parentComment.isDeleted) {
        return sendError(res, 400, 'Invalid or deleted parent comment');
      }
      depth = parentComment.depth + 1;
      if (depth > 6) {
        return sendError(res, 400, 'Maximum reply depth reached');
      }
    }

    const comment = new Comment({
      content,
      author: req.user._id,
      blog: blogId,
      parent: parent || null,
      depth,
    });

    await comment.save();
    await comment.populate('author', 'fullName profileImage isVerified');

    if (!parent) {
      blog.comments.push(comment._id);
      await blog.save();

      const blogAuthor = await User.findById(blog.author);
      if (blogAuthor) {
        await sendCommentNotificationEmail(
          blogAuthor.email,
          blogAuthor.fullName,
          req.user,
          blog.title
        );
      }
    }

    sendSuccess(res, 201, comment, 'Comment created successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Comment creation failed');
  }
};

export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { commentId } = req.params;

    const comment = await Comment.findOne({ 
      _id: commentId,
      isDeleted: false 
    });

    if (!comment) {
      return sendError(res, 404, 'Comment not found or already deleted');
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to update this comment');
    }

    comment.content = content;
    await comment.save();
    await comment.populate('author', 'fullName profileImage isVerified');

    sendSuccess(res, 200, comment, 'Comment updated successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Comment update failed');
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOne({ 
      _id: commentId,
      isDeleted: false 
    });

    if (!comment) {
      return sendError(res, 404, 'Comment not found or already deleted');
    }

    const user = req.user;
    const isOwner = comment.author.toString() === user._id.toString();
    const isAdminOrSuper = user.role === 'admin' || user.role === 'superadmin';

    if (!isOwner && !isAdminOrSuper) {
      return sendError(res, 403, 'Not authorized to delete this comment');
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    if (!comment.parent) {
      await Blog.findByIdAndUpdate(comment.blog, {
        $pull: { comments: commentId },
      });
    }

    sendSuccess(res, 200, null, 'Comment deleted successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Comment deletion failed');
  }
};



export const likeDislikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { type } = req.body;

    if (!['like', 'dislike'].includes(type)) {
      return sendError(res, 400, 'Invalid reaction type');
    }

    const comment = await Comment.findOne({
      _id: commentId,
      isDeleted: false,
    });

    if (!comment) {
      return sendError(res, 404, 'Comment not found or deleted');
    }

    const userId = req.user._id;
    const opposite = type === 'like' ? 'dislikes' : 'likes';
    const current = type === 'like' ? 'likes' : 'dislikes';

    const hasCurrent = comment[current].some(id => id.equals(userId));
    const hasOpposite = comment[opposite].some(id => id.equals(userId));

  
    if (hasOpposite) {
      comment[opposite] = comment[opposite].filter(id => !id.equals(userId));
    }

    if (hasCurrent) {
      comment[current] = comment[current].filter(id => !id.equals(userId));
    } else {
      comment[current].push(userId);
    }

    await comment.save();
    await comment.populate('author', 'fullName profileImage isVerified');

    sendSuccess(res, 200, comment, 'Reaction updated');
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Reaction failed');
  }
};