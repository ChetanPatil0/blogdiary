// import { useState, useRef, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import { FiX, FiLoader, FiImage, FiPlus, FiArrowLeft } from "react-icons/fi";
// import { useNotificationStore } from "../../store/notificationStore";
// import Modal from "../../components/Modal";
// import { MEDIA_BASE_URL } from "../../services/api";
// import { getBlogById, updateBlog } from "../../services/blogApi";


// const getNonSpaceLength = (str) => str.replace(/\s+/g, "").length;
// const getTrimmedLength = (str) => str.replace(/\s+/g, "").length;

// const validationSchema = Yup.object({
//   title: Yup.string()
//     .required("Title is required")
//     .min(5, "Title must be at least 5 characters")
//     .test("max-trimmed", "Title must not exceed 50 characters (excluding spaces)", (value) => !value || getTrimmedLength(value) <= 100)
//     .max(100, "Title must not exceed 100 characters total"),
//   description: Yup.string()
//     .required("Description is required")
//     .min(10, "Description must be at least 10 characters")
//     .max(300, "Description must not exceed 300 characters"),
//   content: Yup.string()
//     .required("Content is required")
//     .min(100, "Content must be at least 100 characters")
//     .max(5000, "Content must not exceed 5000 characters"),
//   category: Yup.string().required("Category is required"),
//   tags: Yup.array()
//     .of(Yup.string())
//     .required("At least one tag is required")
//     .min(1, "Add at least one tag")
//     .max(5, "Maximum 5 tags allowed"),
// });

// const EditBlog = () => {
  
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const addNotification = useNotificationStore((state) => state.addNotification);

//   const [loading, setLoading] = useState(true);
//   const [initialValues, setInitialValues] = useState(null);
//   const [existingCoverUrl, setExistingCoverUrl] = useState("");
//   const [coverSrc, setCoverSrc] = useState("");
//   const [coverFile, setCoverFile] = useState(null);
//   const [postImages, setPostImages] = useState([]);
//   const [tagInput, setTagInput] = useState("");
//   const [showPublishModal, setShowPublishModal] = useState(false);
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [dragActive, setDragActive] = useState(false);

//   const formikRef = useRef(null);

//   useEffect(() => {
//     const fetchBlog = async () => {
//       try {
//         setLoading(true);
//         const response = await getBlogById(id);
//         const blog = response.data;

//         setInitialValues({
//           title: blog.title || "",
//           description: blog.description || "",
//           content: blog.content || "",
//           category: blog.category || "",
//           tags: blog.tags || [],
//         });

//         if (blog.coverImage?.url) {
//           const coverPath = blog.coverImage.url.startsWith("http")
//             ? blog.coverImage.url
//             : `${MEDIA_BASE_URL}${blog.coverImage.url}`;
//           setExistingCoverUrl(coverPath);
//           setCoverSrc(coverPath);
//         }

//         if (blog.images?.length > 0) {
//           const loadedImages = blog.images.map((img) => {
//             const imgPath = img.url.startsWith("http")
//               ? img.url
//               : `${MEDIA_BASE_URL}${img.url}`;
//             return {
//               preview: imgPath,
//               isExisting: true,
//               _id: img._id,
//             };
//           });
//           setPostImages(loadedImages);
//         }
//       } catch (err) {
//         addNotification("Failed to load blog", "error");
//         navigate(-1);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBlog();
//   }, [id, navigate, addNotification]);

//   const hasAnyInput = (values) =>
//     values.title.trim() ||
//     values.description.trim() ||
//     values.content.trim() ||
//     values.category ||
//     values.tags.length > 0 ||
//     coverFile ||
//     postImages.length > 0;

//   const handleCoverSelect = (files) => {
//     const file = files?.[0];
//     if (!file) return;
//     if (!file.type.startsWith("image/")) {
//       addNotification("Only image files are allowed", "error");
//       return;
//     }
//     setCoverFile(file);
//     const reader = new FileReader();
//     reader.onload = (e) => setCoverSrc(e.target.result);
//     reader.readAsDataURL(file);
//   };

