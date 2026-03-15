import api from "./api";

export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const verifyUserEmail = async (email, otp) => {
  const response = await api.post('/auth/verify-email', { email, otp });
  return response.data;
};

export const resendVerification = async (email) => {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};


export const updateNotificationPreferences = async (data) => {
  const response = await api.patch('/auth/manage/notifications', data);
  return response.data;
};

export const uploadProfileImage = async (formData) => {
  const response = await api.post('/auth/upload-profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};


export const getUserDetails = async (id) => {
  const response = await api.get(`/auth/users/${id}/details`);
  return response.data;
};