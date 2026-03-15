import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { registerSchema } from '../../validations/schemas';
import { useNotificationStore } from '../../store/notificationStore';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { register } from '../../services/authApi';

const Signup = () => {
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {

        const payload = {
          fullName: `${values.firstName} ${values.lastName}`,
          username: values.username,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword
        };

        const response = await register(payload);

        if (response.success) {
          addNotification('Registration successful! Check your email to verify.', 'success');
          navigate(`/verify-email?email=${values.email}`);
        }
      } catch (error) {
        addNotification(error.response?.data?.message || 'Registration failed', 'error');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="  bg-light-50 dark:bg-dark-900 ">
      <div className="text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-light-50 mb-3">
          Create Account
        </h1>
        <p className="text-dark-500 dark:text-light-400 text-sm sm:text-base">
          Join BlogDiary and start sharing your stories
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className=" ">

<div className='grid grid-cols-1 gap-4 md:grid-cols-2 sm:grid-cols-1 space-y-2 py-8'>


        {/* First Name */}
        <div>
          <label className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-2.5">
            First Name
          </label>
          <div className="relative">
            <FiUser className="absolute left-4 top-3.5 text-dark-400 dark:text-light-500" size={18} />
            <input
              type="text"
              {...formik.getFieldProps('firstName')}
              placeholder="First Name"
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-dark-700 bg-light-50 dark:bg-dark-700 text-dark-900 dark:text-light-50 placeholder-dark-400 dark:placeholder-light-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
            />
          </div>

          {formik.touched.firstName && formik.errors.firstName && (
            <p className="mt-2 text-sm text-red-500">{formik.errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-2.5">
            Last Name
          </label>
          <div className="relative">
            <FiUser className="absolute left-4 top-3.5 text-dark-400 dark:text-light-500" size={18} />
            <input
              type="text"
              {...formik.getFieldProps('lastName')}
              placeholder="Last Name"
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-dark-700 bg-light-50 dark:bg-dark-700 text-dark-900 dark:text-light-50 placeholder-dark-400 dark:placeholder-light-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
            />
          </div>

          {formik.touched.lastName && formik.errors.lastName && (
            <p className="mt-2 text-sm text-red-500">{formik.errors.lastName}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-2.5">
            Username
          </label>
          <div className="relative">
            <FiUser className="absolute left-4 top-3.5 text-dark-400 dark:text-light-500" size={18} />
            <input
              type="text"
              {...formik.getFieldProps('username')}
              placeholder="Username"
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-dark-700 bg-light-50 dark:bg-dark-700 text-dark-900 dark:text-light-50 placeholder-dark-400 dark:placeholder-light-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
            />
          </div>
          {formik.touched.username && formik.errors.username && (
            <p className="mt-2 text-sm text-red-500">{formik.errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-2.5">
            Email Address
          </label>
          <div className="relative">
            <FiMail className="absolute left-4 top-3.5 text-dark-400 dark:text-light-500" size={18} />
            <input
              type="email"
              {...formik.getFieldProps('email')}
              placeholder="you@example.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-dark-700 bg-light-50 dark:bg-dark-700 text-dark-900 dark:text-light-50 placeholder-dark-400 dark:placeholder-light-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="mt-2 text-sm text-red-500">{formik.errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-2.5">
            Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-3.5 text-dark-400 dark:text-light-500" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              {...formik.getFieldProps('password')}
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3 rounded-xl border-2 border-gray-300 dark:border-dark-700 bg-light-50 dark:bg-dark-700 text-dark-900 dark:text-light-50 placeholder-dark-400 dark:placeholder-light-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-dark-400 dark:text-light-500 hover:text-dark-600 dark:hover:text-light-300"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="mt-2 text-sm text-red-500">{formik.errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-2.5">
            Confirm Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-3.5 text-dark-400 dark:text-light-500" size={18} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              {...formik.getFieldProps('confirmPassword')}
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3 rounded-xl border-2 border-gray-300 dark:border-dark-700 bg-light-50 dark:bg-dark-700 text-dark-900 dark:text-light-50 placeholder-dark-400 dark:placeholder-light-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-3.5 text-dark-400 dark:text-light-500 hover:text-dark-600 dark:hover:text-light-300"
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-500">{formik.errors.confirmPassword}</p>
          )}
        </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
          {!loading && <FiArrowRight size={18} />}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-dark-600 dark:text-light-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;