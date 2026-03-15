import User from "../models/User.js";
import Blog from "../models/Blog.js";
import Activity from "../models/Activity.js";
import ViewHistory from "../models/ViewHistory.js";
import { TempUser } from "../models/TempUser.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const getAdminDashboard = async (req, res) => {
  try {

    const totalUsers = await User.countDocuments({ isDeleted: false });

    const totalBlogs = await Blog.countDocuments();

    const publishedBlogs = await Blog.countDocuments({ status: "publish" });

    const draftBlogs = await Blog.countDocuments({ status: "draft" });

    const pendingTempUsers = await TempUser.countDocuments();

    const totalViews = await ViewHistory.countDocuments();

    const likesAgg = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalLikes: { $sum: "$likesCount" }
        }
      }
    ]);

    const totalLikes = likesAgg[0]?.totalLikes || 0;

    const commentsAgg = await Blog.aggregate([
      {
        $project: {
          commentsCount: { $size: "$comments" }
        }
      },
      {
        $group: {
          _id: null,
          totalComments: { $sum: "$commentsCount" }
        }
      }
    ]);

    const totalComments = commentsAgg[0]?.totalComments || 0;

    const recentUsers = await User.find({ isDeleted: false })
      .select("fullName username email role createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentBlogs = await Blog.find()
      .select("title status views likesCount createdAt")
      .populate("author", "username fullName")
      .sort({ createdAt: -1 })
      .limit(5);

    const userActivities = recentUsers.map((user) => ({
      type: "user_registered",
      message: `${user.fullName} joined the platform`,
      user,
      createdAt: user.createdAt,
    }));

    const blogActivities = recentBlogs.map((blog) => ({
      type: blog.status === "publish" ? "blog_published" : "blog_drafted",
      message:
        blog.status === "publish"
          ? `Blog "${blog.title}" was published`
          : `Blog "${blog.title}" was saved as draft`,
      blog,
      user: blog.author,
      createdAt: blog.createdAt,
    }));

    const recentActivities = [...userActivities, ...blogActivities]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    sendSuccess(
      res,
      200,
      {
        stats: {
          totalUsers,
          totalBlogs,
          publishedBlogs,
          draftBlogs,
          pendingTempUsers,
          totalViews,
          totalLikes,
          totalComments,
        },
        recentActivities,
        recentUsers,
        recentBlogs,
      },
      "Admin dashboard data fetched"
    );

  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to load admin dashboard");
  }
};



export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "superadmin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, users, "Users fetched successfully");
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch users");
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    user.isDeleted = true;
    user.deletedAt = new Date();

    await user.save();

    sendSuccess(res, 200, null, "User deleted successfully");
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to delete user");
  }
};