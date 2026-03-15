import { Link } from 'react-router-dom';
import { FiCalendar, FiEye, FiArrowRight } from 'react-icons/fi';
import { formatDate } from '../utils';
import { MEDIA_BASE_URL } from '../services/api';
import { recordBlogView } from '../services/blogApi';
import { useAuthStore } from '../store/authStore';

const HorizontalBlogCard = ({ blog, withShadow = false }) => {
    const {user}=useAuthStore();
  const imageFallback = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800';

  const imageUrl = blog.coverImage?.url
    ? `${MEDIA_BASE_URL}${blog.coverImage.url}`
    : imageFallback;

     const handleView = async () => {
        console.log('handl view call')
        try {
          await recordBlogView(blog?._id, user?._id);
          console.log('handle view succes')
        } catch (error) {
            console.log('handl view err')
          console.error("View record failed:", error);
        }
      };

  return (
    <Link to={`/blogs/${blog._id}`} className="block" onClick={handleView}>
      <div
        className={`group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          withShadow ? 'shadow-md hover:shadow-xl' : 'hover:shadow-lg'
        }`}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-5/12 lg:w-4/12 flex-shrink-0">
            <div className="aspect-[4/3] sm:aspect-[5/4] md:aspect-[4/3] lg:aspect-[5/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={imageUrl}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-4 flex flex-col flex-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3">
              <span className="flex items-center gap-1.5">
                <FiCalendar size={13} />
                {formatDate(blog.displayDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <FiEye size={13} />
                {blog.views || 0} views
              </span>
            </div>

            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {blog.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-4 leading-relaxed line-clamp-2 flex-grow">
              {blog.description || 'No description available...'}
            </p>

            <div className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium text-sm md:text-base">
              Read More
              <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HorizontalBlogCard;
