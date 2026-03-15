import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEdit, FiTrash2, FiHeart, FiUpload } from "react-icons/fi";
import { formatDate } from "../utils";
import { MEDIA_BASE_URL } from "../services/api";
import { recordBlogView, publishBlog, deleteBlog } from "../services/blogApi";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import Modal from "./Modal";

const BlogCardSelf = ({ blog, onPublishSuccess, onDeleteSuccess }) => {
  const {
    _id,
    title,
    description,
    coverImage,
    tags = [],
    views = 0,
    likesCount = 0,
    displayDate,
    status = "draft",
  } = blog;

  const { user } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const imageUrl = coverImage?.url
    ? `${MEDIA_BASE_URL}${coverImage.url}`
    : "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg";

  const handleView = async () => {
    try {
      await recordBlogView(_id, user?._id);
    } catch (error) {
      console.error("View record failed:", error);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishBlog(_id);
      addNotification("Blog published successfully!", "success");
      if (onPublishSuccess) onPublishSuccess(_id);
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to publish blog";
      addNotification(msg, "error");
    } finally {
      setIsPublishing(false);
      setShowPublishModal(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBlog(_id);
      addNotification("Blog deleted successfully", "success");
      if (onDeleteSuccess) onDeleteSuccess(_id);
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to delete blog";
      addNotification(msg, "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div
        className="group w-full sm:w-[320px] md:w-[340px] lg:w-[360px] 
        bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg 
        transition overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col"
      >
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
          {/* Status badge */}
          <span
            className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded ${
              status === "draft"
                ? "bg-yellow-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {status.toUpperCase()}
          </span>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {title}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {description}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FiEye size={14} />
                <span>{views}</span>
              </div>

              <div className="flex items-center gap-1">
                <FiHeart size={14} />
                <span>{likesCount}</span>
              </div>
            </div>

            <span>{formatDate(displayDate)}</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              to={`/blogs/${_id}`}
              onClick={handleView}
              className="px-3 py-1.5 text-xs rounded-md flex items-center gap-1 
              bg-blue-500 hover:bg-blue-600 
              dark:bg-blue-600 dark:hover:bg-blue-700 
              text-white transition"
            >
              <FiEye size={14} />
              View
            </Link>

            <Link
              to={`/my-blogs/edit/${_id}`}
              className="px-3 py-1.5 text-xs rounded-md flex items-center gap-1 
              bg-amber-500 hover:bg-amber-600 
              dark:bg-amber-600 dark:hover:bg-amber-700 
              text-white transition"
            >
              <FiEdit size={14} />
              Edit
            </Link>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-1.5 text-xs rounded-md flex items-center gap-1 
              bg-red-500 hover:bg-red-600 
              dark:bg-red-600 dark:hover:bg-red-700 
              text-white transition"
            >
              <FiTrash2 size={14} />
              Delete
            </button>

            {status === "draft" && (
              <button
                onClick={() => setShowPublishModal(true)}
                className="px-3 py-1.5 text-xs rounded-md flex items-center gap-1 
                bg-green-500 hover:bg-green-600 
                dark:bg-green-600 dark:hover:bg-green-700 
                text-white transition"
              >
                <FiUpload size={14} />
                Publish
              </button>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showPublishModal}
        title="Publish Blog"
        onClose={() => setShowPublishModal(false)}
        onConfirm={handlePublish}
        confirmText={isPublishing ? "Publishing..." : "Yes, Publish"}
        cancelText="Cancel"
        isDangerous={false}
        confirmDisabled={isPublishing}
      >
        <p className="text-slate-700 dark:text-slate-300">
          Are you sure you want to publish <strong>"{title}"</strong>?
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Once published, it will be visible to everyone.
        </p>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        title="Delete Blog"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Deleting..." : "Yes, Delete"}
        cancelText="Cancel"
        isDangerous={true}
        confirmDisabled={isDeleting}
      >
        <p className="text-slate-700 dark:text-slate-300">
          Are you sure you want to delete <strong>"{title}"</strong>?
        </p>
        <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium">
          This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default BlogCardSelf;