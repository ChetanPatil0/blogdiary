import Activity from '../models/Activity.js';
import { sendSuccess, sendError } from '../utils/response.js';


export const getActivities = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('blog', 'title')
      .populate('user', 'fullName profileImage isVerified');

    const unreadCount = await Activity.countDocuments({
      user: req.user._id,
      read: false,
    });

    sendSuccess(res, 200, { activities, unreadCount });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch activities');
  }
};


export const markActivityAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!activity) {
      return sendError(res, 404, 'Activity not found');
    }

    sendSuccess(res, 200, activity, 'Activity marked as read');
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to mark activity as read');
  }
};


export const clearActivities = async (req, res) => {
  try {
    await Activity.deleteMany({ user: req.user._id });
    sendSuccess(res, 200, null, 'All activities cleared');
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to clear activities');
  }
};

export const getUnreadActivitiesCount = async (req, res) => {
  try {
    const unreadCount = await Activity.countDocuments({
      user: req.user._id,
      read: false,
    });

    sendSuccess(res, 200, { unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    sendError(res, 500, 'Failed to get unread notifications count');
  }
};