//   const removeCover = () => {
//     setCoverSrc(existingCoverUrl);
//     setCoverFile(null);
//   };

//   const handlePostImagesSelect = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length + postImages.length > 5) {
//       addNotification(`Maximum 5 additional images allowed`, "error");
//       return;
//     }
//     const newImages = files
//       .map((file) => {
//         if (!file.type.startsWith("image/")) {
//           addNotification("Only image files are allowed", "error");
//           return null;
//         }
//         return { file, preview: URL.createObjectURL(file), isExisting: false };
//       })
//       .filter(Boolean);
//     setPostImages((prev) => [...prev, ...newImages]);
//   };

//   const removePostImage = (index) => {
//     setPostImages((prev) => {
//       const img = prev[index];
//       if (!img.isExisting && img.preview) {
//         URL.revokeObjectURL(img.preview);
//       }
//       return prev.filter((_, i) => i !== index);
//     });
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(e.type === "dragenter" || e.type === "dragover");
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
//     if (e.dataTransfer.files?.[0]) {
//       handleCoverSelect(e.dataTransfer.files);
//     }
//   };

//   const handleAddTag = (e) => {
//     if (e.key === "Enter" || e.key === ",") {
//       e.preventDefault();
//       const newTag = tagInput.trim().toLowerCase().replace(/^#+/, "");
//       if (!newTag) return;
//       if (formikRef.current?.values.tags.length >= 5) {
//         addNotification("Maximum 5 tags allowed", "error");
//         return;
//       }
//       if (formikRef.current?.values.tags.includes(newTag)) {
//         addNotification("Tag already added", "error");
//         setTagInput("");
//         return;
//       }
//       formikRef.current?.setFieldValue("tags", [...formikRef.current.values.tags, newTag]);
//       setTagInput("");
//     }
//   };

//   const removeTag = (index) => {
//     formikRef.current?.setFieldValue(
//       "tags",
//       formikRef.current.values.tags.filter((_, i) => i !== index)
//     );
//   };

//   const charCountNoSpaces = (text) => text.replace(/\s+/g, "").length;

//   const isTitleGood = (value) => value && getNonSpaceLength(value) >= 5;
//   const isDescGood = (value) => value && getNonSpaceLength(value) >= 10;
//   const isContentGood = (value) => value && getNonSpaceLength(value) >= 100;

//   const handleCancelClick = (values) => {
//     if (hasAnyInput(values) || coverFile || postImages.some(img => !img.isExisting)) {
//       setShowCancelModal(true);
//     } else {
//       navigate(-1);
//     }
//   };

//   const confirmCancel = () => {
//     navigate(-1);
//     setShowCancelModal(false);
//   };

//   const handleConfirmPublish = async () => {
//     if (!formikRef.current) return;

//     const errors = await formikRef.current.validateForm();
//     if (Object.keys(errors).length > 0) {
//       formikRef.current.setTouched(
//         Object.fromEntries(Object.keys(formikRef.current.values).map(k => [k, true]))
//       );
//       setShowPublishModal(false);
//       addNotification("Please fix validation errors", "error");
//       return;
//     }

//     await formikRef.current.submitForm();
//     setShowPublishModal(false);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <FiLoader className="animate-spin h-12 w-12 text-primary-500" />
//       </div>
//     );
//   }

//   if (!initialValues) return null;

//   return (
//     <Formik
//       innerRef={formikRef}
//       initialValues={initialValues}
//       validationSchema={validationSchema}
//       onSubmit={async (values, { setSubmitting }) => {
//         try {
//           setSubmitting(true);

//           const trimmedValues = {
//             title: values.title.trim(),
//             description: values.description.trim(),
//             content: values.content.trim(),
//             category: values.category,
//             tags: values.tags.map((t) => t.trim()),
//           };

