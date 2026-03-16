import Blog from "../models/Blog.js";
import User from "../models/User.js";
import { sendSuccess, sendError, addDisplayDate } from "../utils/response.js";
import { uploadBlogImages, deleteBlogImages, cleanupUploadedFiles } from "../utils/uploadManager.js";
import {
  sendBlogPublishedEmail,
  sendBlogUpdatedEmail,
  sendBlogDeletedEmail,
  sendLikeNotificationEmail,
  sendCommentNotificationEmail,
} from "../utils/emailService.js";
import ViewHistory from "../models/ViewHistory.js";
import mongoose from "mongoose";

import { createActivity } from "../utils/activityService.js";


export const createBlog = async (req, res) => {
  let uploadedFilesToClean = [];

  try {
    const { title, description, content, category, tags, status } = req.body;

    if (!req.files?.coverImage?.[0]) {
      return sendError(res, 400, "Cover image is required");
    }

    const coverUpload = uploadBlogImages(
      [req.files.coverImage[0]],
      req.user._id.toString(),
    );

    if (!coverUpload.success || !coverUpload.files.length) {
      return sendError(res, 400, "Failed to upload cover image");
    }

    const coverImage = coverUpload.files[0];
    uploadedFilesToClean.push(coverImage);

    let additionalImages = [];
    if (req.files?.images?.length) {
      const imagesUpload = uploadBlogImages(
        req.files.images,
        req.user._id.toString(),
      );

      if (imagesUpload.success && imagesUpload.files.length) {
        additionalImages = imagesUpload.files;
        uploadedFilesToClean.push(...additionalImages);
      }
    }

    let tagsArray = [];
    if (typeof tags === "string") {
      tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
    } else if (Array.isArray(tags)) {
      tagsArray = tags.map((t) => t.trim()).filter(Boolean);
    }

    const now = new Date();

    const blog = new Blog({
      title,
      description,
      content,
      category,
      tags: tagsArray,
      author: req.user._id,
      coverImage,
      images: additionalImages,
      status: status === "draft" ? "draft" : "publish",
      draftedAt: status === "draft" || !status ? now : null,
      publishedAt: status === "publish" ? now : null,
      views: 0,
      likesCount: 0,
    });

    await blog.save();
    await blog.populate("author", "fullName email profileImage isVerified");

    if (blog.status === "publish" && req.user?.emailNotifications) {
      await sendBlogPublishedEmail(req.user.email, req.user.fullName, title);
    }

    await User.findByIdAndUpdate(req.user._id, {
      $push: { blogs: blog._id },
    });

    createActivity("blog_published", req.user._id, blog._id, title, description);

    uploadedFilesToClean = [];

    sendSuccess(res, 201, blog, `Blog created successfully as ${blog.status}`);
  } catch (error) {
    console.error(error);

    if (uploadedFilesToClean.length > 0) {
      cleanupUploadedFiles(uploadedFilesToClean);
    }

    sendError(res, 500, "Blog creation failed");
  }
};

