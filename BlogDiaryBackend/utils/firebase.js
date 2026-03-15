import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export const uploadProfileImage = async (file, userId) => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;
    const path = `profile/${userId}/${fileName}`;

    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file.buffer);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      url: downloadURL,
      publicId: snapshot.ref.fullPath,
    };
  } catch (error) {
    console.error('Profile image upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const uploadBlogImages = async (files, userId) => {
  try {
    const uploadPromises = files.map((file, index) => {
      const timestamp = Date.now();
      const fileName = `${timestamp}-${index}-${file.originalname}`;
      const path = `blogs/${userId}/${fileName}`;

      const storageRef = ref(storage, path);
      return uploadBytes(storageRef, file.buffer).then(async (snapshot) => {
        const downloadURL = await getDownloadURL(snapshot.ref);
        return {
          success: true,
          url: downloadURL,
          publicId: snapshot.ref.fullPath,
        };
      });
    });

    const results = await Promise.all(uploadPromises);
    const failedUploads = results.filter((result) => !result.success);

    if (failedUploads.length > 0) {
      return {
        success: false,
        error: 'Some files failed to upload',
        results,
      };
    }

    return {
      success: true,
      results,
    };
  } catch (error) {
    console.error('Blog images upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteImage = async (publicId) => {
  try {
    const fileRef = ref(storage, publicId);
    await deleteObject(fileRef);
    return { success: true };
  } catch (error) {
    console.error('Image delete error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map((publicId) => {
      const fileRef = ref(storage, publicId);
      return deleteObject(fileRef);
    });

    await Promise.all(deletePromises);
    return { success: true };
  } catch (error) {
    console.error('Multiple images delete error:', error);
    return { success: false, error: error.message };
  }
};
