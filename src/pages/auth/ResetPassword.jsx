import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { resetPasswordSchema } from '../../validations/schemas';

import { useNotificationStore } from '../../store/notificationStore';
import Logo from '../../components/Logo';
import { resetPassword } from '../../services/authApi';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      const token = searchParams.get('token');
      if (!token) return addNotification('Invalid token', 'error');

      setLoading(true);
      try {
        const response = await resetPassword(token, values.newPassword);
        if (response.data.success) {
          addNotification('Password reset successfully!', 'success');
          navigate('/login');
        }
      } catch (error) {
        addNotification(error.response?.data?.message || 'Failed', 'error');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-50 dark:bg-dark-900 px-4">
      <div className="w-full max-w-md">
        <Logo size="lg" className="mx-auto mb-8" />
        <h2 className="text-3xl font-bold text-center text-dark-900 dark:text-light-50 mb-8">New Password</h2>
        
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              {...formik.getFieldProps('newPassword')}
              placeholder="New Password"
              className="w-full px-4 py-2 rounded-lg border-2 border-light-200 dark:border-dark-700 bg-light-50 dark:bg-dark-800"
            />
            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.newPassword}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              {...formik.getFieldProps('confirmPassword')}
              placeholder="Confirm Password"
              className="w-full px-4 py-2 rounded-lg border-2 border-light-200 dark:border-dark-700 bg-light-50 dark:bg-dark-800"
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.confirmPassword}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ResetPassword;
