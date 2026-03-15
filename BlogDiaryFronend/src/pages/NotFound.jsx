import { useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-light-50 dark:bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        
        <div className="mb-8">
          <div className="text-7xl font-bold text-primary-500 dark:text-primary-400 mb-4">
            404
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-light-50 mb-3">
            Page Not Found
          </h1>
          <p className="text-dark-600 dark:text-light-400 text-base">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-light-200 dark:border-dark-700 text-dark-900 dark:text-light-50 rounded-xl hover:bg-light-100 dark:hover:bg-dark-800 transition-colors font-semibold"
          >
            <FiArrowLeft size={18} />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-semibold"
          >
            <FiHome size={18} />
            Home
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFound;