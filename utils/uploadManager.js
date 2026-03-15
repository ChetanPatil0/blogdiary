import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = 'uploads';
const PROFILE_DIR = path.join(UPLOAD_DIR, 'profiles');
const BLOG_DIR = path.join(UPLOAD_DIR, 'blogs');

const ensureDirectories = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
  }
  if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR);
  }
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR);
  }
};

const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const ext = path.extname(originalName);
  return `${timestamp}${ext}`;
};

export const uploadProfileImage = (file, userId) => {
  try {
    ensureDirectories();

    const fileName = generateFileName(file.originalname);
    const userFolder = path.join(PROFILE_DIR, userId);

    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    const filePath = path.join(userFolder, fileName);
    fs.writeFileSync(filePath, file.buffer);

    return {
      success: true,
      filename: fileName,
      path: filePath,
      url: `/uploads/profiles/${userId}/${fileName}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const uploadBlogImages = (files, userId) => {
  try {
    ensureDirectories();

    const userFolder = path.join(BLOG_DIR, userId);

    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    const uploadedFiles = files.map((file) => {
      const fileName = generateFileName(file.originalname);
      const filePath = path.join(userFolder, fileName);
      fs.writeFileSync(filePath, file.buffer);

      return {
        filename: fileName,
        path: filePath,
        url: `/uploads/blogs/${userId}/${fileName}`,
      };
    });

    return {
      success: true,
      files: uploadedFiles,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteProfileImage = (userId, filename) => {
  try {
    const filePath = path.join(PROFILE_DIR, userId, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }

    return { success: false, error: 'File not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteBlogImages = (userId, filenames) => {
  try {
    const userFolder = path.join(BLOG_DIR, userId);

    filenames.forEach((filename) => {
      const filePath = path.join(userFolder, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const cleanupUploadedFiles = (filesToClean) => {
  filesToClean.forEach((fileObj) => {
    try {
      if (fileObj?.path && fs.existsSync(fileObj.path)) {
        fs.unlinkSync(fileObj.path);
        console.log(`Cleaned up orphaned file: ${fileObj.path}`);
      }
    } catch (err) {
      console.error(`Cleanup failed for ${fileObj?.path}:`, err.message);
    }
  });
};