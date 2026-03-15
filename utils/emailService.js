import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service:  'gmail',
  auth: {
    user: 'patilpratap2905@gmail.com',
    pass: 'qbhk vyqt zbjp jjwp',
  },
});


export const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email - BlogDiary",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        
        <h2 style="color:#333;">Verify Your Email</h2>

        <p>Thanks for signing up to <strong>BlogDiary</strong>.</p>

        <p>Please use the following OTP to verify your email address.</p>

        <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            margin: 30px 0;
            color: #0ea5e9;
        ">
          ${otp}
        </div>

        <p>This OTP will expire in <strong>10 minutes</strong>.</p>

        <p>If you did not create this account, you can safely ignore this email.</p>

      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};


export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password - BlogDiary',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Click the link below to set a new password.</p>
        <p>
          <a href="${resetLink}" style="background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>This link expires in 1 hour.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

export const sendPasswordChangeNotification = async (email, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Changed - BlogDiary',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Changed Successfully</h2>
        <p>Hi ${userName},</p>
        <p>Your password has been changed successfully.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (email, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to BlogDiary!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to BlogDiary!</h2>
        <p>Hi ${userName},</p>
        <p>Your account is now verified. Start creating amazing blogs!</p>
        <p>
          <a href="${process.env.FRONTEND_URL}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to BlogDiary
          </a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};


export const sendBlogPublishedEmail = async (email, userName, blogTitle) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Blog Published - BlogDiary',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Blog Published Successfully!</h2>
        <p>Hi ${userName},</p>
        <p>Your blog <strong>"${blogTitle}"</strong> has been published!</p>
        <p>Your readers can now find and enjoy your blog.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/blogs" style="background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View All Blogs
          </a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};


export const sendBlogUpdatedEmail = async (email, userName, blogTitle) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Blog Updated - BlogDiary',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Blog Updated!</h2>
        <p>Hi ${userName},</p>
        <p>Your blog <strong>"${blogTitle}"</strong> has been updated successfully.</p>
        <p>The changes are now live for your readers.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};


export const sendBlogDeletedEmail = async (email, userName, blogTitle) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Blog Deleted - BlogDiary',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Blog Deleted</h2>
        <p>Hi ${userName},</p>
        <p>Your blog <strong>"${blogTitle}"</strong> has been deleted.</p>
        <p>This action cannot be undone.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

export const sendLikeNotificationEmail = async (email, userName, liker, blogTitle) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${liker.fullName} liked your blog - BlogDiary`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Like!/h2>
        <p>Hi ${userName},</p>
        <p><strong>${liker.fullName}</strong> liked your blog <strong>"${blogTitle}"</strong></p>
        <p>Keep writing great content!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

export const sendCommentNotificationEmail = async (email, userName, commenter, blogTitle) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${commenter.fullName} commented on your blog - BlogDiary`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Comment!</h2>
        <p>Hi ${userName},</p>
        <p><strong>${commenter.fullName}</strong> commented on your blog <strong>"${blogTitle}"</strong></p>
        <p>Check out their comment!</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/blogs" style="background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Comments
          </a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};
