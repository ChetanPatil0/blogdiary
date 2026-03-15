

// import { useState, useEffect, useMemo, useCallback } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { getBlogById, likeBlog, getRelatedBlogs, getPopularBlogs } from '../../services/blogApi';
// import { useAuthStore } from '../../store/authStore';
// import Loader from '../../components/Loader';
// import Modal from '../../components/Modal';
// import BlogCard from '../../components/BlogCard';
// import { FiEye, FiHeart, FiArrowLeft, FiCalendar, FiTag } from 'react-icons/fi';
// import { formatDate } from '../../utils';
// import { MEDIA_BASE_URL } from '../../services/api';
// import { EmptyState } from '../../components/EmptyState';

// const BlogDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const {user, isAuthenticated } = useAuthStore();

//   const [blog, setBlog] = useState(null);
//   const [relatedBlogs, setRelatedBlogs] = useState([]);
//   const [isPopularFallback, setIsPopularFallback] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [liked, setLiked] = useState(false);
//   const [likesCount, setLikesCount] = useState(0);
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         setIsPopularFallback(false);

//      const blogRes = await getBlogById(id, user?._id);
// console.log("Blog Details:", blogRes);

//         if (!blogRes.success) {
//           setError(blogRes.message || 'Blog not found');
//           return;
//         }

//         const blogData = blogRes.data;
//         if (!isMounted) return;

//         setBlog(blogData);
//         setLiked(!!blogData.isLiked);
//         setLikesCount(blogData.likesCount || 0);

//         let fetchedBlogs = [];

//         if (blogData.category || blogData.tags?.length > 0) {
//           const params = { limit: 5, excludeId: blogData._id };
//           if (blogData.category) params.category = blogData.category;
//           if (blogData.tags?.length > 0) params.tags = blogData.tags.join(',');

//           const relatedRes = await getRelatedBlogs(params);
//           if (relatedRes?.success && Array.isArray(relatedRes.data)) {
//             fetchedBlogs = relatedRes.data;
//           }
//         }

//         if (fetchedBlogs.length === 0) {
//           const popularRes = await getPopularBlogs(5);
//           fetchedBlogs = Array.isArray(popularRes)
//             ? popularRes
//             : Array.isArray(popularRes?.data) ? popularRes.data : [];
//           setIsPopularFallback(true);
//         }

//         if (isMounted) {
//           setRelatedBlogs(fetchedBlogs);
//         }
//       } catch (err) {
//         if (isMounted) setError('Failed to load content');
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchData();

//     return () => { isMounted = false; };
//   }, [id]);

//   const handleLike = useCallback(async () => {
//     if (!isAuthenticated) {
//       setShowLoginModal(true);
//       return;
//     }
//     if (liked) return;

//     try {
//       const res = await likeBlog(id);
//       if (res?.success) {
//         setLikesCount(res.data?.likesCount ?? likesCount + 1);
//         setLiked(true);
//       }
//     } catch (err) {
//       console.error('Like failed:', err);
//     }
//   }, [id, isAuthenticated, liked, likesCount]);

//   const coverImageUrl = useMemo(
//     () => blog?.coverImage?.url
//       ? `${MEDIA_BASE_URL}${blog.coverImage.url}`
//       : 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
//     [blog]
//   );

//   if (loading) {
//     return <Loader fullScreen message="Loading..." />;
//   }

//   if (error || !blog) {
//     return (
//       <div className="min-h-screen bg-light-50 dark:bg-dark-900 flex items-center justify-center">
//         <EmptyState
//           icon={FiEye}
//           title={error || 'Blog not found'}
//           description="Sorry, we couldn't find this post."
//           actionText="Go Back"
//           onAction={() => navigate(-1)}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-light-50 dark:bg-dark-900 pb-24">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">

//           <div className="lg:col-span-8 xl:col-span-9">
            // <button
            //   onClick={() => navigate(-1)}
            //   className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6 transition-colors"
            // >
            //   <FiArrowLeft size={18} />
            //   Back
            // </button>

//             <div className="rounded-xl overflow-hidden shadow-lg mb-8">
//               <img
//                 src={coverImageUrl}
//                 alt={blog.title}
//                 className="w-full h-64 sm:h-80 lg:h-96 object-cover"
//               />
//             </div>

//             <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
//               {blog.title}
//             </h1>

//             <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
//               {blog.description}
//             </p>

//             <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400 mb-10 pb-6 border-b border-gray-200 dark:border-gray-700">
//               <div className="flex items-center gap-1.5">
//                 <FiEye size={16} />
//                 {blog.views || 0} views
//               </div>
//               <button
//                 onClick={handleLike}
//                 disabled={liked}
//                 className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
//               >
//                 <FiHeart size={16} className={liked ? 'fill-current' : ''} />
//                 {likesCount} likes
//               </button>
//               {blog.category && (
//                 <div className="flex items-center gap-1.5">
//                   <FiTag size={16} />
//                   <span className="capitalize">{blog.category}</span>
//                 </div>
//               )}
//             </div>