export const updateBlog = async (req, res) => {
  let filesToCleanOnFailure = [];

  try {
    const { id } = req.params;
    const { title, description, content, category, tags, status } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) return sendError(res, 404, "Blog not found");

    if (blog.author.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Not authorized to update this blog");
    }

    if (req.files?.coverImage?.[0]) {
      if (blog.coverImage) {
        deleteBlogImages(req.user._id.toString(), [blog.coverImage]);
      }

      const coverUpload = uploadBlogImages(
        [req.files.coverImage[0]],
        req.user._id.toString(),
      );

      if (!coverUpload.success || !coverUpload.files.length) {
        return sendError(res, 400, "Failed to upload new cover image");
      }

      blog.coverImage = coverUpload.files[0];
      filesToCleanOnFailure.push(blog.coverImage);
    }

    if (req.files?.images?.length) {
      const imagesUpload = uploadBlogImages(
        req.files.images,
        req.user._id.toString(),
      );

      if (imagesUpload.success && imagesUpload.files.length) {
        blog.images = [...(blog.images || []), ...imagesUpload.files];
        filesToCleanOnFailure.push(...imagesUpload.files);
      }
    }

    if (title) blog.title = title;
    if (description) blog.description = description;
    if (content) blog.content = content;
    if (category) blog.category = category;

    if (tags) {
      if (typeof tags === "string") {
        blog.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
      } else if (Array.isArray(tags)) {
        blog.tags = tags.map((t) => t.trim()).filter(Boolean);
      }
    }

    if (status) {
      if (status === "publish" && blog.status === "draft") {
        blog.status = "publish";
        blog.publishedAt = new Date();
      }
    }

    await blog.save();
    await blog.populate("author", "fullName email profileImage isVerified");

    if (blog.status === "publish" && req.user?.emailNotifications) {
      await sendBlogUpdatedEmail(
        req.user.email,
        req.user.fullName,
        blog.title,
      );
    }

    createActivity(
      "blog_updated",
      req.user._id,
      blog._id,
      blog.title,
      blog.description,
    );

    filesToCleanOnFailure = [];

    sendSuccess(res, 200, blog, "Blog updated successfully");
  } catch (error) {
    console.error(error);

    if (filesToCleanOnFailure.length > 0) {
      cleanupUploadedFiles(filesToCleanOnFailure);
    }

    sendError(res, 500, "Blog update failed");
  }
};
export const publishBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return sendError(res, 404, "Blog not found");
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Not authorized to publish this blog");
    }

    if (blog.status === "publish") {
      return sendError(res, 400, "This blog is already published");
    }

    if (blog.status !== "draft") {
      return sendError(res, 400, "Only drafts can be published");
    }


    blog.status = "publish";
    blog.publishedAt = new Date();

    await blog.save();
    await blog.populate("author", "fullName email profileImage isVerified");

    if (req.user?.emailNotifications) {
      await sendBlogPublishedEmail(
        req.user.email,
        req.user.fullName,
        blog.title
      );
    }

    createActivity(
      "blog_published",
      req.user._id,
      blog._id,
      blog.title,
      blog.description
    );

    sendSuccess(res, 200, blog, "Blog published successfully");
  } catch (error) {
    console.error("Publish error:", error);
    sendError(res, 500, "Failed to publish blog");
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return sendError(res, 404, "Blog not found");
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Not authorized to delete this blog");
    }

    // Delete images
    if (blog.images && blog.images.length > 0) {
      deleteBlogImages(req.user._id.toString(), blog.images);
    }

    const title = blog.title;
    await Blog.findByIdAndDelete(id);

    // Remove from user's blogs
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { blogs: id },
    });

    if (req.user.emailNotifications) {
      await sendBlogDeletedEmail(req.user.email, req.user.fullName, title);
    }

    createActivity(
      "blog_deleted",
      req.user._id,
      blog._id,
      title,
      blog.description,
    );
    sendSuccess(res, 200, null, "Blog deleted successfully");
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Blog deletion failed");
  }
};

export const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return sendError(res, 404, "Blog not found");
    }

    const likeIndex = blog.likes.indexOf(req.user._id);

    let isLiked = false;

    if (likeIndex > -1) {
      blog.likes.splice(likeIndex, 1);
      blog.likesCount = Math.max(0, blog.likesCount - 1);
      isLiked = false;
    } else {
      blog.likes.push(req.user._id);
      blog.likesCount = (blog.likesCount || 0) + 1;
      isLiked = true;

      const author = await User.findById(blog.author);

      if (req.user.emailNotifications) {
        await sendLikeNotificationEmail(
          author.email,
          author.fullName,
          req.user,
          blog.title,
        );
      }
    }

    await blog.save();
    createActivity(
      "like",
      req.user._id,
      blog._id,
      blog.title,
      `${req.user.fullName} ${isLiked ? "liked" : "unliked"} your blog`,
    );

    res.status(200).json({
      success: true,
      blogId: blog._id,
      isLiked,
      likesCount: blog.likesCount,
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Like action failed");
  }
};


