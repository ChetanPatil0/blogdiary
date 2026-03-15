
import { FiInbox, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';

export const EmptyState = ({
  icon: Icon = FiInbox,
  title = "No data found",
  description = "There is nothing to show here yet.",
  actionText,
  onAction,
  className = "",
}) => {
  return (
    <div className={`py-12 px-4 text-center ${className}`}>
      <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {title}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const ErrorState = ({
  title = "Something went wrong",
  description = "We couldn't load the content. Please try again later.",
  onRetry,
}) => {
  return (
    <div className="py-12 px-4 text-center">
      <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
        <FiAlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
      </div>

      <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-3">
        {title}
      </h3>

      <p className="text-red-700 dark:text-red-300 max-w-md mx-auto mb-6">
        {description}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export const SuccessState = ({
  title = "Success!",
  description = "Your action was completed successfully.",
}) => {
  return (
    <div className="py-12 px-4 text-center">
      <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
        <FiCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
      </div>

      <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-3">
        {title}
      </h3>

      <p className="text-green-700 dark:text-green-300 max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
};

export const ComingSoon = ({
  title = "Coming Soon",
  description = "This feature is under construction. Check back later!",
}) => {
  return (
    <div className="py-16 px-6 text-center">
      <div className="mx-auto max-w-md">
        <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <FiClock className="w-12 h-12 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {description}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-500">
          We're working hard to bring this to you soon!
        </p>
      </div>
    </div>
  );
};