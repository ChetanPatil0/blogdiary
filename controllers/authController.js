import User from '../models/User.js';

import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError, addDisplayDate } from '../utils/response.js';
import { uploadProfileImage, deleteProfileImage } from '../utils/uploadManager.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangeNotification, sendWelcomeEmail } from '../utils/emailService.js';
import { generateVerificationToken, generateResetToken, getTokenExpiry } from '../utils/tokenGenerator.js';
import { generateOTP } from '../utils/generateOTP.js';
import path from 'path';
import fs from 'fs/promises';
import { TempUser } from '../models/TempUser.js';
import Blog from '../models/Blog.js';




export const register = async (req, res) => {
  console.log("register call");

  try {
    const { fullName, username, email, password } = req.body;

    const existingUserUsername = await User.findOne({ username });
    const existingTempUsername = await TempUser.findOne({ username });

    if (existingUserUsername || existingTempUsername) {
      return sendError(res, 409, "Username already exists");
    }

    console.log('existingUserUsername',existingUserUsername)

    const existingUser = await User.findOne({ email });
    const existingTemp = await TempUser.findOne({ email });

    if (existingUser || existingTemp) {
      return sendError(res, 409, "Email already exists");
    }

    const otp = generateOTP();

    const tempUser = new TempUser({
      fullName,
      username,
      email,
      password,
      otp,
      otpExpires: getTokenExpiry(10)
    });

    await tempUser.save();

    await sendVerificationEmail(email, otp);

    sendSuccess(
      res,
      201,
      { email },
      "Verification OTP sent. Please verify to complete registration."
    );

  } catch (error) {
    console.error(error);
    sendError(res, 500, "Registration failed");
  }
};

export const registerSuperAdmin = async (req, res) => {
  try {
    const { fullName, email, password, username } = req.body;

    const secret = req.body.secret || req.headers['x-super-secret'];
    if (secret !== process.env.SUPERADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized – superadmin registration denied",
      });
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    if (username && (await User.findOne({ username }))) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    const superAdmin = new User({
      fullName,
      email,
      password,
      username,
      role: 'superadmin',
      isVerified: true,
    });

    await superAdmin.save();

    const token = generateToken(superAdmin._id);

    return res.status(201).json({
      success: true,
      message: "Superadmin created successfully",
      user: {
        _id: superAdmin._id,
        fullName: superAdmin.fullName,
        email: superAdmin.email,
        username: superAdmin.username || null,
        role: superAdmin.role,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('email otp',req.body)
  
    if (!email || !otp) {
      return sendError(res, 400, "Email and OTP required");
    }

    const tempUser = await TempUser.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() }
    }).select("+password");

    if (!tempUser) {
      return sendError(res, 400, "Invalid or expired OTP");
    }

    const user = await User.create({
      fullName: tempUser.fullName,
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password,
      isVerified: true
    });

    await TempUser.deleteOne({ _id: tempUser._id });

    await sendWelcomeEmail(user.email, user.fullName);

    const jwtToken = generateToken(user._id);

    sendSuccess(
      res,
      200,
      { user, token: jwtToken },
      "Email verified successfully"
    );

  } catch (error) {
    console.error(error);
    sendError(res, 500, "Email verification failed");
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    }).select('+password');

    if (!user) {
      return sendError(res, 401, 'Invalid email/username or password');
    }

    if (!user.isVerified) {
      return sendError(res, 403, 'Please verify your email first');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid email/username or password');
    }

    const token = generateToken(user._id);

    sendSuccess(res, 200, { user, token }, 'Login successful');

  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Login failed');
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('blogs').populate('likedBlogs');
    sendSuccess(res, 200, user);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch user');
  }
};

