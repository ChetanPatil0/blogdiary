const Loader = ({ size = 'md', fullScreen = false, message = 'Loading...' }) => {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  const spinner = <div className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 dark:border-dark-600 dark:border-t-primary-500 rounded-full animate-spin`} />;
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-light-50 dark:bg-dark-900 bg-opacity-50 dark:bg-opacity-50 flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
          {message && <p className="mt-4 text-dark-700 dark:text-light-200 font-medium">{message}</p>}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center">
      {spinner}
      {message && <p className="mt-3 text-dark-600 dark:text-light-300 text-sm font-medium">{message}</p>}
    </div>
  );
};
export default Loader;
