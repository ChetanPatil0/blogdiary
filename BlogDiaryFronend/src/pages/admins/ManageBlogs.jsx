// import { useEffect, useState } from "react";
// import { FiSearch, FiFilter } from "react-icons/fi";
// import { getAllBlogs, getCategories } from "../../services/blogApi";
// import Loader from "../../components/Loader";
// import BlogCardSelf from "../../components/BlogCardSelf";
// import { EmptyState } from "../../components/EmptyState";
// import { useAuthStore } from "../../store/authStore";
// import FilterDrawer from "../../components/FilterDrawer";

// const ManageBlogs = () => {
//   const { user } = useAuthStore();

//   const [blogs, setBlogs] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [page, setPage] = useState(1);
//   const [limit] = useState(12);

//   const [searchInput, setSearchInput] = useState("");
//   const [search, setSearch] = useState("");

//   const [category, setCategory] = useState("");
//   const [filterOpen, setFilterOpen] = useState(false);

//   const fetchBlogs = async () => {
//     try {
//       setLoading(true);
//       const res = await getAllBlogs(page, limit, category, search);
//       console.log('blog data  : ', res);
//       const data = res?.data || res || {};
//       setBlogs(data.blogs || []);
//     } catch (error) {
//       console.error(error);
//       setBlogs([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const res = await getCategories();
//       setCategories(res?.categories || res || []);
//     } catch (error) {
//       console.error("Failed to fetch categories:", error);
//       setCategories([]);
//     }
//   };