//           const formData = new FormData();
//           formData.append("title", trimmedValues.title);
//           formData.append("description", trimmedValues.description);
//           formData.append("content", trimmedValues.content);
//           formData.append("category", trimmedValues.category);
//           trimmedValues.tags.forEach((tag) => formData.append("tags", tag));

//           if (coverFile) {
//             formData.append("coverImage", coverFile);
//           }

//           postImages.forEach((img) => {
//             if (!img.isExisting && img.file) {
//               formData.append("images", img.file);
//             }
//           });

//           const response = await updateBlog(id, formData);

//           addNotification(response.data.message || "Blog updated successfully!", "success");
//           navigate(`/my-blogs`);
//         } catch (error) {
//           const msg = error?.response?.data?.message || error?.message || "Failed to update blog";
//           addNotification(msg, "error");
//         } finally {
//           setSubmitting(false);
//         }
//       }}
//     >
//       {(formik) => (
//        <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 py-4 px-4 sm:px-4 lg:px-4">
//          <div className="mb-8 flex items-center gap-4 text-left">
//   <button
//     onClick={() => navigate(-1)}
//     className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
//   >
//     <FiArrowLeft size={18} />
//     Back
//   </button>

//   <div>
//     <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
//       Edit Post
//     </h1>
//     <p className="text-slate-600 dark:text-slate-400">
//       Update your blog post
//     </p>
//   </div>
// </div>

//           <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 max-w-4xl mx-auto">
//             <Form className="space-y-7">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                   Title <span className="text-red-500">*</span>
//                 </label>
//                 <Field
//                   type="text"
//                   name="title"
//                   placeholder="Enter post title"
//                   maxLength={100}
//                   className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition"
//                 />
//                 <div className="mt-1.5 flex justify-between text-xs">
//                   <ErrorMessage name="title" component="p" className="text-red-600 dark:text-red-400" />
//                   <span
//                     className={`${
//                       isTitleGood(formik.values.title)
//                         ? "text-green-600 dark:text-green-400 font-medium"
//                         : getTrimmedLength(formik.values.title) > 45
//                         ? "text-amber-600 dark:text-amber-400"
//                         : "text-slate-500 dark:text-slate-400"
//                     }`}
//                   >
//                     {charCountNoSpaces(formik.values.title)} / 50 chars
//                   </span>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Category <span className="text-red-500">*</span>
//                   </label>
//                   <Field
//                     as="select"
//                     name="category"
//                     className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition"
//                   >
//                     <option value="" disabled>Select category</option>
//                     <option value="technology">Technology</option>
//                     <option value="lifestyle">Lifestyle</option>
//                     <option value="business">Business</option>
//                     <option value="travel">Travel</option>
//                     <option value="food">Food</option>
//                     <option value="health">Health</option>
//                     <option value="other">Other</option>
//                   </Field>
//                   <ErrorMessage name="category" component="p" className="mt-1.5 text-sm text-red-600 dark:text-red-400" />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     Tags <span className="text-red-500">*</span> (max 5)
//                   </label>
//                   <input
//                     type="text"
//                     value={tagInput}
//                     onChange={(e) => setTagInput(e.target.value)}
//                     onKeyDown={handleAddTag}
//                     disabled={formik.values.tags.length >= 5}
//                     placeholder={formik.values.tags.length >= 5 ? "Max tags reached" : "Type tag & press Enter or comma"}
//                     className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition disabled:opacity-60"
//                   />
//                   {formik.values.tags.length > 0 && (
//                     <div className="mt-3 flex flex-wrap gap-2">
//                       {formik.values.tags.map((tag, idx) => (
//                         <span
//                           key={idx}
//                           className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100/60 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium border border-primary-200/50 dark:border-primary-700/40"
//                         >
//                           {tag}
//                           <button
//                             type="button"
//                             onClick={() => removeTag(idx)}
//                             className="text-primary-700 dark:text-primary-300 hover:text-primary-900 dark:hover:text-primary-100"
//                           >
//                             <FiX size={14} />
//                           </button>
//                         </span>
//                       ))}
//                     </div>
//                   )}
//                   <div className="mt-1.5 flex justify-between text-xs">
//                     <ErrorMessage name="tags" component="p" className="text-red-600 dark:text-red-400" />
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                   Description <span className="text-red-500">*</span>
//                 </label>
//                 <Field
//                   as="textarea"
//                   name="description"
//                   placeholder="Short summary of your post"
//                   rows={4}
//                   maxLength={300}
//                   className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition resize-none"
//                 />
//                 <div className="mt-1.5 flex justify-between text-xs">
//                   <ErrorMessage name="description" component="p" className="text-red-600 dark:text-red-400" />
//                   <span
//                     className={`${isDescGood(formik.values.description) ? "text-green-600 dark:text-green-400 font-medium" : "text-slate-500 dark:text-slate-400"}`}
//                   >
//                     {charCountNoSpaces(formik.values.description)} / 300 chars
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                   Content <span className="text-red-500">*</span>
//                 </label>
//                 <Field
//                   as="textarea"
//                   name="content"
//                   placeholder="Write your full post here..."
//                   rows={12}
//                   className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition resize-y min-h-[240px]"
//                 />
//                 <div className="mt-1.5 flex justify-between text-xs">
//                   <ErrorMessage name="content" component="p" className="text-red-600 dark:text-red-400" />
//                   <span
//                     className={`${isContentGood(formik.values.content) ? "text-green-600 dark:text-green-400 font-medium" : "text-slate-500 dark:text-slate-400"}`}
//                   >
//                     {charCountNoSpaces(formik.values.content)} / 5000 chars
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                   Cover Image <span className="text-red-500">*</span>
//                 </label>