//             <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none mb-16">
//               <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
//                 {blog.content}
//               </div>
//             </div>

//             {blog.images?.length > 0 && (
//               <div className="mb-12">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Gallery</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                   {blog.images.map((img, idx) => (
//                     <div
//                       key={img._id || idx}
//                       className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
//                     >
//                       <img
//                         src={`${MEDIA_BASE_URL}${img.url}`}
//                         alt={`Gallery image ${idx + 1}`}
//                         className="w-full h-52 object-cover"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
//                 <div className="flex items-center gap-4">
//                   <div>
//                     <p className="text-base font-medium text-gray-900 dark:text-white">
//                       Posted by {blog.author?.fullName || 'Anonymous'}
//                     </p>
//                     <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
//                       <FiCalendar size={14} />
//                       {formatDate(blog.createdAt)}
//                     </div>
//                   </div>
//                 </div>

//                 {blog.tags?.length > 0 && (
//                   <div className="flex flex-wrap gap-2">
//                     {blog.tags.map((tag, i) => (
//                       <span
//                         key={i}
//                         className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
//                       >
//                         #{tag}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="mt-16 lg:hidden">
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//                 {isPopularFallback ? 'Popular Posts' : 'Related Posts'}
//               </h2>
//               {relatedBlogs.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {relatedBlogs.map((rel) => (
//                     <BlogCard key={rel._id} blog={rel} />
//                   ))}
//                 </div>
//               ) : (
//                 <EmptyState
//                   icon={FiTag}
//                   title="No posts available"
//                   description="Check back later for more content."
//                 />
//               )}
//             </div>
//           </div>

//           {relatedBlogs.length > 0 && (
//             <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
//               <div className="sticky top-6">
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//                   {isPopularFallback ? 'Popular Posts' : 'Related Posts'}
//                 </h2>
//                 <div className="space-y-6">
//                   {relatedBlogs.map((rel) => (
//                     <BlogCard key={rel._id} blog={rel} />
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//         </div>
//       </div>

//       <button
//         onClick={handleLike}
//         disabled={liked}
//         className={`
//           fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full shadow-2xl transition-all
//           ${liked
//             ? 'bg-red-600 text-white cursor-not-allowed'
//             : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-800/40 border border-gray-300 dark:border-gray-700'
//           }
//         `}
//       >
//         <FiHeart size={22} className={liked ? 'fill-current' : ''} />
//         <span className="font-semibold">{likesCount}</span>
//       </button>

//       <Modal
//         isOpen={showLoginModal}
//         title="Login Required"
//         onClose={() => setShowLoginModal(false)}
//       >
//         <p className="text-gray-600 dark:text-gray-300 mb-5">
//           Please sign in or create an account to like this post.
//         </p>
//         <div className="flex flex-col sm:flex-row gap-4">
//           <Link
//             to="/login"
//             className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-center font-medium transition"
//           >
//             Sign in
//           </Link>
//           <Link
//             to="/register"
//             className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-center font-medium transition"
//           >
//             Register
//           </Link>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default BlogDetail;