export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
      console.log('user id ',req.query.userId,'test',userId)

    const blog = await Blog.findById(id)
      .populate("author", "fullName username email profileImage isVerified")
      .populate("comments.author", "fullName username profileImage isVerified");

    if (!blog) {
      return sendError(res, 404, "Blog not found");
    }

  
    if (blog.status === "draft") {

      if (!userId) {
        return sendError(res, 403, "This blog is not published yet");
      }

      const requestingUser = await User.findById(userId).select("isAdmin");

      if (!requestingUser) {
        return sendError(res, 403, "Invalid user");
      }

     
      
      const isAuthor = blog.author._id.toString() === userId.toString();
      const isAdmin  = requestingUser.isAdmin === true;


      if (!isAuthor && !isAdmin) {
        return sendError(res, 403, "This blog is not published yet");
      }
    }

    const blogWithDate = addDisplayDate([blog])[0];

    const isLiked = userId ? blogWithDate.likes.includes(userId) : false;
    blogWithDate.isLiked = isLiked;

    return sendSuccess(res, 200, blogWithDate, "Blog fetched successfully");

  } catch (error) {
    console.error("Get blog error:", error);
    return sendError(res, 500, "Failed to fetch blog");
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      status,
      sort = "latest",
      isAdmin = "false",
    } = req.query;

    const admin = isAdmin === "true";
    

    let query = {};

   

    if (admin) {
      console.log('Admin query with status:', status)
     
      if (status) {
        query.status = status; 
      }
   
    } else {
    
      query.status = status || "publish";
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      const searchConditions = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];

      const parsedDate = new Date(search);
      if (!isNaN(parsedDate.getTime())) {
        const nextDay = new Date(parsedDate);
        nextDay.setDate(parsedDate.getDate() + 1);

        searchConditions.push({
          publishedAt: { $gte: parsedDate, $lt: nextDay },
        });
      }

      if (isAdmin) {
        const users = await User.find({
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }).select("_id");

        if (users.length) {
          searchConditions.push({
            author: { $in: users.map((u) => u._id) },
          });
        }
      }

      query.$or = searchConditions;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let blogs = [];
    let total = 0;

    if (sort === "random") {
      const allMatching = await Blog.find(query)
        .populate("author", "fullName email profileImage isVerified")
        .lean();

      total = allMatching.length;

      for (let i = allMatching.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allMatching[i], allMatching[j]] = [allMatching[j], allMatching[i]];
      }

      blogs = allMatching.slice(skip, skip + limitNum);
      blogs = blogs.map((blog) => ({
        ...blog,
        isLiked: req.user ? blog.likes.some((id) => id.equals(req.user._id)) : false,
      }));

      blogs = addDisplayDate(blogs);
    } else if (sort === "popular") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const aggResult = await Blog.aggregate([
        { $match: query },

        {
          $lookup: {
            from: "viewhistories",
            let: { blogId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$blog", "$$blogId"] },
                      { $gte: ["$viewedAt", thirtyDaysAgo] },
                    ],
                  },
                },
              },
            ],
            as: "recentViews",
          },
        },

        {
          $addFields: {
            recentViewsCount: { $size: "$recentViews" },
          },
        },

        {
          $sort: {
            recentViewsCount: -1,
            likesCount: -1,
            createdAt: -1,
          },
        },

        { $skip: skip },
        { $limit: limitNum },

        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },

        {
          $project: {
            recentViews: 0,
            "author.password": 0,
            "author.__v": 0,
            "author.fullName": 1,
            "author.email": 1,
            "author.profileImage": 1,
            "author.isVerified": 1,
          },
        },
      ]);

      blogs = aggResult.map((blog) => ({
        ...blog,
        isLiked: req.user ? blog.likes?.some((id) => id.equals(req.user._id)) : false,
      }));

      blogs = addDisplayDate(blogs);

      total = await Blog.countDocuments(query);
    } else {
      // default sort = latest
      blogs = await Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("author", "fullName username email profileImage isVerified")
        .lean();

      blogs = blogs.map((blog) => ({
        ...blog,
        isLiked: req.user ? blog.likes.some((id) => id.equals(req.user._id)) : false,
      }));

      blogs = addDisplayDate(blogs);

      total = await Blog.countDocuments(query);
    }

    sendSuccess(res, 200, {
      blogs,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      sortUsed: sort,
    });
  } catch (error) {
    console.error("Get all blogs error:", error);
    sendError(res, 500, "Failed to fetch blogs");
  }
};