//                 {!coverSrc ? (
//                   <div
//                     onDragEnter={handleDrag}
//                     onDragOver={handleDrag}
//                     onDragLeave={handleDrag}
//                     onDrop={handleDrop}
//                     className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
//                       dragActive
//                         ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20"
//                         : "border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10"
//                     }`}
//                   >
//                     <FiImage className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
//                     <p className="text-slate-700 dark:text-slate-300 font-medium mb-1 text-sm">
//                       Drag & drop or click to select new cover image
//                     </p>
//                     <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Recommended: 1200×630 px</p>
//                     <label
//                       htmlFor="cover-upload"
//                       className="inline-flex px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg cursor-pointer transition"
//                     >
//                       Choose Cover Image
//                     </label>
//                     <input
//                       id="cover-upload"
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleCoverSelect(e.target.files)}
//                       className="hidden"
//                     />
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-[320px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
//                       <img
//                         src={coverSrc}
//                         alt="Cover preview"
//                         className="max-w-full max-h-full object-contain"
//                       />
//                       <div className="absolute top-2 right-2 bg-black/65 text-white text-xs font-medium px-2.5 py-1 rounded-full z-10">
//                         {coverFile ? "New Cover Preview" : "Current Cover"}
//                       </div>
//                     </div>

//                     <div className="flex items-center justify-between text-sm">
//                       <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[70%]">
//                         {coverFile?.name || "Current cover image"}
//                       </span>
//                       <button
//                         type="button"
//                         onClick={removeCover}
//                         className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-800/60 text-red-600 dark:text-red-400 rounded-lg transition text-sm flex items-center gap-1"
//                       >
//                         <FiX size={16} /> {coverFile ? "Remove new" : "Change"}
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                   Additional Images (max 5)
//                 </label>

//                 <div className="flex flex-wrap gap-4 mb-4">
//                   {postImages.map((img, idx) => (
//                     <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
//                       <img src={img.preview} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
//                       <button
//                         type="button"
//                         onClick={() => removePostImage(idx)}
//                         className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                       >
//                         <FiX size={14} />
//                       </button>
//                     </div>
//                   ))}

//                   {postImages.length < 5 && (
//                     <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-primary-500 transition">
//                       <FiPlus size={24} className="text-slate-400" />
//                       <input
//                         type="file"
//                         accept="image/*"
//                         multiple
//                         onChange={handlePostImagesSelect}
//                         className="hidden"
//                       />
//                     </label>
//                   )}
//                 </div>

//                 <p className="text-xs text-slate-500 dark:text-slate-400">
//                   {postImages.length}/5 images
//                 </p>
//               </div>

//               <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-end">
//                 <button
//                   type="button"
//                   onClick={() => handleCancelClick(formik.values)}
//                   className="px-6 py-3 border rounded-lg font-medium transition text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setShowPublishModal(true)}
//                   disabled={formik.isSubmitting}
//                   className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
//                 >
//                   {formik.isSubmitting ? (
//                     <>
//                       <FiLoader className="animate-spin" size={18} />
//                       Saving...
//                     </>
//                   ) : (
//                     "Update Post"
//                   )}
//                 </button>
//               </div>
//             </Form>
//           </div>

//           <Modal
//             isOpen={showPublishModal}
//             title="Update Confirmation"
//             onClose={() => setShowPublishModal(false)}
//             onConfirm={handleConfirmPublish}
//             confirmText="Yes, Update"
//             cancelText="No, Keep Editing"
//           >
//             <p className="text-slate-700 dark:text-slate-300">Are you sure you want to update this post?</p>
//           </Modal>

//           <Modal
//             isOpen={showCancelModal}
//             title="Discard Changes?"
//             onClose={() => setShowCancelModal(false)}
//             onConfirm={confirmCancel}
//             confirmText="Yes, Discard"
//             cancelText="No, Keep Editing"
//             isDangerous={true}
//           >
//             <p className="text-slate-700 dark:text-slate-300">All unsaved changes will be lost. Continue?</p>
//           </Modal>
//         </div>
//       )}
//     </Formik>
//   );
// };

// export default EditBlog;



import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiX, FiLoader, FiImage, FiPlus, FiArrowLeft, FiSave } from "react-icons/fi";
import { useNotificationStore } from "../../store/notificationStore";
import Modal from "../../components/Modal";
import { MEDIA_BASE_URL } from "../../services/api";
import { getBlogById, updateBlog } from "../../services/blogApi";