//   useEffect(() => {
//     fetchBlogs();
//   }, [page, category, search]);

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const triggerSearch = () => {
//     setSearch(searchInput.trim());
//     setPage(1);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") triggerSearch();
//   };

//   const handleDeleteSuccess = (deletedId) => {
//     setBlogs((prev) => prev.filter((blog) => blog._id !== deletedId));
//   };

//   const handlePublishSuccess = (publishedId) => {
//     setBlogs((prev) =>
//       prev.map((blog) =>
//         blog._id === publishedId ? { ...blog, status: "publish" } : blog
//       )
//     );
//   };

//   const handleClearFilters = () => {
//     setSearchInput("");
//     setSearch("");
//     setCategory("");
//     setPage(1);
//     setFilterOpen(false);
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <h1 className="text-2xl font-bold">Manage Blogs</h1>

//         <div className="flex gap-3">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder={
//                 user?.role === "admin" || user?.role === "superadmin"
//                   ? "Search title, description, author..."
//                   : "Search blogs..."
//               }
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//               onKeyPress={handleKeyPress}
//               className="border-2 border-gray-300 dark:border-dark-600 rounded-lg px-3 py-2 text-sm w-72 focus:border-primary-500 focus:outline-none"
//             />
//             <FiSearch className="absolute right-3 top-2.5 text-gray-400" />
//           </div>

//           <button
//             onClick={triggerSearch}
//             className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition"
//           >
//             Search
//           </button>

//           <button
//             onClick={() => setFilterOpen(true)}
//             className="px-4 py-2 bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-dark-500 transition flex items-center gap-1"
//           >
//             <FiFilter />
//             Filters
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex justify-center py-16">
//           <Loader message="Loading blogs..." />
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {blogs.length > 0 ? (
//             blogs.map((blog) => (
//               <BlogCardSelf
//                 key={blog._id}
//                 blog={blog}
//                 onDeleteSuccess={handleDeleteSuccess}
//                 onPublishSuccess={handlePublishSuccess}
//               />
//             ))
//           ) : (
//             <EmptyState
//               title="No blogs found"
//               description="Try changing filters or search terms."
//             />
//           )}
//         </div>
//       )}

//       <FilterDrawer
//         isOpen={filterOpen}
//         onClose={() => setFilterOpen(false)}
//         category={category}
//         setCategory={setCategory}
//         categories={categories}
//         onClearFilters={handleClearFilters}
//       />
//     </div>
//   );
// };

// export default ManageBlogs;

import { useEffect, useState } from "react";
import { FiSearch, FiFilter, FiEye, FiEdit, FiTrash2, FiUpload } from "react-icons/fi";
import DataTable from "react-data-table-component";

import { MEDIA_BASE_URL } from "../../services/api";

import { getAllBlogs, getCategories } from "../../services/blogApi";
import { publishBlog, deleteBlog } from "../../services/blogApi";

import Loader from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import FilterDrawer from "../../components/FilterDrawer";
import Modal from "../../components/Modal";

import { useNotificationStore } from "../../store/notificationStore";
import { formatSimpleDate } from "../../utils";
import { useNavigate } from "react-router-dom";

const ManageBlogs = () => {
    const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);

  // Modals
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isAdmin = true;

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await getAllBlogs(page, limit, category, search,isAdmin);
      console.log('Blogs fetched for admin : ', res);
      const data = res?.data || res || {};
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error(error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      console.log('Categories fetched for admin : ', res);
      setCategories(res?.data.categories || res || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, category, search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const triggerSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") triggerSearch();
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setPage(1);
    setFilterOpen(false);
  };


  const handleView = (blogId) => {
     navigate(`/blogs/${blogId}`);
  };

  const openPublishModal = (blog) => {
    setSelectedBlog(blog);
    setShowPublishModal(true);
  };

  const openDeleteModal = (blog) => {
    setSelectedBlog(blog);
    setShowDeleteModal(true);
  };

  const handlePublish = async () => {
    if (!selectedBlog) return;
    setIsPublishing(true);
    try {
      await publishBlog(selectedBlog._id);
      addNotification("Blog published successfully!", "success");
      setBlogs((prev) =>
        prev.map((b) =>
          b._id === selectedBlog._id ? { ...b, status: "publish" } : b
        )
      );
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to publish blog";
      addNotification(msg, "error");
    } finally {
      setIsPublishing(false);
      setShowPublishModal(false);
      setSelectedBlog(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedBlog) return;
    setIsDeleting(true);
    try {
      await deleteBlog(selectedBlog._id);
      addNotification("Blog deleted successfully", "success");
      setBlogs((prev) => prev.filter((b) => b._id !== selectedBlog._id));
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to delete blog";
      addNotification(msg, "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedBlog(null);
    }
  };



  const columns = [
    {
      name: "Cover",
      width: "100px",
      cell: (row) => {
        const imgUrl = row.coverImage?.url
          ? `${MEDIA_BASE_URL}${row.coverImage.url}`
          : "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg";
        return (
          <img
            src={imgUrl}
            alt={row.title}
            className="w-20 h-14 object-cover rounded shadow-sm"
            loading="lazy"
          />
        );
      },
    },
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
      wrap: true,
      grow: 2.2,
    },
    {
      name: "Author",
      selector: (row) => row.author?.username || row.author?.fullName || "—",
      sortable: true,
      width: "160px",
      cell: (row) => (
        <span className="truncate max-w-[140px]" title={row.author?.username || row.author?.fullName}>
          {row.author?.username || row.author?.fullName || "—"}
        </span>
      ),
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      width: "130px",
      cell: (row) => (
        <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
          {row.category || "—"}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            row.status === "publish"
              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
          }`}
        >
          {row.status === "publish" ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      name: "Date",
      selector: (row) => row.displayDate || row.createdAt,
      sortable: true,
      width: "120px",
      cell: (row) => formatSimpleDate(row.displayDate ||  row.createdAt),
    },
    {
      name: "Views",
      selector: (row) => row.views || 0,
      sortable: true,
      width: "90px",
      right: true,
    },
    {
      name: "Likes",
      selector: (row) => row.likesCount || 0,
      sortable: true,
      width: "90px",
      right: true,
    },
    {
      name: "Actions",
      width: "260px",
      cell: (row) => (
        <div className="flex flex-wrap gap-2 py-1">
          <button
            onClick={() => handleView(row._id)}
            className="px-3 py-1.5 text-xs rounded-md flex items-center gap-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition min-w-[70px]"
          >
            <FiEye size={14} />
            View
          </button>

          <button
            onClick={() => window.location.assign(`/my-blogs/edit/${row._id}`)}
            className="px-3 py-1.5 text-xs rounded-md flex items-center gap-1 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white transition min-w-[70px]"
          >
            <FiEdit size={14} />
            Edit
          </button>

          <button
            onClick={() => openDeleteModal(row)}
            className="px-3 py-1.5 text-xs rounded-md flex items-center gap-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white transition min-w-[78px]"
          >
            <FiTrash2 size={14} />
            Delete
          </button>

          {row.status === "draft" && (
            <button
              onClick={() => openPublishModal(row)}
              className="px-3 py-1.5 text-xs rounded-md flex items-center gap-1 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white transition min-w-[82px]"
            >
              <FiUpload size={14} />
              Publish
            </button>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader message="Loading blogs..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Manage Blogs</h1>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search title, description, category..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm w-72 focus:border-blue-500 focus:outline-none"
            />
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            onClick={triggerSearch}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Search
          </button>

          {/* <button
            onClick={() => setFilterOpen(true)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-300 transition flex items-center gap-1.5"
          >
            <FiFilter size={16} />
            Filter
          </button> */}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={blogs}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 15, 20, 50]}
          highlightOnHover
          pointerOnHover
          responsive
          striped
          noDataComponent={
            <div className="py-16">
              <EmptyState
                title="No blogs found"
                description="Try adjusting your search or filters."
              />
            </div>
          }
        />
      </div>

      <FilterDrawer
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        category={category}
        setCategory={setCategory}
        categories={categories}
        onClearFilters={handleClearFilters}
      />

      {/* Publish Modal */}
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
        {selectedBlog && (
          <p className="text-slate-700 dark:text-slate-300">
            Publish <strong>"{selectedBlog.title}"</strong>?
          </p>
        )}
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          It will become visible to everyone.
        </p>
      </Modal>

      {/* Delete Modal */}
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
        {selectedBlog && (
          <p className="text-slate-700 dark:text-slate-300">
            Delete <strong>"{selectedBlog.title}"</strong>?
          </p>
        )}
        <p className="text-sm text-red-600 dark:text-red-400 mt-3 font-medium">
          This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ManageBlogs;