// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { FiEye, FiHeart, FiCalendar } from "react-icons/fi";
// import { formatDate } from "../utils";
// import { MEDIA_BASE_URL } from "../services/api";
// import { likeBlog, recordBlogView } from "../services/blogApi";
// import { useAuthStore } from "../store/authStore";
// import Modal from "../components/Modal";

// const BlogCard = ({ blog }) => {
//   const {
//     _id,
//     title,
//     description,
//     coverImage,
//     views = 0,
//     likesCount = 0,
//     createdAt,
//     isLiked = false
//   } = blog;

//   const { isAuthenticated, user } = useAuthStore();

//   const [likes, setLikes] = useState(likesCount);
//   const [liked, setLiked] = useState(isLiked);
//   const [showModal, setShowModal] = useState(false);

//   const imageUrl = coverImage?.url
//     ? `${MEDIA_BASE_URL}${coverImage.url}`
//     : "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg";

//   const handleLike = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isAuthenticated) {
//       setShowModal(true);
//       return;
//     }

//     if (liked) return;

//     try {
//       const res = await likeBlog(_id);
//       if (res?.success) {
//         setLikes(res.data?.likesCount ?? likes + 1);
//         setLiked(true);
//       }
//     } catch (err) {
//       console.error("Like failed:", err);
//     }
//   };

//   const handleView = async () => {
//     try {
//       await recordBlogView(_id, user?._id);
//     } catch (error) {
//       console.error("View record failed:", error);
//     }
//   };

//   return (
//     <>
//       <Link
//         to={`/blogs/${_id}`}
//         onClick={handleView}
//         className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition"
//       >
//         <div className="h-48 overflow-hidden">
//           <img
//             src={imageUrl}
//             alt={title}
//             className="w-full h-full object-cover hover:scale-105 transition"
//           />
//         </div>

//         <div className="p-4 flex flex-col gap-3">

//           <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
//             {title}
//           </h2>

//           <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
//             {description}
//           </p>

//           <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2 gap-3">

//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-1">
//                 <FiCalendar size={14} />
//                 {formatDate(createdAt)}
//               </div>

//               <div className="flex items-center gap-1">
//                 <FiEye size={14} />
//                 {views}
//               </div>
//             </div>

//             <button
//               onClick={handleLike}
//               disabled={liked}
//               className={`flex items-center gap-1 transition-colors ${
//                 liked
//                   ? "text-red-500 cursor-not-allowed"
//                   : "hover:text-red-500 text-gray-500"
//               }`}
//             >
//               <FiHeart size={14} className={liked ? "fill-current" : ""} />
//               {likes}
//             </button>

//           </div>

//         </div>
//       </Link>

//       <Modal
//         isOpen={showModal}
//         title="Login Required"
//         onClose={() => setShowModal(false)}
//       >
//         <p className="text-gray-600 dark:text-gray-300 mb-4">
//           Please login or register to like this blog.
//         </p>

//         <div className="flex gap-3">
//           <Link
//             to="/login"
//             className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
//           >
//             Login
//           </Link>

//           <Link
//             to="/register"
//             className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
//           >
//             Register
//           </Link>
//         </div>
//       </Modal>
//     </>
//   );
// };

// export default BlogCard;


import { Link } from "react-router-dom";
import { FiEye, FiHeart, FiCalendar } from "react-icons/fi";
import { formatDate } from "../utils";
import { MEDIA_BASE_URL } from "../services/api";
import { recordBlogView } from "../services/blogApi";
import { useAuthStore } from "../store/authStore";

const BlogCard = ({ blog }) => {
  const {
    _id,
    title,
    description,
    content,
    coverImage,
    views = 0,
    likesCount = 0,
    displayDate,
  } = blog;
  console.log('Blog Card data : ',blog)

  const { user } = useAuthStore();

  const imageUrl = coverImage?.url
    ? `${MEDIA_BASE_URL}${coverImage.url}`
    : "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg";

  const previewText = (() => {
    if (description && description.trim().length >= 60) {
      return description.trim();
    }
    if (content) {
      const plainText = content.replace(/<[^>]+>/g, "").trim();
      return plainText.length > 0 ? plainText : "No preview available...";
    }
    return description || "No description available";
  })();

  const preview = previewText.length > 220
    ? previewText.substring(0, 217) + "..."
    : previewText;

  const handleView = async () => {
    try {
      await recordBlogView(_id, user?._id);
    } catch (error) {
      console.error("View record failed:", error);
    }
  };

  return (
    <Link
      to={`/blogs/${_id}`}
      onClick={handleView}
      className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition"
            loading="lazy"
        />
      </div>

      <div className="p-4 flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
          {title}
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4">
          {preview}
        </p>

        <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <FiCalendar size={14} />
              {formatDate(displayDate)}
            </div>

            <div className="flex items-center gap-1">
              <FiEye size={14} />
              {views}
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <FiHeart size={14} className="text-red-400" />
            {likesCount}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;