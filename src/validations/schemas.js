import * as Yup from 'yup';

export const registerSchema = Yup.object({
  firstName: Yup.string()
    .min(3, 'First name must be at least 3 characters')
     .matches(/^[A-Za-z0-9]+$/, 'First name can contain only letters and numbers')
    .required('First name is required'),

  lastName: Yup.string()
    .min(3, 'Last name must be at least 3 characters')
     .matches(/^[A-Za-z0-9]+$/, 'Last name can contain only letters and numbers')
    .required('Last name is required'),

  username: Yup.string()
    .matches(/^[A-Za-z0-9]+$/, 'Username can contain only letters and numbers')
    .required('Username is required'),

  email: Yup.string()
    .email('Invalid email address')
     .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must contain a domain like .com")
    .required('Email is required'),
   
  
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain uppercase letter')
    .matches(/[a-z]/, 'Password must contain lowercase letter')
    .matches(/[0-9]/, 'Password must contain number')
    .required('Password is required'),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

export const loginSchema = Yup.object({
  identifier: Yup.string().required('Email or username required'),
  password: Yup.string().required('Password required'),
});
 
export const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

export const resetPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain uppercase letter')
    .matches(/[a-z]/, 'Password must contain lowercase letter')
    .matches(/[0-9]/, 'Password must contain number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain uppercase letter')
    .matches(/[a-z]/, 'Password must contain lowercase letter')
    .matches(/[0-9]/, 'Password must contain number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

export const updateProfileSchema = Yup.object({
  fullName: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .required('Full name is required'),
  bio: Yup.string()
    .max(500, 'Bio must not exceed 500 characters'),
});

export const createBlogSchema = Yup.object({
  title: Yup.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description must not exceed 500 characters')
    .required('Description is required'),
  content: Yup.string()
    .min(100, 'Content must be at least 100 characters')
    .required('Content is required'),
  category: Yup.string().required('Category is required'),
  tags: Yup.string(),
});

export const commentSchema = Yup.object({
  content: Yup.string()
    .min(2, 'Comment must be at least 2 characters')
    .max(1000, 'Comment must not exceed 1000 characters')
    .required('Comment is required'),
});