export const getMyBlogs = async (req, res) => {
  try {
    const query = {
      author: req.user._id,
    };

    let blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .select(
        "title description category tags status coverImage likesCount views createdAt publishedAt draftedAt",
      )
      .lean();

    blogs = addDisplayDate(blogs);

    const total = blogs.length;

    sendSuccess(res, 200, {
      blogs,
      total,
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch your blogs");
  }
};

export const getFeaturedBlogs = async (req, res) => {
  try {
    let blogs = await Blog.find({ status: "publish" })
  .sort({ likesCount: -1 })
  .limit(6)
  .populate("author", "fullName username profileImage isVerified");

    blogs = blogs.map((blog) => {
      const blogObj = blog.toObject();
      blogObj.isLiked = req.user ? blog.likes.includes(req.user._id) : false;
      return blogObj;
    });

    blogs = addDisplayDate(blogs);

    sendSuccess(res, 200, blogs);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch featured blogs");
  }
};

export const getLatestBlogs = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

   let blogs = await Blog.find({ status: "publish" })
  .sort({ createdAt: -1 })
  .limit(parseInt(limit))
  .populate("author", "fullName username profileImage isVerified");

    blogs = blogs.map((blog) => {
      const blogObj = blog.toObject();
      blogObj.isLiked = req.user ? blog.likes.includes(req.user._id) : false;
      return blogObj;
    });

    blogs = addDisplayDate(blogs);

    sendSuccess(res, 200, blogs);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch latest blogs");
  }
};

export const getPopularBlogs = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    let blogs = await Blog.find({ status: "publish" })
  .sort({ views: -1 })
  .limit(parseInt(limit))
  .populate("author", "fullName username profileImage isVerified");

    blogs = blogs.map((blog) => {
      const blogObj = blog.toObject();
      blogObj.isLiked = req.user ? blog.likes.includes(req.user._id) : false;
      return blogObj;
    });

    blogs = addDisplayDate(blogs);

    sendSuccess(res, 200, blogs);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch popular blogs");
  }
};

export const getBlogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

   let blogs = await Blog.find({ category, status: "publish" })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(parseInt(limit))
  .populate("author", "fullName username profileImage isVerified");

    blogs = blogs.map((blog) => {
      const blogObj = blog.toObject();
      blogObj.isLiked = req.user ? blog.likes.includes(req.user._id) : false;
      return blogObj;
    });

    blogs = addDisplayDate(blogs);

    const total = await Blog.countDocuments({ category });

    sendSuccess(res, 200, {
      blogs,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch blogs by category");
  }
};

export const getRelatedBlogs = async (req, res) => {
  try {
    const { category, tags, limit = 4, excludeId } = req.query;

    if (!category && (!tags || tags.length === 0)) {
      return sendError(res, 400, "Provide at least category or tags");
    }

    const query = {
      status: "publish",
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(",");
      if (tagArray.length > 0) {
        query.tags = { $in: tagArray };
      }
    }

    let related = await Blog.find(query)
      .select(
        "title description coverImage views likesCount createdAt publishedAt author tags",
      )
      .populate("author", "fullName profileImage isVerified")
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    related = addDisplayDate(related);

    sendSuccess(res, 200, related);
  } catch (error) {
    console.error("Error fetching related blogs:", error);
    sendError(res, 500, "Failed to fetch related blogs");
  }
};

export const recordBlogView = async (req, res) => {
  console.log('recordBlogView called with params:', req.params, 'and body:', req.body); 
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid blog ID");
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return sendError(res, 404, "Blog not found");
    }

    let skipView = false;
    if (userId && mongoose.isValidObjectId(userId)) {
      if (userId.toString() === blog.author.toString()) {
        skipView = true;
      }
    }

    // if (skipView) {
    //   return sendSuccess(res, 200, { message: "Author view not counted" });
    // }

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.ip ||
      req.connection.remoteAddress ||
      "anonymous";

    await ViewHistory.create({
      blog: id,
      user: userId && mongoose.isValidObjectId(userId) ? userId : null,
      ip,
      viewedAt: new Date(),
    });

    blog.views = (blog.views || 0) + 1;
    await blog.save();

    return sendSuccess(res, 200, {
      message: "View recorded",
      totalViews: blog.views,
    });
  } catch (error) {
    console.error("Error recording view:", error);
    return sendError(res, 500, "Failed to record view");
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    sendSuccess(res, 200, categories);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch categories");
  }
};