import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getBlogById, 
  likeBlog, 
  getRelatedBlogs, 
  getPopularBlogs 
} from '../../services/blogApi';
import { useAuthStore } from '../../store/authStore';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import BlogCard from '../../components/BlogCard';
import CommentSection from '../../components/CommentSection'; 
import { FiEye, FiHeart, FiArrowLeft, FiCalendar, FiTag } from 'react-icons/fi';
import { formatDate } from '../../utils';
import { MEDIA_BASE_URL } from '../../services/api';
import { EmptyState } from '../../components/EmptyState';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [isPopularFallback, setIsPopularFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsPopularFallback(false);

        const blogRes = await getBlogById(id, user?._id);
        console.log("Blog Details:", blogRes);

        if (!blogRes.success) {
          setError(blogRes.message || 'Blog not found');
          return;
        }

        const blogData = blogRes.data;
        if (!isMounted) return;

        setBlog(blogData);
        setLiked(!!blogData.isLiked);
        setLikesCount(blogData.likesCount || 0);

        let fetchedBlogs = [];

        if (blogData.category || blogData.tags?.length > 0) {
          const params = { limit: 5, excludeId: blogData._id };
          if (blogData.category) params.category = blogData.category;
          if (blogData.tags?.length > 0) params.tags = blogData.tags.join(',');

          const relatedRes = await getRelatedBlogs(params);
          if (relatedRes?.success && Array.isArray(relatedRes.data)) {
            fetchedBlogs = relatedRes.data;
          }
        }

        if (fetchedBlogs.length === 0) {
          const popularRes = await getPopularBlogs(5);
          fetchedBlogs = Array.isArray(popularRes)
            ? popularRes
            : Array.isArray(popularRes?.data) ? popularRes.data : [];
          setIsPopularFallback(true);
        }

        if (isMounted) {
          setRelatedBlogs(fetchedBlogs);
        }
      } catch (err) {
        if (isMounted) setError('Failed to load content');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [id, user?._id]);

  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (liked) return;

    try {
      const res = await likeBlog(id);
      if (res?.success) {
        setLikesCount(res.data?.likesCount ?? likesCount + 1);
        setLiked(true);
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  }, [id, isAuthenticated, liked, likesCount]);

  const coverImageUrl = useMemo(
    () => blog?.coverImage?.url
      ? `${MEDIA_BASE_URL}${blog.coverImage.url}`
      : 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
    [blog]
  );

  if (loading) {
    return <Loader fullScreen message="Loading..." />;
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-light-50 dark:bg-dark-900 flex items-center justify-center">
        <EmptyState
          icon={FiEye}
          title={error || 'Blog not found'}
          description="Sorry, we couldn't find this post."
          actionText="Go Back"
          onAction={() => navigate(-1)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-50 dark:bg-dark-900 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">

          <div className="lg:col-span-8 xl:col-span-9">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6 transition-colors"
            >
              <FiArrowLeft size={18} />
              Back
            </button>

            <div className="rounded-xl overflow-hidden shadow-lg mb-8">
              <img
                src={coverImageUrl}
                alt={blog.title}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
              {blog.title}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {blog.description}
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400 mb-10 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5">
                <FiEye size={16} />
                {blog.views || 0} views
              </div>
              <button
                onClick={handleLike}
                disabled={liked}
                className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                <FiHeart size={16} className={liked ? 'fill-current' : ''} />
                {likesCount} likes
              </button>
              {blog.category && (
                <div className="flex items-center gap-1.5">
                  <FiTag size={16} />
                  <span className="capitalize">{blog.category}</span>
                </div>
              )}
            </div>

            <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none mb-16">
              <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                {blog.content}
              </div>
            </div>

            {blog.images?.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Gallery</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {blog.images.map((img, idx) => (
                    <div
                      key={img._id || idx}
                      className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={`${MEDIA_BASE_URL}${img.url}`}
                        alt={`Gallery image ${idx + 1}`}
                        className="w-full h-52 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Author & Tags */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div>
                <p className="text-base font-medium text-gray-900 dark:text-white">
  Posted By {" "}
  {isAuthenticated ? (
    <Link
      to={`/blogs/author-profile/${blog.author?._id}`}
      className="hover:text-primary-500 transition-colors"
    >
      {blog.author?.fullName || blog.author?.username || 'Anonymous'}
    </Link>
  ) : (
    <span>
      {blog.author?.fullName || blog.author?.username || 'Anonymous'}
    </span>
  )}
</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <FiCalendar size={14} />
                      {formatDate(blog.displayDate)}
                    </div>
                  </div>
                </div>

                {blog.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <CommentSection blogId={id} />

            <div className="mt-16 lg:hidden">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {isPopularFallback ? 'Popular Posts' : 'Related Posts'}
              </h2>
              {relatedBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedBlogs.map((rel) => (
                    <BlogCard key={rel._id} blog={rel} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FiTag}
                  title="No posts available"
                  description="Check back later for more content."
                />
              )}
            </div>
          </div>

          {/* Desktop sidebar related posts */}
          {relatedBlogs.length > 0 && (
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <div className="sticky top-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {isPopularFallback ? 'Popular Posts' : 'Related Posts'}
                </h2>
                <div className="space-y-6">
                  {relatedBlogs.map((rel) => (
                    <BlogCard key={rel._id} blog={rel} />
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating like button */}
      <button
        onClick={handleLike}
        disabled={liked}
        className={`
          fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full shadow-2xl transition-all
          ${liked
            ? 'bg-red-600 text-white cursor-not-allowed'
            : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-800/40 border border-gray-300 dark:border-gray-700'
          }
        `}
      >
        <FiHeart size={22} className={liked ? 'fill-current' : ''} />
        <span className="font-semibold">{likesCount}</span>
      </button>

      {/* Login modal for like action */}
      <Modal
        isOpen={showLoginModal}
        title="Login Required"
        onClose={() => setShowLoginModal(false)}
      >
        <p className="text-gray-600 dark:text-gray-300 mb-5">
          Please sign in or create an account to like this post.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/login"
            className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-center font-medium transition"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-center font-medium transition"
          >
            Register
          </Link>
        </div>
      </Modal>
    </div>
  );
};

export default BlogDetail;