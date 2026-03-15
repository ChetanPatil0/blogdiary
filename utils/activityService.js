import Activity from '../models/Activity.js';

import User from '../models/User.js';

export const createActivity = async (type, userId, blogId, title, description) => {
  try {
    const activity = new Activity({
      type,
      user: userId,
      blog: blogId,
      title,
      description,
    });

    await activity.save();
    return activity;
  } catch (error) {
    console.error('Activity creation error:', error);
  }
};

export const sendBlogNotification = async (type, blog, user) => {
  try {
    const blogAuthor = await User.findById(blog.author);
    if (!blogAuthor) return;

    const messages = {
      blog_created: {
        subject: 'New Blog Published!',
        title: 'Blog Published',
        body: `Your blog "${blog.title}" has been published successfully!`,
      },
      blog_updated: {
        subject: 'Blog Updated',
        title: 'Blog Updated',
        body: `Your blog "${blog.title}" has been updated.`,
      },
      blog_deleted: {
        subject: 'Blog Deleted',
        title: 'Blog Deleted',
        body: `Your blog "${blog.title}" has been deleted.`,
      },
      like: {
        subject: 'New Like!',
        title: `${user.fullName} liked your blog`,
        body: `${user.fullName} liked your blog "${blog.title}".`,
      },
      comment: {
        subject: 'New Comment!',
        title: `${user.fullName} commented on your blog`,
        body: `${user.fullName} commented on your blog "${blog.title}".`,
      },
    };

  } catch (error) {
    console.error('Notification email error:', error);
  }
};

export const getActivities = async (userId, limit = 20) => {
  try {
    const activities = await Activity.find({ user: userId })
      .sort('-createdAt')
      .limit(limit)
      .populate('blog', 'title')
      .populate('user', 'fullName profileImage');

    return activities;
  } catch (error) {
    console.error('Get activities error:', error);
    return [];
  }
};

export const markActivityAsRead = async (activityId) => {
  try {
    return await Activity.findByIdAndUpdate(
      activityId,
      { read: true },
      { new: true }
    );
  } catch (error) {
    console.error('Mark as read error:', error);
  }
};
