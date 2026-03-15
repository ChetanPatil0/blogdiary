



// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { Formik, Form, Field, ErrorMessage } from 'formik';
// import { loginSchema } from '../../validations/schemas';

// import { useAuthStore } from '../../store/authStore';
// import { useNotificationStore } from '../../store/notificationStore';
// import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
// import { loginUser } from '../../services/authApi';

// const Login = () => {
//   const navigate = useNavigate();
//   const login = useAuthStore((state) => state.login);
//   const addNotification = useNotificationStore((state) => state.addNotification);

//   const [showPassword, setShowPassword] = useState(false);

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-300/20">
//       <div className="text-center mb-8">
//         <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-light-50 mb-3">
//           Welcome Back
//         </h1>
//         <p className="text-dark-500 dark:text-light-400 text-sm sm:text-base">
//           Sign in to your BlogDiary account
//         </p>
//       </div>

//       <Formik
//         initialValues={{ email: '', password: '' }}
//         validationSchema={loginSchema}
//         validateOnBlur={true}
//         validateOnChange={true}
//         onSubmit={async (values, { setSubmitting }) => {
//           try {
//             const response = await loginUser(values);

//             if (response?.success) {
//               login(response.data.user, response.data.token);
//               addNotification('Login successful!', 'success');

//               setTimeout(() => {
//                 navigate('/dashboard', { replace: true });
//               }, 800);
//             }
//           } catch (error) {
//             const message =
//               error.response?.data?.message ||
//               error.message ||
//               'Login failed. Please check your credentials.';

//             addNotification(message, 'error');
//              setSubmitting(false);
//           }
//         }}
//       >
//         {({ isSubmitting }) => (
//           <Form className="space-y-5" noValidate>
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-2.5"
//               >
//                 Email Address
//               </label>
//               <div className="relative">
//                 <FiMail
//                   className="absolute left-4 top-3.5 text-dark-400 dark:text-light-500"
//                   size={18}
//                 />
//                 <Field
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   placeholder="you@example.com"
//                   className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-dark-700 bg-light-50 dark:bg-dark-700 text-dark-900 dark:text-light-50 placeholder-dark-400 dark:placeholder-light-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
//                 />
//               </div>
//               <ErrorMessage
//                 name="email"
//                 component="p"
//                 className="mt-2 text-sm text-red-500"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-2.5"
//               >
//                 Password
//               </label>
//               <div className="relative">
//                 <FiLock
//                   className="absolute left-4 top-3.5 text-dark-400 dark:text-light-500"
//                   size={18}
//                 />
//                 <Field
//                   id="password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   autoComplete="current-password"
//                   placeholder="••••••••"
//                   className="w-full pl-11 pr-11 py-3 rounded-xl border-2 border-gray-300 dark:border-dark-700 bg-light-50 dark:bg-dark-700 text-dark-900 dark:text-light-50 placeholder-dark-400 dark:placeholder-light-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-3.5 text-dark-400 dark:text-light-500 hover:text-dark-600 dark:hover:text-light-300 transition-colors"
//                   aria-label={showPassword ? 'Hide password' : 'Show password'}
//                 >
//                   {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
//                 </button>
//               </div>
//               <ErrorMessage
//                 name="password"
//                 component="p"
//                 className="mt-2 text-sm text-red-500"
//               />
//             </div>

//             <div className="text-right">
//               <Link
//                 to="/forgot-password"
//                 className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
//               >
//                 Forgot password?
//               </Link>
//             </div>

//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
//             >
//               {isSubmitting ? 'Signing in...' : 'Sign In'}
//               {!isSubmitting && <FiArrowRight size={18} />}
//             </button>
//           </Form>
//         )}
//       </Formik>

//       <div className="mt-6 text-center">
//         <p className="text-dark-600 dark:text-light-400 text-sm">
//           Don't have an account?{' '}
//           <Link
//             to="/signup"
//             className="text-primary-500 hover:text-primary-600 font-semibold transition-colors"
//           >
//             Sign up
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;



import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { loginSchema } from '../../validations/schemas';

import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { loginUser } from '../../services/authApi';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="max-w-md mx-auto p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-300/20">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-light-50 mb-3">
          Welcome Back
        </h1>
        <p className="text-dark-500 dark:text-light-400 text-sm sm:text-base">
          Sign in to your BlogDiary account
        </p>
      </div>

      <Formik
        initialValues={{ identifier: '', password: '' }}
        validationSchema={loginSchema}
        validateOnBlur={true}
        validateOnChange={true}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const response = await loginUser(values);

            if (response?.success) {
              console.log('Login response:', response);
              login(response.data.user, response.data.token);
              addNotification('Login successful!', 'success');

              setTimeout(() => {
                navigate('/dashboard', { replace: true });
              }, 800);
            } else {
              addNotification(
                response?.message || 'Login failed. Please check your credentials.',
                'error'
              );
            }
          } catch (error) {
            const message =
              error.response?.data?.message ||
              error.message ||
              'Login failed. Please check your credentials.';

            addNotification(message, 'error');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-2.5"
              >
                Email or Username
              </label>

              <div className="relative">
                <FiMail
                  className="absolute left-4 top-3.5 text-dark-400 dark:text-light-500"
                  size={18}
                />

                <Field
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter email or username"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-dark-700 bg-light-50 dark:bg-dark-700 text-dark-900 dark:text-light-50 placeholder-dark-400 dark:placeholder-light-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
                />
              </div>

              <ErrorMessage
                name="identifier"
                component="p"
                className="mt-2 text-sm text-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-2.5"
              >
                Password
              </label>

              <div className="relative">
                <FiLock
                  className="absolute left-4 top-3.5 text-dark-400 dark:text-light-500"
                  size={18}
                />

                <Field
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border-2 border-gray-300 dark:border-dark-700 bg-light-50 dark:bg-dark-700 text-dark-900 dark:text-light-50 placeholder-dark-400 dark:placeholder-light-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-dark-400 dark:text-light-500 hover:text-dark-600 dark:hover:text-light-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              <ErrorMessage
                name="password"
                component="p"
                className="mt-2 text-sm text-red-500"
              />
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
              {!isSubmitting && <FiArrowRight size={18} />}
            </button>
          </Form>
        )}
      </Formik>

      <div className="mt-6 text-center">
        <p className="text-dark-600 dark:text-light-400 text-sm">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-primary-500 hover:text-primary-600 font-semibold transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