export const getBlogAnalytics = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user.role === "superadmin" || user.role === "admin";
    const authorFilter = isAdmin ? {} : { author: user._id };

    const now = new Date();
    const startOfMonth = new Date(now);
    startOfMonth.setDate(startOfMonth.getDate() - 30);
    const startOfYear = new Date(now);
    startOfYear.setFullYear(startOfYear.getFullYear() - 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

   
    const overallStats = await Blog.aggregate([
      { $match: authorFilter },
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          totalPublished: {
            $sum: { $cond: [{ $eq: ["$status", "publish"] }, 1, 0] },
          },
          totalDrafts: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likesCount" },
        },
      },
    ]);

    const stats = overallStats[0] || {
      totalBlogs: 0,
      totalPublished: 0,
      totalDrafts: 0,
      totalViews: 0,
      totalLikes: 0,
    };




    const topBlogsOverall = addDisplayDate(
      await Blog.find(authorFilter)
        .sort({ views: -1 })
        .limit(3)
        .select("title views likesCount coverImage.url createdAt draftedAt publishedAt")
    );

    const topBlogsThisWeek = addDisplayDate(
      await Blog.find({
        ...authorFilter,
        createdAt: { $gte: startOfWeek },
      })
        .sort({ views: -1 })
        .limit(3)
        .select("title views likesCount coverImage.url createdAt draftedAt publishedAt")
    );

    const topBlogsThisMonth = addDisplayDate(
      await Blog.find({
        ...authorFilter,
        createdAt: { $gte: startOfMonth },
      })
        .sort({ views: -1 })
        .limit(3)
        .select("title views likesCount coverImage.url createdAt draftedAt publishedAt")
    );

    const topBlogsThisYear = addDisplayDate(
      await Blog.find({
        ...authorFilter,
        createdAt: { $gte: startOfYear },
      })
        .sort({ views: -1 })
        .limit(3)
        .select("title views likesCount coverImage.url createdAt draftedAt publishedAt")
    );

    // ── Most Liked Blogs ────────────────────────────────────────────────────
    const mostLikedOverall = addDisplayDate(
      await Blog.find(authorFilter)
        .sort({ likesCount: -1 })
        .limit(3)
        .select("title likesCount views coverImage.url createdAt draftedAt publishedAt")
    );

    const mostLikedThisMonth = addDisplayDate(
      await Blog.find({
        ...authorFilter,
        createdAt: { $gte: startOfMonth },
      })
        .sort({ likesCount: -1 })
        .limit(3)
        .select("title likesCount views coverImage.url createdAt draftedAt publishedAt")
    );

    const mostLikedThisYear = addDisplayDate(
      await Blog.find({
        ...authorFilter,
        createdAt: { $gte: startOfYear },
      })
        .sort({ likesCount: -1 })
        .limit(3)
        .select("title likesCount views coverImage.url createdAt draftedAt publishedAt")
    );

    // ── Daily Views Trend (last 30 days) ────────────────────────────────────
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyViews = await ViewHistory.aggregate([
      {
        $match: {
          blog: { $in: await Blog.distinct("_id", authorFilter) },
          viewedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$viewedAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const viewTrend = dailyViews.map((item) => ({
      date: item._id,
      views: item.count,
    }));

    res.json({
      success: true,
      data: {
        stats,
        topBlogs: {
          overall: topBlogsOverall,
          thisWeek: topBlogsThisWeek,
          thisMonth: topBlogsThisMonth,
          thisYear: topBlogsThisYear,
        },
        mostLiked: {
          overall: mostLikedOverall,
          thisMonth: mostLikedThisMonth,
          thisYear: mostLikedThisYear,
        },
        viewTrend,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};




export const getBlogDashboardAnalytics = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id });

    const blogsWithDate = addDisplayDate(blogs);

    const analytics = {
      totalBlogs: blogsWithDate.length,
      totalPublished: blogsWithDate.filter((blog) => blog.status === "publish").length,
      totalDraft: blogsWithDate.filter((blog) => blog.status === "draft").length,
      totalViews: blogsWithDate.reduce((sum, blog) => sum + (blog.views || 0), 0),
      totalLikes: blogsWithDate.reduce((sum, blog) => sum + (blog.likesCount || 0), 0),
      totalComments: blogsWithDate.reduce(
        (sum, blog) => sum + (blog.comments ? blog.comments.length : 0),
        0
      ),
      blogs: blogsWithDate.map((blog) => ({
        ...blog,
        commentsCount: blog.comments ? blog.comments.length : 0,
      })),
    };

    sendSuccess(res, 200, analytics);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch analytics");
  }
};