const getNonSpaceLength = (str) => str.replace(/\s+/g, "").length;
const getTrimmedLength = (str) => str.replace(/\s+/g, "").length;

const validationSchema = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .min(5, "Title must be at least 5 characters")
    .test("max-trimmed", "Title must not exceed 50 characters (excluding spaces)", (value) => !value || getTrimmedLength(value) <= 100)
    .max(100, "Title must not exceed 100 characters total"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(300, "Description must not exceed 300 characters"),
  content: Yup.string()
    .required("Content is required")
    .min(100, "Content must be at least 100 characters")
    .max(5000, "Content must not exceed 5000 characters"),
  category: Yup.string().required("Category is required"),
  tags: Yup.array()
    .of(Yup.string())
    .required("At least one tag is required")
    .min(1, "Add at least one tag")
    .max(5, "Maximum 5 tags allowed"),
});

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState("");
  const [coverSrc, setCoverSrc] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [postImages, setPostImages] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState("update");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [originalStatus, setOriginalStatus] = useState("draft");

  const formikRef = useRef(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await getBlogById(id);
        const blog = response.data;

        setOriginalStatus(blog.status || "draft");

        setInitialValues({
          title: blog.title || "",
          description: blog.description || "",
          content: blog.content || "",
          category: blog.category || "",
          tags: blog.tags || [],
          status: blog.status || "draft",
        });

        if (blog.coverImage?.url) {
          const coverPath = blog.coverImage.url.startsWith("http")
            ? blog.coverImage.url
            : `${MEDIA_BASE_URL}${blog.coverImage.url}`;
          setExistingCoverUrl(coverPath);
          setCoverSrc(coverPath);
        }

        if (blog.images?.length > 0) {
          const loadedImages = blog.images.map((img) => {
            const imgPath = img.url.startsWith("http")
              ? img.url
              : `${MEDIA_BASE_URL}${img.url}`;
            return {
              preview: imgPath,
              isExisting: true,
              _id: img._id,
            };
          });
          setPostImages(loadedImages);
        }
      } catch (err) {
        addNotification("Failed to load blog", "error");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, navigate, addNotification]);

  const hasChanges = (values) =>
    values.title.trim() !== initialValues?.title.trim() ||
    values.description.trim() !== initialValues?.description.trim() ||
    values.content.trim() !== initialValues?.content.trim() ||
    values.category !== initialValues?.category ||
    JSON.stringify(values.tags.sort()) !== JSON.stringify(initialValues?.tags.sort()) ||
    coverFile ||
    postImages.some((img) => !img.isExisting);

  const handleCoverSelect = (files) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addNotification("Only image files are allowed", "error");
      return;
    }
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCoverSrc(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeCover = () => {
    setCoverSrc(existingCoverUrl);
    setCoverFile(null);
  };

  const handlePostImagesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + postImages.length > 5) {
      addNotification(`Maximum 5 additional images allowed`, "error");
      return;
    }
    const newImages = files
      .map((file) => {
        if (!file.type.startsWith("image/")) {
          addNotification("Only image files are allowed", "error");
          return null;
        }
        return { file, preview: URL.createObjectURL(file), isExisting: false };
      })
      .filter(Boolean);
    setPostImages((prev) => [...prev, ...newImages]);
  };

  const removePostImage = (index) => {
    setPostImages((prev) => {
      const img = prev[index];
      if (!img.isExisting && img.preview) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleCoverSelect(e.dataTransfer.files);
    }
  };

  const addTagsFromInput = () => {
    if (!tagInput.trim()) return;

    const newTags = tagInput
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/^#+/, ""))
      .filter((t) => t.length > 0);

    if (newTags.length === 0) return;

    const currentTags = formikRef.current?.values.tags || [];
    const uniqueNewTags = newTags.filter((tag) => !currentTags.includes(tag));

    if (currentTags.length + uniqueNewTags.length > 5) {
      addNotification(`Cannot add more tags — maximum 5 allowed`, "error");
      setTagInput("");
      return;
    }

    if (uniqueNewTags.length > 0) {
      formikRef.current?.setFieldValue("tags", [...currentTags, ...uniqueNewTags]);
    } else {
      addNotification("All entered tags already exist", "info");
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTagsFromInput();
    }
  };

  const removeTag = (index) => {
    formikRef.current?.setFieldValue(
      "tags",
      formikRef.current.values.tags.filter((_, i) => i !== index)
    );
  };

  const charCountNoSpaces = (text) => text.replace(/\s+/g, "").length;

  const isTitleGood = (value) => value && getNonSpaceLength(value) >= 5;
  const isDescGood = (value) => value && getNonSpaceLength(value) >= 10;
  const isContentGood = (value) => value && getNonSpaceLength(value) >= 100;

  const handleCancelClick = () => {
    if (hasChanges(formikRef.current?.values || {}) || coverFile || postImages.some(img => !img.isExisting)) {
      setShowCancelModal(true);
    } else {
      navigate(-1);
    }
  };

  const confirmCancel = () => {
    navigate(-1);
    setShowCancelModal(false);
  };

  const openConfirmModal = (action) => {
    if (!formikRef.current) return;

    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!formikRef.current) return;

    const errors = await formikRef.current.validateForm();
    if (Object.keys(errors).length > 0) {
      formikRef.current.setTouched(
        Object.fromEntries(Object.keys(formikRef.current.values).map(k => [k, true]))
      );
      setShowConfirmModal(false);
      addNotification("Please fix validation errors", "error");
      return;
    }

    if (confirmAction === "draft") {
      formikRef.current.setFieldValue("status", "draft");
    } else {
      formikRef.current.setFieldValue("status", "publish");
    }

    await formikRef.current.submitForm();
    setShowConfirmModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin h-12 w-12 text-primary-500" />
      </div>
    );
  }

  if (!initialValues) return null;

  return (
    <Formik
      innerRef={formikRef}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          setSubmitting(true);

          const trimmedValues = {
            title: values.title.trim(),
            description: values.description.trim(),
            content: values.content.trim(),
            category: values.category,
            tags: values.tags.map((t) => t.trim()),
            status: values.status,
          };

          const formData = new FormData();
          formData.append("title", trimmedValues.title);
          formData.append("description", trimmedValues.description);
          formData.append("content", trimmedValues.content);
          formData.append("category", trimmedValues.category);
          trimmedValues.tags.forEach((tag) => formData.append("tags", tag));
          formData.append("status", trimmedValues.status);

          if (coverFile) {
            formData.append("coverImage", coverFile);
          }

          postImages.forEach((img) => {
            if (!img.isExisting && img.file) {
              formData.append("images", img.file);
            }
          });

          const response = await updateBlog(id, formData);

          addNotification(
            response.data.message ||
            (trimmedValues.status === "draft" ? "Draft saved" : "Post updated"),
            "success"
          );

          navigate("/my-blogs");
        } catch (error) {
          const msg = error?.response?.data?.message || error?.message || "Failed to update blog";
          addNotification(msg, "error");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {(formik) => (
        <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 py-4 px-4 sm:px-4 lg:px-4">
          <div className="mb-8 flex items-center gap-4 text-left">
            <button
              onClick={handleCancelClick}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
            >
              <FiArrowLeft size={18} />
              Back
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Edit Post
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Update your blog post
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 max-w-4xl mx-auto">
            <Form className="space-y-7">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Field
                  type="text"
                  name="title"
                  placeholder="Enter post title"
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition"
                />
                <div className="mt-1.5 flex justify-between text-xs">
                  <ErrorMessage name="title" component="p" className="text-red-600 dark:text-red-400" />
                  <span
                    className={`${
                      isTitleGood(formik.values.title)
                        ? "text-green-600 dark:text-green-400 font-medium"
                        : getTrimmedLength(formik.values.title) > 45
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {charCountNoSpaces(formik.values.title)} / 50 chars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    name="category"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition"
                  >
                    <option value="" disabled>Select category</option>
                    <option value="technology">Technology</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="business">Business</option>
                    <option value="travel">Travel</option>
                    <option value="food">Food</option>
                    <option value="health">Health</option>
                    <option value="other">Other</option>
                  </Field>
                  <ErrorMessage name="category" component="p" className="mt-1.5 text-sm text-red-600 dark:text-red-400" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tags <span className="text-red-500">*</span> (max 5)
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    disabled={formik.values.tags.length >= 5}
                    placeholder={formik.values.tags.length >= 5 ? "Max tags reached" : "tech, ai, react → press Enter"}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition disabled:opacity-60"
                  />
                  {formik.values.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formik.values.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100/60 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium border border-primary-200/50 dark:border-primary-700/40"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(idx)}
                            className="text-primary-700 dark:text-primary-300 hover:text-primary-900 dark:hover:text-primary-100"
                          >
                            <FiX size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-1.5 flex justify-between text-xs">
                    <ErrorMessage name="tags" component="p" className="text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <Field
                  as="textarea"
                  name="description"
                  placeholder="Short summary of your post"
                  rows={4}
                  maxLength={300}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition resize-none"
                />
                <div className="mt-1.5 flex justify-between text-xs">
                  <ErrorMessage name="description" component="p" className="text-red-600 dark:text-red-400" />
                  <span
                    className={`${isDescGood(formik.values.description) ? "text-green-600 dark:text-green-400 font-medium" : "text-slate-500 dark:text-slate-400"}`}
                  >
                    {charCountNoSpaces(formik.values.description)} / 300 chars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <Field
                  as="textarea"
                  name="content"
                  placeholder="Write your full post here..."
                  rows={12}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition resize-y min-h-[240px]"
                />
                <div className="mt-1.5 flex justify-between text-xs">
                  <ErrorMessage name="content" component="p" className="text-red-600 dark:text-red-400" />
                  <span
                    className={`${isContentGood(formik.values.content) ? "text-green-600 dark:text-green-400 font-medium" : "text-slate-500 dark:text-slate-400"}`}
                  >
                    {charCountNoSpaces(formik.values.content)} / 5000 chars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Cover Image <span className="text-red-500">*</span>
                </label>

                {!coverSrc ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      dragActive
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20"
                        : "border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10"
                    }`}
                  >
                    <FiImage className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
                    <p className="text-slate-700 dark:text-slate-300 font-medium mb-1 text-sm">
                      Drag & drop or click to select new cover image
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Recommended: 1200×630 px</p>
                    <label
                      htmlFor="cover-upload"
                      className="inline-flex px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg cursor-pointer transition"
                    >
                      Choose Cover Image
                    </label>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCoverSelect(e.target.files)}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-[320px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      <img
                        src={coverSrc}
                        alt="Cover preview"
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className="absolute top-2 right-2 bg-black/65 text-white text-xs font-medium px-2.5 py-1 rounded-full z-10">
                        {coverFile ? "New Cover Preview" : "Current Cover"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[70%]">
                        {coverFile?.name || "Current cover image"}
                      </span>
                      <button
                        type="button"
                        onClick={removeCover}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-800/60 text-red-600 dark:text-red-400 rounded-lg transition text-sm flex items-center gap-1"
                      >
                        <FiX size={16} /> {coverFile ? "Remove new" : "Change"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Additional Images (max 5)
                </label>

                <div className="flex flex-wrap gap-4 mb-4">
                  {postImages.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
                      <img src={img.preview} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePostImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}

                  {postImages.length < 5 && (
                    <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-primary-500 transition">
                      <FiPlus size={24} className="text-slate-400" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePostImagesSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {postImages.length}/5 images
                </p>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="px-6 py-3 border rounded-lg font-medium transition text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => openConfirmModal("draft")}
                  disabled={formik.isSubmitting || !formik.values.title.trim()}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {formik.isSubmitting && confirmAction === "draft" ? (
                    <>
                      <FiLoader className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave size={18} />
                      Save Draft
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => openConfirmModal("update")}
                  disabled={formik.isSubmitting}
                  className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
                >
                  {formik.isSubmitting && confirmAction !== "draft" ? (
                    <>
                      <FiLoader className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : originalStatus === "draft" ? (
                    "Publish Post"
                  ) : (
                    "Update Post"
                  )}
                </button>
              </div>
            </Form>
          </div>

          <Modal
            isOpen={showConfirmModal}
            title={confirmAction === "draft" ? "Save Draft" : "Confirm Update"}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={handleConfirmAction}
            confirmText={confirmAction === "draft" ? "Save Draft" : "Yes, Update"}
            cancelText="No, Keep Editing"
          >
            <p className="text-slate-700 dark:text-slate-300">
              {confirmAction === "draft"
                ? "Save current changes as draft?"
                : originalStatus === "draft"
                ? "Are you sure you want to publish this post?"
                : "Save changes to this published post?"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              This will {confirmAction === "draft" ? "update the draft" : "update the post"}.
            </p>
          </Modal>

          <Modal
            isOpen={showCancelModal}
            title="Discard Changes?"
            onClose={() => setShowCancelModal(false)}
            onConfirm={confirmCancel}
            confirmText="Yes, Discard"
            cancelText="No, Keep Editing"
            isDangerous={true}
          >
            <p className="text-slate-700 dark:text-slate-300">
              All unsaved changes will be lost. Continue?
            </p>
          </Modal>
        </div>
      )}
    </Formik>
  );
};

export default EditBlog;