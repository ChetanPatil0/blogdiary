import * as Yup from 'yup';

export const registerSchema = Yup.object({
  fullName: Yup.string().required('Full name required').min(3, 'Min 3 characters'),
  email: Yup.string().email('Invalid email').required('Email required'),
  password: Yup.string()
    .required('Password required')
    .min(8, 'Min 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, number'),
  confirmPassword: Yup.string()
    .required('Confirm password required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

export const loginSchema = Yup.object({
  identifier: Yup.string().required('Email or username is required'),
  password: Yup.string().required('Password required'),
});

export const createBlogSchema = Yup.object({
  title: Yup.string()
    .required('Title required')
    .min(5, 'Min 5 characters')
    .max(200, 'Max 200 characters'),
  description: Yup.string()
    .required('Description required')
    .min(20, 'Min 20 characters')
    .max(500, 'Max 500 characters'),
  content: Yup.string().required('Content required').min(100, 'Min 100 characters'),
  category: Yup.string().required('Category required'),
  tags: Yup.array().of(Yup.string()).max(5, 'Max 5 tags'),
});

export const commentSchema = Yup.object({
 content: Yup.string()
  .required("Comment is required")
  .min(2, "Comment must be at least 2 characters")
  .test(
    "max-chars-no-space",
    " Comment is too long. Maximum 1000 characters allowed.",
    (value) => {
      if (!value) return true;
      const lengthWithoutSpaces = value.replace(/\s/g, "").length;
      return lengthWithoutSpaces <= 1000;
    }
  )
  .trim(),

  parent: Yup.string()
    .nullable()
    .optional()
    .matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid parent comment ID', excludeEmptyString: true }),
});