export const updateProfile = async (req, res) => {
  let profileImagePath = null; 

  try {
    const { fullName, bio, emailNotifications } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }


    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
      const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');


      await fs.mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, req.file.buffer);


      const imageUrl = `/uploads/profiles/${filename}`;

      profileImagePath = filePath; 

      user.profileImage = {
        filename,
        url: imageUrl,
      };
    }

    if (fullName !== undefined) user.fullName = fullName.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (emailNotifications !== undefined) {
      user.emailNotifications = emailNotifications === 'true' || emailNotifications === true;
    }

    await user.save();

   
    profileImagePath = null;

 
    const updatedUser = await User.findById(user._id).select(
      '-password -verificationToken -resetToken -__v'
    );

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);


    if (profileImagePath) {
      try {
        await fs.unlink(profileImagePath);
        console.log('Cleaned up failed upload:', profileImagePath);
      } catch (cleanupErr) {
        console.error('Cleanup failed:', cleanupErr);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Profile update failed',
    });
  }
};

export const uploadUserProfileImage = async (req, res) => {

  try {
    if (!req.file) {
      return sendError(res, 400, 'No file provided');
    }

    const result = uploadProfileImage(req.file, req.user._id.toString());

    if (!result.success) {
      return sendError(res, 500, 'Profile image upload failed');
    }

    const oldUser = await User.findById(req.user._id);

    if (oldUser.profileImage && oldUser.profileImage.filename) {
      deleteProfileImage(req.user._id.toString(), oldUser.profileImage.filename);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        profileImage: {
          filename: result.filename,
          url: result.url,
        },
      },
      { new: true }
    );

    sendSuccess(res, 200, user, 'Profile image uploaded successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Profile image upload failed');
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const { emailNotifications } = req.body;

    if (typeof emailNotifications !== "boolean") {
      return sendError(res, 400, "emailNotifications must be a boolean value");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    user.emailNotifications = emailNotifications;
    await user.save({ validateBeforeSave: false });

    sendSuccess(res, 200, {
      emailNotifications: user.emailNotifications
    }, "Notification preferences updated successfully");
  } catch (error) {
    console.error("Update notification preferences error:", error);
    sendError(res, 500, "Failed to update notification preferences");
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const resetToken = generateResetToken();

    user.resetToken = resetToken;
    user.resetTokenExpires = getTokenExpiry(60);

    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    sendSuccess(res, 200, { email }, 'Password reset email sent');
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Forgot password failed');
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return sendError(res, 400, 'Token and new password required');
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    }).select('+resetToken +resetTokenExpires');

    if (!user) {
      return sendError(res, 400, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;

    await user.save();

    await sendPasswordChangeNotification(user.email, user.fullName);

    sendSuccess(res, 200, null, 'Password reset successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Password reset failed');
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    await sendPasswordChangeNotification(user.email, user.fullName);

    sendSuccess(res, 200, null, 'Password changed successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Password change failed');
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const tempUser = await TempUser.findOne({ email });

    if (!tempUser) {
      return sendError(res, 404, "Registration not found");
    }

    const otp = generateOTP();

    tempUser.otp = otp;
    tempUser.otpExpires = getTokenExpiry(10);

    await tempUser.save();

    await sendVerificationEmail(email, otp);

    sendSuccess(res, 200, { email }, "Verification OTP sent");

  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to resend verification email");
  }
};


export const getUserFullDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    let blogQuery = { author: id };

    if (
      currentUser.role !== "admin" &&
      currentUser.role !== "superadmin"
    ) {
      blogQuery.status = "publish";
    }

    const blogs = await Blog.find(blogQuery).sort({ createdAt: -1 });

   
    const blogsWithDisplayDate = addDisplayDate(blogs);

    const totalBlogs = blogsWithDisplayDate.length;

    const totalLikes = blogsWithDisplayDate.reduce(
      (acc, blog) => acc + blog.likesCount,
      0
    );

    const totalViews = blogsWithDisplayDate.reduce(
      (acc, blog) => acc + blog.views,
      0
    );

    sendSuccess(
      res,
      200,
      {
        user,
        stats: {
          totalBlogs,
          totalLikes,
          totalViews,
        },
        blogs: blogsWithDisplayDate,
      },
      "User details fetched"
    );
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch user details");
  }
};