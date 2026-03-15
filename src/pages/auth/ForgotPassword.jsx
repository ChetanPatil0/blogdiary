import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { forgotPasswordSchema } from '../../validations/schemas';

import { useNotificationStore } from '../../store/notificationStore';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { forgotPassword } from '../../services/authApi';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await forgotPassword(values.email);
        console.log('frogot pass res ',response)

        if (response.success) {
          setSubmitted(true);
          addNotification('Password reset link sent to your email!', 'success');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
           console.log('frogot pass eror res ',error.response)
        addNotification(error.response?.data?.message || 'Failed to send reset link', 'error');
      } finally {
        setLoading(false);
      }
    },
  });

  if (submitted) {
    return (
      <div className="w-full sm:w-full md:w-4/5 lg:w-4/5 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-light-50 mb-3">
            Check Your Email
          </h1>
          <p className="text-dark-500 dark:text-light-400 text-sm sm:text-base">
            We've sent a password reset link
          </p>
        </div>

        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-dark-700 border-2 border-primary-500 flex items-center justify-center">
              <FiCheckCircle size={32} className="text-primary-500" />
            </div>
          </div>

          <div>
            <p className="text-dark-600 dark:text-light-400 mb-2">
              Password reset link has been sent to:
            </p>
            <p className="font-semibold text-dark-900 dark:text-light-50 break-all">
              {formik.values.email}
            </p>
          </div>

          <p className="text-sm text-dark-600 dark:text-light-400">
            Check your email for the reset link. You'll be redirected to login in a few seconds.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold transition-colors"
          >
            <FiArrowLeft size={18} />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-full md:w-4/5 lg:w-4/5 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-light-50 mb-3">
          Forgot Password
        </h1>
        <p className="text-dark-500 dark:text-light-400 text-sm sm:text-base">
          Enter your email to receive a reset link
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
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
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-light-200 dark:border-dark-700 bg-light-50 dark:bg-dark-700 text-dark-900 dark:text-light-50 placeholder-dark-400 dark:placeholder-light-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="mt-2 text-sm text-red-500">{formik.errors.email}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors duration-200"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-dark-600 dark:text-light-400 hover:text-dark-900 dark:hover:text-light-50 text-sm font-medium transition-colors"
        >
          <FiArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;